<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // --- categories enhancements ---
        if (Schema::hasTable('categories')) {
            Schema::table('categories', function (Blueprint $table) {
                if (!Schema::hasColumn('categories', 'parent_id')) {
                    $table->unsignedBigInteger('parent_id')->nullable()->after('id');
                    $table->foreign('parent_id')->references('id')->on('categories')->nullOnDelete();
                }
                if (!Schema::hasColumn('categories', 'image')) {
                    $table->string('image')->nullable()->after('slug');
                }
                if (!Schema::hasColumn('categories', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('image');
                }
                // softDeletes + indexes
                if (!Schema::hasColumn('categories', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
            // indexes
            try { Schema::table('categories', fn(Blueprint $t) => $t->index('slug')); } catch (\Throwable $e) {}
            try { Schema::table('categories', fn(Blueprint $t) => $t->index('is_active')); } catch (\Throwable $e) {}
        }

        // --- brands enhancements ---
        if (Schema::hasTable('brands')) {
            Schema::table('brands', function (Blueprint $table) {
                if (!Schema::hasColumn('brands', 'logo')) {
                    $table->string('logo')->nullable()->after('slug');
                }
                if (!Schema::hasColumn('brands', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('logo');
                }
            });
            try { Schema::table('brands', fn(Blueprint $t) => $t->index('slug')); } catch (\Throwable $e) {}
        }

        // --- products enhancements ---
        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                if (!Schema::hasColumn('products', 'sku')) {
                    $table->string('sku')->nullable()->unique()->after('slug');
                }
                if (!Schema::hasColumn('products', 'base_price')) {
                    $table->decimal('base_price', 10, 2)->nullable()->after('price');
                }
                if (!Schema::hasColumn('products', 'discount_price')) {
                    $table->decimal('discount_price', 10, 2)->nullable()->after('base_price');
                }
                if (!Schema::hasColumn('products', 'status')) {
                    $table->enum('status', ['active','draft','out_of_stock'])->default('active')->after('discount_price');
                }
                if (!Schema::hasColumn('products', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
            try { Schema::table('products', fn(Blueprint $t) => $t->index('slug')); } catch (\Throwable $e) {}
            try { Schema::table('products', fn(Blueprint $t) => $t->index('sku')); } catch (\Throwable $e) {}
            try { Schema::table('products', fn(Blueprint $t) => $t->index('status')); } catch (\Throwable $e) {}
            try { Schema::table('products', fn(Blueprint $t) => $t->index('brand_id')); } catch (\Throwable $e) {}
            try { Schema::table('products', fn(Blueprint $t) => $t->index('category_id')); } catch (\Throwable $e) {}
        }

        // --- product_images enhancements ---
        if (Schema::hasTable('product_images')) {
            Schema::table('product_images', function (Blueprint $table) {
                if (!Schema::hasColumn('product_images', 'display_order')) {
                    $table->integer('display_order')->default(0)->after('is_primary');
                }
                if (!Schema::hasColumn('product_images', 'url')) {
                    // keep image_url, add alias column if missing for spec compliance
                    $table->string('url')->nullable()->after('image_url');
                }
            });
        }

        // --- product_variants enhancements ---
        if (Schema::hasTable('product_variants')) {
            Schema::table('product_variants', function (Blueprint $table) {
                if (!Schema::hasColumn('product_variants', 'sku')) {
                    $table->string('sku')->nullable()->unique()->after('product_id');
                }
                if (!Schema::hasColumn('product_variants', 'price')) {
                    $table->decimal('price', 10, 2)->nullable()->after('color_hex');
                }
                if (!Schema::hasColumn('product_variants', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('low_stock_threshold');
                }
            });
            try { Schema::table('product_variants', fn(Blueprint $t) => $t->index('sku')); } catch (\Throwable $e) {}
        }

        // --- addresses ---
        if (!Schema::hasTable('addresses')) {
            Schema::create('addresses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('label')->nullable(); // Home, Office
                $table->string('street');
                $table->string('city');
                $table->string('state')->nullable();
                $table->string('zip')->nullable();
                $table->string('country')->default('Bangladesh');
                $table->boolean('is_default')->default(false);
                $table->timestamps();
                $table->index('user_id');
            });
        }

        // --- attributes ---
        if (!Schema::hasTable('attributes')) {
            Schema::create('attributes', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique(); // Size, Color
                $table->string('slug')->unique();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('attribute_values')) {
            Schema::create('attribute_values', function (Blueprint $table) {
                $table->id();
                $table->foreignId('attribute_id')->constrained('attributes')->onDelete('cascade');
                $table->string('value'); // 9, Black
                $table->integer('display_order')->default(0);
                $table->timestamps();
                $table->index(['attribute_id']);
            });
        }

        if (!Schema::hasTable('category_attribute')) {
            Schema::create('category_attribute', function (Blueprint $table) {
                $table->id();
                $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
                $table->foreignId('attribute_id')->constrained('attributes')->onDelete('cascade');
                $table->unique(['category_id','attribute_id']);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('variant_attribute_value')) {
            Schema::create('variant_attribute_value', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_variant_id')->constrained('product_variants')->onDelete('cascade');
                $table->foreignId('attribute_value_id')->constrained('attribute_values')->onDelete('cascade');
                $table->unique(['product_variant_id','attribute_value_id'], 'variant_attr_unique');
                $table->timestamps();
            });
        }

        // --- carts ---
        if (!Schema::hasTable('carts')) {
            Schema::create('carts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
                $table->string('session_id')->nullable()->index();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('cart_items')) {
            Schema::create('cart_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('cart_id')->constrained('carts')->onDelete('cascade');
                $table->foreignId('product_variant_id')->constrained('product_variants')->onDelete('cascade');
                $table->integer('quantity')->default(1);
                $table->timestamps();
                $table->unique(['cart_id','product_variant_id']);
            });
        }

        // --- wishlists ---
        if (!Schema::hasTable('wishlists')) {
            Schema::create('wishlists', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
                $table->timestamps();
                $table->unique(['user_id','product_id']);
            });
        }

        // --- coupons enhancements ---
        if (Schema::hasTable('coupons')) {
            Schema::table('coupons', function (Blueprint $table) {
                if (!Schema::hasColumn('coupons', 'type')) {
                    $table->enum('type', ['percentage','fixed'])->default('percentage')->after('code');
                }
                if (!Schema::hasColumn('coupons', 'value')) {
                    $table->decimal('value', 10, 2)->nullable()->after('type');
                }
                if (!Schema::hasColumn('coupons', 'min_order_value')) {
                    $table->decimal('min_order_value', 10, 2)->default(0)->after('value');
                }
                if (!Schema::hasColumn('coupons', 'usage_limit')) {
                    $table->integer('usage_limit')->nullable()->after('min_order_value');
                }
                if (!Schema::hasColumn('coupons', 'times_used')) {
                    $table->integer('times_used')->default(0)->after('usage_limit');
                }
                if (!Schema::hasColumn('coupons', 'starts_at')) {
                    $table->dateTime('starts_at')->nullable()->after('times_used');
                }
                if (!Schema::hasColumn('coupons', 'expires_at')) {
                    $table->dateTime('expires_at')->nullable()->after('starts_at');
                }
                // keep existing discount_type/discount_value for BC
            });
        }

        // --- stock_logs ---
        if (!Schema::hasTable('stock_logs')) {
            Schema::create('stock_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_variant_id')->constrained('product_variants')->onDelete('cascade');
                $table->integer('change_amount');
                $table->string('reason')->nullable(); // manual adjustment, order placed, restock
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
                $table->index('product_variant_id');
            });
        }

        // --- static_pages ---
        if (!Schema::hasTable('static_pages')) {
            Schema::create('static_pages', function (Blueprint $table) {
                $table->id();
                $table->string('slug')->unique();
                $table->string('title');
                $table->longText('content')->nullable();
                $table->timestamps();
                $table->index('slug');
            });
        }

        // --- store_settings ---
        if (!Schema::hasTable('store_settings')) {
            Schema::create('store_settings', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->text('value')->nullable(); // JSON for shipping zones/rates
                $table->timestamps();
            });
        }

        // --- newsletter_subscribers ---
        if (!Schema::hasTable('newsletter_subscribers')) {
            Schema::create('newsletter_subscribers', function (Blueprint $table) {
                $table->id();
                $table->string('email')->unique();
                $table->timestamps();
            });
        }

        // --- contact_messages (alias for inquiries, keep both for BC) ---
        if (!Schema::hasTable('contact_messages')) {
            Schema::create('contact_messages', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email');
                $table->string('subject')->nullable();
                $table->text('message');
                $table->string('status')->default('unread');
                $table->timestamps();
            });
        }

        // --- orders enhancements: softDeletes, indexes, missing columns ---
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                if (!Schema::hasColumn('orders', 'shipping_address_id')) {
                    $table->unsignedBigInteger('shipping_address_id')->nullable()->after('shipping_address');
                }
                if (!Schema::hasColumn('orders', 'coupon_id')) {
                    $table->unsignedBigInteger('coupon_id')->nullable()->after('coupon_code');
                }
                if (!Schema::hasColumn('orders', 'shipping_cost')) {
                    $table->decimal('shipping_cost', 10, 2)->default(0)->after('subtotal');
                }
                if (!Schema::hasColumn('orders', 'tax')) {
                    $table->decimal('tax', 10, 2)->default(0)->after('shipping_cost');
                }
                if (!Schema::hasColumn('orders', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
            try { Schema::table('orders', fn(Blueprint $t) => $t->index('order_number')); } catch (\Throwable $e) {}
            try { Schema::table('orders', fn(Blueprint $t) => $t->index('status')); } catch (\Throwable $e) {}
            try { Schema::table('orders', fn(Blueprint $t) => $t->index('customer_email')); } catch (\Throwable $e) {}
        }

        // --- order_items enhancements ---
        if (Schema::hasTable('order_items')) {
            Schema::table('order_items', function (Blueprint $table) {
                if (!Schema::hasColumn('order_items', 'product_variant_id')) {
                    $table->unsignedBigInteger('product_variant_id')->nullable()->after('product_id');
                }
                if (!Schema::hasColumn('order_items', 'product_name_snapshot')) {
                    $table->string('product_name_snapshot')->nullable()->after('product_variant_id');
                }
                if (!Schema::hasColumn('order_items', 'price_snapshot')) {
                    $table->decimal('price_snapshot', 10, 2)->nullable()->after('product_name_snapshot');
                }
            });
        }

        // --- reviews enhancements ---
        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                if (!Schema::hasColumn('reviews', 'user_id')) {
                    $table->foreignId('user_id')->nullable()->after('product_id')->constrained('users')->nullOnDelete();
                }
                if (!Schema::hasColumn('reviews', 'is_approved')) {
                    $table->boolean('is_approved')->default(true)->after('status');
                }
                if (!Schema::hasColumn('reviews', 'author_name')) {
                    // rename user_name -> author_name alias if needed
                    if (Schema::hasColumn('reviews', 'user_name')) {
                        // keep both, add alias
                        $table->string('author_name')->nullable()->after('user_name');
                    } else {
                        $table->string('author_name')->nullable()->after('product_id');
                    }
                }
            });
        }

        // --- users enhancements ---
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'is_blocked')) {
                    $table->boolean('is_blocked')->default(false)->after('postal_code');
                }
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('newsletter_subscribers');
        Schema::dropIfExists('store_settings');
        Schema::dropIfExists('static_pages');
        Schema::dropIfExists('stock_logs');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::dropIfExists('variant_attribute_value');
        Schema::dropIfExists('category_attribute');
        Schema::dropIfExists('attribute_values');
        Schema::dropIfExists('attributes');
        Schema::dropIfExists('addresses');
        // column drops omitted for safety
    }
};
