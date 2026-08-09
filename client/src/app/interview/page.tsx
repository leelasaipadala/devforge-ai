'use client';

import { useState, useEffect } from 'react';
import { HelpCircle, Send, CheckCircle2, AlertTriangle, Sparkles, Trophy, Award, Clock, PlayCircle, RotateCcw } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ApiClient } from '@/lib/api';

const CATEGORIES = [
  'DSA', 'Algorithms', 'JavaScript', 'TypeScript', 'React', 'Next.js',
  'Node.js', 'Express', 'MongoDB', 'SQL', 'System Design', 'Backend',
  'Frontend', 'DevOps', 'Behavioral', 'HR'
];

export default function InterviewPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Practice' | 'MockInterview'>('Practice');
  const [category, setCategory] = useState('Backend');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  // Mock Interview State
  const [mockStarted, setMockStarted] = useState(false);
  const [mockQuestionIdx, setMockQuestionIdx] = useState(0);
  const [mockAnswers, setMockAnswers] = useState<Record<number, string>>({});
  const [mockScores, setMockScores] = useState<Record<number, any>>({});
  const [mockFinished, setMockFinished] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [category, difficulty]);

  async function loadQuestions() {
    try {
      const res: any = await ApiClient.get(`/interview/questions?category=${category}&difficulty=${difficulty}`);
      setQuestions(res.questions || []);
      if (res.questions && res.questions.length > 0) {
        setSelectedQuestion(res.questions[0]);
      }
    } catch (err) {
      console.error('Error loading interview questions:', err);
    }
  }

  const handleEvaluate = async () => {
    if (!selectedQuestion || !userAnswer.trim()) return;

    setEvaluating(true);
    try {
      const res: any = await ApiClient.post('/interview/evaluate', {
        questionText: selectedQuestion.question,
        category,
        difficulty,
        userAnswer,
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
  };

  const handleMockNext = async () => {
    const currentQ = questions[mockQuestionIdx];
    const currentAns = mockAnswers[mockQuestionIdx] || '';

    if (currentQ && currentAns.trim()) {
      setEvaluating(true);
      try {
        const res: any = await ApiClient.post('/interview/evaluate', {
          questionText: currentQ.question,
          category,
          difficulty,
          userAnswer: currentAns,
        });
        setMockScores((prev) => ({ ...prev, [mockQuestionIdx]: res.evaluation }));
      } catch (err) {
        console.error('Mock evaluation error:', err);
      } finally {
        setEvaluating(false);
      }
    }

    if (mockQuestionIdx + 1 < Math.min(questions.length, 5)) {
      setMockQuestionIdx((prev) => prev + 1);
    } else {
      setMockFinished(true);
    }
  };

  // Calculate Mock Overall Score
  const mockScoreValues = Object.values(mockScores).map((s) => s?.score || 75);
  const avgMockScore = mockScoreValues.length > 0
    ? Math.round(mockScoreValues.reduce((a, b) => a + b, 0) / mockScoreValues.length)
    : 80;

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500">
                <HelpCircle className="w-4 h-4" />
                <span>Technical & System Design Practice Platform</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Interview Simulator</h1>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 bg-secondary border border-border p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('Practice')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'Practice' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Question Bank Practice
              </button>
              <button
                onClick={() => setActiveTab('MockInterview')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'MockInterview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Mock Interview Mode
              </button>
            </div>
          </div>

          {/* Category Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setEvaluation(null);
                  setUserAnswer('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  category === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* MODE 1: PRACTICE MODE */}
          {activeTab === 'Practice' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Question List */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Practice Question</h2>
                <div className="space-y-3">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => {
                        setSelectedQuestion(q);
                        setEvaluation(null);
                        setUserAnswer('');
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedQuestion?.id === q.id
                          ? 'bg-indigo-500/10 border-indigo-500 shadow-lg'
                          : 'bg-card border-border hover:border-accent'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span className="px-2 py-0.5 rounded bg-secondary text-indigo-400 font-semibold">{q.category}</span>
                        <span className="text-muted-foreground font-medium">{q.difficulty}</span>
                      </div>
                      <p className="text-xs font-medium text-foreground line-clamp-3">{q.question}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practice Workspace */}
              <div className="lg:col-span-2 space-y-6">
                {selectedQuestion ? (
                  <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border space-y-6">
                    <div>
                      <span className="text-xs text-indigo-500 font-semibold uppercase tracking-wider">Active Question</span>
                      <h2 className="text-lg font-bold text-foreground mt-1 leading-relaxed">{selectedQuestion.question}</h2>
                    </div>

                    {selectedQuestion.expectedKeyPoints && (
                      <div className="p-3.5 rounded-xl bg-secondary/60 border border-border text-xs">
                        <span className="text-muted-foreground font-semibold">Key Concepts to Touch Upon:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedQuestion.expectedKeyPoints.map((pt: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-secondary text-foreground text-[10px] border border-border">
                              • {pt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-2">Your Technical Answer</label>
                      <textarea
                        rows={7}
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Explain your approach, architecture, implementation details, algorithms, and complexity tradeoffs..."
                        className="w-full px-4 py-3 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                      />
                    </div>

                    <button
                      onClick={handleEvaluate}
                      disabled={evaluating || !userAnswer.trim()}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 fill-white" />
                      <span>{evaluating ? 'Evaluating Technical Answer...' : 'Submit Response for AI Evaluation'}</span>
                    </button>

                    {/* AI Evaluation */}
                    {evaluation && (
                      <div className="p-6 rounded-xl bg-secondary/80 border border-indigo-500/30 space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                          <span className="text-xs font-bold text-indigo-500 uppercase">FORGE AI Evaluation Score</span>
                          <div className="text-3xl font-extrabold text-indigo-500">{evaluation.score} <span className="text-xs text-muted-foreground font-normal">/ 100</span></div>
                        </div>

                        <div className="text-xs text-foreground leading-relaxed">{evaluation.feedback}</div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-foreground space-y-1">
                            <span className="font-bold text-emerald-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Strengths</span>
                            {evaluation.strengths?.map((s: string, i: number) => <div key={i}>• {s}</div>)}
                          </div>

                          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-foreground space-y-1">
                            <span className="font-bold text-amber-500 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Improvements</span>
                            {evaluation.improvements?.map((imp: string, i: number) => <div key={i}>• {imp}</div>)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center text-muted-foreground">Select a question to practice.</div>
                )}
              </div>
            </div>
          )}

          {/* MODE 2: MOCK INTERVIEW MODE */}
          {activeTab === 'MockInterview' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border space-y-6 max-w-3xl mx-auto">
              {!mockStarted ? (
                <div className="text-center space-y-6 py-8">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500 mx-auto">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Simulated Live Technical Interview</h2>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Experience a 5-question live technical screening for {category}. FORGE AI will ask sequential questions and evaluate your responses in a final score report.
                    </p>
                  </div>

                  <button
                    onClick={startMockInterview}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 mx-auto"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Start Mock Interview Session</span>
                  </button>
                </div>
              ) : !mockFinished ? (
                /* Active Question Steps */
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-xs font-bold text-indigo-500">Question {mockQuestionIdx + 1} of 5</span>
                    <span className="text-xs text-muted-foreground">Target Category: {category}</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-foreground leading-relaxed">
                      {questions[mockQuestionIdx]?.question || 'Explain the event loop in Node.js and non-blocking I/O.'}
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-2">Your Answer</label>
                    <textarea
                      rows={6}
                      value={mockAnswers[mockQuestionIdx] || ''}
                      onChange={(e) => setMockAnswers({ ...mockAnswers, [mockQuestionIdx]: e.target.value })}
                      placeholder="Type your response as if speaking to an interviewer..."
                      className="w-full px-4 py-3 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={handleMockNext}
                      disabled={evaluating || !(mockAnswers[mockQuestionIdx] || '').trim()}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-lg shadow-indigo-600/20"
                    >
                      {mockQuestionIdx + 1 < Math.min(questions.length, 5) ? 'Submit & Next Question →' : 'Finish & Generate Report'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Final Report */
                <div className="space-y-6 py-4">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
                      <Award className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Mock Interview Evaluation Report</h2>
                    <p className="text-xs text-muted-foreground">Completed 5-question screening for {category}</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-secondary/80 border border-indigo-500/30 text-center space-y-2">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Overall Technical Performance Score</span>
                    <div className="text-4xl font-extrabold text-indigo-500">{avgMockScore} <span className="text-xs text-muted-foreground font-normal">/ 100</span></div>
                  </div>

                  <button
                    onClick={startMockInterview}
                    className="w-full py-3 rounded-xl bg-secondary hover:bg-accent border border-border text-xs font-bold text-foreground flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retake Mock Interview</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

