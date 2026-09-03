<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Storefront\AccountController;
use App\Http\Controllers\Storefront\CartController;
use App\Http\Controllers\Storefront\CheckoutController;
use App\Http\Controllers\Storefront\ReviewController;
use App\Http\Controllers\Storefront\StockNotificationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;

// Storefront — public Inertia pages
Route::get('/', function () {
    try {
        $bestSellers = Product::with(['brand','images'])->orderByDesc('rating')->take(6)->get();
        $featured = Product::with(['brand','images'])->where('is_featured', true)->take(4)->get();
        $newArrivals = Product::with(['brand','images'])->where('is_new', true)->latest()->take(6)->get();
        if ($featured->isEmpty()) $featured = $bestSellers->take(4);
        if ($newArrivals->isEmpty()) $newArrivals = Product::with(['brand','images'])->latest()->take(6)->get();
        $heroSlides = \App\Models\HeroSlide::where('is_active', true)->orderBy('sort_order')->get();
        if ($heroSlides->isEmpty()) {
            // fallback hardcoded if no slides
            $heroSlides = collect([
                ['id'=>1,'title'=>'Summer 2026 Collection','subtitle'=>'Engineered street-ready cushioning','badge'=>'SUPER SALE','discount_badge'=>'ENJOY UP TO 30% OFF','cta_text'=>'Shop Sale','cta_link'=>'/products?category=sneakers','bg_image'=>'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&auto=format&fit=crop&q=80','shoe_image'=>'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80'],
            ]);
        }
    } catch (\Throwable $e) {
        $bestSellers = $featured = $newArrivals = collect();
        $heroSlides = collect();
    }
    return Inertia::render('Storefront/Home', [
        'featured' => $featured,
        'bestSellers' => $bestSellers,
        'newArrivals' => $newArrivals,
        'heroSlides' => $heroSlides,
    ]);
})->name('storefront.home');

Route::get('/products', function (\Illuminate\Http\Request $request) {
    $q = Product::with(['brand','category','images','variants'])->where('status','active');
    if ($request->filled('category') && $request->category!=='all') {
        $catVal = $request->category;
        $q->where(function($qq) use ($catVal) {
            $qq->whereHas('category', fn($c) => $c->where('slug', $catVal)->orWhere('id', $catVal))
               ->orWhere('category_id', $catVal);
        });
    }
    if ($request->filled('gender') && $request->gender!=='all') {
        $q->where('gender', $request->gender);
    }
    if ($request->filled('brand') && $request->brand!=='all') {
        $q->whereHas('brand', fn($qq)=> $qq->where('slug', $request->brand));
    }
    if ($request->filled('search')) {
        $s = '%'.$request->search.'%';
        $q->where(fn($qq)=> $qq->where('name','like',$s)->orWhere('description','like',$s));
    }
    if ($request->filled('min_price')) {
        $q->where('price', '>=', (float)$request->min_price);
    }
    if ($request->filled('max_price')) {
        $q->where('price', '<=', (float)$request->max_price);
    }
    if ($request->filled('in_stock') && $request->in_stock==='1') {
        $q->whereHas('variants', fn($qq)=> $qq->where('stock_quantity','>',0));
    }
    if ($request->filled('on_sale') && $request->on_sale==='1') {
        $q->whereNotNull('discount_price');
    }
    $sort = $request->get('sort','newest');
    match($sort) {
        'price_low' => $q->orderBy('price','asc'),
        'price_high' => $q->orderBy('price','desc'),
        'rating' => $q->orderByDesc('rating'),
        default => $q->latest()
    };
    $products = $q->paginate(12)->withQueryString();
    // For filter counts & price stats (Kizora style)
    $categoryCounts = [];
    foreach (Category::all() as $cat) {
        $categoryCounts[$cat->slug] = Product::where('status','active')->where('category_id',$cat->id)->count();
        $categoryCounts[$cat->id] = $categoryCounts[$cat->slug];
    }
    $priceStats = [
        'min' => (int) Product::where('status','active')->min('price'),
        'max' => (int) Product::where('status','active')->max('price'),
    ];
    return Inertia::render('Storefront/Products/Index', [
        'products'=>$products,
        'filters'=> $request->only(['category','gender','brand','search','sort','min_price','max_price','in_stock','on_sale']),
        'brands'=> Brand::all(),
        'categories'=> Category::all(),
        'categoryCounts' => $categoryCounts,
        'priceStats' => $priceStats,
    ]);
})->name('products.index');

