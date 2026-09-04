<?php

namespace Database\Seeders;

use App\Models\ChatbotAiConfig;
use Illuminate\Database\Seeder;

class ChatbotAiConfigSeeder extends Seeder
{
    public function run(): void
    {
        $configs = [
            [
                'name' => 'OpenAI GPT-4o Mini (Default)',
                'provider' => 'openai',
                'api_url' => 'https://api.openai.com/v1',
                'api_key' => 'sk-placeholder-key-replace-in-admin',
                'model_name' => 'gpt-4o-mini',
                'temperature' => 0.70,
                'max_tokens' => 800,
                'is_active' => true,
                'is_enabled' => true,
                'last_test_status' => null,
            ],
            [
                'name' => 'Groq Ultra-Fast Llama 3.3',
                'provider' => 'groq',
                'api_url' => 'https://api.groq.com/openai/v1',
                'api_key' => 'gsk-placeholder-key-replace-in-admin',
                'model_name' => 'llama-3.3-70b-versatile',
                'temperature' => 0.70,
                'max_tokens' => 800,
                'is_active' => false,
                'is_enabled' => true,
                'last_test_status' => null,
            ],
            [
                'name' => 'Google Gemini 1.5 Flash',
                'provider' => 'gemini',
                'api_url' => 'https://generativelanguage.googleapis.com/v1beta/openai',
                'api_key' => 'AIzaSy-placeholder-key-replace-in-admin',
                'model_name' => 'gemini-1.5-flash',
                'temperature' => 0.70,
                'max_tokens' => 800,
                'is_active' => false,
                'is_enabled' => true,
                'last_test_status' => null,
            ],
        ];

        foreach ($configs as $cfg) {
            if (!ChatbotAiConfig::where('name', $cfg['name'])->exists()) {
                ChatbotAiConfig::create($cfg);
            }
        }
    }
}
