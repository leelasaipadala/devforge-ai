'use client';

import {useState, useEffect, useCallback} from 'react';
import { HelpCircle, Send, CheckCircle2, Sparkles, Trophy, Award, Clock, PlayCircle, RotateCcw, Target, BookOpen, Layers, Code, GitMerge, FileText } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api';
import { AuroraCard } from '@/components/AuroraCard';
import { AuroraButton } from '@/components/AuroraButton';
import { AuroraBadge } from '@/components/AuroraBadge';

const TECHNOLOGIES = [
  { name: 'Java', categories: ['All', 'Core Java', 'OOP', 'Collections', 'Multithreading', 'Memory Management', 'Exception Handling', 'JVM', 'Streams'] },
  { name: 'Python', categories: ['All', 'Python Basics', 'OOP', 'Collections', 'Functions', 'Decorators', 'Generators', 'Async Programming', 'Memory Management'] },
  { name: 'C++', categories: ['All', 'Basics', 'Pointers & Memory', 'OOP & Virtual Tables', 'Templates', 'STL', 'Concurrency', 'Modern C++'] },
  { name: 'JavaScript', categories: ['All', 'Fundamentals', 'Closures', 'Promises', 'Async/Await', 'Event Loop', 'DOM', 'ES6+', 'Prototypes'] },
  { name: 'TypeScript', categories: ['All', 'Interfaces', 'Generics', 'Utility Types', 'Type Narrowing', 'Decorators', 'Strict Options'] },
  { name: 'C', categories: ['All', 'Memory Allocation', 'Pointers', 'Structs & Unions', 'Preprocessor', 'Storage Classes'] },
  { name: 'SQL', categories: ['All', 'Queries', 'Joins', 'Aggregation', 'Subqueries', 'Indexes', 'Transactions', 'Normalization', 'Window Functions'] },
  { name: 'React', categories: ['All', 'Components', 'Hooks', 'State Management', 'Rendering', 'Performance', 'Routing', 'Server Components'] },
  { name: 'Node.js', categories: ['All', 'Event Loop', 'Streams', 'Buffer', 'Modules', 'Cluster Module', 'Worker Threads'] },
  { name: 'MongoDB', categories: ['All', 'CRUD', 'Aggregations', 'Indexing Strategies', 'Sharding', 'Replica Sets', 'Schema Design'] },
  { name: 'DBMS', categories: ['All', 'ER Modeling', 'Relational Algebra', 'ACID Properties', 'Normalization', 'Concurrency Control'] },
  { name: 'Operating Systems', categories: ['All', 'Process vs Thread', 'Scheduling Algorithms', 'Deadlocks', 'Virtual Memory', 'Paging', 'IPC'] },
  { name: 'Computer Networks', categories: ['All', 'OSI Model', 'TCP vs UDP', 'HTTP Protocols', 'DNS', 'Subnetting', 'TLS/SSL Handshake'] },
  { name: 'Data Structures', categories: ['All', 'Arrays', 'LinkedLists', 'Stacks', 'Queues', 'HashTables', 'Trees', 'Heaps', 'Graphs'] },
  { name: 'Algorithms', categories: ['All', 'Sorting', 'Searching', 'Dynamic Programming', 'Greedy', 'Backtracking', 'Graph Algorithms'] },
  { name: 'System Design', categories: ['All', 'Scalability', 'Caching', 'Load Balancing', 'Microservices', 'Message Queues', 'Sharding'] },
  { name: 'Behavioral', categories: ['All', 'Behavioral', 'Leadership', 'Conflict Resolution', 'Time Management', 'Failure & Reflection'] },
];

