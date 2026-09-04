<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatbotConversation;
use App\Services\ChatbotService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChatbotController extends Controller
{
    protected ChatbotService $chatbotService;

    public function __construct(ChatbotService $chatbotService)
    {
        $this->chatbotService = $chatbotService;
    }

    /**
     * Return public config for storefront widget
     */
    public function config()
    {
        $settings = $this->chatbotService->getSettings();

        return response()->json([
            'enabled' => $settings['enabled'],
            'name' => $settings['name'],
            'welcome_message' => $settings['welcome_message'],
            'quick_suggestions' => [
                'Where is my order?',
                'What is your return policy?',
                'Do you offer Cash on Delivery?',
                'How does size exchange work?',
                'Show me running shoes',
            ],
        ]);
    }

    /**
     * Send user message and get bot answer
     */
    public function chat(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'session_id' => 'nullable|string|max:100',
        ]);

        $sessionId = !empty($validated['session_id']) ? $validated['session_id'] : (string) Str::uuid();
        $user = $request->user();

        $result = $this->chatbotService->respond($validated['message'], $sessionId, $user);

        return response()->json([
            'answer' => $result['answer'],
            'source' => $result['source'],
            'model' => $result['model'] ?? null,
            'category' => $result['category'] ?? null,
            'session_id' => $sessionId,
        ]);
    }

    /**
     * Retrieve recent conversation history for session
     */
    public function history(Request $request)
    {
        $sessionId = $request->query('session_id');
        if (!$sessionId) {
            return response()->json(['messages' => []]);
        }

        $messages = ChatbotConversation::where('session_id', $sessionId)
            ->orderBy('id', 'asc')
            ->take(30)
            ->get(['id', 'user_message', 'bot_response', 'source', 'created_at']);

        return response()->json(['messages' => $messages]);
    }
}
