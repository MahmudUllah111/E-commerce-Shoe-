<?php
namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\ProductVariant;
use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CartController extends Controller
{
    private function getCart(Request $request): ?Cart
    {
        if ($request->user()) {
            $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
            // merge guest session cart if exists
            $sessionId = $request->session()->getId();
            if ($sessionId) {
                $guestCart = Cart::where('session_id', $sessionId)->whereNull('user_id')->first();
                if ($guestCart && $guestCart->id !== $cart->id) {
                    foreach ($guestCart->items as $gi) {
                        $existing = $cart->items()->where('product_variant_id', $gi->product_variant_id)->first();
                        if ($existing) {
                            $existing->increment('quantity', $gi->quantity);
                        } else {
                            $cart->items()->create([
                                'product_variant_id' => $gi->product_variant_id,
                                'quantity' => $gi->quantity,
                            ]);
                        }
                    }
                    $guestCart->delete();
                }
            }
            // ensure session_id is set for later merging? keep user cart's session_id null or update
            return $cart;
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
                            'id' => $z['id'] ?? \Illuminate\Support\Str::slug($z['name'] ?? $z['zone'] ?? 'zone'),
                            'name' => $z['name'] ?? $z['zone'] ?? 'Shipping',
                            'cost' => $z['rate'] ?? $z['cost'] ?? $z['price'] ?? 0,
                            'eta' => $z['eta'] ?? '',
                        ];
                    }
                    if (!empty($methods)) return $methods;
                }
                if (is_array($decoded) && isset($decoded[0]['name'])) return $decoded;
                if (is_array($decoded) && isset($decoded[0]['zone'])) {
                    // flat array like [{"zone":"Inside Dhaka","rate":5},...]
                    $methods = [];
                    foreach ($decoded as $z) {
                        $name = $z['zone'] ?? $z['name'] ?? 'Shipping';
                        $methods[] = [
                            'id' => $z['id'] ?? \Illuminate\Support\Str::slug($name),
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
        return 0.08; // 8% default
    }

    private function appliedCoupon(Request $request): ?Coupon
    {
        $code = $request->session()->get('coupon_code');
        if (!$code) return null;
        $coupon = Coupon::where('code', $code)->first();
        if (!$coupon) {
            $request->session()->forget('coupon_code');
            return null;
        }
        // validate again
        if (!$coupon->is_active) { $request->session()->forget('coupon_code'); return null; }
        $now = now();
        if ($coupon->valid_until && $now->gt($coupon->valid_until)) { $request->session()->forget('coupon_code'); return null; }
        if ($coupon->expires_at && $now->gt($coupon->expires_at)) { $request->session()->forget('coupon_code'); return null; }
        if ($coupon->starts_at && $now->lt($coupon->starts_at)) { $request->session()->forget('coupon_code'); return null; }
        if ($coupon->usage_limit !== null && $coupon->times_used >= $coupon->usage_limit) { $request->session()->forget('coupon_code'); return null; }
        return $coupon;
    }

    private function calcSummary(Request $request, Cart $cart, ?string $shippingMethodId = null): array
    {
        $items = $cart->items()->with(['variant.product.images'])->get();
        $subtotal = 0;
        foreach ($items as $it) {
            $unit = $it->variant?->price ?? $it->variant?->product?->price ?? $it->variant?->product?->base_price ?? 0;
            $subtotal += (float) $unit * (int) $it->quantity;
        }

        $coupon = $this->appliedCoupon($request);
        $discount = 0;
        if ($coupon) {
            $min = $coupon->min_order_amount ?? $coupon->min_order_value ?? 0;
            if ($subtotal >= (float) $min) {
                $type = $coupon->discount_type ?? $coupon->type ?? 'percentage';
                $val = $coupon->discount_value ?? $coupon->value ?? 0;
                if ($type === 'percentage') {
                    $discount = $subtotal * ((float) $val / 100);
                } else {
                    $discount = min((float) $val, $subtotal);
                }
            } else {
                // below min, forget coupon for calc but keep session? we just don't apply
                $discount = 0;
            }
        }

        $methods = $this->shippingMethods();
        $selected = null;
        if ($shippingMethodId) {
            $selected = collect($methods)->firstWhere('id', $shippingMethodId);
        }
        if (!$selected) $selected = $methods[0] ?? ['cost'=>0];
        $shippingCost = $items->count() > 0 ? (float) ($selected['cost'] ?? 0) : 0;

        $taxable = max(0, $subtotal - $discount);
        $tax = $taxable * $this->taxRate();
        // if cart empty, tax 0
        if ($items->count() === 0) $tax = 0;

        $total = $taxable + $shippingCost + $tax;

        return [
            'subtotal' => round($subtotal, 2),
            'discount' => round($discount, 2),
            'shipping_cost' => round($shippingCost, 2),
            'tax' => round($tax, 2),
            'total' => round($total, 2),
            'coupon' => $coupon ? ['code'=>$coupon->code,'type'=>$coupon->discount_type ?? $coupon->type,'value'=>$coupon->discount_value ?? $coupon->value] : null,
            'shipping_method' => $selected,
            'shipping_methods' => $methods,
            'tax_rate' => $this->taxRate(),
        ];
    }

    public function index(Request $request)
    {
        $cart = $this->getCart($request);
        $cart->load(['items.variant.product.images', 'items.variant.product.brand']);
        $summary = $this->calcSummary($request, $cart, $request->session()->get('shipping_method'));

        // map items for frontend
        $items = $cart->items->map(function ($it) {
            $variant = $it->variant;
            $product = $variant?->product;
            $thumb = $product?->images->firstWhere('is_primary', true)?->image_url
                ?? $product?->images->first()?->image_url
                ?? $product?->images->first()?->url
                ?? 'https://via.placeholder.com/300?text=No+Image';
            $price = $variant?->price ?? $product?->price ?? $product?->base_price ?? 0;
            return [
                'id' => $it->id,
                'quantity' => $it->quantity,
                'variant' => $variant ? [
                    'id' => $variant->id,
                    'size_value' => $variant->size_value,
                    'color_name' => $variant->color_name,
                    'color_hex' => $variant->color_hex,
                    'stock_quantity' => $variant->stock_quantity,
                ] : null,
                'product' => $product ? [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $price,
                    'image' => $thumb,
                ] : null,
                'unit_price' => (float) $price,
                'line_total' => round((float)$price * (int)$it->quantity, 2),
            ];
        });

        return Inertia::render('Storefront/Cart/Index', [
            'cart' => [
                'id' => $cart->id,
                'items' => $items,
                'count' => $items->sum('quantity'),
            ],
            'summary' => $summary,
            'coupon_code' => $request->session()->get('coupon_code'),
        ]);
    }

    public function add(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1|max:50',
        ]);

        $variant = ProductVariant::with('product')->findOrFail($data['variant_id']);
        if ((int) $variant->product_id !== (int) $data['product_id']) {
            return back()->with('error', 'Variant does not belong to product.');
        }
        if ($variant->stock_quantity !== null && $data['quantity'] > $variant->stock_quantity) {
            return back()->with('error', 'Only '.$variant->stock_quantity.' left in stock.');
        }

        $cart = $this->getCart($request);
        $existing = $cart->items()->where('product_variant_id', $variant->id)->first();
        if ($existing) {
            $newQty = $existing->quantity + $data['quantity'];
            if ($variant->stock_quantity !== null && $newQty > $variant->stock_quantity) {
                return back()->with('error', 'Cannot add more than available stock ('.$variant->stock_quantity.').');
            }
            $existing->update(['quantity' => $newQty]);
        } else {
            $cart->items()->create([
                'product_variant_id' => $variant->id,
                'quantity' => $data['quantity'],
            ]);
        }

        return back()->with('success', 'Added to cart.');
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'item_id' => 'required|integer|exists:cart_items,id',
            'quantity' => 'required|integer|min:0|max:50',
        ]);

        $cart = $this->getCart($request);
        $item = $cart->items()->where('id', $data['item_id'])->firstOrFail();

        if ($data['quantity'] === 0) {
            $item->delete();
            return back()->with('success', 'Item removed.');
        }

        $variant = $item->variant;
        if ($variant && $variant->stock_quantity !== null && $data['quantity'] > $variant->stock_quantity) {
            return back()->with('error', 'Only '.$variant->stock_quantity.' left in stock.');
        }

        $item->update(['quantity' => $data['quantity']]);
        return back()->with('success', 'Quantity updated.');
    }

    public function remove(Request $request, $id = null)
    {
        $itemId = $id ?? $request->input('item_id') ?? $request->input('id');
        $request->validate(['item_id' => $id ? 'nullable' : 'required|integer']);

        $cart = $this->getCart($request);
        $query = $cart->items();
        if ($itemId) $query->where('id', $itemId);
        elseif ($request->has('item_id')) $query->where('id', $request->input('item_id'));

        $item = $query->first();
        if ($item) $item->delete();

        return back()->with('success', 'Item removed.');
    }

    // DELETE /cart/{id} alternative
    public function destroy(Request $request, $id)
    {
        $cart = $this->getCart($request);
        $item = $cart->items()->where('id', $id)->first();
        if ($item) $item->delete();
        return back()->with('success', 'Item removed.');
    }

    public function applyCoupon(Request $request)
    {
        $data = $request->validate(['code' => 'required|string|max:100']);
        $code = strtoupper(trim($data['code']));
        $coupon = Coupon::where('code', $code)->first();
        if (!$coupon) {
            return back()->with('error', 'Invalid coupon code.');
        }
        if (!$coupon->is_active) {
            return back()->with('error', 'Coupon is not active.');
        }
        $now = now();
        if ($coupon->valid_until && $now->gt($coupon->valid_until)) return back()->with('error', 'Coupon has expired.');
        if ($coupon->expires_at && $now->gt($coupon->expires_at)) return back()->with('error', 'Coupon has expired.');
        if ($coupon->starts_at && $now->lt($coupon->starts_at)) return back()->with('error', 'Coupon not yet valid.');
        if ($coupon->usage_limit !== null && $coupon->times_used >= $coupon->usage_limit) return back()->with('error', 'Coupon usage limit reached.');

        // check min order
        $cart = $this->getCart($request);
        $items = $cart->items()->with('variant.product')->get();
        $subtotal = 0;
        foreach ($items as $it) {
            $unit = $it->variant?->price ?? $it->variant?->product?->price ?? 0;
            $subtotal += (float)$unit * (int)$it->quantity;
        }
        $min = $coupon->min_order_amount ?? $coupon->min_order_value ?? 0;
        if ($subtotal < (float) $min) {
            return back()->with('error', 'Minimum order of $'.number_format($min,2).' required for this coupon.');
        }
        if ($items->count() === 0) return back()->with('error', 'Cart is empty.');

        $request->session()->put('coupon_code', $coupon->code);
        return back()->with('success', 'Coupon applied: '.$coupon->code);
    }

    public function removeCoupon(Request $request)
    {
        $request->session()->forget('coupon_code');
        return back()->with('success', 'Coupon removed.');
    }
}
