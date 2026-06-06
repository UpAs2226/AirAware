import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function HealthPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m AirBot, your personal air quality health assistant. I can help you understand air quality data, health impacts, and provide personalized recommendations. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.slice(-7).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.post('/ai/chat', {
        message: userMsg,
        history: history.slice(0, -1)
      });

      setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Chat unavailable. Please ensure your Groq API key is configured.';
      setMessages([...newMessages, { role: 'assistant', content: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'What does PM2.5 mean for my health?',
    'How does AQI affect people with asthma?',
    'What can I do to protect myself from air pollution?',
    'Explain ozone levels and their health effects',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-12 py-8 flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-on-surface mb-1">Health AI Chat</h1>
        <p className="text-on-surface-variant text-sm flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-primary">psychology</span>
          Powered by Groq LLaMA · Personalized health guidance
        </p>
      </div>

      {/* Chat Window */}
      <div className="flex-1 card overflow-y-auto mb-4 flex flex-col gap-4 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              msg.role === 'assistant'
                ? 'bg-primary text-white'
                : 'bg-primary-container text-on-primary-container'
            }`}>
              {msg.role === 'assistant' ? (
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              ) : (
                (user?.name?.[0] || 'U').toUpperCase()
              )}
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'assistant'
                ? 'bg-surface-container-low text-on-surface rounded-tl-sm'
                : 'bg-primary text-white rounded-tr-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            </div>
            <div className="bg-surface-container-low px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => sendMessage(p)}
              className="text-xs bg-surface-container-low border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary px-3 py-1.5 rounded-full transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about air quality, health impacts, tips..."
          className="input-field flex-1"
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="bg-primary hover:opacity-90 disabled:opacity-50 text-white w-12 rounded-xl flex items-center justify-center transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </div>
    </div>
  );
}