export default function InterviewPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleMobileMenuClick = useCallback(() => setMobileOpen(true), []);
  const [activeTab, setActiveTab] = useState<'Practice' | 'Timed' | 'MockInterview'>('Practice');
  const [technology, setTechnology] = useState('Java');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const [poolExhausted, setPoolExhausted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Timed Mode State
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(300);
  const [timerActive, setTimerActive] = useState(false);

  // Mock Interview State
  const [mockStarted, setMockStarted] = useState(false);
  const [mockQuestionIdx, setMockQuestionIdx] = useState(0);
  const [mockAnswers, setMockAnswers] = useState<Record<number, string>>({});
  const [mockScores, setMockScores] = useState<Record<number, any>>({});
  const [mockFinished, setMockFinished] = useState(false);

  const currentTechObj = TECHNOLOGIES.find((t) => t.name === technology) || TECHNOLOGIES[0];

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadQuestions(false);
    }
  }, [technology, category, difficulty, authLoading, isAuthenticated]);

  // Timed mode countdown timer
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeftSeconds > 0) {
      interval = setInterval(() => setTimeLeftSeconds((prev) => prev - 1), 1000);
    } else if (timeLeftSeconds === 0 && timerActive) {
      setTimerActive(false);
      handleEvaluate();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeftSeconds]);

  async function loadQuestions(allowRepetition = false) {
    setLoading(true);
    setEvaluation(null);
    setUserAnswer('');
    setShowExplanation(false);
    try {
      const catParam = category === 'All' ? '' : category;
      const res: any = await ApiClient.get(
        `/interview/questions?technology=${encodeURIComponent(technology)}&subCategory=${encodeURIComponent(catParam)}&difficulty=${difficulty}&allowRepetition=${allowRepetition}`
      );

      setPoolExhausted(!!res.poolExhausted);
      if (res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
        setSelectedQuestion(res.questions[0]);
        if (activeTab === 'Timed') {
          setTimeLeftSeconds((res.questions[0].expectedTimeMinutes || 5) * 60);
          setTimerActive(true);
        }
      } else {
        setQuestions([]);
        setSelectedQuestion(null);
      }
    } catch (err) {
      console.error('Error loading interview questions:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleEvaluate = async () => {
    if (!selectedQuestion || !userAnswer.trim() || evaluating) return;

    setEvaluating(true);
    setTimerActive(false);
    try {
      const res: any = await ApiClient.post('/interview/evaluate', {
        questionId: selectedQuestion.id,
        questionText: selectedQuestion.question,
        technology,
        category: selectedQuestion.category || category,
        difficulty,
        userAnswer,
        mode: activeTab,
      });
      setEvaluation(res.evaluation);
    } catch (err) {
      console.error('Error evaluating answer:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const startMockInterview = () => {
    setMockStarted(true);
    setMockQuestionIdx(0);
    setMockAnswers({});
    setMockScores({});
    setMockFinished(false);
    if (questions.length > 0) {
      setSelectedQuestion(questions[0]);
    }
  };

  const handleMockNext = async () => {
    const currentQ = questions[mockQuestionIdx];
    const currentAns = mockAnswers[mockQuestionIdx] || '';

    if (currentQ && currentAns.trim()) {
      setEvaluating(true);
      try {
        const res: any = await ApiClient.post('/interview/evaluate', {
          questionId: currentQ.id,
          questionText: currentQ.question,
          technology,
          category: currentQ.category || category,
          difficulty,
          userAnswer: currentAns,
          mode: 'MockInterview',
        });
        setMockScores((prev) => ({ ...prev, [mockQuestionIdx]: res.evaluation }));
      } catch (err) {
        console.error('Mock evaluation error:', err);
      } finally {
        setEvaluating(false);
      }
    }

    if (mockQuestionIdx + 1 < Math.min(questions.length, 5)) {
      const nextIdx = mockQuestionIdx + 1;
      setMockQuestionIdx(nextIdx);
      setSelectedQuestion(questions[nextIdx]);
    } else {
      setMockFinished(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={handleMobileMenuClick} />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header Bar */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-primary uppercase mb-2">
                <Trophy className="w-4 h-4" />
                <span>Interview Intelligence</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Mock Interviewer</h1>
              <p className="text-sm text-muted-foreground mt-2 font-medium max-w-xl">
                Technology-curated question bank with anti-repetition tracking and automated AI evaluation.
              </p>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-1.5 bg-secondary/30 p-1.5 rounded-2xl border border-border/60 shrink-0 text-[12px]">
              <button
                onClick={() => {
                  setActiveTab('Practice');
                  setTimerActive(false);
                }}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  activeTab === 'Practice' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                Practice
              </button>
              <button
                onClick={() => {
                  setActiveTab('Timed');
                  if (selectedQuestion) {
                    setTimeLeftSeconds((selectedQuestion.expectedTimeMinutes || 5) * 60);
                    setTimerActive(true);
                  }
                }}
                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'Timed' ? 'bg-warning text-white shadow-md shadow-warning/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <Clock className="w-4 h-4" />
                Timed
              </button>
              <button
                onClick={() => {
                  setActiveTab('MockInterview');
                  setTimerActive(false);
                }}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  activeTab === 'MockInterview' ? 'bg-ai text-white shadow-md shadow-ai/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                Interview
              </button>
            </div>
          </header>

          {/* Interactive Filters (Technology, Category, Difficulty) */}
          <AuroraCard className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground tracking-widest mb-2">
                  <Code className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" /> Technology
                </label>
                <select
                  value={technology}
                  onChange={(e) => {
                    setTechnology(e.target.value);
                    setCategory('All');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/80 text-[13px] font-bold text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                >
                  {TECHNOLOGIES.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground tracking-widest mb-2">
                  <Layers className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" /> Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/80 text-[13px] font-bold text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                >
                  {currentTechObj.categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground tracking-widest mb-2">
                  <Target className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" /> Difficulty
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-background rounded-xl border border-border/80 text-[12px] shadow-sm">
                  {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`py-1.5 rounded-lg font-bold transition-all text-center ${
                        difficulty === d
                          ? d === 'Easy'
                            ? 'bg-success text-white shadow-sm'
                            : d === 'Medium'
                            ? 'bg-warning text-white shadow-sm'
                            : 'bg-danger text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </AuroraCard>

          {/* Pool Exhausted Banner */}
          {poolExhausted && (
            <AuroraCard className="p-4 bg-ai/5 border-ai/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-[13px] font-medium text-foreground">
                <Target className="w-5 h-5 text-ai shrink-0" />
                <span>You&apos;ve completed all unseen curated questions for <strong>{technology}</strong> ({difficulty}).</span>
              </div>
              <AuroraButton
                onClick={() => loadQuestions(true)}
                variant="ai"
                className="gap-2 shrink-0 h-9 px-4 text-[12px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Practice Again</span>
              </AuroraButton>
            </AuroraCard>
          )}

          {/* Main Practice / Timed Content */}
          {activeTab !== 'MockInterview' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Question Sidebar List */}
              <div className="lg:col-span-4 space-y-4">
                <h2 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  {technology} Pool ({questions.length})
                </h2>

                {loading ? (
                  <AuroraCard className="p-8 text-center text-[13px] font-medium text-muted-foreground border-dashed">
                    Loading questions...
                  </AuroraCard>
                ) : questions.length === 0 ? (
                  <AuroraCard className="p-8 text-center space-y-3 border-dashed">
                    <p className="text-[13px] font-medium text-foreground">No questions remaining in pool.</p>
                    <button
                      onClick={() => loadQuestions(true)}
                      className="text-[12px] text-primary font-bold hover:underline"
                    >
                      Enable repetition
                    </button>
                  </AuroraCard>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {questions.map((q, idx) => {
                      const isSelected = selectedQuestion?.id === q.id;
                      return (
                        <div
                          key={q.id || idx}
                          onClick={() => {
                            setSelectedQuestion(q);
                            setEvaluation(null);
                            setUserAnswer('');
                            setShowExplanation(false);
                            if (activeTab === 'Timed') {
                              setTimeLeftSeconds((q.expectedTimeMinutes || 5) * 60);
                              setTimerActive(true);
                            }
                          }}
                          className={`w-full text-left p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 group ${
                            isSelected
                              ? 'bg-primary/5 border-primary ring-1 ring-primary/20 shadow-md'
                              : 'bg-card border-border/60 hover:border-primary/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-bold text-[10px] uppercase tracking-wider ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>{q.category || q.technology}</span>
                            <AuroraBadge 
                              variant={q.difficulty === 'Easy' ? 'success' : q.difficulty === 'Medium' ? 'warning' : 'danger'}
                              className="text-[9px] px-1.5 py-0"
                            >
                              {q.difficulty}
                            </AuroraBadge>
                          </div>
                          <p className={`line-clamp-2 leading-relaxed text-[13px] font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{q.question}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Main Question Display & Answer Box */}
              <div className="lg:col-span-8 space-y-6">
                {selectedQuestion ? (
                  <AuroraCard className="space-y-6 relative overflow-hidden group/card">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    
                    {/* Active Question Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5 relative z-10">
                      <div className="flex flex-wrap items-center gap-3">
                        <AuroraBadge variant="primary" className="text-[11px] px-3">{selectedQuestion.technology}</AuroraBadge>
                        <span className="text-[12px] text-muted-foreground font-bold tracking-wide uppercase">{selectedQuestion.category}</span>
                      </div>

                      {activeTab === 'Timed' && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-warning/10 border border-warning/30 text-warning font-mono font-bold text-[14px] shadow-sm shrink-0">
                          <Clock className="w-4 h-4 animate-pulse" />
                          <span>{formatTime(timeLeftSeconds)}</span>
                        </div>
                      )}
                    </div>

                    {/* Question Text */}
                    <div className="space-y-4 relative z-10">
                      <h3 className="text-xl font-bold text-foreground leading-relaxed">{selectedQuestion.question}</h3>
                      {selectedQuestion.keyConcepts && selectedQuestion.keyConcepts.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {selectedQuestion.keyConcepts.map((k: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-secondary/80 text-muted-foreground text-[11px] font-mono font-medium border border-border/50">
                              #{k}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Answer Input */}
                    <div className="space-y-3 relative z-10">
                      <label className="block text-[12px] font-bold uppercase tracking-widest text-foreground">Your Technical Answer</label>
                      <textarea
                        rows={8}
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Write your detailed explanation here..."
                        className="w-full p-5 rounded-2xl bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-mono leading-relaxed resize-none shadow-inner"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 relative z-10">
                      <AuroraButton
                        onClick={() => setShowExplanation(!showExplanation)}
                        variant="secondary"
                        className="gap-2 text-[12px]"
                      >
                        <HelpCircle className="w-4 h-4 text-primary" />
                        <span>{showExplanation ? 'Hide Explanation' : 'View Key Concepts'}</span>
                      </AuroraButton>

                      <AuroraButton
                        onClick={handleEvaluate}
                        disabled={!userAnswer.trim() || evaluating}
                        variant="primary"
                        className="gap-2"
                      >
                        {evaluating ? (
                          <>
                            <Sparkles className="w-4 h-4 animate-spin" />
                            <span>Evaluating...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Answer</span>
                          </>
                        )}
                      </AuroraButton>
                    </div>

                    {/* Explanation Box */}
                    {showExplanation && selectedQuestion.explanation && (
                      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 text-[13px] space-y-3 leading-relaxed relative z-10 mt-4">
                        <div className="font-bold text-primary flex items-center gap-2 uppercase tracking-widest text-[11px]">
                          <Layers className="w-4 h-4" /> Model Explanation & Key Points
                        </div>
                        <p className="text-foreground font-medium">{selectedQuestion.explanation}</p>
                      </div>
                    )}

                    {/* Evaluation Result */}
                    {evaluation && (
                      <AuroraCard className="space-y-5 border-success/30 bg-success/5 relative z-10 mt-6">
                        <div className="flex items-center justify-between border-b border-success/10 pb-4">
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                            <span className="text-[14px] font-bold text-foreground uppercase tracking-wider">AI Evaluation Result</span>
                          </div>
                          <div className="text-2xl font-bold font-mono text-success tracking-tighter">
                            {evaluation.score} <span className="text-lg text-muted-foreground font-medium font-sans">/100</span>
                          </div>
                        </div>

                        <p className="text-[14px] text-foreground font-medium leading-relaxed">{evaluation.feedback}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
                          {evaluation.strengths && evaluation.strengths.length > 0 && (
                            <div className="space-y-3">
                              <span className="font-bold text-success uppercase text-[11px] tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                                Key Strengths
                              </span>
                              <ul className="space-y-2 text-foreground text-[13px] font-medium">
                                {evaluation.strengths.map((s: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-success mt-1">•</span>
                                    <span>{s}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {evaluation.improvements && evaluation.improvements.length > 0 && (
                            <div className="space-y-3">
                              <span className="font-bold text-warning uppercase text-[11px] tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-warning"></div>
                                Areas for Improvement
                              </span>
                              <ul className="space-y-2 text-foreground text-[13px] font-medium">
                                {evaluation.improvements.map((imp: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-warning mt-1">•</span>
                                    <span>{imp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </AuroraCard>
                    )}
                  </AuroraCard>
                ) : (
                  <AuroraCard className="p-16 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2 h-[500px]">
                    <div className="w-16 h-16 rounded-3xl bg-secondary border border-border flex items-center justify-center text-muted-foreground mb-2">
                      <FileText className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">No Question Selected</h3>
                    <p className="text-[14px] text-muted-foreground font-medium max-w-sm">
                      Select a technology and question from the list on the left to begin practicing.
                    </p>
                  </AuroraCard>
                )}
              </div>
            </div>
          ) : (
            /* Mock Interview Mode */
            <AuroraCard className="space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-ai/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              
              {!mockStarted ? (
                <div className="text-center py-16 space-y-6 max-w-lg mx-auto relative z-10">
                  <div className="w-24 h-24 rounded-[2rem] bg-ai/10 border border-ai/20 flex items-center justify-center mx-auto text-ai shadow-inner">
                    <PlayCircle className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Mock Technical Interview</h2>
                    <p className="text-[14px] text-muted-foreground leading-relaxed font-medium">
                      Complete a 5-question sequential technical interview session for <strong className="text-foreground">{technology}</strong> ({difficulty}).
                    </p>
                  </div>
                  <AuroraButton
                    onClick={startMockInterview}
                    variant="ai"
                    className="px-8 py-4 text-[14px] shadow-lg shadow-ai/20 mx-auto"
                  >
                    Start Mock Interview
                  </AuroraButton>
                </div>
              ) : mockFinished ? (
                <div className="space-y-8 relative z-10">
                  <div className="text-center py-8 border-b border-border/50 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto">
                      <Award className="w-10 h-10 text-success" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Interview Completed!</h2>
                      <p className="text-[14px] text-muted-foreground font-medium mt-2">Here is your technical performance breakdown.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {questions.slice(0, 5).map((q, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-secondary/30 border border-border/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] uppercase tracking-widest text-ai">Question {idx + 1}</span>
                          <AuroraBadge variant="success" className="font-mono text-[11px] px-2">
                            {mockScores[idx]?.score || 0} / 100
                          </AuroraBadge>
                        </div>
                        <p className="font-bold text-[14px] text-foreground leading-relaxed">{q.question}</p>
                        <p className="text-muted-foreground text-[13px] font-medium leading-relaxed pt-2 border-t border-border/40">
                          {mockScores[idx]?.feedback || 'Evaluated.'}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-6">
                    <AuroraButton
                      onClick={() => setMockStarted(false)}
                      variant="secondary"
                      className="mx-auto"
                    >
                      Back to Interview Hub
                    </AuroraButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 relative z-10">
                  <div className="flex items-center justify-between border-b border-border/50 pb-5">
                    <span className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">
                      Question {mockQuestionIdx + 1} of {Math.min(questions.length, 5)}
                    </span>
                    <AuroraBadge variant="ai" className="px-3">
                      {technology} • {difficulty}
                    </AuroraBadge>
                  </div>

                  {questions[mockQuestionIdx] && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-foreground leading-relaxed">{questions[mockQuestionIdx].question}</h3>

                      <div className="space-y-3">
                        <label className="block text-[12px] font-bold uppercase tracking-widest text-foreground">Your Technical Answer</label>
                        <textarea
                          rows={8}
                          value={mockAnswers[mockQuestionIdx] || ''}
                          onChange={(e) =>
                            setMockAnswers((prev) => ({ ...prev, [mockQuestionIdx]: e.target.value }))
                          }
                          placeholder="Write your answer..."
                          className="w-full p-5 rounded-2xl bg-background border border-border text-[14px] text-foreground focus:outline-none focus:border-ai/50 focus:ring-4 focus:ring-ai/5 font-mono leading-relaxed resize-none shadow-inner transition-all"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <AuroraButton
                          onClick={handleMockNext}
                          disabled={!mockAnswers[mockQuestionIdx]?.trim() || evaluating}
                          variant="ai"
                          className="px-6 gap-2"
                        >
                          {evaluating ? (
                            <>
                              <Sparkles className="w-4 h-4 animate-spin" />
                              <span>Evaluating...</span>
                            </>
                          ) : (
                            <span>{mockQuestionIdx + 1 === Math.min(questions.length, 5) ? 'Finish Mock Interview' : 'Next Question'}</span>
                          )}
                        </AuroraButton>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </AuroraCard>
          )}
        </main>
      </div>
    </div>
  );
}
