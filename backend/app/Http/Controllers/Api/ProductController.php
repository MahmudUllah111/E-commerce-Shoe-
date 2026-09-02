<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    // GET /api/products
    public function index(Request $request)
    {
        $query = DB::table('products')
            ->join('brands', 'products.brand_id', '=', 'brands.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select('products.*', 'brands.name as brand_name', 'categories.name as category_name');

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('categories.slug', $request->category);
        }
        if ($request->filled('gender') && $request->gender !== 'all') {
            $query->where('products.gender', $request->gender);
        }
        if ($request->filled('brand') && $request->brand !== 'all') {
            $query->where('brands.slug', $request->brand);
        }
        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('products.name', 'like', $search)
                  ->orWhere('products.description', 'like', $search)
                  ->orWhere('brands.name', 'like', $search);
            });
        }

        $sort = $request->get('sort', 'newest');
        switch ($sort) {
            case 'price_low':
                $query->orderBy('products.price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('products.price', 'desc');
                break;
            case 'rating':
                $query->orderBy('products.rating', 'desc');
                break;
            default:
                $query->orderBy('products.created_at', 'desc');
                break;
        }

        $products = $query->paginate(12);

        foreach ($products->items() as $p) {
            $p->images = DB::table('product_images')->where('product_id', $p->id)->pluck('image_url');
            $p->variants = DB::table('product_variants')->where('product_id', $p->id)->get();
        }

        return response()->json($products);
    }

    // GET /api/products/{id}
    public function show($id)
    {
        $product = DB::table('products')
            ->join('brands', 'products.brand_id', '=', 'brands.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select('products.*', 'brands.name as brand_name', 'categories.name as category_name')
            ->where('products.id', $id)
            ->first();

        if (!$product) {
            return response()->json(['message' => 'Shoe not found'], 404);
        }

        $product->images = DB::table('product_images')->where('product_id', $product->id)->pluck('image_url');
        $product->variants = DB::table('product_variants')->where('product_id', $product->id)->get();
        $product->reviews = DB::table('reviews')->where('product_id', $product->id)->where('status', 'approved')->get();

        return response()->json($product);
    }

    // POST /api/products/{id}/reviews
    public function addReview(Request $request, $id)
    {
        $validated = $request->validate([
            'author_name' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:5|max:1000',
        ]);

        $reviewId = DB::table('reviews')->insertGetId([
            'product_id' => $id,
            'author_name' => $validated['author_name'],
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'status' => 'approved',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $avgRating = DB::table('reviews')->where('product_id', $id)->where('status', 'approved')->avg('rating');
        $reviewsCount = DB::table('reviews')->where('product_id', $id)->where('status', 'approved')->count();

        DB::table('products')->where('id', $id)->update([
            'rating' => round($avgRating, 1),
            'reviews_count' => $reviewsCount,
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Review posted successfully!',
            'review' => DB::table('reviews')->where('id', $reviewId)->first()
        ], 201);
    }

    // GET /api/categories
    public function categories()
    {
        return response()->json(DB::table('categories')->get());
    }

    // GET /api/brands
    public function brands()
    {
        return response()->json(DB::table('brands')->get());
    }

    // GET /api/coupons/validate
    public function validateCoupon(Request $request)
    {
        $code = $request->query('code');
        $subtotal = (float)$request->query('subtotal', 0);

        $coupon = DB::table('coupons')->where('code', $code)->where('is_active', true)->first();
        if (!$coupon) {
            return response()->json(['valid' => false, 'message' => 'Invalid or expired coupon code'], 404);
        }

        if ($subtotal < (float)$coupon->min_order_amount) {
            return response()->json(['valid' => false, 'message' => "Minimum order of \${$coupon->min_order_amount} required"], 400);
        }

        $discount = ($coupon->discount_type === 'percentage')
            ? ($subtotal * ($coupon->discount_value / 100))
            : min($coupon->discount_value, $subtotal);

        return response()->json(['valid' => true, 'discount' => round($discount, 2), 'coupon' => $coupon]);
    }

    // POST /api/orders
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'shipping_address' => 'required|string',
            'shipping_method' => 'nullable|string',
            'payment_method' => 'nullable|string',
            'coupon_code' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated) {
            $subtotal = 0;
            $itemsToInsert = [];

            foreach ($validated['items'] as $item) {
                $variant = DB::table('product_variants')->where('id', $item['variant_id'])->lockForUpdate()->first();
                $product = DB::table('products')->where('id', $item['product_id'])->first();

                if (!$variant || $variant->stock_quantity < $item['quantity']) {
                    return response()->json(['message' => "Insufficient stock for {$product->name} (Size: {$variant->size_value})"], 422);
                }

                $subtotal += (float)$product->price * $item['quantity'];
                $itemsToInsert[] = [
                    'product_id' => $product->id,
                    'variant_id' => $variant->id,
                    'size' => $variant->size_value,
                    'color' => $variant->color_name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                ];

                DB::table('product_variants')->where('id', $variant->id)->decrement('stock_quantity', $item['quantity']);
            }

            $discount = 0;
            if (!empty($validated['coupon_code'])) {
                $coupon = DB::table('coupons')->where('code', $validated['coupon_code'])->where('is_active', true)->first();
                if ($coupon && $subtotal >= (float)$coupon->min_order_amount) {
                    $discount = ($coupon->discount_type === 'percentage')
                        ? ($subtotal * ($coupon->discount_value / 100))
                        : min($coupon->discount_value, $subtotal);
                }
            }

            $shipping = ($subtotal > 100) ? 0.00 : 15.00;
            $total = max(0, $subtotal - $discount + $shipping);
            $orderNumber = 'ORD-' . strtoupper(uniqid());

            $orderId = DB::table('orders')->insertGetId([
                'order_number' => $orderNumber,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'shipping_address' => $validated['shipping_address'],
                'shipping_method' => $validated['shipping_method'] ?? 'Standard Shipping',
                'subtotal' => round($subtotal, 2),
                'discount_amount' => round($discount, 2),
                'tax_amount' => 0.00,
                'total_amount' => round($total, 2),
                'coupon_code' => $validated['coupon_code'] ?? null,
                'status' => 'processing',
                'payment_method' => $validated['payment_method'] ?? 'Cash on Delivery',
                'payment_status' => 'paid',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($itemsToInsert as $item) {
                DB::table('order_items')->insert([
                    'order_id' => $orderId,
                    'product_id' => $item['product_id'],
                    'size' => $item['size'],
                    'color' => $item['color'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return response()->json([
                'success' => true,
                'order_number' => $orderNumber,
                'total' => round($total, 2),
                'items_count' => count($itemsToInsert)
            ], 201);
        });
    }

    // GET /api/orders/{orderNumber}
    public function trackOrder($orderNumber)
    {
        $order = DB::table('orders')->where('order_number', $orderNumber)->first();
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $items = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('order_items.*', 'products.name as product_name', 'products.slug as product_slug')
            ->where('order_items.order_id', $order->id)
            ->get();

        foreach ($items as $item) {
            $item->image = DB::table('product_images')->where('product_id', $item->product_id)->value('image_url');
        }

        $order->items = $items;
        return response()->json($order);
    }

    // POST /api/stock-notifications
    public function subscribeStockNotification(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'required|exists:product_variants,id',
        ]);

        DB::table('stock_notifications')->updateOrInsert(
            [
                'email' => $validated['email'],
                'variant_id' => $validated['variant_id']
            ],
            [
                'product_id' => $validated['product_id'],
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        return response()->json(['success' => true, 'message' => 'Notification recorded.']);
    }

    // GET /api/admin/catalog
    public function getAdminCatalog()
    {
        $products = DB::table('products')
            ->join('brands', 'products.brand_id', '=', 'brands.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select('products.*', 'brands.name as brand_name', 'categories.name as category_name')
            ->orderBy('products.id', 'desc')
            ->get();

        foreach ($products as $p) {
            $p->variants = DB::table('product_variants')->where('product_id', $p->id)->get();
            $p->images = DB::table('product_images')->where('product_id', $p->id)->pluck('image_url');
            $p->pending_notifications = DB::table('stock_notifications')
                ->where('product_id', $p->id)
                ->where('status', 'pending')
                ->count();
        }

        return response()->json($products);
    }

    // POST /api/admin/inventory/update
    public function updateVariantStock(Request $request)
    {
        $validated = $request->validate([
            'variant_id' => 'required|exists:product_variants,id',
            'new_stock' => 'required|integer|min:0',
        ]);

        $variant = DB::table('product_variants')->where('id', $validated['variant_id'])->first();
        $previousStock = (int)$variant->stock_quantity;

        DB::table('product_variants')
            ->where('id', $validated['variant_id'])
            ->update([
                'stock_quantity' => $validated['new_stock'],
                'updated_at' => now(),
            ]);

        $notifiedCustomers = [];

        // When stock goes from 0 to > 0, notify subscribed customers
        if ($previousStock === 0 && $validated['new_stock'] > 0) {
            $product = DB::table('products')->where('id', $variant->product_id)->first();

            $subscribers = DB::table('stock_notifications')
                ->where('variant_id', $variant->id)
                ->where('status', 'pending')
                ->get();

            foreach ($subscribers as $sub) {
                $emailBody = "Hello,\n\nGood news! The \"{$product->name}\" (Size: US {$variant->size_value}) that you requested from your wishlist is now back in stock!\n\nPlease visit our store at: http://localhost:5173/product/{$product->id} to purchase it before it sells out.\n\nThank you for choosing TrustedMart!";

                try {
                    Mail::raw($emailBody, function ($message) use ($sub, $product) {
                        $message->to($sub->email)
                                ->subject("Back in Stock: {$product->name} is available now!");
                    });
                } catch (\Exception $e) {
                    // Fail silently if network/mail transport is temporarily unavailable
                }

                DB::table('stock_notifications')
                    ->where('id', $sub->id)
                    ->update([
                        'status' => 'notified',
                        'notified_at' => now(),
                        'updated_at' => now()
                    ]);

                $notifiedCustomers[] = [
                    'email' => $sub->email,
                    'shoe_name' => $product->name,
                    'size' => $variant->size_value,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Stock updated to {$validated['new_stock']} units.",
            'notified_customers' => $notifiedCustomers,
            'notified_count' => count($notifiedCustomers),
            'new_stock' => $validated['new_stock']
        ]);
    }

    // POST /api/admin/products
    public function createProduct(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'gender' => 'required|in:Men,Women,Kids,Unisex',
            'price' => 'required|numeric|min:1',
            'description' => 'required|string',
            'materials' => 'nullable|string',
            'image_url' => 'nullable|string',
            'sizes' => 'required|array|min:1',
            'sizes.*.size_value' => 'required|string',
            'sizes.*.color_name' => 'nullable|string',
            'sizes.*.stock_quantity' => 'required|integer|min:0',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $slug = Str::slug($validated['name']) . '-' . rand(100, 999);

            $productId = DB::table('products')->insertGetId([
                'name' => $validated['name'],
                'slug' => $slug,
                'brand_id' => $validated['brand_id'],
                'category_id' => $validated['category_id'],
                'gender' => $validated['gender'],
                'price' => $validated['price'],
                'rating' => 5.0,
                'reviews_count' => 0,
                'is_new' => true,
                'is_featured' => false,
                'description' => $validated['description'],
                'materials' => $validated['materials'] ?? 'Synthetic and mesh upper',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $imageUrl = '1.jpg';
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('products'), $filename);
                $imageUrl = $filename;
            } elseif (!empty($validated['image_url'])) {
                $imageUrl = $validated['image_url'];
            }

            DB::table('product_images')->insert([
                'product_id' => $productId,
                'image_url' => $imageUrl,
                'is_primary' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($validated['sizes'] as $sz) {
                DB::table('product_variants')->insert([
                    'product_id' => $productId,
                    'size_value' => $sz['size_value'],
                    'color_name' => $sz['color_name'] ?? 'Standard',
                    'color_hex' => '#111111',
                    'stock_quantity' => (int)$sz['stock_quantity'],
                    'low_stock_threshold' => 3,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return response()->json(['success' => true, 'product_id' => $productId], 201);
        });
    }

    // GET /api/admin/orders
    public function getAdminOrders()
    {
        $orders = DB::table('orders')->orderBy('id', 'desc')->get();

        foreach ($orders as $order) {
            $order->items = DB::table('order_items')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->select('order_items.*', 'products.name as product_name')
                ->where('order_items.order_id', $order->id)
                ->get();
        }

        return response()->json($orders);
    }

    // POST /api/admin/orders/status
    public function updateOrderStatus(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'status' => 'required|in:processing,shipped,delivered,cancelled',
        ]);

        DB::table('orders')->where('id', $validated['order_id'])->update([
            'status' => $validated['status'],
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Order status updated to {$validated['status']}"
        ]);
    }
    

    // POST /api/contact
    public function submitContact(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string|min:5|max:2000',
        ]);

        $id = DB::table('contact_inquiries')->insertGetId([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'message' => $validated['message'],
            'status' => 'unread',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Optional: Send an email alert to your Gmail
        try {
            Mail::raw("New Contact Inquiry from {$validated['name']} ({$validated['email']}):\n\n{$validated['message']}", function ($m) use ($validated) {
                $m->to('mahmudsets@gmail.com')
                  ->subject("New Customer Inquiry: {$validated['name']}");
            });
        } catch (\Exception $e) {
            // Fail gracefully if mail server is busy
        }

        return response()->json(['success' => true, 'message' => 'Message stored successfully!'], 201);
    }





}