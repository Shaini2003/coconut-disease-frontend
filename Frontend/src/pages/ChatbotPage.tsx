// Frontend/src/pages/ChatbotPage.tsx
import { Bot, ChevronDown, ChevronUp, Loader2, Send, Trash2, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../i18n';

const API_URL = 'http://localhost:5000/api';

interface Message { id: number; role: 'user' | 'bot'; content: string; timestamp: Date; }
interface ChatbotPageProps { onNavigate: (page: string) => void; }

const CATEGORIES_EN = [
  { label: '🔴 Critical Diseases', color: 'border-red-200 text-red-700', bg: 'bg-red-50 hover:bg-red-100', questions: ['What is Bud Rot?','How to treat Bud Rot?','What is Stem Bleeding?','How to treat Stem Bleeding?','What is WCLWD?','WCLWD symptoms and treatment?'] },
  { label: '🟠 High Severity', color: 'border-orange-200 text-orange-700', bg: 'bg-orange-50 hover:bg-orange-100', questions: ['What is Leaf Rot?','How to treat Leaf Rot?','What is Bud Root Dropping?','Bud Root Dropping treatment?'] },
  { label: '🟡 Medium Severity', color: 'border-yellow-200 text-yellow-700', bg: 'bg-yellow-50 hover:bg-yellow-100', questions: ['What is Gray Leaf Spot?','How to treat Gray Leaf Spot?','What are CCI Caterpillars?','CCI Caterpillars treatment?','What are CCI Leaflets?'] },
  { label: '🌾 Farming Tips', color: 'border-green-200 text-green-700', bg: 'bg-green-50 hover:bg-green-100', questions: ['How often should I water coconut trees?','What fertilizer should I use?','When do coconut trees produce nuts?','How to harvest coconuts?','Best soil for coconut trees?','How to contact CRISL?'] },
];

const CATEGORIES_SI = [
  { label: '🔴 අනතුරුදායක රෝග', color: 'border-red-200 text-red-700', bg: 'bg-red-50 hover:bg-red-100', questions: ['බද් රොට් යනු කුමක්ද?','බද් රොට් ප්‍රතිකාර කරන්නේ කෙසේද?','ස්ටෙම් ලේ වැගිරීම යනු කුමක්ද?','ස්ටෙම් ලේ වැගිරීම ප්‍රතිකාරය?','WCLWD යනු කුමක්ද?','WCLWD රෝග ලක්ෂණ සහ ප්‍රතිකාර?'] },
  { label: '🟠 ඉහළ බරපතලකම', color: 'border-orange-200 text-orange-700', bg: 'bg-orange-50 hover:bg-orange-100', questions: ['කොළ කුණු රෝගය යනු කුමක්ද?','කොළ කුණු රෝගය ප්‍රතිකාර?','බද් රූට් ඩ්‍රොපිං යනු කුමක්ද?','බද් රූට් ඩ්‍රොපිං ප්‍රතිකාරය?'] },
  { label: '🟡 මධ්‍යම බරපතලකම', color: 'border-yellow-200 text-yellow-700', bg: 'bg-yellow-50 hover:bg-yellow-100', questions: ['ග්‍රේ ලීෆ් ස්පොට් යනු කුමක්ද?','ග්‍රේ ලීෆ් ස්පොට් ප්‍රතිකාර?','CCI රූකඩ රෝගය යනු කුමක්ද?','CCI රූකඩ ප්‍රතිකාරය?','CCI ලීෆ්ලෙට්ස් යනු කුමක්ද?'] },
  { label: '🌾 ගොවිතැන් ඉඟි', color: 'border-green-200 text-green-700', bg: 'bg-green-50 hover:bg-green-100', questions: ['පොල් ගස් කොපමණ වාරයකට වතුර දෙන්නද?','පොල් ගස් සඳහා කුමන පොහොර යෙදිය යුතුද?','පොල් ගස් ගෙඩි දෙන්නේ කවදාද?','පොල් හෙළ කරන්නේ කෙසේද?','පොල් ගස් සඳහා හොඳම පස කුමක්ද?','CRISL සම්බන්ධ කරන්නේ කෙසේද?'] },
];

export default function ChatbotPage({}: ChatbotPageProps) {
  const { t, language } = useTranslation();
  const CATEGORIES = language === 'si' ? CATEGORIES_SI : CATEGORIES_EN;

  const getWelcome = (): Message => ({
    id: 0, role: 'bot', timestamp: new Date(),
    content: language === 'si'
      ? `ආයුබෝවන්! 👋 **CocoAI සහායකට** සාදරයෙන් පිළිගනිමු.\n\nමම ඔබේ පොල් ගොවිතැන් විශේෂඥ සහායකයා. මට පෙර සංවාද මතක තබාගත හැක. ඔබේ ගැටලුව පවසන්න!`
      : `Hello! 👋 Welcome to **CocoAI Assistant**.\n\nI'm your coconut farming expert. I can remember our previous messages to give you better context. Ask me anything!`,
  });

  const [messages,       setMessages]       = useState<Message[]>([getWelcome()]);
  const [input,          setInput]          = useState('');
  const [sending,        setSending]        = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [hasHistory,     setHasHistory]     = useState(false);
  const [openCategory,   setOpenCategory]   = useState<number | null>(null);
  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setMessages(prev => [getWelcome(), ...prev.slice(1)]); }, [language]);
  useEffect(() => { fetchHistory(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, sending]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_URL}/chatbot/history`, { headers: { Authorization: `Bearer ${token}` } });
      const data  = await res.json();
      if (res.ok && Array.isArray(data.history) && data.history.length > 0) {
        const restored: Message[] = [];
        data.history.forEach((row: any, i: number) => {
          restored.push({ id: i*2+10, role:'user', content: row.user_message, timestamp: new Date(row.created_at) });
          restored.push({ id: i*2+11, role:'bot',  content: row.bot_response,  timestamp: new Date(row.created_at) });
        });
        setMessages([getWelcome(), ...restored]);
        setHasHistory(true);
      }
    } catch (err) { console.warn('History load failed:', err); }
    finally { setHistoryLoading(false); }
  };

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    
    const newMessages: Message[] = [...messages, { id: Date.now(), role:'user', content: msg, timestamp: new Date() }];
    setMessages(newMessages);
    setInput(''); setOpenCategory(null); setSending(true);
    
    const chatHistory = newMessages.slice(-7, -1).map(m => ({ sender: m.role, text: m.content }));

    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_URL}/chatbot`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ message: msg, language: language, history: chatHistory }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: Date.now()+1, role:'bot',
        content:   data.message || (language === 'si' ? 'සමාවෙන්න, ප්‍රතිචාර දැක්වීමට නොහැකි විය.' : 'Sorry, I could not process that.'),
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now()+1, role:'bot',
        content:   language === 'si' ? 'සම්බන්ධතා දෝෂය. Backend ක්‍රියාත්මකදැයි බලන්න.' : t.chatbot.connectionError,
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
      await fetch(`${API_URL}/chatbot/history`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } }); 
    } catch {}
    setMessages([getWelcome()]); setHasHistory(false);
  };

  const renderContent = (text: string) =>
    text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? <strong key={i} className="font-bold">{part.slice(2,-2)}</strong> : <span key={i}>{part}</span>
    );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow"><Bot className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t.chatbot.title}</h1>
              <p className="text-sm flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" />
                <span className="text-green-600">{historyLoading ? t.chatbot.loadingHistory : hasHistory ? t.chatbot.historyRestored : t.chatbot.online}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`hidden sm:inline-block text-xs font-bold px-3 py-1.5 rounded-full border ${language === 'si' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
              {language === 'si' ? '🇱🇰 සිංහලෙන් පිළිතුරු' : '🇬🇧 Replying in English'}
            </span>
            <button onClick={clearChat} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition font-medium">
              <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline-block">{t.chatbot.clearChat}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 py-4 flex flex-col flex-1">
        <div className="mb-4">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2 pl-1">{t.chatbot.categories}</p>
          <div className="space-y-2">
            {CATEGORIES.map((cat, idx) => (
              <div key={idx} className={`border rounded-2xl overflow-hidden shadow-sm transition-all ${cat.color}`}>
                <button onClick={() => setOpenCategory(openCategory===idx ? null : idx)} className={`w-full flex items-center justify-between px-5 py-3 text-sm font-bold ${cat.bg} transition`}>
                  <span>{cat.label}</span>{openCategory===idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openCategory===idx && (
                  <div className="flex flex-wrap gap-2 px-5 pb-4 pt-3 bg-white border-t border-gray-100 animate-in slide-in-from-top-2">
                    {cat.questions.map(q => (<button key={q} onClick={() => sendMessage(q)} className={`text-xs px-3.5 py-1.5 rounded-full border font-semibold transition hover:scale-105 active:scale-95 ${cat.color} ${cat.bg}`}>{q}</button>))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {historyLoading && (<div className="flex items-center gap-2 text-sm text-gray-400 mb-3 font-medium"><Loader2 className="w-4 h-4 animate-spin" />{t.chatbot.loadingMsg}</div>)}
        {!historyLoading && hasHistory && (<div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3 flex items-center gap-2 shadow-sm animate-in fade-in"><span className="text-blue-500 text-sm">🕐</span><p className="text-sm font-medium text-blue-700">{t.chatbot.historyBanner}</p></div>)}

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scroll-smooth" style={{ minHeight: '300px' }}>
          {messages.map((msg, idx) => (
            <div key={msg.id} className="animate-in slide-in-from-bottom-2 fade-in duration-300">
              {idx > 1 && new Date(msg.timestamp).toDateString() !== new Date(messages[idx-1].timestamp).toDateString() && (
                <div className="flex items-center gap-3 my-4"><div className="flex-1 h-px bg-gray-200"></div><span className="text-xs font-semibold text-gray-400">{new Date(msg.timestamp).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span><div className="flex-1 h-px bg-gray-200"></div></div>
              )}
              <div className={`flex gap-3 ${msg.role==='user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow ${msg.role==='bot' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                  {msg.role==='bot' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                </div>
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed whitespace-pre-line shadow ${msg.role==='bot' ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm font-medium' : 'bg-green-600 text-white rounded-tr-sm font-medium'}`}>
                  {renderContent(msg.content)}
                  <div className={`text-[10px] mt-2 font-semibold ${msg.role==='bot' ? 'text-gray-400' : 'text-green-200'}`}>{new Date(msg.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                </div>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex gap-3 animate-in fade-in">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow"><Bot className="w-5 h-5 text-white" /></div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow"><div className="flex gap-1.5 items-center h-5">{[0,150,300].map(d=>(<span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}}/>))}</div></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="flex gap-3 items-end bg-white p-2 rounded-3xl shadow-sm border border-gray-200">
          <div className="flex-1 flex items-end px-3 py-1">
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }}}
              placeholder={t.chatbot.placeholder} className="flex-1 resize-none outline-none text-sm font-medium text-gray-800 bg-transparent max-h-32 py-2" rows={1} />
          </div>
          <button onClick={()=>sendMessage()} disabled={!input.trim()||sending}
            className="w-12 h-12 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition shadow flex-shrink-0 active:scale-95">
            {sending ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Send className="w-5 h-5 text-white ml-0.5" />}
          </button>
        </div>
        <p className="text-xs font-medium text-gray-400 text-center mt-3 mb-1">{t.chatbot.hint}</p>
      </div>
    </div>
  );
}