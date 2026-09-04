<?php

namespace App\Services;

use App\Models\ChatbotAiConfig;
use App\Models\ChatbotConversation;
use App\Models\ChatbotKnowledgeBase;
use App\Models\Order;
use App\Models\Product;
use App\Models\StaticPage;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotService
{
    /**
     * Get store settings for the chatbot
     */
    public function getSettings(): array
    {
        $settings = DB::table('store_settings')->whereIn('key', [
            'chatbot_enabled',
            'chatbot_name',
            'chatbot_welcome_message',
            'chatbot_system_prompt',
            'chatbot_ai_fallback_enabled',
        ])->pluck('value', 'key')->toArray();

        return [
            'enabled' => ($settings['chatbot_enabled'] ?? '1') === '1',
            'name' => $settings['chatbot_name'] ?? 'Marty - AI Shopping Assistant',
            'welcome_message' => $settings['chatbot_welcome_message'] ?? 'Hello! 👋 I am Marty, your TrustedMart shopping assistant. Ask me anything about our shoes, sizing, stock, orders, or return policy!',
            'system_prompt' => $settings['chatbot_system_prompt'] ?? "You are Marty, the friendly, professional, and helpful AI shopping assistant for TrustedMart, a premium footwear retail store in Bangladesh.\nOnly answer questions regarding TrustedMart products, sneaker models, sizing, live stock, orders, store policies, payments, and customer care.\nNever invent fake prices, unavailable sizes, or speculative delivery promises. Strictly ground your answers in the provided store context.\nKeep responses concise, welcoming, and easy to read using markdown bullet points where appropriate.",
            'ai_fallback_enabled' => ($settings['chatbot_ai_fallback_enabled'] ?? '1') === '1',
        ];
    }

    /**
     * Update store settings for the chatbot
     */
    public function updateSettings(array $data): void
    {
        $keys = [
            'chatbot_enabled' => isset($data['enabled']) ? ($data['enabled'] ? '1' : '0') : '1',
            'chatbot_name' => $data['name'] ?? 'Marty - AI Shopping Assistant',
            'chatbot_welcome_message' => $data['welcome_message'] ?? 'Hello! 👋 I am Marty, your TrustedMart shopping assistant.',
            'chatbot_system_prompt' => $data['system_prompt'] ?? '',
            'chatbot_ai_fallback_enabled' => isset($data['ai_fallback_enabled']) ? ($data['ai_fallback_enabled'] ? '1' : '0') : '1',
        ];

        foreach ($keys as $key => $value) {
            DB::table('store_settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $value, 'updated_at' => now(), 'created_at' => now()]
            );
        }
    }

    /**
     * Main conversation answer pipeline
     */
    public function respond(string $userMessage, string $sessionId, ?User $user = null): array
    {
        $startTime = microtime(true);
        $cleanMessage = trim($userMessage);
        $settings = $this->getSettings();

        if (!$settings['enabled']) {
            return [
                'answer' => 'Our shopping assistant is currently undergoing scheduled maintenance. Please visit our Contact Us page or email support@trustedmart.com for immediate help.',
                'source' => 'system',
            ];
        }

        // -------------------------------------------------------------
        // Step 1: Knowledge Base Search
        // -------------------------------------------------------------
        $kbMatch = $this->searchKnowledgeBase($cleanMessage);
        if ($kbMatch) {
            $kbMatch->incrementHit();
            $responseTime = (int) round((microtime(true) - $startTime) * 1000);

            ChatbotConversation::create([
                'session_id' => $sessionId,
                'user_id' => $user?->id,
                'user_message' => $cleanMessage,
                'bot_response' => $kbMatch->answer,
                'source' => 'knowledge_base',
                'is_unanswered' => false,
                'is_fallback' => false,
                'response_time_ms' => $responseTime,
            ]);

            return [
                'answer' => $kbMatch->answer,
                'source' => 'knowledge_base',
                'category' => $kbMatch->category,
            ];
        }

        // -------------------------------------------------------------
        // Step 2: Dynamic Live Database Check (Orders, Real Stock)
        // -------------------------------------------------------------
        $dynamicAnswer = $this->resolveDynamicQueries($cleanMessage, $user);
        if ($dynamicAnswer) {
            $responseTime = (int) round((microtime(true) - $startTime) * 1000);

            ChatbotConversation::create([
                'session_id' => $sessionId,
                'user_id' => $user?->id,
                'user_message' => $cleanMessage,
                'bot_response' => $dynamicAnswer,
                'source' => 'knowledge_base',
                'is_unanswered' => false,
                'is_fallback' => false,
                'response_time_ms' => $responseTime,
            ]);

            return [
                'answer' => $dynamicAnswer,
                'source' => 'knowledge_base',
            ];
        }

        // -------------------------------------------------------------
        // Step 3: AI Fallback Model Integration
        // -------------------------------------------------------------
        if ($settings['ai_fallback_enabled']) {
            $activeConfig = ChatbotAiConfig::active()->first();

            if ($activeConfig && $activeConfig->getDecryptedApiKey()) {
                try {
                    $aiResult = $this->callAiModel($cleanMessage, $sessionId, $activeConfig, $settings, $user);
                    $responseTime = (int) round((microtime(true) - $startTime) * 1000);

                    ChatbotConversation::create([
                        'session_id' => $sessionId,
                        'user_id' => $user?->id,
                        'user_message' => $cleanMessage,
                        'bot_response' => $aiResult['text'],
                        'source' => 'ai',
                        'ai_config_id' => $activeConfig->id,
                        'model_used' => $activeConfig->model_name,
                        'is_unanswered' => false,
                        'is_fallback' => false,
                        'tokens_used' => $aiResult['tokens'] ?? null,
                        'response_time_ms' => $responseTime,
                    ]);

                    return [
                        'answer' => $aiResult['text'],
                        'source' => 'ai',
                        'model' => $activeConfig->model_name,
                    ];
                } catch (\Throwable $e) {
                    Log::warning('Chatbot AI model call failed: ' . $e->getMessage());

                    $responseTime = (int) round((microtime(true) - $startTime) * 1000);
                    $fallbackMsg = $this->getFriendlyFallback();

                    ChatbotConversation::create([
                        'session_id' => $sessionId,
                        'user_id' => $user?->id,
                        'user_message' => $cleanMessage,
                        'bot_response' => $fallbackMsg,
                        'source' => 'fallback',
                        'ai_config_id' => $activeConfig->id,
                        'model_used' => $activeConfig->model_name,
                        'is_unanswered' => true,
                        'is_fallback' => true,
                        'response_time_ms' => $responseTime,
                        'error_message' => substr($e->getMessage(), 0, 500),
                    ]);

                    return [
                        'answer' => $fallbackMsg,
                        'source' => 'fallback',
                    ];
                }
            }
        }

        // -------------------------------------------------------------
        // Step 4: No AI configured or AI disabled -> Graceful Fallback
        // -------------------------------------------------------------
        $responseTime = (int) round((microtime(true) - $startTime) * 1000);
        $fallbackMsg = $this->getFriendlyFallback();

        ChatbotConversation::create([
            'session_id' => $sessionId,
            'user_id' => $user?->id,
            'user_message' => $cleanMessage,
            'bot_response' => $fallbackMsg,
            'source' => 'fallback',
            'is_unanswered' => true,
            'is_fallback' => true,
            'response_time_ms' => $responseTime,
        ]);

        return [
            'answer' => $fallbackMsg,
            'source' => 'fallback',
        ];
    }

    /**
     * Search Knowledge Base using keyword, question, and semantic match
     */
    protected function searchKnowledgeBase(string $query): ?ChatbotKnowledgeBase
    {
        $normalized = strtolower(trim($query));
        $words = array_filter(explode(' ', preg_replace('/[^\w\s]/u', ' ', $normalized)));

        $entries = ChatbotKnowledgeBase::active()->orderBy('sort_order', 'asc')->get();

        $bestMatch = null;
        $highestScore = 0;

        foreach ($entries as $entry) {
            $score = 0;
            $qNorm = strtolower($entry->question);

            // Exact match
            if ($normalized === $qNorm) {
                return $entry;
            }

            // Substring containment
            if (str_contains($normalized, $qNorm) || str_contains($qNorm, $normalized)) {
                $score += 60;
            }

            // Keyword tags matching
            if (!empty($entry->keywords)) {
                $tags = array_map('trim', explode(',', strtolower($entry->keywords)));
                foreach ($tags as $tag) {
                    if (!empty($tag) && str_contains($normalized, $tag)) {
                        $score += 40;
                    }
                }
            }

            // Word-by-word overlap
            $qWords = array_filter(explode(' ', preg_replace('/[^\w\s]/u', ' ', $qNorm)));
            $matchedWords = array_intersect($words, $qWords);
            $score += count($matchedWords) * 10;

            if ($score > $highestScore && $score >= 40) {
                $highestScore = $score;
                $bestMatch = $entry;
            }
        }

        return $bestMatch;
    }

    /**
     * Resolves dynamic website queries: Order tracking, Product lookups, Stock info
     */
    protected function resolveDynamicQueries(string $message, ?User $user): ?string
    {
        $lower = strtolower($message);

        // 1. Order status query: e.g. "#ORD-123456" or "where is my order" or "order status"
        if (preg_match('/(ord[-\s]?\d{4,10})/i', $message, $matches)) {
            $rawCode = strtoupper(str_replace(' ', '', $matches[1]));
            $order = Order::where('order_number', $rawCode)
                ->orWhere('order_number', 'like', "%{$rawCode}%")
                ->orWhere('id', preg_replace('/\D/', '', $rawCode))
                ->with('items.product')
                ->first();

            if ($order) {
                $statusFormatted = ucwords(str_replace('_', ' ', $order->order_status ?? $order->status ?? 'processing'));
                $paymentFormatted = ucwords($order->payment_status ?? 'pending');
                $totalFormatted = number_format($order->total_amount ?? $order->total ?? 0, 2);

                $itemSummary = $order->items->map(function ($item) {
                    $name = $item->product?->name ?? 'Shoe item';
                    return "- {$name} (x{$item->quantity})";
                })->implode("\n");

                return "📦 **Order Status: {$rawCode}**\n\n" .
                    "- **Status:** {$statusFormatted}\n" .
                    "- **Payment:** {$paymentFormatted}\n" .
                    "- **Total Amount:** \${$totalFormatted}\n" .
                    "- **Items:**\n{$itemSummary}\n\n" .
                    "You can view complete tracking updates and download your invoice on our [Track Order](/track-order) page!";
            }
        }

        // 2. Logged-in customer asking "my recent order" or "where is my package"
        if ($user && (str_contains($lower, 'my order') || str_contains($lower, 'my package') || str_contains($lower, 'recent order'))) {
            $latestOrder = Order::where('user_id', $user->id)->latest()->with('items.product')->first();
            if ($latestOrder) {
                $statusFormatted = ucwords(str_replace('_', ' ', $latestOrder->order_status ?? $latestOrder->status ?? 'processing'));
                $dateFormatted = $latestOrder->created_at->format('M d, Y');
                return "Hi {$user->name}! Your latest order **#{$latestOrder->order_number}** placed on {$dateFormatted} is currently **{$statusFormatted}**.\n\n" .
                    "Total: \${$latestOrder->total_amount}. Track details or download your invoice in your [Account Orders](/account/orders).";
            }
        }

        // 3. Product-specific live search: e.g. "do you have pegasus", "show me running shoes", "air max price"
        $shoeKeywords = ['pegasus', 'air max', 'jordan', 'runner', 'sneaker', 'football', 'marathon', 'leather', 'formal', 'cleats'];
        $detectedShoe = null;
        foreach ($shoeKeywords as $kw) {
            if (str_contains($lower, $kw)) {
                $detectedShoe = $kw;
                break;
            }
        }

        if ($detectedShoe) {
            $matchedProducts = Product::where('status', 'active')
                ->where(function ($q) use ($detectedShoe) {
                    $q->where('name', 'like', "%{$detectedShoe}%")
                        ->orWhere('description', 'like', "%{$detectedShoe}%");
                })
                ->with(['variants', 'brand'])
                ->take(3)
                ->get();

            if ($matchedProducts->isNotEmpty()) {
                $list = $matchedProducts->map(function ($p) {
                    $brand = $p->brand?->name ?? 'Brand';
                    $price = number_format($p->price ?? $p->base_price ?? 0, 2);
                    $inStockVariants = $p->variants->where('stock_quantity', '>', 0);
                    $sizes = $inStockVariants->pluck('size_value')->unique()->implode(', ');
                    $stockText = $inStockVariants->count() > 0 ? "In Stock (Sizes: US {$sizes})" : "Currently Out of Stock (Restock Alert Available)";

                    return "👟 **[{$p->name}](/product/{$p->slug})** — \${$price} ({$brand})\n  *Availability:* {$stockText}";
                })->implode("\n\n");

                return "Here are the matching shoes currently available in our catalog:\n\n{$list}\n\nYou can click the shoe links above to select your size and place an order!";
            }
        }

        return null;
    }

    /**
     * Sends grounded context and user query to the active AI Model
     */
    protected function callAiModel(string $userMessage, string $sessionId, ChatbotAiConfig $config, array $settings, ?User $user): array
    {
        $apiKey = $config->getDecryptedApiKey();
        if (!$apiKey) {
            throw new \Exception('API key is missing or cannot be decrypted.');
        }

        $storeContext = $this->buildStoreContext($userMessage, $user);
        $conversationHistory = $this->getRecentConversationHistory($sessionId);

        $systemContent = $settings['system_prompt'] . "\n\n" . $storeContext;

        $messages = [
            ['role' => 'system', 'content' => $systemContent],
        ];

        foreach ($conversationHistory as $hist) {
            $messages[] = ['role' => 'user', 'content' => $hist->user_message];
            $messages[] = ['role' => 'assistant', 'content' => $hist->bot_response];
        }

        $messages[] = ['role' => 'user', 'content' => $userMessage];

        // Determine base URL & provider strategy
        $provider = strtolower($config->provider);
        $baseUrl = rtrim($config->api_url ?: $this->getDefaultBaseUrl($provider), '/');
        $model = $config->model_name ?: 'gpt-4o-mini';

        if ($provider === 'anthropic') {
            return $this->callAnthropic($baseUrl, $apiKey, $model, $systemContent, $conversationHistory, $userMessage, $config);
        }

        // OpenAI-compatible format (OpenAI, Groq, Gemini OpenAI compat, DeepSeek, Local Ollama, etc.)
        $url = str_ends_with($baseUrl, '/chat/completions') ? $baseUrl : $baseUrl . '/chat/completions';

        $payload = [
            'model' => $model,
            'messages' => $messages,
            'temperature' => (float) ($config->temperature ?? 0.70),
            'max_tokens' => (int) ($config->max_tokens ?? 800),
        ];

        $response = Http::timeout(15)
            ->withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])
            ->post($url, $payload);

        if (!$response->successful()) {
            $err = $response->json('error.message') ?? $response->body();
            throw new \Exception("AI Provider returned HTTP {$response->status()}: " . substr($err, 0, 200));
        }

        $data = $response->json();
        $replyText = $data['choices'][0]['message']['content'] ?? null;

        if (!$replyText) {
            throw new \Exception('Empty response received from AI model.');
        }

        return [
            'text' => trim($replyText),
            'tokens' => $data['usage']['total_tokens'] ?? null,
        ];
    }

    /**
     * Anthropic provider handling
     */
    protected function callAnthropic(string $baseUrl, string $apiKey, string $model, string $systemPrompt, $history, string $userMessage, ChatbotAiConfig $config): array
    {
        $url = str_ends_with($baseUrl, '/messages') ? $baseUrl : $baseUrl . '/messages';

        $messages = [];
        foreach ($history as $hist) {
            $messages[] = ['role' => 'user', 'content' => $hist->user_message];
            $messages[] = ['role' => 'assistant', 'content' => $hist->bot_response];
        }
        $messages[] = ['role' => 'user', 'content' => $userMessage];

        $payload = [
            'model' => $model,
            'max_tokens' => (int) ($config->max_tokens ?? 800),
            'temperature' => (float) ($config->temperature ?? 0.70),
            'system' => $systemPrompt,
            'messages' => $messages,
        ];

        $response = Http::timeout(15)
            ->withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'Content-Type' => 'application/json',
            ])
            ->post($url, $payload);

        if (!$response->successful()) {
            throw new \Exception("Anthropic API error: " . substr($response->body(), 0, 200));
        }

        $data = $response->json();
        $replyText = $data['content'][0]['text'] ?? null;

        return [
            'text' => trim($replyText ?? 'I am here to help you find the best shoes on TrustedMart!'),
            'tokens' => ($data['usage']['input_tokens'] ?? 0) + ($data['usage']['output_tokens'] ?? 0),
        ];
    }

    /**
     * Test connection for an AI configuration
     */
    public function testAiConnection(ChatbotAiConfig $config): array
    {
        $startTime = microtime(true);
        $apiKey = $config->getDecryptedApiKey();

        if (empty($apiKey)) {
            return [
                'success' => false,
                'message' => 'Cannot test connection: API key is not configured.',
                'response_time_ms' => 0,
            ];
        }

        try {
            $provider = strtolower($config->provider);
            $baseUrl = rtrim($config->api_url ?: $this->getDefaultBaseUrl($provider), '/');
            $model = $config->model_name ?: 'gpt-4o-mini';

            if ($provider === 'anthropic') {
                $url = str_ends_with($baseUrl, '/messages') ? $baseUrl : $baseUrl . '/messages';
                $resp = Http::timeout(10)->withHeaders([
                    'x-api-key' => $apiKey,
                    'anthropic-version' => '2023-06-01',
                    'Content-Type' => 'application/json',
                ])->post($url, [
                    'model' => $model,
                    'max_tokens' => 20,
                    'messages' => [['role' => 'user', 'content' => 'Say connected in 2 words']],
                ]);
            } else {
                $url = str_ends_with($baseUrl, '/chat/completions') ? $baseUrl : $baseUrl . '/chat/completions';
                $resp = Http::timeout(10)->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json',
                ])->post($url, [
                    'model' => $model,
                    'max_tokens' => 20,
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are a test ping bot.'],
                        ['role' => 'user', 'content' => 'Say connected in 2 words'],
                    ],
                ]);
            }

            $elapsedMs = (int) round((microtime(true) - $startTime) * 1000);

            if ($resp->successful()) {
                $config->update([
                    'last_tested_at' => now(),
                    'last_test_status' => 'success',
                    'last_test_message' => "Connected successfully ({$elapsedMs}ms). Model '{$model}' is ready.",
                ]);

                return [
                    'success' => true,
                    'message' => "Connected successfully! Response received in {$elapsedMs}ms.",
                    'response_time_ms' => $elapsedMs,
                ];
            }

            $errBody = $resp->json('error.message') ?? $resp->body();
            $msg = "Provider returned HTTP {$resp->status()}: " . substr($errBody, 0, 150);

            $config->update([
                'last_tested_at' => now(),
                'last_test_status' => 'error',
                'last_test_message' => $msg,
            ]);

            return [
                'success' => false,
                'message' => $msg,
                'response_time_ms' => $elapsedMs,
            ];
        } catch (\Throwable $e) {
            $elapsedMs = (int) round((microtime(true) - $startTime) * 1000);
            $msg = "Connection error: " . substr($e->getMessage(), 0, 150);

            $config->update([
                'last_tested_at' => now(),
                'last_test_status' => 'error',
                'last_test_message' => $msg,
            ]);

            return [
                'success' => false,
                'message' => $msg,
                'response_time_ms' => $elapsedMs,
            ];
        }
    }

    /**
     * Assembles live grounded context from the database
     */
    protected function buildStoreContext(string $query, ?User $user): string
    {
        $context = "### REAL STORE DATA & POLICIES (TRUSTEDMART):\n";
        $context .= "- Location: Flagship Store & HQ at House 24, Road 7, Dhanmondi, Dhaka 1205, Bangladesh.\n";
        $context .= "- Contact: Phone +880 1700-000000 (9am-9pm daily), Email support@trustedmart.com.\n";
        $context .= "- Delivery: 24 to 48 hours inside Dhaka; 3 to 5 business days nationwide in Bangladesh. Free shipping on orders over $100.\n";
        $context .= "- Returns: 30-Day Doorstep Courier Exchange. Courier delivers new size and collects the return.\n";
        $context .= "- Payments: Cash on Delivery (COD) nationwide, bKash, Nagad, Visa, MasterCard.\n";
        $context .= "- Stock Alerts: Customers can submit their email on any out-of-stock size to receive an automated restock email.\n";

        // Add top featured shoes & real stock
        $sampleProducts = Product::where('status', 'active')->with('brand')->take(6)->get();
        if ($sampleProducts->isNotEmpty()) {
            $context .= "\n### TOP FEATURED PRODUCTS:\n";
            foreach ($sampleProducts as $p) {
                $brand = $p->brand?->name ?? 'Brand';
                $price = number_format($p->price ?? $p->base_price ?? 0, 2);
                $context .= "- {$p->name} (\${$price}, {$brand}) - Link: /product/{$p->slug}\n";
            }
        }

        if ($user) {
            $context .= "\n### CURRENT USER:\n- Name: {$user->name}\n- Email: {$user->email}\n";
        }

        return $context;
    }

    protected function getRecentConversationHistory(string $sessionId, int $limit = 3)
    {
        return ChatbotConversation::where('session_id', $sessionId)
            ->latest()
            ->take($limit)
            ->get()
            ->reverse();
    }

    protected function getDefaultBaseUrl(string $provider): string
    {
        return match ($provider) {
            'groq' => 'https://api.groq.com/openai/v1',
            'gemini' => 'https://generativelanguage.googleapis.com/v1beta/openai',
            'anthropic' => 'https://api.anthropic.com/v1',
            default => 'https://api.openai.com/v1',
        };
    }

    protected function getFriendlyFallback(): string
    {
        return "I'm having a little trouble finding that specific information right now. Our support specialists are available daily from 9:00 AM to 9:00 PM BST at support@trustedmart.com or +880 1700-000000. You can also visit our [Contact Us](/contact) page!";
    }
}
