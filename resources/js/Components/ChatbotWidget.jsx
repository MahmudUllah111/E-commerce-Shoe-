import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, Sparkles, RefreshCw, ChevronDown, CheckCheck, ExternalLink, HelpCircle, ShoppingBag, Truck, RotateCcw } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({
        enabled: true,
        name: 'Marty',
        welcome_message: 'Hello! 👋 I am Marty, your TrustedMart shopping assistant. How can I help you today?',
        quick_suggestions: [
            'Where is my order?',
            'What is your return policy?',
            'Do you offer Cash on Delivery?',
            'Show me running shoes',
        ],
    });
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const messagesEndRef = useRef(null);

    // Initialize or load session
    useEffect(() => {
        let sid = sessionStorage.getItem('tm_chat_session_id');
        if (!sid) {
            sid = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
            sessionStorage.setItem('tm_chat_session_id', sid);
        }
        setSessionId(sid);

        // Fetch config
        axios.get('/chatbot/config')
            .then(res => {
                if (res.data) {
                    setConfig(prev => ({ ...prev, ...res.data }));
                }
            })
            .catch(() => {});

        // Fetch session history if exists
        axios.get(`/chatbot/history?session_id=${sid}`)
            .then(res => {
                if (res.data?.messages && res.data.messages.length > 0) {
                    const loaded = [];
                    res.data.messages.forEach(m => {
                        loaded.push({ sender: 'user', text: m.user_message, time: m.created_at });
                        loaded.push({ sender: 'bot', text: m.bot_response, source: m.source, time: m.created_at });
                    });
                    setMessages(loaded);
                } else {
                    // Initial welcome message
                    setMessages([
                        {
                            sender: 'bot',
                            text: config.welcome_message,
                            source: 'system',
                            time: new Date().toISOString(),
                        }
                    ]);
                }
            })
            .catch(() => {
                setMessages([
                    {
                        sender: 'bot',
                        text: config.welcome_message,
                        source: 'system',
                        time: new Date().toISOString(),
                    }
                ]);
            });
    }, []);

    // Auto-scroll on new messages
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, loading]);

    const handleSend = async (textToSend = null) => {
        const query = (textToSend || input).trim();
        if (!query || loading) return;

        setInput('');
        const userMsg = { sender: 'user', text: query, time: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const res = await axios.post('/chatbot/chat', {
                message: query,
                session_id: sessionId,
            });

            const botMsg = {
                sender: 'bot',
                text: res.data.answer || "I'm here to help! Could you please clarify your question?",
                source: res.data.source || 'knowledge_base',
                category: res.data.category || null,
                model: res.data.model || null,
                time: new Date().toISOString(),
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            const fallbackMsg = {
                sender: 'bot',
                text: "I'm having a little trouble connecting right now. You can reach our customer support team directly at support@trustedmart.com or via our Contact Us page!",
                source: 'fallback',
                time: new Date().toISOString(),
            };
            setMessages(prev => [...prev, fallbackMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = () => {
        const newSid = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
        sessionStorage.setItem('tm_chat_session_id', newSid);
        setSessionId(newSid);
        setMessages([
            {
                sender: 'bot',
                text: config.welcome_message,
                source: 'system',
                time: new Date().toISOString(),
            }
        ]);
    };

    // Helper to format simple markdown (links, bold, lists) safely
    const formatMessageText = (rawText) => {
        if (!rawText) return '';

        // Split into lines
        const lines = rawText.split('\n');

        return lines.map((line, lIdx) => {
            // Check for links [Label](url)
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            const parts = [];
            let lastIndex = 0;
            let match;

            while ((match = linkRegex.exec(line)) !== null) {
                if (match.index > lastIndex) {
                    parts.push(line.substring(lastIndex, match.index));
                }
                const label = match[1];
                const href = match[2];
                parts.push(
                    <Link
                        key={`link-${lIdx}-${match.index}`}
                        href={href}
                        onClick={() => {
                            if (window.innerWidth < 640) setIsOpen(false);
                        }}
                        className="text-rose-600 font-bold underline hover:text-rose-700 inline-flex items-center gap-0.5"
                    >
                        {label} <ExternalLink size={10} />
                    </Link>
                );
                lastIndex = linkRegex.lastIndex;
            }
            if (lastIndex < line.length) {
                parts.push(line.substring(lastIndex));
            }

            // Bold formatting **text**
            const renderedParts = parts.map((part, pIdx) => {
                if (typeof part !== 'string') return part;
                const boldSplit = part.split(/(\*\*[^*]+\*\*)/g);
                return boldSplit.map((chunk, cIdx) => {
                    if (chunk.startsWith('**') && chunk.endsWith('**')) {
                        return <strong key={`b-${lIdx}-${pIdx}-${cIdx}`} className="font-extrabold text-slate-900">{chunk.slice(2, -2)}</strong>;
                    }
                    return chunk;
                });
            });

            // List item bullet
            const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
            const isNumbered = /^\d+\.\s/.test(line.trim());

            return (
                <div key={lIdx} className={`${isBullet || isNumbered ? 'pl-2 my-0.5' : 'my-0.5'} min-h-[1.2rem]`}>
                    {renderedParts}
                </div>
            );
        });
    };

    if (!config.enabled) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 font-sans">
            {/* Chat Panel */}
            {isOpen && (
                <div
                    className="flex flex-col bg-white border border-gray-200/90 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-5"
                    style={{
                        width: 'min(410px, calc(100vw - 1.5rem))',
                        height: 'min(580px, calc(100vh - 5.5rem))',
                    }}
                    role="dialog"
                    aria-label="AI Shopping Assistant"
                >
                    {/* Header */}
                    <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-2.5">
                            <div className="relative">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-sm">
                                    <Bot size={18} />
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="text-sm font-black tracking-tight leading-tight">{config.name}</h3>
                                    <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/30 flex items-center gap-0.5">
                                        <Sparkles size={9} /> AI
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium">TrustedMart Assistant • Online</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleClearChat}
                                title="Reset conversation"
                                className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                            >
                                <RefreshCw size={14} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                title="Close chat"
                                className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50/50 to-white text-xs sm:text-sm">
                        {messages.map((m, idx) => {
                            const isUser = m.sender === 'user';
                            return (
                                <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl shadow-sm text-xs sm:text-[13px] leading-relaxed ${
                                            isUser
                                                ? 'bg-slate-900 text-white rounded-br-xs font-medium'
                                                : 'bg-white border border-gray-200/80 text-slate-800 rounded-bl-xs'
                                        }`}
                                    >
                                        {!isUser && m.source && m.source !== 'system' && (
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pb-1 border-b border-gray-100">
                                                {m.source === 'knowledge_base' ? (
                                                    <span className="text-emerald-600 flex items-center gap-1">
                                                        <CheckCheck size={11} /> Verified Answer
                                                    </span>
                                                ) : m.source === 'ai' ? (
                                                    <span className="text-rose-600 flex items-center gap-1">
                                                        <Sparkles size={11} /> AI Generated ({m.model || 'Model'})
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-600">Support Desk</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            {formatMessageText(m.text)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Typing / Loading Indicator */}
                        {loading && (
                            <div className="flex items-center gap-1.5 bg-white border border-gray-200/80 text-gray-400 px-3.5 py-2.5 rounded-2xl rounded-bl-xs w-20 shadow-sm">
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"></span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions (Shown when few messages) */}
                    {messages.length <= 2 && config.quick_suggestions?.length > 0 && (
                        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-1.5">
                            {config.quick_suggestions.slice(0, 4).map((sugg, sIdx) => (
                                <button
                                    key={sIdx}
                                    onClick={() => handleSend(sugg)}
                                    className="text-[11px] font-bold bg-white hover:bg-slate-900 hover:text-white text-slate-700 border border-gray-200 px-2.5 py-1 rounded-full shadow-xs transition-all text-left"
                                >
                                    {sugg}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Bar */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about shoes, sizes, orders..."
                            disabled={loading}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-xs sm:text-sm font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition-all disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            aria-label="Send Message"
                            className="w-9 h-9 rounded-full bg-slate-900 hover:bg-black text-white flex items-center justify-center disabled:opacity-40 disabled:hover:bg-slate-900 transition-all shadow-sm shrink-0"
                        >
                            <Send size={15} />
                        </button>
                    </form>

                    <div className="bg-gray-50 py-1 text-center text-[10px] text-gray-400 font-medium border-t border-gray-100">
                        Powered by TrustedMart Knowledge Base & AI
                    </div>
                </div>
            )}

            {/* Floating Launcher Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    aria-label="Open AI Assistant"
                    className="group relative flex items-center gap-2.5 bg-slate-900 hover:bg-black text-white pl-4 pr-5 py-3 rounded-full shadow-2xl hover:shadow-rose-600/20 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-sm">
                            <Bot size={18} />
                        </div>
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                    </div>
                    <div className="text-left hidden sm:block">
                        <span className="block text-xs font-black leading-tight">Need Help?</span>
                        <span className="block text-[10px] text-slate-300 font-bold">Ask Marty AI</span>
                    </div>
                    <Sparkles size={14} className="text-amber-400 group-hover:rotate-12 transition-transform" />
                </button>
            )}
        </div>
    );
}
