import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
    Bot,
    Sparkles,
    Cpu,
    BookOpen,
    Settings,
    History,
    Plus,
    Edit3,
    Trash2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Play,
    Zap,
    Key,
    Sliders,
    Search,
    Filter,
    Shield,
    HelpCircle,
    MessageSquare,
    ExternalLink
} from 'lucide-react';

export default function ChatbotIndex({
    settings = {},
    aiConfigs = [],
    knowledgeBase = [],
    categories = [],
    conversations = { data: [] },
    filters = {},
    metrics = {}
}) {
    const [activeTab, setActiveTab] = useState('configs'); // configs, kb, settings, logs

    // Modal states
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [editingAiConfig, setEditingAiConfig] = useState(null);

    const [kbModalOpen, setKbModalOpen] = useState(false);
    const [editingKb, setEditingKb] = useState(null);

    const [testingId, setTestingId] = useState(null);

    // Filter states for KB & Logs
    const [kbSearch, setKbSearch] = useState(filters.kb_search || '');
    const [kbCategory, setKbCategory] = useState(filters.kb_category || '');

    // -------------------------------------------------------------
    // Form 1: General Settings
    // -------------------------------------------------------------
    const settingsForm = useForm({
        enabled: settings.enabled ?? true,
        name: settings.name || 'Marty - AI Shopping Assistant',
        welcome_message: settings.welcome_message || '',
        system_prompt: settings.system_prompt || '',
        ai_fallback_enabled: settings.ai_fallback_enabled ?? true,
    });

    const submitSettings = (e) => {
        e.preventDefault();
        settingsForm.post('/admin/chatbot/settings', {
            preserveScroll: true,
            onSuccess: () => toast.success('Chatbot settings saved successfully.'),
            onError: () => toast.error('Please check form fields.'),
        });
    };

    // -------------------------------------------------------------
    // Form 2: AI Config (Create / Edit)
    // -------------------------------------------------------------
    const aiForm = useForm({
        name: '',
        provider: 'openai',
        api_url: '',
        api_key: '',
        model_name: 'gpt-4o-mini',
        temperature: 0.70,
        max_tokens: 800,
        is_active: false,
        is_enabled: true,
    });

    const openCreateAiModal = () => {
        setEditingAiConfig(null);
        aiForm.reset();
        aiForm.setData({
            name: '',
            provider: 'openai',
            api_url: 'https://api.openai.com/v1',
            api_key: '',
            model_name: 'gpt-4o-mini',
            temperature: 0.70,
            max_tokens: 800,
            is_active: false,
            is_enabled: true,
        });
        setAiModalOpen(true);
    };

    const openEditAiModal = (config) => {
        setEditingAiConfig(config);
        aiForm.setData({
            name: config.name,
            provider: config.provider,
            api_url: config.api_url || '',
            api_key: '', // Left blank unless admin wants to update
            model_name: config.model_name,
            temperature: config.temperature,
            max_tokens: config.max_tokens,
            is_enabled: config.is_enabled,
        });
        setAiModalOpen(true);
    };

    const submitAiForm = (e) => {
        e.preventDefault();
        if (editingAiConfig) {
            aiForm.put(`/admin/chatbot/ai-configs/${editingAiConfig.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('AI Configuration updated.');
                    setAiModalOpen(false);
                },
                onError: (errs) => toast.error(Object.values(errs)[0] || 'Failed to update config.'),
            });
        } else {
            aiForm.post('/admin/chatbot/ai-configs', {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('New AI Configuration added.');
                    setAiModalOpen(false);
                },
                onError: (errs) => toast.error(Object.values(errs)[0] || 'Failed to add config.'),
            });
        }
    };

    const handleActivateAi = (id) => {
        router.post(`/admin/chatbot/ai-configs/${id}/activate`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Active AI configuration switched successfully!'),
            onError: () => toast.error('Failed to switch active configuration.'),
        });
    };

    const handleTestAi = (id) => {
        setTestingId(id);
        router.post(`/admin/chatbot/ai-configs/${id}/test`, {}, {
            preserveScroll: true,
            onFinish: () => setTestingId(null),
        });
    };

    const handleDeleteAi = (id, name) => {
        if (!confirm(`Are you sure you want to remove '${name}'?`)) return;
        router.delete(`/admin/chatbot/ai-configs/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('AI Configuration removed.'),
        });
    };

    // -------------------------------------------------------------
    // Form 3: Knowledge Base (Create / Edit)
    // -------------------------------------------------------------
    const kbForm = useForm({
        category: 'General',
        question: '',
        answer: '',
        keywords: '',
        sort_order: 0,
        is_active: true,
    });

    const openCreateKbModal = (initialQuestion = '') => {
        setEditingKb(null);
        kbForm.reset();
        kbForm.setData({
            category: 'General',
            question: initialQuestion,
            answer: '',
            keywords: '',
            sort_order: 0,
            is_active: true,
        });
        setKbModalOpen(true);
    };

    const openEditKbModal = (entry) => {
        setEditingKb(entry);
        kbForm.setData({
            category: entry.category,
            question: entry.question,
            answer: entry.answer,
            keywords: entry.keywords || '',
            sort_order: entry.sort_order,
            is_active: entry.is_active,
        });
        setKbModalOpen(true);
    };

    const submitKbForm = (e) => {
        e.preventDefault();
        if (editingKb) {
            kbForm.put(`/admin/chatbot/knowledge-base/${editingKb.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Knowledge Base entry updated.');
                    setKbModalOpen(false);
                },
                onError: (errs) => toast.error(Object.values(errs)[0] || 'Error saving entry.'),
            });
        } else {
            kbForm.post('/admin/chatbot/knowledge-base', {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Knowledge Base entry created.');
                    setKbModalOpen(false);
                },
                onError: (errs) => toast.error(Object.values(errs)[0] || 'Error creating entry.'),
            });
        }
    };

    const handleToggleKb = (id) => {
        router.post(`/admin/chatbot/knowledge-base/${id}/toggle`, {}, { preserveScroll: true });
    };

    const handleDeleteKb = (id) => {
        if (!confirm('Are you sure you want to delete this Knowledge Base entry?')) return;
        router.delete(`/admin/chatbot/knowledge-base/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Entry removed.'),
        });
    };

    const handleFilterKb = (e) => {
        e.preventDefault();
        router.get('/admin/chatbot', {
            kb_search: kbSearch,
            kb_category: kbCategory,
            tab: 'kb',
        }, { preserveScroll: true });
    };

    const activeAi = aiConfigs.find(c => c.is_active);

    return (
        <AdminLayout header="AI Chatbot & Knowledge Base">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Top Metrics & Quick Status Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                            <Bot size={24} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chatbot Status</div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2.5 h-2.5 rounded-full ${settings.enabled ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                <span className="font-black text-slate-900">{settings.enabled ? 'Active Online' : 'Disabled'}</span>
                            </div>
                            <div className="text-[11px] text-gray-400 font-medium truncate mt-0.5">{settings.name}</div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                            <Cpu size={24} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active AI Model</div>
                            <div className="font-black text-slate-900 truncate mt-1">
                                {activeAi ? activeAi.name : 'None (KB Only)'}
                            </div>
                            <div className="text-[11px] text-gray-400 font-semibold truncate mt-0.5">
                                {activeAi ? `${activeAi.provider.toUpperCase()} • ${activeAi.model_name}` : 'Fallback Disabled'}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Knowledge Base</div>
                            <div className="text-2xl font-black text-slate-900 mt-0.5">{knowledgeBase.length}</div>
                            <div className="text-[11px] text-gray-400 font-semibold">{metrics.kb_answered || 0} Total KB Hits</div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Unanswered Queries</div>
                            <div className="text-2xl font-black text-slate-900 mt-0.5">{metrics.fallbacks_unanswered || 0}</div>
                            <div className="text-[11px] text-amber-600 font-semibold">Review & add to KB</div>
                        </div>
                    </div>
                </div>

                {/* Main Card with Navigation Tabs */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="border-b border-gray-200 px-6 pt-4 flex flex-wrap gap-2 sm:gap-6">
                        <button
                            onClick={() => setActiveTab('configs')}
                            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                                activeTab === 'configs'
                                    ? 'border-slate-900 text-slate-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <Cpu size={16} /> AI Configurations ({aiConfigs.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('kb')}
                            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                                activeTab === 'kb'
                                    ? 'border-slate-900 text-slate-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <BookOpen size={16} /> Knowledge Base ({knowledgeBase.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                                activeTab === 'settings'
                                    ? 'border-slate-900 text-slate-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <Settings size={16} /> Bot Settings
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                                activeTab === 'logs'
                                    ? 'border-slate-900 text-slate-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <History size={16} /> Conversation Logs
                        </button>
                    </div>

                    <div className="p-6">
                        {/* ========================================================= */}
                        {/* TAB 1: AI CONFIGURATIONS                                  */}
                        {/* ========================================================= */}
                        {activeTab === 'configs' && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">Manage Multiple AI Configurations</h3>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                                            Save different providers (OpenAI, Groq, Gemini, Anthropic, Custom). Switch the active model instantly without editing code.
                                        </p>
                                    </div>
                                    <button
                                        onClick={openCreateAiModal}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
                                    >
                                        <Plus size={15} /> Add AI Configuration
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {aiConfigs.map(cfg => (
                                        <div
                                            key={cfg.id}
                                            className={`border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                                                cfg.is_active
                                                    ? 'border-slate-900 bg-slate-50/50 shadow-md ring-2 ring-slate-900/10'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                                            {cfg.provider}
                                                        </span>
                                                        <h4 className="font-extrabold text-sm text-slate-900 mt-1.5">{cfg.name}</h4>
                                                    </div>
                                                    {cfg.is_active ? (
                                                        <span className="text-[11px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                                                            <CheckCircle2 size={12} className="text-emerald-400" /> Active
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleActivateAi(cfg.id)}
                                                            className="text-xs font-bold text-gray-500 hover:text-slate-900 hover:bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200 transition-all"
                                                        >
                                                            Set Active
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="mt-4 space-y-1.5 text-xs text-gray-600">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400 font-semibold">Model:</span>
                                                        <span className="font-bold text-slate-800 font-mono">{cfg.model_name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400 font-semibold">API Key:</span>
                                                        <span className="font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                                            {cfg.masked_key}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400 font-semibold">Max Tokens / Temp:</span>
                                                        <span className="font-bold text-slate-700">{cfg.max_tokens} / {cfg.temperature}</span>
                                                    </div>
                                                </div>

                                                {/* Test Status Banner */}
                                                <div className="mt-4 pt-3 border-t border-gray-100">
                                                    {cfg.last_test_status ? (
                                                        <div className={`p-2.5 rounded-xl text-[11px] font-medium flex items-start gap-1.5 ${
                                                            cfg.last_test_status === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                                                        }`}>
                                                            {cfg.last_test_status === 'success' ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" /> : <XCircle size={14} className="text-rose-600 shrink-0 mt-0.5" />}
                                                            <div className="min-w-0 flex-1 truncate">{cfg.last_test_message}</div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-[11px] text-gray-400 italic">Not tested yet. Click 'Test Connection'.</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Bar */}
                                            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                                                <button
                                                    onClick={() => handleTestAi(cfg.id)}
                                                    disabled={testingId === cfg.id}
                                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-slate-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                                                >
                                                    <Play size={12} className={testingId === cfg.id ? 'animate-spin' : ''} />
                                                    {testingId === cfg.id ? 'Testing...' : 'Test Connection'}
                                                </button>

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => openEditAiModal(cfg)}
                                                        className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-slate-900 flex items-center justify-center transition-colors"
                                                        title="Edit Configuration"
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAi(cfg.id, cfg.name)}
                                                        className="w-8 h-8 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 flex items-center justify-center transition-colors"
                                                        title="Delete Configuration"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* TAB 2: KNOWLEDGE BASE                                     */}
                        {/* ========================================================= */}
                        {activeTab === 'kb' && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">Store Knowledge Base Entries</h3>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                                            Questions in the Knowledge Base are answered instantly with 100% accuracy before calling external AI.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => openCreateKbModal('')}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
                                    >
                                        <Plus size={15} /> Add Knowledge Entry
                                    </button>
                                </div>

                                {/* Filters */}
                                <form onSubmit={handleFilterKb} className="flex flex-wrap items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                    <div className="relative flex-1 min-w-[200px]">
                                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={kbSearch}
                                            onChange={(e) => setKbSearch(e.target.value)}
                                            placeholder="Search questions, keywords, answers..."
                                            className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:border-slate-900 outline-none"
                                        />
                                    </div>
                                    <select
                                        value={kbCategory}
                                        onChange={(e) => setKbCategory(e.target.value)}
                                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:border-slate-900 outline-none"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <button
                                        type="submit"
                                        className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all"
                                    >
                                        Filter
                                    </button>
                                </form>

                                {/* Knowledge Base List */}
                                <div className="space-y-3">
                                    {knowledgeBase.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                            No knowledge base entries found matching your search.
                                        </div>
                                    ) : (
                                        knowledgeBase.map(entry => (
                                            <div
                                                key={entry.id}
                                                className={`p-4 rounded-xl border transition-all ${
                                                    entry.is_active ? 'bg-white border-gray-200 hover:border-gray-300 shadow-xs' : 'bg-gray-50/70 border-gray-200 opacity-60'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-1 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                                                {entry.category}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                                {entry.hit_count || 0} Hits
                                                            </span>
                                                        </div>
                                                        <h4 className="font-extrabold text-sm text-slate-900">{entry.question}</h4>
                                                        <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed max-h-24 overflow-hidden text-ellipsis">
                                                            {entry.answer}
                                                        </p>
                                                        {entry.keywords && (
                                                            <div className="flex flex-wrap gap-1 pt-1">
                                                                {entry.keywords.split(',').map((k, kIdx) => (
                                                                    <span key={kIdx} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                                                        #{k.trim()}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            onClick={() => handleToggleKb(entry.id)}
                                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                                                entry.is_active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                            }`}
                                                        >
                                                            {entry.is_active ? 'Enabled' : 'Disabled'}
                                                        </button>
                                                        <button
                                                            onClick={() => openEditKbModal(entry)}
                                                            className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-slate-900 flex items-center justify-center transition-colors"
                                                            title="Edit Entry"
                                                        >
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteKb(entry.id)}
                                                            className="w-8 h-8 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 flex items-center justify-center transition-colors"
                                                            title="Delete Entry"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* TAB 3: BOT SETTINGS & IDENTITY                            */}
                        {/* ========================================================= */}
                        {activeTab === 'settings' && (
                            <form onSubmit={submitSettings} className="space-y-6 max-w-3xl">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">Chatbot Identity & Instructions</h3>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                                        Configure the chatbot's name, welcome message, and AI behavior instructions.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                        <div>
                                            <div className="font-bold text-sm text-slate-900">Enable Floating Chat Widget</div>
                                            <div className="text-xs text-gray-500">Show the floating bot launcher on the storefront</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settingsForm.data.enabled}
                                            onChange={(e) => settingsForm.setData('enabled', e.target.checked)}
                                            className="w-5 h-5 text-slate-900 rounded focus:ring-slate-900"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                        <div>
                                            <div className="font-bold text-sm text-slate-900">Enable AI Fallback</div>
                                            <div className="text-xs text-gray-500">When Knowledge Base has no answer, consult the active AI model</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settingsForm.data.ai_fallback_enabled}
                                            onChange={(e) => settingsForm.setData('ai_fallback_enabled', e.target.checked)}
                                            className="w-5 h-5 text-slate-900 rounded focus:ring-slate-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Bot Name</label>
                                        <input
                                            type="text"
                                            value={settingsForm.data.name}
                                            onChange={(e) => settingsForm.setData('name', e.target.value)}
                                            placeholder="e.g. Marty - AI Shopping Assistant"
                                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-slate-900 outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Welcome Message</label>
                                        <textarea
                                            rows={2}
                                            value={settingsForm.data.welcome_message}
                                            onChange={(e) => settingsForm.setData('welcome_message', e.target.value)}
                                            placeholder="Initial greeting shown to customer when chat window opens"
                                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-slate-900 outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">AI System Prompt & Instructions</label>
                                        <textarea
                                            rows={6}
                                            value={settingsForm.data.system_prompt}
                                            onChange={(e) => settingsForm.setData('system_prompt', e.target.value)}
                                            placeholder="Direct instructions given to the AI model..."
                                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono focus:border-slate-900 outline-none leading-relaxed"
                                            required
                                        />
                                        <p className="text-[11px] text-gray-400 mt-1 font-medium">
                                            Store catalog, order tracking info, and policies are automatically injected into context during runtime.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={settingsForm.processing}
                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-black transition-all shadow-sm"
                                >
                                    {settingsForm.processing ? 'Saving...' : 'Save Settings'}
                                </button>
                            </form>
                        )}

                        {/* ========================================================= */}
                        {/* TAB 4: CONVERSATION LOGS & FALLBACKS                      */}
                        {/* ========================================================= */}
                        {activeTab === 'logs' && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">Conversation History & Unanswered Questions</h3>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                                            Review real customer questions. Easily convert unanswered or fallback queries into Knowledge Base answers.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => router.get('/admin/chatbot', { unanswered_only: !filters.unanswered_only, tab: 'logs' })}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                                                filters.unanswered_only ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {filters.unanswered_only ? 'Showing Unanswered Only' : 'Filter Unanswered / Fallbacks'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Clear all conversation history?')) {
                                                    router.post('/admin/chatbot/conversations/clear');
                                                }
                                            }}
                                            className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all"
                                        >
                                            Clear Logs
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {conversations.data.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                            No conversation logs found.
                                        </div>
                                    ) : (
                                        conversations.data.map(log => (
                                            <div
                                                key={log.id}
                                                className={`p-4 rounded-xl border transition-all ${
                                                    log.is_fallback || log.is_unanswered
                                                        ? 'bg-amber-50/50 border-amber-200'
                                                        : 'bg-white border-gray-200'
                                                }`}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                    <div className="space-y-2 flex-1">
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <span className="font-bold text-slate-800">
                                                                {log.user ? `${log.user.name} (${log.user.email})` : 'Guest Visitor'}
                                                            </span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                                                log.source === 'knowledge_base' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                                log.source === 'ai' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                                                'bg-amber-100 text-amber-800 border border-amber-300'
                                                            }`}>
                                                                {log.source === 'knowledge_base' ? 'Knowledge Base' :
                                                                 log.source === 'ai' ? `AI (${log.model_used || 'Model'})` : 'Fallback / Unanswered'}
                                                            </span>
                                                            {log.response_time_ms && (
                                                                <span className="text-[10px] text-gray-400 font-mono">{log.response_time_ms}ms</span>
                                                            )}
                                                        </div>

                                                        {/* User Question */}
                                                        <div className="bg-white border border-gray-200/80 rounded-xl p-3 text-xs font-semibold text-slate-900">
                                                            <span className="text-gray-400 uppercase text-[10px] font-black mr-2">Question:</span>
                                                            {log.user_message}
                                                        </div>

                                                        {/* Bot Answer */}
                                                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                                                            <span className="text-gray-400 uppercase text-[10px] font-black mr-2">Answer:</span>
                                                            {log.bot_response}
                                                        </div>

                                                        {log.error_message && (
                                                            <div className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
                                                                Error: {log.error_message}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex sm:flex-col items-end gap-2 shrink-0">
                                                        <button
                                                            onClick={() => openCreateKbModal(log.user_message)}
                                                            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all flex items-center gap-1"
                                                        >
                                                            <Plus size={13} /> Add to KB
                                                        </button>
                                                        <button
                                                            onClick={() => router.delete(`/admin/chatbot/conversations/${log.id}`, { preserveScroll: true })}
                                                            className="text-gray-400 hover:text-rose-600 p-1.5 transition-colors"
                                                            title="Delete log"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ========================================================= */}
                {/* MODAL: AI CONFIGURATION (CREATE / EDIT)                   */}
                {/* ========================================================= */}
                {aiModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h4 className="text-base font-black text-slate-900">
                                    {editingAiConfig ? 'Edit AI Configuration' : 'Add New AI Configuration'}
                                </h4>
                                <button onClick={() => setAiModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <form onSubmit={submitAiForm} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Configuration Name</label>
                                    <input
                                        type="text"
                                        value={aiForm.data.name}
                                        onChange={(e) => aiForm.setData('name', e.target.value)}
                                        placeholder="e.g. OpenAI GPT-4o Mini or Groq Llama 3"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:border-slate-900 outline-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Provider</label>
                                        <select
                                            value={aiForm.data.provider}
                                            onChange={(e) => {
                                                const prov = e.target.value;
                                                let defaultUrl = 'https://api.openai.com/v1';
                                                let defaultModel = 'gpt-4o-mini';
                                                if (prov === 'groq') {
                                                    defaultUrl = 'https://api.groq.com/openai/v1';
                                                    defaultModel = 'llama-3.3-70b-versatile';
                                                } else if (prov === 'gemini') {
                                                    defaultUrl = 'https://generativelanguage.googleapis.com/v1beta/openai';
                                                    defaultModel = 'gemini-1.5-flash';
                                                } else if (prov === 'anthropic') {
                                                    defaultUrl = 'https://api.anthropic.com/v1';
                                                    defaultModel = 'claude-3-5-haiku-20241022';
                                                }
                                                aiForm.setData(prev => ({
                                                    ...prev,
                                                    provider: prov,
                                                    api_url: defaultUrl,
                                                    model_name: defaultModel,
                                                }));
                                            }}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:border-slate-900 outline-none"
                                        >
                                            <option value="openai">OpenAI</option>
                                            <option value="groq">Groq (Fastest)</option>
                                            <option value="gemini">Google Gemini</option>
                                            <option value="anthropic">Anthropic Claude</option>
                                            <option value="custom">Custom / OpenAI-Compatible</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Model Name</label>
                                        <input
                                            type="text"
                                            value={aiForm.data.model_name}
                                            onChange={(e) => aiForm.setData('model_name', e.target.value)}
                                            placeholder="e.g. gpt-4o-mini"
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:border-slate-900 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">API Endpoint / Base URL</label>
                                    <input
                                        type="url"
                                        value={aiForm.data.api_url}
                                        onChange={(e) => aiForm.setData('api_url', e.target.value)}
                                        placeholder="https://api.openai.com/v1"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:border-slate-900 outline-none font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        API Secret Key {editingAiConfig && <span className="text-gray-400 font-normal lowercase">(leave blank to keep current)</span>}
                                    </label>
                                    <input
                                        type="password"
                                        value={aiForm.data.api_key}
                                        onChange={(e) => aiForm.setData('api_key', e.target.value)}
                                        placeholder={editingAiConfig ? '••••••••••••••••' : 'sk-... or your API key'}
                                        required={!editingAiConfig}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono focus:bg-white focus:border-slate-900 outline-none"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Encrypted with AES-256 in Laravel. Never exposed to browsers.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Temperature ({aiForm.data.temperature})</label>
                                        <input
                                            type="number"
                                            step="0.05"
                                            min="0"
                                            max="1"
                                            value={aiForm.data.temperature}
                                            onChange={(e) => aiForm.setData('temperature', parseFloat(e.target.value))}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:border-slate-900 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Max Tokens</label>
                                        <input
                                            type="number"
                                            step="50"
                                            min="100"
                                            max="2048"
                                            value={aiForm.data.max_tokens}
                                            onChange={(e) => aiForm.setData('max_tokens', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:border-slate-900 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setAiModalOpen(false)}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={aiForm.processing}
                                        className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all"
                                    >
                                        {aiForm.processing ? 'Saving...' : 'Save Configuration'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* MODAL: KNOWLEDGE BASE (CREATE / EDIT)                      */}
                {/* ========================================================= */}
                {kbModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h4 className="text-base font-black text-slate-900">
                                    {editingKb ? 'Edit Knowledge Base Entry' : 'Add Knowledge Base Entry'}
                                </h4>
                                <button onClick={() => setKbModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <form onSubmit={submitKbForm} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                                        <input
                                            type="text"
                                            value={kbForm.data.category}
                                            onChange={(e) => kbForm.setData('category', e.target.value)}
                                            placeholder="e.g. Shipping, Sizing, Returns"
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:border-slate-900 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Sort Priority</label>
                                        <input
                                            type="number"
                                            value={kbForm.data.sort_order}
                                            onChange={(e) => kbForm.setData('sort_order', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:border-slate-900 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Customer Question / Topic</label>
                                    <input
                                        type="text"
                                        value={kbForm.data.question}
                                        onChange={(e) => kbForm.setData('question', e.target.value)}
                                        placeholder="e.g. How long does shipping take to Chittagong?"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:border-slate-900 outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Bot Answer</label>
                                    <textarea
                                        rows={5}
                                        value={kbForm.data.answer}
                                        onChange={(e) => kbForm.setData('answer', e.target.value)}
                                        placeholder="Accurate answer provided to customer. Supports markdown bullets and links e.g. [Track Order](/track-order)."
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:border-slate-900 outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Matching Keywords (Comma separated)</label>
                                    <input
                                        type="text"
                                        value={kbForm.data.keywords}
                                        onChange={(e) => kbForm.setData('keywords', e.target.value)}
                                        placeholder="e.g. delivery time, courier, how long, shipping days"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:border-slate-900 outline-none"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="kb_active"
                                        checked={kbForm.data.is_active}
                                        onChange={(e) => kbForm.setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
                                    />
                                    <label htmlFor="kb_active" className="text-xs font-bold text-gray-700">Active (Available to chatbot)</label>
                                </div>

                                <div className="pt-2 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setKbModalOpen(false)}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={kbForm.processing}
                                        className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all"
                                    >
                                        {kbForm.processing ? 'Saving...' : 'Save Knowledge Entry'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
