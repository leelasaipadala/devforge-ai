'use client';

import { useState, useEffect } from 'react';
import { HelpCircle, Send, CheckCircle2, AlertTriangle, Sparkles, Trophy, Award, Clock, PlayCircle, RotateCcw, Target, BookOpen, Layers } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ApiClient } from '@/lib/api';

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

  useEffect(() => {
    loadQuestions(false);
  }, [technology, category, difficulty]);

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
        <Header onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">Interview Intelligence Engine</h1>
              </div>
              <p className="text-xs text-muted-foreground">
                Technology-curated question bank with anti-repetition tracking and automated AI evaluation.
              </p>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-1.5 bg-card p-1 rounded-xl border border-border shrink-0 text-xs">
              <button
                onClick={() => {
                  setActiveTab('Practice');
                  setTimerActive(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'Practice' ? 'bg-blue-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Practice Mode
              </button>
              <button
                onClick={() => {
                  setActiveTab('Timed');
                  if (selectedQuestion) {
                    setTimeLeftSeconds((selectedQuestion.expectedTimeMinutes || 5) * 60);
                    setTimerActive(true);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'Timed' ? 'bg-amber-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Timed Mode
              </button>
              <button
                onClick={() => {
                  setActiveTab('MockInterview');
                  setTimerActive(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'MockInterview' ? 'bg-purple-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Mock Interview
              </button>
            </div>
          </div>

          {/* Interactive Filters (Technology, Category, Difficulty) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-muted-foreground tracking-wider mb-1.5">
                Technology
              </label>
              <select
                value={technology}
                onChange={(e) => {
                  setTechnology(e.target.value);
                  setCategory('All');
                }}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-blue-500 font-medium"
              >
                {TECHNOLOGIES.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-muted-foreground tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-blue-500 font-medium"
              >
                {currentTechObj.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-muted-foreground tracking-wider mb-1.5">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-background rounded-xl border border-border text-xs">
                {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-1 rounded-lg font-semibold transition-all text-center ${
                      difficulty === d
                        ? d === 'Easy'
                          ? 'bg-emerald-600 text-white'
                          : d === 'Medium'
                          ? 'bg-amber-600 text-white'
                          : 'bg-red-600 text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pool Exhausted Banner */}
          {poolExhausted && (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-purple-400 font-medium">
                <Target className="w-5 h-5 shrink-0" />
                <span>🎯 You&apos;ve completed all unseen curated questions for <strong>{technology}</strong> ({difficulty}).</span>
              </div>
              <button
                onClick={() => loadQuestions(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Practice Again
              </button>
            </div>
          )}

          {/* Main Practice / Timed Content */}
          {activeTab !== 'MockInterview' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Question Sidebar List */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  {technology} Question Pool ({questions.length})
                </h2>

                {loading ? (
                  <div className="p-6 rounded-2xl bg-card border border-border text-center text-xs text-muted-foreground">
                    Loading questions...
                  </div>
                ) : questions.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-card border border-border text-center text-xs text-muted-foreground space-y-2">
                    <p>No questions remaining in pool.</p>
                    <button
                      onClick={() => loadQuestions(true)}
                      className="text-xs text-blue-400 font-semibold underline"
                    >
                      Enable repetition
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {questions.map((q, idx) => (
                      <button
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
                        className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all space-y-1.5 ${
                          selectedQuestion?.id === q.id
                            ? 'bg-blue-600/10 border-blue-500/50 text-foreground font-medium shadow-sm'
                            : 'bg-card border-border hover:border-border/80 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-blue-400 uppercase">{q.category || q.technology}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                              q.difficulty === 'Easy'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : q.difficulty === 'Medium'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </div>
                        <p className="line-clamp-2 leading-relaxed text-foreground font-sans">{q.question}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Question Display & Answer Box */}
              <div className="lg:col-span-2 space-y-6">
                {selectedQuestion ? (
                  <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm">
                    {/* Active Question Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs">
                          {selectedQuestion.technology}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">• {selectedQuestion.category}</span>
                      </div>

                      {activeTab === 'Timed' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-sm shadow-inner">
                          <Clock className="w-4 h-4 animate-pulse" />
                          <span>{formatTime(timeLeftSeconds)}</span>
                        </div>
                      )}
                    </div>

                    {/* Question Text */}
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-foreground leading-snug">{selectedQuestion.question}</h3>
                      {selectedQuestion.keyConcepts && selectedQuestion.keyConcepts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {selectedQuestion.keyConcepts.map((k: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-secondary text-muted-foreground text-[10px] font-mono">
                              #{k}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Answer Input */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-muted-foreground">Your Technical Answer</label>
                      <textarea
                        rows={6}
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Write your detailed explanation here..."
                        className="w-full p-4 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 transition-colors font-mono leading-relaxed"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => setShowExplanation(!showExplanation)}
                        className="px-3 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground text-xs font-medium transition-colors border border-border flex items-center gap-1.5"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                        {showExplanation ? 'Hide Explanation' : 'View Key Concepts'}
                      </button>

                      <button
                        onClick={handleEvaluate}
                        disabled={!userAnswer.trim() || evaluating}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-40 flex items-center gap-2"
                      >
                        {evaluating ? (
                          <>
                            <Sparkles className="w-4 h-4 animate-spin" />
                            Evaluating...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            Submit Answer
                          </>
                        )}
                      </button>
                    </div>

                    {/* Explanation Box */}
                    {showExplanation && selectedQuestion.explanation && (
                      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs space-y-1.5 leading-relaxed">
                        <div className="font-bold text-blue-400 flex items-center gap-1.5">
                          <Layers className="w-4 h-4" /> Model Explanation & Key Points
                        </div>
                        <p className="text-foreground">{selectedQuestion.explanation}</p>
                      </div>
                    )}

                    {/* Evaluation Result */}
                    {evaluation && (
                      <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-sm mt-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span className="text-sm font-bold text-foreground">AI Evaluation Result</span>
                          </div>
                          <div className="text-base font-bold font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                            {evaluation.score} / 100
                          </div>
                        </div>

                        <p className="text-xs text-foreground leading-relaxed">{evaluation.feedback}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {evaluation.strengths && evaluation.strengths.length > 0 && (
                            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1 text-xs">
                              <span className="font-bold text-emerald-400">Key Strengths</span>
                              <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-[11px]">
                                {evaluation.strengths.map((s: string, i: number) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {evaluation.improvements && evaluation.improvements.length > 0 && (
                            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1 text-xs">
                              <span className="font-bold text-amber-400">Areas for Improvement</span>
                              <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-[11px]">
                                {evaluation.improvements.map((imp: string, i: number) => (
                                  <li key={i}>{imp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 rounded-2xl bg-card border border-border text-center text-xs text-muted-foreground space-y-3">
                    <p>Select a technology and question from the list to begin practicing.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Mock Interview Mode */
            <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm">
              {!mockStarted ? (
                <div className="text-center py-12 space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
                    <PlayCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Role & Tech Specific Mock Interview</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Complete a 5-question sequential technical interview session for <strong>{technology}</strong> ({difficulty}).
                    </p>
                  </div>
                  <button
                    onClick={startMockInterview}
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-500/20"
                  >
                    Start Mock Interview
                  </button>
                </div>
              ) : mockFinished ? (
                <div className="space-y-6">
                  <div className="text-center py-6 border-b border-border space-y-2">
                    <Award className="w-12 h-12 text-emerald-400 mx-auto" />
                    <h2 className="text-xl font-bold text-foreground">Mock Interview Completed!</h2>
                    <p className="text-xs text-muted-foreground">Here is your technical performance breakdown.</p>
                  </div>

                  <div className="space-y-3">
                    {questions.slice(0, 5).map((q, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-background border border-border space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-400">Question {idx + 1}</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {mockScores[idx]?.score || 0} / 100
                          </span>
                        </div>
                        <p className="font-semibold text-foreground">{q.question}</p>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">{mockScores[idx]?.feedback || 'Evaluated.'}</p>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-4">
                    <button
                      onClick={() => setMockStarted(false)}
                      className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border"
                    >
                      Back to Interview Hub
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-border pb-4 text-xs font-semibold">
                    <span className="text-muted-foreground">
                      Question {mockQuestionIdx + 1} of {Math.min(questions.length, 5)}
                    </span>
                    <span className="text-purple-400 font-bold uppercase">{technology} • {difficulty}</span>
                  </div>

                  {questions[mockQuestionIdx] && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-foreground">{questions[mockQuestionIdx].question}</h3>

                      <textarea
                        rows={6}
                        value={mockAnswers[mockQuestionIdx] || ''}
                        onChange={(e) =>
                          setMockAnswers((prev) => ({ ...prev, [mockQuestionIdx]: e.target.value }))
                        }
                        placeholder="Write your answer..."
                        className="w-full p-4 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-purple-500 font-mono"
                      />

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleMockNext}
                          disabled={!mockAnswers[mockQuestionIdx]?.trim() || evaluating}
                          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-40"
                        >
                          {evaluating ? 'Evaluating...' : mockQuestionIdx + 1 === Math.min(questions.length, 5) ? 'Finish Mock' : 'Next Question'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
