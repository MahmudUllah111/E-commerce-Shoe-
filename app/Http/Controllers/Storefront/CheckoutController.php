<?php
namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\StoreSetting;
use App\Mail\OrderConfirmationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    private function getCart(Request $request): ?Cart
    {
        if ($request->user()) {
            return Cart::firstOrCreate(['user_id' => $request->user()->id]);
        }
        $sessionId = $request->session()->getId();
        if (!$sessionId) {
            $request->session()->start();
            $sessionId = $request->session()->getId();
        }
        return Cart::firstOrCreate(['session_id' => $sessionId, 'user_id' => null]);
    }

    private function shippingMethods(): array
    {
        $raw = StoreSetting::where('key', 'shipping_settings')->value('value')
            ?? StoreSetting::where('key', 'shipping_zones')->value('value')
            ?? StoreSetting::where('key', 'shipping_rates')->value('value')
            ?? null;
        if ($raw) {
            try {
                $decoded = is_string($raw) ? json_decode($raw, true) : $raw;
                if (isset($decoded['methods']) && is_array($decoded['methods'])) return $decoded['methods'];
                if (isset($decoded['zones']) && is_array($decoded['zones'])) {
                    $methods = [];
                    foreach ($decoded['zones'] as $z) {
                        $methods[] = [
                            'id' => $z['id'] ?? Str::slug($z['name'] ?? $z['zone'] ?? 'zone'),
                            'name' => $z['name'] ?? $z['zone'] ?? 'Shipping',
                            'cost' => $z['rate'] ?? $z['cost'] ?? $z['price'] ?? 0,
                            'eta' => $z['eta'] ?? '',
                            'zones' => $z['zones'] ?? null,
                        ];
                    }
                    if (!empty($methods)) return $methods;
                }
                if (is_array($decoded) && isset($decoded[0]['name'])) return $decoded;
                if (is_array($decoded) && isset($decoded[0]['zone'])) {
                    $methods = [];
                    foreach ($decoded as $z) {
                        $name = $z['zone'] ?? $z['name'] ?? 'Shipping';
                        $methods[] = [
                            'id' => $z['id'] ?? Str::slug($name),
                            'name' => $name,
                            'cost' => $z['rate'] ?? $z['cost'] ?? $z['price'] ?? 0,
                            'eta' => $z['eta'] ?? ($name==='Inside Dhaka' ? '2-3 days' : '3-5 days'),
                        ];
                    }
                    if (!empty($methods)) return $methods;
                }
            } catch (\Throwable $e) {}
        }
        return [
            ['id' => 'standard', 'name' => 'Standard Shipping', 'cost' => 5.00, 'eta' => '3-5 days'],
            ['id' => 'express', 'name' => 'Express Shipping', 'cost' => 15.00, 'eta' => '1-2 days'],
        ];
    }

    private function taxRate(): float
    {
        $raw = StoreSetting::where('key', 'tax_rate')->value('value')
            ?? StoreSetting::where('key', 'tax_settings')->value('value')
            ?? null;
        if ($raw !== null) {
            try {
                $decoded = is_string($raw) ? json_decode($raw, true) : $raw;
                if (is_numeric($decoded)) return (float) $decoded;
                if (is_array($decoded) && isset($decoded['rate'])) return (float) $decoded['rate'];
                if (is_array($decoded) && isset($decoded['tax_rate'])) return (float) $decoded['tax_rate'];
                if (is_numeric($raw)) return (float) $raw;
            } catch (\Throwable $e) {}
        }
        return 0.08;
    }

    private function appliedCoupon(Request $request): ?Coupon
    {
        $code = $request->session()->get('coupon_code');
        if (!$code) return null;
        $coupon = Coupon::where('code', $code)->first();
        if (!$coupon || !$coupon->is_active) { $request->session()->forget('coupon_code'); return null; }
        $now = now();
        if ($coupon->valid_until && $now->gt($coupon->valid_until)) { $request->session()->forget('coupon_code'); return null; }
        if ($coupon->expires_at && $now->gt($coupon->expires_at)) { $request->session()->forget('coupon_code'); return null; }
        if ($coupon->starts_at && $now->lt($coupon->starts_at)) { $request->session()->forget('coupon_code'); return null; }
        if ($coupon->usage_limit !== null && $coupon->times_used >= $coupon->usage_limit) { $request->session()->forget('coupon_code'); return null; }
        return $coupon;
    }

    private function storeInfo(): array
    {
        $keys = ['store_name','store_email','store_address','store_phone','tax_rate','shipping_settings','store_settings'];
        $info = [];
        foreach ($keys as $k) {
            $v = StoreSetting::where('key', $k)->value('value');
            $info[$k] = $v;
        }
        return $info;
    }

    public function index(Request $request)
    {
        $cart = $this->getCart($request);
        $cart->load(['items.variant.product.images', 'items.variant.product.brand']);
        if ($cart->items->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        $coupon = $this->appliedCoupon($request);
        $methods = $this->shippingMethods();
        $taxRate = $this->taxRate();

        $selectedMethodId = $request->session()->get('shipping_method') ?? $methods[0]['id'] ?? 'standard';
        $selectedMethod = collect($methods)->firstWhere('id', $selectedMethodId) ?? $methods[0];

        $subtotal = 0;
        $items = $cart->items->map(function ($it) use (&$subtotal) {
            $variant = $it->variant;
            $product = $variant?->product;
            $unit = $variant?->price ?? $product?->price ?? $product?->base_price ?? 0;
            $subtotal += (float)$unit * (int)$it->quantity;
            $thumb = $product?->images->firstWhere('is_primary', true)?->image_url
                ?? $product?->images->first()?->image_url
                ?? $product?->images->first()?->url
                ?? 'https://via.placeholder.com/300';
            return [
                'id' => $it->id,
                'quantity' => $it->quantity,
                'unit_price' => (float) $unit,
                'line_total' => round((float)$unit * (int)$it->quantity, 2),
                'variant' => $variant ? ['id'=>$variant->id,'size_value'=>$variant->size_value,'color_name'=>$variant->color_name,'stock_quantity'=>$variant->stock_quantity] : null,
                'product' => $product ? ['id'=>$product->id,'name'=>$product->name,'slug'=>$product->slug,'image'=>$thumb] : null,
            ];
        });

        $discount = 0;
        if ($coupon) {
            $min = $coupon->min_order_amount ?? $coupon->min_order_value ?? 0;
            if ($subtotal >= (float)$min) {
                $type = $coupon->discount_type ?? $coupon->type ?? 'percentage';
                $val = $coupon->discount_value ?? $coupon->value ?? 0;
                $discount = $type === 'percentage' ? $subtotal * ((float)$val/100) : min((float)$val, $subtotal);
            }
        }

        $shippingCost = (float) ($selectedMethod['cost'] ?? 0);
        $taxable = max(0, $subtotal - $discount);
        $tax = $taxable * $taxRate;
        $total = $taxable + $shippingCost + $tax;

        $summary = [
            'subtotal' => round($subtotal,2),
            'discount' => round($discount,2),
            'shipping_cost' => round($shippingCost,2),
            'tax' => round($tax,2),
            'total' => round($total,2),
            'tax_rate' => $taxRate,
            'coupon' => $coupon ? ['code'=>$coupon->code,'value'=>$coupon->discount_value ?? $coupon->value, 'type'=>$coupon->discount_type ?? $coupon->type] : null,
            'selected_method' => $selectedMethod,
        ];

        $addresses = [];
        if ($request->user()) {
            $addresses = Address::where('user_id', $request->user()->id)->latest()->get();
        }

        // Generate a one-time checkout token to prevent duplicate submissions
        $orderToken = Str::random(40);
        $request->session()->put('checkout_order_token', $orderToken);

        return Inertia::render('Storefront/Checkout/Index', [
            'cart' => ['items'=>$items, 'count'=>$items->sum('quantity')],
            'summary' => $summary,
            'shipping_methods' => $methods,
            'addresses' => $addresses,
            'auth' => ['user' => $request->user()],
            'store' => $this->storeInfo(),
            'order_token' => $orderToken,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'order_token' => 'required|string',
        ]);

        $sessionToken = $request->session()->get('checkout_order_token');
        if (!$sessionToken || $sessionToken !== $request->input('order_token')) {
            return back()->with('error', 'This checkout session has expired. Please try again.')->withInput();
        }
        $request->session()->forget('checkout_order_token');

        $cart = $this->getCart($request);
        $cart->load(['items.variant.product']);
        if ($cart->items->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Cart is empty.');
        }

        $rules = [
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:50',
            'shipping_method' => 'required|string',
            'payment_method' => 'required|string|in:cod,bkash,nagad,sslcommerz,mock,card,online',
            'bkash_number' => 'nullable|string|max:20',
            'bkash_trx' => 'nullable|string|max:50',
            'nagad_number' => 'nullable|string|max:20',
            'nagad_trx' => 'nullable|string|max:50',
            // address: either address_id or new address fields
            'address_id' => 'nullable|exists:addresses,id',
            'street' => 'required_without:address_id|string|max:500',
            'city' => 'required_without:address_id|string|max:255',
            'state' => 'nullable|string|max:255',
            'zip' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:255',
            // optional save address flag
            'save_address' => 'nullable|boolean',
        ];

        // If user is guest, we still require address fields; if address_id provided but user guest, ignore
        $data = $request->validate($rules);

        $methods = $this->shippingMethods();
        $selectedMethod = collect($methods)->firstWhere('id', $data['shipping_method']);
        if (!$selectedMethod) {
            return back()->withErrors(['shipping_method' => 'Invalid shipping method.'])->withInput();
        }
        $shippingCost = (float) ($selectedMethod['cost'] ?? 0);
        $shippingMethodName = $selectedMethod['name'] ?? $data['shipping_method'];

        // Resolve shipping address text and shipping_address_id
        $shippingAddressId = null;
        $shippingAddressText = '';
        if (!empty($data['address_id']) && $request->user()) {
            $addr = Address::where('id', $data['address_id'])->where('user_id', $request->user()->id)->first();
            if (!$addr) return back()->withErrors(['address_id'=>'Invalid address'])->withInput();
            $shippingAddressId = $addr->id;
            $shippingAddressText = trim($addr->street . ', ' . $addr->city . ($addr->state ? ', '.$addr->state : '') . ($addr->zip ? ' '.$addr->zip : '') . ', '.$addr->country);
        } else {
            $street = $data['street'] ?? '';
            $city = $data['city'] ?? '';
            $state = $data['state'] ?? '';
            $zip = $data['zip'] ?? '';
            $country = $data['country'] ?? 'Bangladesh';
            $shippingAddressText = trim($street . ', ' . $city . ($state ? ', '.$state : '') . ($zip ? ' '.$zip : '') . ', '.$country);

            // optionally save new address for auth user
            if ($request->user() && $request->boolean('save_address')) {
                $newAddr = Address::create([
                    'user_id' => $request->user()->id,
                    'label' => 'Shipping',
                    'street' => $street,
                    'city' => $city,
                    'state' => $state,
                    'zip' => $zip,
                    'country' => $country,
                    'is_default' => false,
                ]);
                $shippingAddressId = $newAddr->id;
            }
        }

        // Compute totals
        $subtotal = 0;
        foreach ($cart->items as $it) {
            $variant = $it->variant;
            $product = $variant?->product;
            $unit = $variant?->price ?? $product?->price ?? $product?->base_price ?? 0;
            $subtotal += (float)$unit * (int)$it->quantity;
        }

        $coupon = $this->appliedCoupon($request);
        $discount = 0;
        $couponId = null;
        $couponCode = null;
        if ($coupon) {
            $min = $coupon->min_order_amount ?? $coupon->min_order_value ?? 0;
            if ($subtotal >= (float)$min) {
                $type = $coupon->discount_type ?? $coupon->type ?? 'percentage';
                $val = $coupon->discount_value ?? $coupon->value ?? 0;
                $discount = $type === 'percentage' ? $subtotal * ((float)$val/100) : min((float)$val, $subtotal);
                $couponId = $coupon->id;
                $couponCode = $coupon->code;
            } else {
                // coupon not applicable due to min, clear it
                $coupon = null;
                $request->session()->forget('coupon_code');
            }
        }

        $taxRate = $this->taxRate();
        $taxable = max(0, $subtotal - $discount);
        $tax = $taxable * $taxRate;
        $total = $taxable + $shippingCost + $tax;

        // verify stock before transaction
        foreach ($cart->items as $it) {
            $v = $it->variant;
            if (!$v) return back()->with('error', 'Invalid cart item.');
            if ($v->stock_quantity !== null && $it->quantity > $v->stock_quantity) {
                return back()->with('error', 'Insufficient stock for '.$v->product?->name.' size '.$v->size_value);
            }
        }

        $order = null;
        DB::transaction(function () use ($request, $cart, &$order, $data, $shippingAddressText, $shippingAddressId, $shippingMethodName, $shippingCost, $subtotal, $discount, $tax, $total, $couponId, $couponCode, $coupon) {
            // generate unique order_number
            $orderNumber = 'TM-' . date('Ymd') . '-' . strtoupper(Str::random(6));
            while (Order::where('order_number', $orderNumber)->exists()) {
                $orderNumber = 'TM-' . date('Ymd') . '-' . strtoupper(Str::random(6));
            }

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $request->user()?->id,
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'],
                'customer_phone' => $data['customer_phone'],
                'shipping_address' => $shippingAddressText,
                'shipping_address_id' => $shippingAddressId,
                'shipping_method' => $shippingMethodName,
                'subtotal' => round($subtotal,2),
                'shipping_cost' => round($shippingCost,2),
                'tax' => round($tax,2),
                'tax_amount' => round($tax,2),
                'discount_amount' => round($discount,2),
                'total_amount' => round($total,2),
                'coupon_id' => $couponId,
                'coupon_code' => $couponCode,
                'status' => 'pending',
                'payment_method' => $data['payment_method'] ?? 'cod',
                'payment_status' => ($data['payment_method'] ?? 'cod') === 'cod' ? 'unpaid' : 'paid',
            ]);

            foreach ($cart->items as $it) {
                $variant = $it->variant;
                $product = $variant?->product;
                $unit = $variant?->price ?? $product?->price ?? $product?->base_price ?? 0;
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product?->id,
                    'product_variant_id' => $variant?->id,
                    'size' => $variant?->size_value ?? '',
                    'color' => $variant?->color_name ?? 'Default',
                    'quantity' => $it->quantity,
                    'unit_price' => round((float)$unit,2),
                    'product_name_snapshot' => $product?->name ?? 'Product',
                    'price_snapshot' => round((float)$unit,2),
                ]);

                // decrement stock and log
                if ($variant) {
                    $variant->decrement('stock_quantity', $it->quantity);
                    DB::table('stock_logs')->insert([
                        'product_variant_id' => $variant->id,
                        'change_amount' => -$it->quantity,
                        'reason' => 'order_placed #'.$orderNumber,
                        'created_by' => $request->user()?->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            if ($coupon) {
                $coupon->increment('times_used');
            }

            // clear cart
            $cart->items()->delete();
            // keep cart record but empty; optionally delete guest cart
            $request->session()->forget(['coupon_code','shipping_method']);
        });

        // Send Pending order confirmation email immediately (queued)
        try {
            if ($order && !empty($order->customer_email)) {
                $order->load(['items.product', 'items.productVariant', 'user']);
                Mail::to($order->customer_email)->queue(new \App\Mail\OrderStatusMail($order, 'pending'));
            }
        } catch (\Throwable $e) {
            Log::error('Order pending email failed: ' . $e->getMessage());
        }

        return redirect()->route('order.success', ['order' => $order->order_number])->with('success', 'Order placed successfully. Confirmation email with invoice and packing slip sent!');
    }

    public function success(Request $request, $order)
    {
        $ord = Order::with(['items.product.images','items.product.brand'])->where('order_number', $order)->orWhere('id', $order)->firstOrFail();
        // authorize: if auth, must be owner or admin; guest can view via order_number (we allow)
        if ($request->user() && $request->user()->role !== 'admin' && $ord->user_id && (int)$ord->user_id !== (int)$request->user()->id) {
            // if user is not owner but has order_number, allow? we check referrer via session? For spec, allow owner only; but we permissive if they have order_number from redirect.
            // We'll allow if they are not admin but order belongs to them or guest order; otherwise abort.
            abort(403);
        }

        return Inertia::render('Storefront/OrderSuccess', [
            'order' => $ord,
        ]);
    }

    public function track(Request $request, $order)
    {
        return $this->success($request, $order);
    }
}