Route::get('/product/{slugOrId}', function ($slugOrId, \Illuminate\Http\Request $request) {
    $product = Product::with([
        'brand',
        'category',
        'images',
        'variants',
        'reviews' => fn($q) => $q->where('status','approved')->latest(),
        'reviews.user'
    ])
    ->where(function($q) use ($slugOrId) {
        $q->where('slug', $slugOrId);
        if (is_numeric($slugOrId)) {
            $q->orWhere('id', (int)$slugOrId);
        }
    })
    ->firstOrFail();
    // PDP reviews breakdown + related carousel
    $approvedReviews = $product->reviews; // already filtered approved
    $avg = $approvedReviews->avg('rating') ? round($approvedReviews->avg('rating'),1) : 0;
    $count = $approvedReviews->count();
    $breakdown = [];
    for($i=5;$i>=1;$i--) $breakdown[$i] = $approvedReviews->where('rating',$i)->count();
    $canReview = false;
    if ($request->user()) {
        $canReview = \App\Models\Order::where('user_id', $request->user()->id)->whereHas('items', fn($q)=> $q->where('product_id',$product->id))->exists();
        $alreadyReviewed = \App\Models\Review::where('product_id',$product->id)->where('user_id',$request->user()->id)->exists();
        if ($alreadyReviewed) $canReview = false;
    }
    $related = Product::with(['brand','images'])->where('category_id',$product->category_id)->where('id','!=',$product->id)->inRandomOrder()->take(8)->get();
    return Inertia::render('Storefront/Product/Show', [
        'product'=>$product,
        'reviewsMeta'=> ['average'=>$avg,'count'=>$count,'breakdown'=>$breakdown],
        'canReview'=>$canReview,
        'related'=>$related,
    ]);
})->name('product.show');

Route::post('/products/{product}/reviews', [ReviewController::class, 'store'])->middleware('auth')->name('products.reviews.store');

