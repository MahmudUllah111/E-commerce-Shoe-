<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_notifications', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('variant_id')->constrained('product_variants')->onDelete('cascade');
            $table->enum('status', ['pending', 'notified'])->default('pending');
            $table->timestamp('notified_at')->nullable();
            $table->timestamps();

            $table->unique(['email', 'variant_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_notifications');
    }
};