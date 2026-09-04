<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chatbot_ai_configs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('provider')->default('openai'); // openai, groq, gemini, anthropic, custom
            $table->string('api_url')->nullable();
            $table->text('api_key'); // Encrypted string
            $table->string('model_name')->default('gpt-4o-mini');
            $table->decimal('temperature', 3, 2)->default(0.70);
            $table->integer('max_tokens')->default(800);
            $table->boolean('is_active')->default(false)->index();
            $table->boolean('is_enabled')->default(true);
            $table->timestamp('last_tested_at')->nullable();
            $table->string('last_test_status', 50)->nullable();
            $table->text('last_test_message')->nullable();
            $table->timestamps();
        });

        Schema::create('chatbot_knowledge_bases', function (Blueprint $table) {
            $table->id();
            $table->string('category')->default('General')->index();
            $table->string('question');
            $table->text('answer');
            $table->text('keywords')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->integer('sort_order')->default(0);
            $table->unsignedBigInteger('hit_count')->default(0);
            $table->timestamps();
        });

        Schema::create('chatbot_conversations', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->index();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('user_message');
            $table->text('bot_response');
            $table->string('source')->default('knowledge_base'); // knowledge_base, ai, fallback, system
            $table->foreignId('ai_config_id')->nullable()->constrained('chatbot_ai_configs')->nullOnDelete();
            $table->string('model_used')->nullable();
            $table->boolean('is_unanswered')->default(false)->index();
            $table->boolean('is_fallback')->default(false)->index();
            $table->integer('tokens_used')->nullable();
            $table->integer('response_time_ms')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chatbot_conversations');
        Schema::dropIfExists('chatbot_knowledge_bases');
        Schema::dropIfExists('chatbot_ai_configs');
    }
};
