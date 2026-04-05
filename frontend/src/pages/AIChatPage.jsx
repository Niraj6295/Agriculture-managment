import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  'What are the best fertilizers for wheat?',
  'How do I prevent pest attacks during monsoon?',
  'My crop leaves are turning yellow, what should I do?',
  'Suggest irrigation schedule for rice crop',
  'What crops should I grow in summer season?',
];

export default function AIChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Hi! I\'m your AI agriculture assistant powered by Groq AI. Ask me anything about farming, crops, soil, irrigation, or pests. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/crops').then(r => setCrops(r.data.crops)).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    const history = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', {
        message: msg,
        cropId: selectedCrop || undefined,
        conversationHistory: history,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'AI service unavailable. Please check your Groq API key in backend/.env';
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${errMsg}`, isError: true }]);
    } finally { setLoading(false); }
  };

  const clearChat = () => setMessages([
    { role: 'assistant', content: '👋 Chat cleared. How can I help you?' }
  ]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Chatbot</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Powered by Groq AI (Llama 3)</p>
        </div>
        <div className="flex gap-3 items-center">
          {crops.length > 0 && (
            <select className="input w-44 text-sm" value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}>
              <option value="">No crop context</option>
              {crops.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          )}
          <button onClick={clearChat} className="btn-secondary flex items-center gap-1.5 text-sm">
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Chat window */}
      <div className="card flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary-100 dark:bg-primary-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {msg.role === 'user' ? <User size={16} className="text-primary-600 dark:text-primary-400" /> : <Bot size={16} className="text-gray-500" />}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-sm'
                  : msg.isError
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-tl-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Bot size={16} className="text-gray-500" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)} className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Ask about farming, crops, soil, pests…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="btn-primary px-4 flex items-center gap-2"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
