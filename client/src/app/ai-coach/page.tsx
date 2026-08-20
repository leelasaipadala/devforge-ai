'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Send, Trash2, Sparkles, Loader2, User, Plus, RefreshCw, Copy, Check, Briefcase, BrainCircuit } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ApiClient } from '@/lib/api';
import { AuroraCard } from '@/components/AuroraCard';
import { AuroraAIOrb } from '@/components/AuroraAIOrb';
import { AuroraButton } from '@/components/AuroraButton';
import { AuroraBadge } from '@/components/AuroraBadge';

// Rich Markdown Formatter for FORGE AI Response Styling
const FormattedMarkdown = React.memo(function FormattedMarkdown({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${index}`} className="p-4 rounded-xl bg-secondary/80 border border-border/80 text-foreground font-mono text-[13px] overflow-x-auto my-3 shadow-inner leading-relaxed">
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
        <h3 key={index} className="text-[15px] font-bold text-primary mt-4 mb-2 flex items-center gap-1.5 pb-1">
          {parseInline(trimmed.replace('### ', ''))}
        </h3>
      );
      return;
    }

    // H4 Header
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={index} className="text-[14px] font-bold text-ai mt-3 mb-1.5">
          {parseInline(trimmed.replace('#### ', ''))}
        </h4>
      );
      return;
    }

    // Numbered List Items
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={index} className="flex items-start gap-2.5 my-1.5 pl-1">
          <span className="w-5 h-5 rounded-full bg-ai/10 text-ai text-[11px] font-bold flex items-center justify-center shrink-0 border border-ai/20 mt-0.5">
            {numMatch[1]}
          </span>
          <div className="flex-1 text-[13px] leading-relaxed pt-0.5">{parseInline(numMatch[2])}</div>
        </div>
      );
      return;
    }

    // Bullet List Items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.replace(/^[-*]\s+/, '');
      elements.push(
        <div key={index} className="flex items-start gap-2.5 my-1.5 pl-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
          <div className="flex-1 text-[13px] leading-relaxed">{parseInline(itemText)}</div>
        </div>
      );
      return;
    }

    // Empty Lines
    if (!trimmed) {
      elements.push(<div key={index} className="h-2" />);
      return;
    }

    // Standard Paragraph
    elements.push(
      <p key={index} className="text-[14px] leading-relaxed text-foreground">
        {parseInline(line)}
      </p>
    );
  });

  return <div className="space-y-1 font-sans">{elements}</div>;
});

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
        <code key={i} className="px-1.5 py-0.5 rounded-md bg-background text-primary font-mono text-[12px] border border-border/50">
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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');
  
  // Context Data
  const [contextData, setContextData] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    'What should I learn this week?',
    'Review my current skill gaps.',
    'How can I improve my resume?',
    'Which project should I build next?',
    'How should I prepare for my next interview?',
  ];

  useEffect(() => {
    loadHistory();
    loadContext();
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

  async function loadContext() {
    try {
      const res: any = await ApiClient.get('/profile');
      setContextData(res);
    } catch (err) {
      setContextData({
        profile: { targetRole: 'Software Engineer' },
        readinessData: { overallScore: 78 }
      });
    }
  }

  const parseErrorMessage = (err: any): string => {
    const code = err?.code || err?.response?.data?.code || '';
    const msg = err?.message || err?.response?.data?.message || '';

    if (code === 'UNAUTHENTICATED' || code === 'CLERK_AUTH_FAILED' || code === 'INVALID_TOKEN' || msg.includes('Authentication token') || msg.includes('Please sign in')) {
      return 'Authentication required. Please sign in to chat with FORGE AI.';
    }
    if (code === 'GEMINI_NOT_CONFIGURED' || msg.includes('not configured')) {
      return 'FORGE AI is not configured yet. Add GEMINI_API_KEY to the server environment to enable AI.';
    }
    if (code === 'GEMINI_AUTH_FAILED' || msg.includes('GEMINI_API_KEY') || msg.includes('AIzaSy')) {
      return 'FORGE AI server configuration is invalid. Please check the server GEMINI_API_KEY.';
    }
    if (code === 'GEMINI_PERMISSION_ERROR' || msg.includes('permission')) {
      return 'FORGE AI does not have permission to use the configured model.';
    }
    if (code === 'GEMINI_MODEL_NOT_FOUND' || msg.includes('model is unavailable')) {
      return 'The configured FORGE AI model is unavailable. Check GEMINI_MODEL.';
    }
    if (code === 'AI_RATE_LIMITED' || msg.includes('rate-limited')) {
      return 'FORGE AI is temporarily rate-limited. Please try again shortly.';
    }
    if (code === 'GEMINI_SERVER_ERROR' || msg.includes('server error')) {
      return 'FORGE AI encountered a temporary server error. Please try again.';
    }
    if (code === 'GEMINI_UNAVAILABLE' || msg.includes('unavailable')) {
      return 'FORGE AI is temporarily unavailable. Please retry.';
    }
    return msg || "FORGE AI couldn't complete that request. Please try again.";
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    // Clear input state immediately
    setInput('');
    setLastUserPrompt(query);

    // Create & append local user message
    const tempUserMsg = { id: `u-${Date.now()}`, role: 'user', content: query, timestamp: new Date() };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res: any = await ApiClient.post('/ai/chat', {
        message: query,
        conversationId,
      });

      if (res && res.conversationId) {
        setConversationId(res.conversationId);
      }

      if (res && res.messages && Array.isArray(res.messages)) {
        setMessages(res.messages);
      } else if (res && res.reply) {
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: res.reply, timestamp: new Date() }]);
      } else {
        const errorText = parseErrorMessage(res);
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: errorText,
            isError: true,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err: any) {
      const errorText = parseErrorMessage(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: errorText,
          isError: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setInput('');
  };

  const handleClearHistory = async () => {
    try {
      await ApiClient.delete('/ai/history');
      setMessages([]);
      setConversationId(null);
    } catch (err) {
      setMessages([]);
      setConversationId(null);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMobileMenuClick = useCallback(() => setMobileOpen(true), []);

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 h-screen">
        <Header onMobileMenuClick={handleMobileMenuClick} readinessScore={contextData?.readinessData?.overallScore} />

        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 gap-6 overflow-hidden">
          
          {/* Main Chat Area */}
          <AuroraCard className="flex-1 flex flex-col h-[calc(100vh-140px)] border-border" padded={false}>
            {/* Top Header Bar */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0 bg-secondary/30">
              <div className="flex items-center gap-3">
                <AuroraAIOrb size="sm" active={loading} />
                <div>
                  <h1 className="text-[15px] font-bold text-foreground flex items-center gap-2">
                    FORGE AI
                    <AuroraBadge variant="ai">PRO</AuroraBadge>
                  </h1>
                  <p className="text-[11px] text-muted-foreground font-medium">Your Personal Career Intelligence Engine</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AuroraButton
                  variant="secondary"
                  onClick={handleNewChat}
                  className="px-3 py-1.5 text-[12px] h-8"
                  title="Start New Conversation"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  New
                </AuroraButton>

                <button
                  onClick={handleClearHistory}
                  className="p-2 rounded-xl text-muted-foreground hover:text-danger hover:bg-danger/5 transition-colors border border-transparent hover:border-danger/20"
                  title="Clear Conversation History"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 max-w-xl mx-auto py-8">
                  <AuroraAIOrb size="lg" active={true} />
                  <div>
                    <h2 className="text-2xl font-extrabold text-foreground mb-2 tracking-tight">How can FORGE AI help today?</h2>
                    <p className="text-[13px] text-muted-foreground leading-relaxed font-medium">
                      Ask technical questions, career readiness guidance, code explanations, or system architecture trade-offs.
                    </p>
                  </div>

                  {/* Suggested Prompts Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-4">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(s)}
                        className="p-3.5 rounded-xl bg-card border border-border/60 hover:border-primary/40 hover:bg-secondary text-[13px] font-medium text-foreground transition-all text-left shadow-sm hover:shadow group"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></div>
                          {s}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={m.id || `m-${idx}`}
                    className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
                        m.role === 'user'
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-card border border-border/80 shadow-sm'
                      }`}
                    >
                      {m.role === 'user' ? <User className="w-4 h-4" /> : <AuroraAIOrb size="sm" active={loading && idx === messages.length -1} />}
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-[14px] leading-relaxed relative group shadow-sm ${
                        m.role === 'user'
                          ? 'bg-primary text-white font-medium rounded-tr-sm'
                          : 'bg-card border border-border text-foreground space-y-2 rounded-tl-sm'
                      }`}
                    >
                      {m.role === 'user' ? (
                        <div className="whitespace-pre-wrap font-sans">{m.content}</div>
                      ) : (
                        <>
                          <FormattedMarkdown content={m.content} />

                          {/* Error Retry Button */}
                          {m.isError && (
                            <div className="pt-3 border-t border-danger/20 mt-3">
                              <button
                                onClick={() => handleSend(lastUserPrompt)}
                                className="px-3 py-1.5 rounded-xl bg-danger/10 hover:bg-danger/20 text-danger font-bold text-[12px] border border-danger/30 flex items-center gap-1.5 transition-all"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Retry
                              </button>
                            </div>
                          )}

                          {/* Actions Toolbar on Assistant Message */}
                          {!m.isError && (
                            <div className="flex items-center gap-3 pt-3 mt-2 border-t border-border/50 text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                              <button
                                onClick={() => handleCopy(m.content, idx)}
                                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                title="Copy response"
                              >
                                {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                              </button>

                              <button
                                onClick={() => handleSend(lastUserPrompt)}
                                className="flex items-center gap-1.5 hover:text-foreground transition-colors ml-3"
                                title="Regenerate response"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Regenerate</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}

              {loading && (
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-2xl bg-card border border-border/80 shadow-sm flex items-center justify-center shrink-0">
                    <AuroraAIOrb size="sm" active={true} />
                  </div>
                  <div className="px-5 py-4 rounded-2xl bg-card border border-border text-[13px] text-muted-foreground font-medium flex items-center gap-3 shadow-sm rounded-tl-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>FORGE AI is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-card/60 backdrop-blur-md border-t border-border/50 shrink-0 rounded-b-[var(--radius-xl)]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="relative flex items-center max-w-4xl mx-auto"
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask FORGE AI anything..."
                  className="w-full pl-5 pr-14 py-4 rounded-2xl bg-background border border-border/80 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all resize-none min-h-[56px] max-h-32 leading-relaxed shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2.5 p-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white transition-all disabled:opacity-40 disabled:hover:bg-primary shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </AuroraCard>

          {/* Right Context Panel (Aurora Atelier specific) */}
          <div className="hidden lg:flex w-80 shrink-0 flex-col gap-6">
            <AuroraCard className="flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 rounded-3xl bg-secondary border border-border flex items-center justify-center mb-4 relative">
                <Briefcase className="w-8 h-8 text-primary" strokeWidth={1.5} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card"></div>
              </div>
              <h3 className="text-lg font-bold text-foreground">Target Role</h3>
              <p className="text-[13px] text-muted-foreground mt-1 font-medium">{contextData?.profile?.targetRole || 'Software Engineer'}</p>
            </AuroraCard>

            <AuroraCard className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <BrainCircuit className="w-3.5 h-3.5 text-primary" />
                Active Focus
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-secondary/60 border border-border/50">
                  <span className="text-[12px] font-semibold text-foreground">System Design</span>
                  <div className="mt-2 flex gap-1">
                    <div className="h-1 flex-1 bg-primary rounded-full"></div>
                    <div className="h-1 flex-1 bg-primary rounded-full"></div>
                    <div className="h-1 flex-1 bg-border rounded-full"></div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-secondary/60 border border-border/50">
                  <span className="text-[12px] font-semibold text-foreground">React Optimization</span>
                  <div className="mt-2 flex gap-1">
                    <div className="h-1 flex-1 bg-ai rounded-full"></div>
                    <div className="h-1 flex-1 bg-border rounded-full"></div>
                    <div className="h-1 flex-1 bg-border rounded-full"></div>
                  </div>
                </div>
              </div>
            </AuroraCard>
          </div>

        </div>
      </div>
    </div>
  );
}
