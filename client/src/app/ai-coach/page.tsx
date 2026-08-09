'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Trash2, Sparkles } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ApiClient } from '@/lib/api';
import { DevForgeLogo } from '@/components/DevForgeLogo';

export default function AICoachPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    'What should I learn next based on my target role?',
    'Analyze my current skill gaps vs market requirements',
    'How can I prepare for technical software interviews?',
    'Suggest 3 high-impact portfolio projects to build',
  ];

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function loadHistory() {
    try {
      const res: any = await ApiClient.get('/ai/history');
      setMessages(res.messages || []);
    } catch (err) {
      console.error('Error loading AI history:', err);
    }
  }

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');
    const tempUserMsg = { id: `u-${Date.now()}`, role: 'user', content: query, timestamp: new Date() };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res: any = await ApiClient.post('/ai/chat', { message: query });
      if (res.messages) {
        setMessages(res.messages);
      } else if (res.reply) {
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: res.reply, timestamp: new Date() }]);
      }
    } catch (err: any) {
      console.error('Error in AI chat:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'FORGE AI is temporarily unavailable. Please verify your connection or try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await ApiClient.delete('/ai/history');
      setMessages([]);
    } catch (err) {
      console.error('Error clearing history:', err);
      setMessages([]);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 h-screen">
        <Header onMobileMenuClick={() => setMobileOpen(true)} />

        <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full p-4 sm:p-6 overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground flex items-center gap-2">
                  FORGE Career Intelligence
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-semibold border border-purple-500/30">
                    FORGE AI
                  </span>
                </h1>
                <p className="text-[11px] text-muted-foreground">Context-aware software career, skill gap, and interview strategy advisor.</p>
              </div>
            </div>

            <button
              onClick={handleClearHistory}
              className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-secondary transition-colors border border-border"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-2">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                  <Sparkles className="w-8 h-8 fill-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">How can FORGE AI help today?</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ask career readiness questions, request project ideas, get interview guidance, or review your resume ATS strategy.
                  </p>
                </div>

                {/* Suggested Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(s)}
                      className="p-3 rounded-xl bg-card hover:bg-secondary border border-border text-xs text-foreground transition-colors text-left font-medium"
                    >
                      "{s}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role !== 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <DevForgeLogo variant="forge-ai" size="sm" />
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-card border border-border text-foreground rounded-bl-none shadow-lg'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 shrink-0 mt-0.5 font-bold text-xs">
                      ME
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="flex gap-3.5 justify-start items-center text-xs text-purple-400">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5 bg-card border border-border px-4 py-3 rounded-2xl">
                  <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                  <span>FORGE AI is analyzing your career profile...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="pt-4 border-t border-border shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 p-2 rounded-2xl bg-card border border-border focus-within:border-blue-500/50 transition-all shadow-xl"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask FORGE AI (e.g., 'Am I ready for a backend role?')..."
                className="flex-1 px-4 py-2.5 bg-transparent text-xs sm:text-sm text-foreground placeholder-muted-foreground focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-lg shadow-blue-600/20 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

