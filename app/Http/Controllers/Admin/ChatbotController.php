<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatbotAiConfig;
use App\Models\ChatbotConversation;
use App\Models\ChatbotKnowledgeBase;
use App\Services\ChatbotService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatbotController extends Controller
{
    protected ChatbotService $chatbotService;

    public function __construct(ChatbotService $chatbotService)
    {
        $this->chatbotService = $chatbotService;
    }

    public function index(Request $request)
    {
        $settings = $this->chatbotService->getSettings();
        $aiConfigs = ChatbotAiConfig::orderBy('is_active', 'desc')->orderBy('id', 'asc')->get();

        $kbQuery = ChatbotKnowledgeBase::query();
        if ($request->filled('kb_search')) {
            $search = $request->input('kb_search');
            $kbQuery->where(function ($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                  ->orWhere('answer', 'like', "%{$search}%")
                  ->orWhere('keywords', 'like', "%{$search}%");
            });
        }
        if ($request->filled('kb_category')) {
            $kbQuery->where('category', $request->input('kb_category'));
        }
        $knowledgeBase = $kbQuery->orderBy('sort_order', 'asc')->get();

        $categories = ChatbotKnowledgeBase::select('category')->distinct()->pluck('category');

        $convQuery = ChatbotConversation::with(['user:id,name,email', 'aiConfig:id,name,provider']);
        if ($request->boolean('unanswered_only')) {
            $convQuery->where('is_unanswered', true);
        }
        if ($request->filled('source_filter')) {
            $convQuery->where('source', $request->input('source_filter'));
        }
        $conversations = $convQuery->latest()->paginate(25)->withQueryString();

        // Metrics
        $totalLogs = ChatbotConversation::count();
        $kbHits = ChatbotConversation::where('source', 'knowledge_base')->count();
        $aiHits = ChatbotConversation::where('source', 'ai')->count();
        $fallbacks = ChatbotConversation::where('is_fallback', true)->count();

        return Inertia::render('Admin/Chatbot/Index', [
            'settings' => $settings,
            'aiConfigs' => $aiConfigs,
            'knowledgeBase' => $knowledgeBase,
            'categories' => $categories,
            'conversations' => $conversations,
            'filters' => [
                'kb_search' => $request->input('kb_search', ''),
                'kb_category' => $request->input('kb_category', ''),
                'unanswered_only' => $request->boolean('unanswered_only'),
                'source_filter' => $request->input('source_filter', ''),
            ],
            'metrics' => [
                'total_queries' => $totalLogs,
                'kb_answered' => $kbHits,
                'ai_answered' => $aiHits,
                'fallbacks_unanswered' => $fallbacks,
            ],
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'enabled' => 'nullable|boolean',
            'name' => 'required|string|max:100',
            'welcome_message' => 'required|string|max:1000',
            'system_prompt' => 'required|string|max:3000',
            'ai_fallback_enabled' => 'nullable|boolean',
        ]);

        $this->chatbotService->updateSettings($validated);

        return back()->with('success', 'Chatbot settings updated successfully.');
    }

    public function storeAiConfig(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'provider' => 'required|string|in:openai,groq,gemini,anthropic,custom',
            'api_url' => 'nullable|url|max:255',
            'api_key' => 'required|string|max:500',
            'model_name' => 'required|string|max:100',
            'temperature' => 'required|numeric|min:0|max:2',
            'max_tokens' => 'required|integer|min:50|max:4096',
            'is_active' => 'nullable|boolean',
            'is_enabled' => 'nullable|boolean',
        ]);

        $isActive = $request->boolean('is_active');
        if ($isActive) {
            ChatbotAiConfig::query()->update(['is_active' => false]);
        }

        ChatbotAiConfig::create([
            'name' => $validated['name'],
            'provider' => $validated['provider'],
            'api_url' => $validated['api_url'] ?? null,
            'api_key' => $validated['api_key'],
            'model_name' => $validated['model_name'],
            'temperature' => $validated['temperature'],
            'max_tokens' => $validated['max_tokens'],
            'is_active' => $isActive,
            'is_enabled' => $request->boolean('is_enabled', true),
        ]);

        return back()->with('success', 'AI Configuration added successfully.');
    }

    public function updateAiConfig(Request $request, $id)
    {
        $config = ChatbotAiConfig::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'provider' => 'required|string|in:openai,groq,gemini,anthropic,custom',
            'api_url' => 'nullable|url|max:255',
            'api_key' => 'nullable|string|max:500',
            'model_name' => 'required|string|max:100',
            'temperature' => 'required|numeric|min:0|max:2',
            'max_tokens' => 'required|integer|min:50|max:4096',
            'is_enabled' => 'nullable|boolean',
        ]);

        $data = [
            'name' => $validated['name'],
            'provider' => $validated['provider'],
            'api_url' => $validated['api_url'] ?? null,
            'model_name' => $validated['model_name'],
            'temperature' => $validated['temperature'],
            'max_tokens' => $validated['max_tokens'],
            'is_enabled' => $request->boolean('is_enabled', true),
        ];

        // Only update API key if a new one is typed
        if (!empty($validated['api_key'])) {
            $data['api_key'] = $validated['api_key'];
        }

        $config->update($data);

        return back()->with('success', "AI Configuration '{$config->name}' updated.");
    }

    public function activateAiConfig($id)
    {
        $config = ChatbotAiConfig::findOrFail($id);
        $config->makeActive();

        return back()->with('success', "AI Model '{$config->name}' is now active.");
    }

    public function testAiConfig($id)
    {
        $config = ChatbotAiConfig::findOrFail($id);
        $result = $this->chatbotService->testAiConnection($config);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->with('error', $result['message']);
    }

    public function destroyAiConfig($id)
    {
        $config = ChatbotAiConfig::findOrFail($id);
        $wasActive = $config->is_active;

        $config->delete();

        // If active config was deleted, activate the first available config
        if ($wasActive) {
            $next = ChatbotAiConfig::where('is_enabled', true)->first();
            if ($next) {
                $next->makeActive();
            }
        }

        return back()->with('success', 'AI Configuration removed safely.');
    }

    public function storeKnowledgeBase(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:100',
            'question' => 'required|string|max:300',
            'answer' => 'required|string|max:3000',
            'keywords' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        ChatbotKnowledgeBase::create([
            'category' => $validated['category'],
            'question' => $validated['question'],
            'answer' => $validated['answer'],
            'keywords' => $validated['keywords'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Knowledge Base entry created successfully.');
    }

    public function updateKnowledgeBase(Request $request, $id)
    {
        $entry = ChatbotKnowledgeBase::findOrFail($id);

        $validated = $request->validate([
            'category' => 'required|string|max:100',
            'question' => 'required|string|max:300',
            'answer' => 'required|string|max:3000',
            'keywords' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $entry->update([
            'category' => $validated['category'],
            'question' => $validated['question'],
            'answer' => $validated['answer'],
            'keywords' => $validated['keywords'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Knowledge Base entry updated.');
    }

    public function toggleKnowledgeBase($id)
    {
        $entry = ChatbotKnowledgeBase::findOrFail($id);
        $entry->update(['is_active' => !$entry->is_active]);

        return back()->with('success', "Entry '" . substr($entry->question, 0, 30) . "...' status toggled.");
    }

    public function destroyKnowledgeBase($id)
    {
        $entry = ChatbotKnowledgeBase::findOrFail($id);
        $entry->delete();

        return back()->with('success', 'Knowledge Base entry deleted.');
    }

    public function destroyConversation($id)
    {
        $log = ChatbotConversation::findOrFail($id);
        $log->delete();

        return back()->with('success', 'Log entry removed.');
    }

    public function clearConversations()
    {
        ChatbotConversation::truncate();

        return back()->with('success', 'All conversation history cleared.');
    }
}
