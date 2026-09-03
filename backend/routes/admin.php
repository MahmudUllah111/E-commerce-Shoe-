<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\AttributeController;
use App\Http\Controllers\Admin\HeroSlideController;

// All admin routes protected by auth + role:Super Admin, Manager, Staff
Route::middleware(['auth', 'role:admin,Manager,Staff,Super Admin'])->prefix('admin')->name('admin.')->group(function () {

    Route::get('/', function () {
        return redirect()->route('admin.dashboard');
    });

    Route::get('/dashboard', [DashboardController::class,'index'])->name('dashboard');

    // === PRODUCTS ===
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::post('/products/bulk', [ProductController::class, 'bulk'])->name('products.bulk');
    Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::post('/products/{product}', [ProductController::class, 'update'])->name('products.update'); // POST for file upload ( Inertia formData )
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::patch('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

    // === CATEGORIES ===
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::post('/categories/bulk', [CategoryController::class, 'bulk'])->name('categories.bulk');
    Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
    Route::post('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::patch('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // === BRANDS ===
    Route::get('/brands', [BrandController::class, 'index'])->name('brands.index');
    Route::post('/brands', [BrandController::class, 'store'])->name('brands.store');
    Route::post('/brands/bulk', [BrandController::class, 'bulk'])->name('brands.bulk');
    Route::post('/brands/{brand}', [BrandController::class, 'update'])->name('brands.update');
    Route::put('/brands/{brand}', [BrandController::class, 'update']);
    Route::patch('/brands/{brand}', [BrandController::class, 'update']);
    Route::delete('/brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy');

    // === ORDERS ===
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
    Route::get('/orders/{order}/invoice', [OrderController::class, 'invoice'])->name('orders.invoice');
    Route::get('/orders/{order}/packing-slip', [OrderController::class, 'packingSlip'])->name('orders.packing');
    Route::post('/orders/{order}/refund', [OrderController::class, 'refund'])->name('orders.refund');

    // === CUSTOMERS (3.6) ===
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('/customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
    Route::post('/customers/{customer}/toggle-block', [CustomerController::class, 'toggleBlock'])->name('customers.toggleBlock');
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');

    // === COUPONS (3.8) ===
    Route::get('/coupons', [CouponController::class, 'index'])->name('coupons.index');
    Route::post('/coupons', [CouponController::class, 'store'])->name('coupons.store');
    Route::patch('/coupons/{coupon}', [CouponController::class, 'update'])->name('coupons.update');
    Route::put('/coupons/{coupon}', [CouponController::class, 'update']);
    Route::post('/coupons/{coupon}/toggle', [CouponController::class, 'toggle'])->name('coupons.toggle');
    Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy'])->name('coupons.destroy');

    // === REVIEWS (3.9) ===
    Route::get('/reviews', [AdminReviewController::class, 'index'])->name('reviews.index');
    Route::post('/reviews/{review}/approve', [AdminReviewController::class, 'approve'])->name('reviews.approve');
    Route::post('/reviews/{review}/reject', [AdminReviewController::class, 'reject'])->name('reviews.reject');
    Route::post('/reviews/{review}/reply', [AdminReviewController::class, 'reply'])->name('reviews.reply');
    Route::delete('/reviews/{review}', [AdminReviewController::class, 'destroy'])->name('reviews.destroy');

    // === QUERIES / CONTACT INQUIRIES ===
    Route::get('/queries', [\App\Http\Controllers\Admin\ContactQueryController::class, 'index'])->name('queries.index');
    Route::patch('/queries/{query}/status', [\App\Http\Controllers\Admin\ContactQueryController::class, 'markStatus'])->name('queries.status');
    Route::delete('/queries/{query}', [\App\Http\Controllers\Admin\ContactQueryController::class, 'destroy'])->name('queries.destroy');

    // === INVENTORY (3.7) ===
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::get('/inventory/logs', [InventoryController::class, 'logs'])->name('inventory.logs');
    Route::patch('/inventory/{variant}/stock', [InventoryController::class, 'updateStock'])->name('inventory.stock');
    Route::patch('/inventory/{variant}/threshold', [InventoryController::class, 'updateThreshold'])->name('inventory.threshold');
    Route::post('/inventory/{variant}/adjust', [InventoryController::class, 'adjust'])->name('inventory.adjust');

    // === DASHBOARD already above ===

    // === ATTRIBUTES (3.4) ===
    Route::get('/attributes', [AttributeController::class,'index'])->name('attributes.index');
    Route::post('/attributes', [AttributeController::class,'store'])->name('attributes.store');
    Route::patch('/attributes/{attribute}', [AttributeController::class,'update'])->name('attributes.update');
    Route::put('/attributes/{attribute}', [AttributeController::class,'update']);
    Route::delete('/attributes/{attribute}', [AttributeController::class,'destroy'])->name('attributes.destroy');
    Route::post('/attributes/{attribute}/values', [AttributeController::class,'storeValue'])->name('attributes.values.store');
    Route::patch('/attribute-values/{value}', [AttributeController::class,'updateValue'])->name('attributes.values.update');
    Route::delete('/attribute-values/{value}', [AttributeController::class,'destroyValue'])->name('attributes.values.destroy');
    Route::post('/attributes/{attribute}/reorder', [AttributeController::class,'reorderValues'])->name('attributes.values.reorder');
    Route::post('/attributes/{attribute}/categories', [AttributeController::class,'syncCategories'])->name('attributes.categories.sync');

    // === HERO BANNER (admin manageable, auto-rotating) ===
    Route::get('/hero', [HeroSlideController::class,'index'])->name('hero.index');
    Route::post('/hero', [HeroSlideController::class,'store'])->name('hero.store');
    Route::post('/hero/{heroSlide}', [HeroSlideController::class,'update'])->name('hero.update');
    Route::patch('/hero/{heroSlide}', [HeroSlideController::class,'update']);
    Route::put('/hero/{heroSlide}', [HeroSlideController::class,'update']);
    Route::delete('/hero/{heroSlide}', [HeroSlideController::class,'destroy'])->name('hero.destroy');
    Route::post('/hero/reorder', [HeroSlideController::class,'reorder'])->name('hero.reorder');

    // === CMS PAGES (3.10) ===
    Route::get('/pages', [PageController::class,'index'])->name('pages.index');
    Route::post('/pages', [PageController::class,'store'])->name('pages.store');
    Route::get('/pages/{page}/edit', [PageController::class,'edit'])->name('pages.edit');
    Route::patch('/pages/{page}', [PageController::class,'update'])->name('pages.update');
    Route::put('/pages/{page}', [PageController::class,'update']);
    Route::delete('/pages/{page}', [PageController::class,'destroy'])->name('pages.destroy');

    // === REPORTS (3.11) ===
    Route::get('/reports', [ReportController::class,'index'])->name('reports.index');
    Route::get('/reports/export', [ReportController::class,'export'])->name('reports.export');

    // === SETTINGS (3.12) ===
    Route::get('/settings', [SettingController::class,'index'])->name('settings.index');
    Route::post('/settings', [SettingController::class,'update'])->name('settings.update');
    Route::patch('/settings', [SettingController::class,'update']);
    Route::post('/settings/users', [SettingController::class,'storeUser'])->name('settings.users.store');
    Route::patch('/settings/users/{user}', [SettingController::class,'updateUser'])->name('settings.users.update');
    Route::put('/settings/users/{user}', [SettingController::class,'updateUser']);
    Route::delete('/settings/users/{user}', [SettingController::class,'destroyUser'])->name('settings.users.destroy');
});
