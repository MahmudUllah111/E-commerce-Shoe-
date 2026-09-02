<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AuthController;

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::put('/user/profile', [AuthController::class, 'updateProfile']);
Route::get('/user/orders', [AuthController::class, 'userOrders']);

// Customer store routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::post('/products/{id}/reviews', [ProductController::class, 'addReview']);
Route::get('/categories', [ProductController::class, 'categories']);
Route::get('/brands', [ProductController::class, 'brands']);
Route::get('/coupons/validate', [ProductController::class, 'validateCoupon']);
Route::post('/orders', [ProductController::class, 'checkout']);
Route::get('/orders/{orderNumber}', [ProductController::class, 'trackOrder']);
Route::post('/stock-notifications', [ProductController::class, 'subscribeStockNotification']);

// Admin routes
Route::get('/admin/catalog', [ProductController::class, 'getAdminCatalog']);
Route::post('/admin/inventory/update', [ProductController::class, 'updateVariantStock']);
Route::post('/admin/products', [ProductController::class, 'createProduct']);
Route::get('/admin/orders', [ProductController::class, 'getAdminOrders']);
Route::post('/admin/orders/status', [ProductController::class, 'updateOrderStatus']);
Route::post('/contact', [ProductController::class, 'submitContact']);