'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Bot,
  BrainCircuit,
  FileText,
  FolderGit2,
  HelpCircle,
  Briefcase,
  CheckCircle2,
  Zap,
  Shield,
  Star,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { Github } from '@/components/Icons';
import { DevForgeLogo } from '@/components/DevForgeLogo';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: BrainCircuit,
      title: 'Real-Time Skill Gap Analysis',
      description: 'Benchmark your current technical skills against live industry requirements for your target role and get an immediate prioritized learning path.',
    },
    {
      icon: Bot,
      title: 'Context-Aware AI Career Coach',
      description: 'Powered by FORGE AI. Evaluates your code, answers career queries, reviews project ideas, and guides your daily developer journey.',
    },
    {
      icon: FileText,
      title: 'ATS Resume Parsing & Scoring',
      description: 'Extract skills and structural metrics from your PDF resume. Identify missing high-impact tech keywords before applying to jobs.',
    },
    {
      icon: Github,
      title: 'GitHub Repository Intelligence',
      description: 'Analyze repository language distributions, commit activity, README documentation quality, and get actionable profile score improvements.',
    },
    {
      icon: FolderGit2,
      title: 'Targeted Portfolio Project Engine',
      description: 'Build impactful full-stack applications tailored to your missing skills with AI-guided project blueprints.',
    },
    {
      icon: HelpCircle,
      title: 'Technical Interview Simulator',
      description: 'Practice DSA, System Design, React, and Backend interview questions with instant AI feedback on technical accuracy and edge cases.',
    },
  ];

  const faqs = [
    {
      q: 'How does DevForge AI calculate my Career Readiness Score?',
      a: 'DevForge AI computes your score across 5 core pillars: Skill coverage against target role benchmarks, ATS resume quality, GitHub repository activity, completed portfolio projects, and technical interview performance.',
    },
    {
      q: 'Is DevForge AI suitable for CSE students and entry-level developers?',
      a: 'Yes! DevForge AI is specifically engineered for students, fresh graduates, and career switchers looking to build proof-of-capability and land developer positions.',
    },
    {
      q: 'Do I need my own API keys to get started?',
      a: 'DevForge AI includes ready-to-use default intelligence engines out of the box, as well as seamless environment configuration for custom Clerk and FORGE AI API keys.',
    },
    {
      q: 'Can I export my career roadmap and project history?',
      a: 'Absolutely. You can track, customize, and export your career roadmap and learning progress anytime from your settings dashboard.',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-600 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 h-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-6 lg:px-16 flex items-center justify-between">
        <Link href="/">
          <DevForgeLogo variant="full" size="lg" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
          <a href="#readiness" className="hover:text-zinc-100 transition-colors">Career Score</a>
          <a href="#ai-coach" className="hover:text-zinc-100 transition-colors">AI Coach</a>
          <a href="#faq" className="hover:text-zinc-100 transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/auth/sign-in" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            href="/onboarding"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
          >
            <span>Start Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 lg:px-16 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800/90 text-xs text-blue-400 font-medium mb-8 shadow-inner"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Next-Generation AI Career Command Center</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-5xl mx-auto leading-[1.1]"
        >
          Build the career your code deserves.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          DevForge AI analyzes your skills, resume, GitHub and career goals to create a personalized path from learning to job readiness.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/onboarding"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-3"
          >
            <span>Start Your Career Journey</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
          >
            <span>Explore DevForge AI</span>
          </Link>
        </motion.div>

        {/* Dashboard Product Preview Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-5xl mx-auto rounded-2xl p-2 bg-gradient-to-b from-zinc-800/80 via-zinc-900/50 to-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden glass-panel"
        >
          <div className="rounded-xl bg-zinc-950 p-6 border border-zinc-800/80 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs text-zinc-500 ml-2 font-mono">devforge-ai.app/dashboard</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-medium border border-blue-500/20">
                Live Career Command Center
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score Card */}
              <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800/90 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">DevForge Career Score</span>
                  <div className="text-4xl font-extrabold text-blue-400 my-2">78 <span className="text-sm font-normal text-zinc-500">/ 100</span></div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Job Ready Competitive
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
                  Target: <strong className="text-zinc-200">Full Stack Developer</strong>
                </div>
              </div>

              {/* Skill Gap Card */}
              <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800/90 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target Skill Gaps</span>
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300">Docker & Containers</span>
                      <span className="text-amber-400 font-semibold">Priority High</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300">System Design</span>
                      <span className="text-amber-400 font-semibold">Priority High</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300">GraphQL APIs</span>
                      <span className="text-blue-400 font-semibold">Priority Medium</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-blue-400 font-medium">3 recommended courses linked</div>
              </div>

              {/* AI Daily Recommendation */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-zinc-900 to-purple-950/40 border border-purple-800/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">FORGE AI Daily Advice</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    "Complete 1 mock system design practice on URL Shorteners and upload your latest resume PDF to boost your ATS keyword score to 85+."
                  </p>
                </div>
                <button className="mt-4 w-full py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-colors">
                  Open AI Chat Session
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Everything connected for developer growth.
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-base">
            No fragmented tools. DevForge AI integrates your skills, projects, resume, GitHub, and job pipeline into a single intelligent operating system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-blue-500/40 hover:bg-zinc-900 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 lg:px-16 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Frequently Asked Questions</h2>
          <p className="text-zinc-400 text-sm">Clear answers about how DevForge AI accelerates your developer career.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-6 py-4 text-left flex items-center justify-between font-semibold text-zinc-200 text-base"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 px-6 lg:px-16 max-w-5xl mx-auto text-center">
        <div className="p-12 rounded-3xl bg-gradient-to-br from-blue-900/40 via-zinc-900 to-purple-900/30 border border-zinc-800/80 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to accelerate your developer career?
            </h2>
            <p className="text-zinc-300 max-w-xl mx-auto mb-8 text-base">
              Join CSE students, self-taught developers, and software engineers using DevForge AI to land their dream software roles.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-xl shadow-blue-600/30 transition-all"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-16 border-t border-zinc-800/80 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} DevForge AI. Your AI-Powered Developer Career Command Center.</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-zinc-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-300">Terms of Service</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-300">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
