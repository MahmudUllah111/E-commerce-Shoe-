<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mail_logs', function (Blueprint $table) {
            $table->id();
            $table->string('type')->default('general'); // inquiry_received, inquiry_reply, order_confirmation, order_status, admin_alert, test_mail
            $table->string('direction')->default('outgoing'); // incoming or outgoing
            $table->string('from_email');
            $table->string('to_email');
            $table->string('subject');
            $table->longText('body');
            $table->string('status')->default('sent'); // sent, failed, logged, received
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mail_logs');
    }
};
