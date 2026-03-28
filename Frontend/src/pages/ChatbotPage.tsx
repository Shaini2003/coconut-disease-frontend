// Frontend/src/pages/ChatbotPage.tsx
// IMPROVED: Category navigation, history loading, rich UI

import { Bot, ChevronDown, ChevronUp, Loader2, Send, Trash2, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const API_URL = 'http://localhost:5000/api';

interface Message {
  id:        number;
  role:      'user' | 'bot';
  content:   string;
  timestamp: Date;
}

interface ChatbotPageProps {
  onNavigate: (page: string) => void;
}

const CATEGORIES = [
  {
    label: '🔴 Critical Diseases',
    color: 'border-red-200 text-red-700',
    bg:    'bg-red-50 hover:bg-red-100',
    questions: [
      'What is Bud Rot?',
      'How to treat Bud Rot?',
      'What is Stem Bleeding?',
      'How to treat Stem Bleeding?',
      'What is WCLWD?',
      'WCLWD symptoms?',
    ],
  },
  {
    label: '🟠 High Severity',
    color: 'border-orange-200 text-orange-700',
    bg:    'bg-orange-50 hover:bg-orange-100',
    questions: [
      'What is Leaf Rot?',
      'How to treat Leaf Rot?',
      'What is Bud Root Dropping?',
      'Bud Root Dropping treatment?',
    ],
  },
  {
    label: '🟡 Medium Severity',
    color: 'border-yellow-200 text-yellow-700',
    bg:    'bg-yellow-50 hover:bg-yellow-100',
    questions: [
      'What is Gray Leaf Spot?',
      'How to treat Gray Leaf Spot?',
      'What are CCI Caterpillars?',
      'CCI Caterpillars treatment?',
    ],
  },
  {
    label: '🌾 Farming Tips',
    color: 'border-green-200 text-green-700',
    bg:    'bg-green-50 hover:bg-green-100',
    questions: [
      'How often should I water coconut trees?',
      'What fertilizer should I use?',
      'When do coconut trees produce nuts?',
      'How to harvest coconuts?',
      'Best soil for coconut trees?',
      'How to contact CRISL?',
    ],
  },
];

const WELCOME: Message = {
  id: 0, role: 'bot', timestamp: new Date(),
  content: `Hello! 👋 Welcome to **CocoAI Assistant**.\n\nI'm your coconut farming expert. I can help with:\n\n🔴 **Critical diseases** — Bud Rot, Stem Bleeding, WCLWD\n🟠 **High severity** — Leaf Rot, Bud Root Dropping\n🟡 **Medium severity** — Gray Leaf Spot, CCI Caterpillars\n🟢 **Healthy tree care** — Watering, fertilizing, harvesting, pests\n\nSelect a category below or type your question!`,
};

export default function ChatbotPage({}: ChatbotPageProps) {
  const [messages,       setMessages]       = useState<Message[]>([WELCOME]);
  const [input,          setInput]          = useState('');
  const [sending,        setSending]        = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [hasHistory,     setHasHistory]     = useState(false);
  const [openCategory,   setOpenCategory]   = useState<number | null>(null);
  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { fetchHistory(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_URL}/chatbot/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.history) && data.history.length > 0) {
        const restored: Message[] = [];
        data.history.forEach((row: any, i: number) => {
          restored.push({ id: i * 2 + 10, role: 'user', content: row.user_message, timestamp: new Date(row.created_at) });
          restored.push({ id: i * 2 + 11, role: 'bot',  content: row.bot_response,  timestamp: new Date(row.created_at) });
        });
        setMessages([WELCOME, ...restored]);
        setHasHistory(true);
      }
    } catch (err) {
      console.warn('History load failed:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: msg, timestamp: new Date() }]);
    setInput('');
    setOpenCategory(null);
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_URL}/chatbot`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'bot',
        content: data.message || 'Sorry, I could not process that.',
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'bot',
        content: '❌ Connection error. Make sure the backend is running on port 5000.',
        timestamp: new Date(),
      }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const clearChat = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/chatbot/history`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    } catch {}
    setMessages([{ ...WELCOME, timestamp: new Date() }]);
    setHasHistory(false);
  };

  const renderContent = (text: string) =>
    text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CocoAI Assistant</h1>
              <p className="text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse"></span>
                <span className="text-green-600">
                  {historyLoading ? 'Loading conversations...'
                    : hasHistory ? 'Conversation history restored'
                    : 'Online — Expert coconut farming assistant'}
                </span>
              </p>
            </div>
          </div>
          <button onClick={clearChat}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition">
            <Trash2 className="w-4 h-4" /> Clear Chat
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 py-4 flex flex-col flex-1">

        {/* Category quick-access */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Quick Questions by Category</p>
          <div className="space-y-2">
            {CATEGORIES.map((cat, idx) => (
              <div key={idx} className={`border rounded-xl overflow-hidden ${cat.color}`}>
                <button
                  onClick={() => setOpenCategory(openCategory === idx ? null : idx)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium ${cat.bg} transition`}
                >
                  <span>{cat.label}</span>
                  {openCategory === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openCategory === idx && (
                  <div className="flex flex-wrap gap-2 px-4 pb-3 pt-2 bg-white border-t border-gray-100">
                    {cat.questions.map(q => (
                      <button key={q} onClick={() => sendMessage(q)}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${cat.color} ${cat.bg}`}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Loading */}
        {historyLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading your previous conversation history...
          </div>
        )}

        {/* History banner */}
        {!historyLoading && hasHistory && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 mb-3 flex items-center gap-2">
            <span className="text-blue-500 text-sm">🕐</span>
            <p className="text-sm text-blue-700">Your previous conversation history has been restored.</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4" style={{ minHeight: '300px' }}>
          {messages.map((msg, idx) => (
            <div key={msg.id}>
              {idx > 1 && new Date(msg.timestamp).toDateString() !== new Date(messages[idx - 1].timestamp).toDateString() && (
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
              )}
              <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'bot' ? 'bg-green-600' : 'bg-blue-600'}`}>
                  {msg.role === 'bot' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                  msg.role === 'bot'
                    ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                    : 'bg-green-600 text-white rounded-tr-sm'
                }`}>
                  {renderContent(msg.content)}
                  <div className={`text-xs mt-2 ${msg.role === 'bot' ? 'text-gray-400' : 'text-green-200'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3 items-end">
          <div className="flex-1 bg-white border border-gray-300 rounded-2xl flex items-end px-4 py-3
                          focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition shadow-sm">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask about diseases, treatment, fertilizer, farming tips..."
              className="flex-1 resize-none outline-none text-sm text-gray-800 bg-transparent max-h-32"
              rows={1}
            />
          </div>
          <button onClick={() => sendMessage()} disabled={!input.trim() || sending}
            className="w-12 h-12 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition shadow-sm flex-shrink-0">
            {sending ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Send className="w-5 h-5 text-white" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Enter to send · Shift+Enter for new line · Agricultural guidance only
        </p>
      </div>
    </div>
  );
}