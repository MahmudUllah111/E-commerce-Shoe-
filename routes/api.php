<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AuthController;

// Public Catalog & Stores
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/brands', [ProductController::class, 'brands']);
Route::get('/categories', [ProductController::class, 'categories']);
Route::get('/coupons/validate', [ProductController::class, 'validateCoupon']);

// Customer Orders & Tracking
Route::post('/orders', [ProductController::class, 'checkout']);
Route::get('/orders/{orderNumber}', [ProductController::class, 'trackOrder']);
Route::get('/user/orders', [ProductController::class, 'userOrders']);

// Reviews & Restock Alerts
Route::post('/products/{id}/reviews', [ProductController::class, 'addReview']);
Route::post('/stock-notifications', [ProductController::class, 'subscribeStockNotification']);
Route::post('/contact', [ProductController::class, 'submitContact']);

// Authentication
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout']);

// Admin Panel Routes
Route::get('/admin/catalog', [ProductController::class, 'getAdminCatalog']);
Route::post('/admin/products', [ProductController::class, 'createProduct']);
Route::post('/admin/inventory/update', [ProductController::class, 'updateVariantStock']);
Route::get('/admin/orders', [ProductController::class, 'getAdminOrders']);
Route::post('/admin/orders/status', [ProductController::class, 'updateOrderStatus']);
Route::get('/admin/inquiries', [ProductController::class, 'getAdminInquiries']);
Route::get('/admin/customers', [ProductController::class, 'getAdminCustomers']);