// === CART (session + DB, guest + auth) ===
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::patch('/cart/update', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/{id}', [CartController::class, 'destroy'])->name('cart.destroy');
Route::delete('/cart', [CartController::class, 'remove'])->name('cart.remove');
Route::post('/cart/coupon', [CartController::class, 'applyCoupon'])->name('cart.coupon.apply');
Route::delete('/cart/coupon', [CartController::class, 'removeCoupon'])->name('cart.coupon.remove');

// === CHECKOUT ===
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/order-success/{order}', [CheckoutController::class, 'success'])->name('order.success');
Route::get('/orders/{order}', [CheckoutController::class, 'track'])->name('orders.track');

// === WISHLIST ===
Route::get('/wishlist', [AccountController::class, 'wishlistIndex'])->name('wishlist.index');
Route::middleware('auth')->group(function(){
    Route::post('/wishlist/toggle', [AccountController::class, 'wishlistToggle'])->name('wishlist.toggle');
    Route::delete('/wishlist/{productId?}', [AccountController::class, 'wishlistDestroy'])->name('wishlist.destroy');
});

// === STOCK NOTIFICATIONS (wishlist + email when OOS, admin restock triggers email) ===
Route::post('/stock-notifications', [StockNotificationController::class, 'subscribe'])->name('stock.notify');

// === ACCOUNT (4.6 /account/*) ===
Route::middleware('auth')->prefix('account')->name('account.')->group(function(){
    Route::get('/', [AccountController::class, 'dashboard'])->name('index');
    Route::get('/dashboard', [AccountController::class, 'dashboard'])->name('dashboard');
    Route::get('/profile', [AccountController::class, 'profile'])->name('profile');
    Route::patch('/profile', [AccountController::class, 'updateProfile'])->name('profile.update');
    Route::put('/password', [AccountController::class, 'updatePassword'])->name('password.update');
    Route::get('/addresses', [AccountController::class, 'addresses'])->name('addresses');
    Route::post('/addresses', [AccountController::class, 'storeAddress'])->name('addresses.store');
    Route::patch('/addresses/{address}', [AccountController::class, 'updateAddress'])->name('addresses.update');
    Route::delete('/addresses/{address}', [AccountController::class, 'destroyAddress'])->name('addresses.destroy');
    Route::post('/addresses/{address}/default', [AccountController::class, 'setDefaultAddress'])->name('addresses.default');
    Route::get('/orders', [AccountController::class, 'orders'])->name('orders');
    Route::get('/orders/{order}', [AccountController::class, 'orderShow'])->name('orders.show');
    Route::get('/wishlist', [AccountController::class, 'wishlist'])->name('wishlist');
});
Route::get('/account-legacy', fn()=> Inertia::render('Storefront/Account/Index'))->middleware('auth')->name('account.legacy');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// === NEWSLETTER ===
Route::post('/newsletter/subscribe', function(\Illuminate\Http\Request $request){
    $data = $request->validate(['email'=>'required|email|max:255']);
    $exists = \Illuminate\Support\Facades\DB::table('newsletter_subscribers')->where('email', $data['email'])->exists();
    if ($exists) {
        return back()->with('success', 'You are already subscribed with this email! Welcome code: WELCOME10');
    }
    \Illuminate\Support\Facades\DB::table('newsletter_subscribers')->insert(['email'=>$data['email'],'created_at'=>now(),'updated_at'=>now()]);
    return back()->with('success','Thanks for subscribing! Use code WELCOME10 for 10% off your order.');
})->name('newsletter.subscribe');

// === CONTACT US & INQUIRIES ===
Route::get('/contact', function(){
    return Inertia::render('Storefront/Contact');
})->name('contact.index');

Route::post('/contact', function(\Illuminate\Http\Request $request){
    $data = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|max:255',
        'subject' => 'required|string|max:255',
        'message' => 'required|string|max:5000',
    ]);

    $id = \Illuminate\Support\Facades\DB::table('contact_messages')->insertGetId([
        'name' => $data['name'],
        'email' => $data['email'],
        'subject' => $data['subject'],
        'message' => $data['message'],
        'status' => 'unread',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // Send email alert to admin via configured SMTP
    try {
        $adminEmail = config('mail.from.address', env('MAIL_FROM_ADDRESS', 'mahmudsets@gmail.com'));
        $body = "Hello Administrator,\n\nA new customer inquiry has been received on TrustedMart:\n\n" .
                "Customer Name: {$data['name']}\n" .
                "Customer Email: {$data['email']}\n" .
                "Subject: {$data['subject']}\n\n" .
                "Message:\n{$data['message']}\n\n" .
                "Review & manage inquiries in Admin Panel: " . url('/admin/queries') . "\n\n" .
                "- TrustedMart Support Desk";

        \Illuminate\Support\Facades\Mail::raw($body, function ($msg) use ($adminEmail, $data) {
            $msg->to($adminEmail)
                ->subject("📩 New Customer Inquiry: {$data['subject']} (from {$data['name']})")
                ->replyTo($data['email'], $data['name']);
        });
    } catch (\Throwable $e) {
        \Illuminate\Support\Facades\Log::error('Contact form email failed: ' . $e->getMessage());
    }

    return back()->with('success', 'Thank you! Your message has been sent to our store administrator.');
})->name('contact.store');

// === TRACK ORDER ===
Route::get('/track-order', function(\Illuminate\Http\Request $request){
    $orderQuery = trim($request->get('order', ''));
    $order = null;
    $notFound = false;
    if ($orderQuery !== '') {
        $order = \App\Models\Order::with(['items.product.images', 'items.productVariant'])
            ->where('order_number', $orderQuery)
            ->orWhere('id', $orderQuery)
            ->first();
        if (!$order) {
            $notFound = true;
        }
    }
    return Inertia::render('Storefront/TrackOrder', [
        'order' => $order,
        'query' => $orderQuery,
        'notFound' => $notFound,
    ]);
})->name('orders.track_page');

// === ORDER INVOICE & PACKING SLIP DOWNLOADS (Customer & Guest) ===
Route::get('/orders/{order}/invoice', function ($order, \Illuminate\Http\Request $request) {
    $ord = \App\Models\Order::with(['items.product', 'items.productVariant', 'user'])
        ->where('order_number', $order)
        ->orWhere('id', $order)
        ->firstOrFail();

    if ($request->user() && $request->user()->role !== 'admin' && $ord->user_id && (int)$ord->user_id !== (int)$request->user()->id) {
        abort(403);
    }

    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdfs.invoice', ['order' => $ord])->setPaper('a4');
    return $pdf->download('invoice-'.$ord->order_number.'.pdf');
})->name('orders.invoice_customer');

Route::get('/orders/{order}/packing-slip', function ($order, \Illuminate\Http\Request $request) {
    $ord = \App\Models\Order::with(['items.product', 'items.productVariant', 'user'])
        ->where('order_number', $order)
        ->orWhere('id', $order)
        ->firstOrFail();

    if ($request->user() && $request->user()->role !== 'admin' && $ord->user_id && (int)$ord->user_id !== (int)$request->user()->id) {
        abort(403);
    }

    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdfs.packing-slip', ['order' => $ord])->setPaper('a4');
    return $pdf->download('packing-slip-'.$ord->order_number.'.pdf');
})->name('orders.packing_customer');

// === STATIC PAGES (CMS) ===
Route::get('/pages/{slug}', function($slug){
    $page = \App\Models\StaticPage::where('slug',$slug)->first();
    if (!$page) {
        $title = ucwords(str_replace(['-', '_'], ' ', $slug));
        $page = (object)[
            'title' => $title,
            'content' => "<p>Welcome to TrustedMart's {$title} page. For any urgent inquiries, please reach out via our <a href='/contact' class='text-rose-600 font-bold underline'>Contact Us</a> page.</p>"
        ];
    }
    return Inertia::render('Storefront/Page/Show', ['page'=>$page]);
})->name('pages.show');

// fallback 404 handled by Inertia error page via exception handler
Route::get('/404-preview', fn()=> Inertia::render('Error', ['status'=>404]))->name('error.preview');
Route::fallback(function(){ return Inertia::render('Error', ['status'=>404]); });

require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
