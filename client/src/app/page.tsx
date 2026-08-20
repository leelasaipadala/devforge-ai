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
import { AuroraButton } from '@/components/AuroraButton';
import { AuroraBadge } from '@/components/AuroraBadge';
import { AuroraCard } from '@/components/AuroraCard';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: BrainCircuit,
      title: 'Intelligent Skill Mapping',
      description: 'Benchmark your current technical abilities against real industry standards and discover your optimal path forward.',
    },
    {
      icon: Bot,
      title: 'Context-Aware Career Coach',
      description: 'Meet FORGE AI. Your dedicated companion for reviewing projects, mastering interviews, and navigating career decisions.',
    },
    {
      icon: FileText,
      title: 'Resume Intelligence Studio',
      description: 'Transform your CV into an ATS-optimized powerhouse. We analyze your keywords, structure, and impact in seconds.',
    },
    {
      icon: Github,
      title: 'Portfolio Analytics',
      description: 'Connect your GitHub to instantly extract value from your repositories and showcase your code quality to recruiters.',
    },
    {
      icon: FolderGit2,
      title: 'Strategic Project Blueprints',
      description: 'Stop building generic tutorials. Generate personalized project architectures designed to fill your specific skill gaps.',
    },
    {
      icon: HelpCircle,
      title: 'Interview Arena',
      description: 'Hone your technical communication with simulated interviews across algorithms, system design, and specialized frameworks.',
    },
  ];

  const faqs = [
    {
      q: 'How does DevForge calculate my Career Readiness?',
      a: 'We synthesize your progress across 5 core dimensions: Skill coverage, Resume strength, GitHub activity, completed Projects, and Interview performance.',
    },
    {
      q: 'Is this platform suitable for junior developers?',
      a: 'Absolutely. DevForge AI is specifically engineered to bridge the gap between learning to code and landing your first professional engineering role.',
    },
    {
      q: 'Do I need my own API keys to get started?',
      a: 'No. DevForge AI comes with its own intelligence engines out of the box, ready to guide your career journey from day one.',
    },
    {
      q: 'Can I track my actual job applications here?',
      a: 'Yes, our Career Opportunity Board provides a premium kanban interface to track every application from wishlist to offer letter.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 h-20 bg-white/40 dark:bg-black/40 backdrop-blur-xl border-b border-border/50 px-6 lg:px-16 flex items-center justify-between transition-colors">
        <Link href="/">
          <DevForgeLogo variant="full" size="lg" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Platform</a>
          <a href="#readiness" className="hover:text-foreground transition-colors">Intelligence</a>
          <a href="#ai-coach" className="hover:text-foreground transition-colors">FORGE AI</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-6">
          <Link href="/auth/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/auth/sign-up">
            <AuroraButton variant="primary" className="rounded-full shadow-lg shadow-primary/20 font-semibold px-6">
              Start Free
            </AuroraButton>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 lg:px-16 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[400px] bg-ai/10 rounded-full blur-[140px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <AuroraBadge variant="ai" className="px-4 py-1.5 text-xs shadow-sm shadow-ai/10">
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              The Premium AI Career Studio
            </span>
          </AuroraBadge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6 max-w-4xl mx-auto leading-[1.05]"
        >
          Build the career <br className="hidden sm:block" /> you're becoming.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          An editorial approach to developer growth. DevForge AI beautifully connects your skills, projects, and interviews into one intelligent ecosystem.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link href="/auth/sign-up" className="w-full sm:w-auto">
            <AuroraButton variant="primary" className="w-full sm:w-auto px-8 py-6 rounded-2xl font-bold text-base shadow-xl shadow-primary/20">
              <span className="flex items-center gap-3">
                Begin Your Journey
                <ArrowRight className="w-5 h-5" />
              </span>
            </AuroraButton>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <AuroraButton variant="outline" className="w-full sm:w-auto px-8 py-6 rounded-2xl font-semibold text-base bg-white/50 dark:bg-black/50 backdrop-blur-md">
              Explore the Studio
            </AuroraButton>
          </Link>
        </motion.div>

        {/* Dashboard Product Preview Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-5xl mx-auto rounded-[2rem] p-3 bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/40 shadow-2xl shadow-primary/10 overflow-hidden"
        >
          <div className="rounded-[1.5rem] bg-card p-8 border border-border shadow-sm text-left">
            <div className="flex items-center justify-between pb-6 border-b border-border/50 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger/80 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-warning/80 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-success/80 shadow-sm" />
                <span className="text-xs text-muted-foreground ml-3 font-mono tracking-tight">studio.devforge.ai</span>
              </div>
              <AuroraBadge variant="primary">
                Live Command Center
              </AuroraBadge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score Card */}
              <AuroraCard padded glow className="flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Career Intelligence</span>
                  <div className="text-5xl font-extrabold text-foreground tracking-tighter my-3">84<span className="text-xl font-medium text-muted-foreground">/100</span></div>
                  <AuroraBadge variant="success" className="mt-2">
                    Highly Competitive
                  </AuroraBadge>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-xs font-medium text-muted-foreground">
                  Target: <span className="text-foreground font-semibold">Software Engineer</span>
                </div>
              </AuroraCard>

              {/* Skill Gap Card */}
              <AuroraCard padded glow className="flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Skill Trajectory</span>
                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-foreground">System Design</span>
                      <AuroraBadge variant="warning">Priority</AuroraBadge>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-foreground">TypeScript</span>
                      <AuroraBadge variant="success">Mastered</AuroraBadge>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-foreground">GraphQL</span>
                      <AuroraBadge variant="primary">In Progress</AuroraBadge>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-[13px] font-semibold text-primary">View Full Constellation →</div>
              </AuroraCard>

              {/* AI Daily Recommendation */}
              <AuroraCard padded glow glass className="bg-ai/5 border-ai/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="w-4 h-4 text-ai" />
                    <span className="text-[11px] font-bold text-ai uppercase tracking-widest">FORGE AI Assistant</span>
                  </div>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    "I noticed you completed the React module. Shall we simulate a frontend systems interview to solidify your knowledge?"
                  </p>
                </div>
                <AuroraButton variant="ai" className="mt-6 w-full rounded-xl">
                  Start Simulation
                </AuroraButton>
              </AuroraCard>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-6">
            A seamless ecosystem for growth.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            Leave fragmented tools behind. DevForge AI beautifully integrates your skills, projects, and interviews into a single, cohesive operating system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <AuroraCard
                key={idx}
                hoverable
                className="group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{feat.description}</p>
              </AuroraCard>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 lg:px-16 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-foreground mb-4">Common Questions</h2>
          <p className="text-muted-foreground text-base">Clarity on how we accelerate your career.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <AuroraCard key={i} padded={false} className="overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-6 py-5 text-left flex items-center justify-between font-bold text-foreground text-base focus:outline-none"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-6 text-sm font-medium text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </div>
            </AuroraCard>
          ))}
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-24 px-6 lg:px-16 max-w-5xl mx-auto text-center">
        <AuroraCard glass glow className="p-16 border-primary/20 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-ai/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
              Ready to elevate your trajectory?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-10 text-lg font-medium leading-relaxed">
              Join ambitious engineers building their futures in the most elegantly designed career studio.
            </p>
            <Link href="/auth/sign-up">
              <AuroraButton variant="primary" className="px-10 py-6 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform duration-300">
                <span className="flex items-center gap-3">
                  Open The Studio
                  <ArrowRight className="w-5 h-5" />
                </span>
              </AuroraButton>
            </Link>
          </div>
        </AuroraCard>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 lg:px-16 border-t border-border/50 text-center text-[13px] font-medium text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>© {new Date().getFullYear()} DevForge AI. The Premium Career Intelligence Studio.</div>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
