<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                if (!Schema::hasColumn('reviews', 'admin_reply')) {
                    $table->text('admin_reply')->nullable()->after('comment');
                }
                if (!Schema::hasColumn('reviews', 'admin_reply_at')) {
                    $table->timestamp('admin_reply_at')->nullable()->after('admin_reply');
                }
                if (!Schema::hasColumn('reviews', 'user_id')) {
                    // already added, ignore
                }
            });
        }
        if (Schema::hasTable('coupons')) {
            Schema::table('coupons', function (Blueprint $table) {
                if (!Schema::hasColumn('coupons', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('valid_until');
                }
            });
        }
    }
    public function down(): void {
        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                if (Schema::hasColumn('reviews', 'admin_reply')) $table->dropColumn('admin_reply');
                if (Schema::hasColumn('reviews', 'admin_reply_at')) $table->dropColumn('admin_reply_at');
            });
        }
    }
};
