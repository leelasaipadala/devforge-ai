'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Trash2, Sparkles, Loader2, User } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ApiClient } from '@/lib/api';

// Rich Markdown Formatter for FORGE AI Response Styling
function FormattedMarkdown({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${index}`} className="p-3.5 rounded-xl bg-zinc-950 border border-border/80 text-emerald-400 font-mono text-[11px] overflow-x-auto my-2 shadow-inner leading-relaxed">
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    const trimmed = line.trim();

    // H3 Header
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="text-sm font-bold text-purple-400 mt-3 mb-1.5 flex items-center gap-1.5 border-b border-border/40 pb-1">
          {parseInline(trimmed.replace('### ', ''))}
        </h3>
      );
      return;
    }

    // H4 Header
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={index} className="text-xs font-bold text-blue-400 mt-2.5 mb-1">
          {parseInline(trimmed.replace('#### ', ''))}
        </h4>
      );
      return;
    }

    // Numbered List Items
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={index} className="flex items-start gap-2 my-1 pl-1">
          <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold flex items-center justify-center shrink-0 border border-purple-500/20 mt-0.5">
            {numMatch[1]}
          </span>
          <div className="flex-1 text-xs leading-relaxed pt-0.5">{parseInline(numMatch[2])}</div>
        </div>
      );
      return;
    }

    // Bullet List Items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.replace(/^[-*]\s+/, '');
      elements.push(
        <div key={index} className="flex items-start gap-2 my-1 pl-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
          <div className="flex-1 text-xs leading-relaxed">{parseInline(itemText)}</div>
        </div>
      );
      return;
    }

    // Empty Lines
    if (!trimmed) {
      elements.push(<div key={index} className="h-1.5" />);
      return;
    }

    // Standard Paragraph
    elements.push(
      <p key={index} className="text-xs leading-relaxed text-foreground">
        {parseInline(line)}
      </p>
    );
  });

  return <div className="space-y-1 font-sans">{elements}</div>;
}

// Inline formatting helper for **bold** and `code`
function parseInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-secondary text-blue-400 font-mono text-[11px] border border-border/50">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function AICoachPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    'What should I learn this week?',
    'Explain Java inheritance.',
    'What is a closure in JavaScript?',
    'How can I improve my GitHub?',
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
      if (res && res.messages && Array.isArray(res.messages)) {
        setMessages(res.messages);
      }
    } catch (err) {
      // Silent catch
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
      if (res && res.messages && Array.isArray(res.messages)) {
        setMessages(res.messages);
      } else if (res && res.reply) {
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: res.reply, timestamp: new Date() }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: 'FORGE AI is currently unavailable. Please try again later.',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err: any) {
      const errMsg = err?.message || 'FORGE AI is currently unavailable. Please try again later.';
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: errMsg,
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
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-semibold border border-purple-500/30 uppercase tracking-wider">
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
                      className="p-3 rounded-xl bg-card hover:bg-secondary border border-border text-xs text-foreground transition-colors text-left font-medium active:scale-[0.99]"
                    >
                      &quot;{s}&quot;
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id || `m-${Math.random()}`}
                  className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                      m.role === 'user'
                        ? 'bg-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-purple-600 shadow-md shadow-purple-500/20'
                    }`}
                  >
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 fill-white" />}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                        : 'bg-card border border-border text-foreground space-y-2 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <div className="whitespace-pre-wrap font-sans">{m.content}</div>
                    ) : (
                      <FormattedMarkdown content={m.content} />
                    )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-4 h-4 fill-white animate-spin" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-card border border-border text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  <span>FORGE AI is analyzing your current question...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="pt-3 border-t border-border shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask FORGE AI (e.g. 'Explain Java inheritance' or 'What is a closure in JS?')..."
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-40 disabled:hover:bg-blue-600 shadow-sm active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
