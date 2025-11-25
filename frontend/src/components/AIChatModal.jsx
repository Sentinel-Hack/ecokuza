import React, { useEffect, useRef, useState } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { apiCall, ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function AIChatModal({ open, onClose, context = {} }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // Load persisted messages
    try {
      const raw = localStorage.getItem('ecokuza_ai_chat');
      if (raw) setMessages(JSON.parse(raw));
      else setMessages([{ id: 'system', role: 'assistant', text: "Hi — I'm Ecokuza AI. Ask me about your dashboard or trees." }]);
    } catch {
      setMessages([{ id: 'system', role: 'assistant', text: "Hi — I'm Ecokuza AI. Ask me about your dashboard or trees." }]);
    }
    setInput('');
  }, [open, context]);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
    try { localStorage.setItem('ecokuza_ai_chat', JSON.stringify(messages)); } catch {}
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: `u_${Date.now()}`, role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const payload = { message: userMsg.text, context };
      const res = await apiCall(ENDPOINTS.AI_CHAT, { method: 'POST', body: JSON.stringify(payload) });
      let data = null;
      try { data = await res.json(); } catch { data = null; }
      const assistantText = data?.reply || data?.message || 'Sorry, no response.';
      const assistantMsg = { id: `a_${Date.now()}`, role: 'assistant', text: assistantText };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg = { id: `err_${Date.now()}`, role: 'assistant', text: 'AI service unavailable. Please try again later.' };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden z-60 flex flex-col" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Ecokuza AI</h3>
          <div>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4"/></Button>
          </div>
        </div>

        <div ref={boxRef} className="flex-1 overflow-y-auto p-4 space-y-3 h-80 bg-gray-50">
          {messages.map(m => (
            <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={`inline-block p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t">
          <div className="flex items-center gap-2">
            <input
              aria-label="Type a message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              className="flex-1 h-10 px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Ask about your dashboard, a tree, or tips..."
            />
            <Button onClick={sendMessage} disabled={loading}><Send className="w-4 h-4"/></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
