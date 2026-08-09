'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DevForgeLogo } from '@/components/DevForgeLogo';

export default function SignInPage() {
  const router = useRouter();
  const { signInDemo, isDemoUsed } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }
    const success = signInDemo(email, email.split('@')[0] || 'Engineer');
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Demo account already used on this device. Please sign in with your account.');
    }
  };

  const handleDemoSignIn = () => {
    const success = signInDemo('demo@devforge.ai', 'Demo Developer', 'Full Stack Developer');
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Demo account already used on this device.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 transition-colors duration-200">
      <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-2 justify-center">
            <DevForgeLogo variant="full" size="lg" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="text-xs text-muted-foreground">Career Command Center for Engineers & Developers</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-muted-foreground">Password</label>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Password reset link has been sent to your email address.'); }} className="text-[11px] text-blue-500 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-500/20"
          >
            Sign In
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-border w-full"></div>
          <span className="bg-card px-3 text-[11px] text-muted-foreground font-medium uppercase absolute">Or</span>
        </div>

        {/* Demo Mode & OAuth buttons */}
        <div className="space-y-2">
          {isDemoUsed ? (
            <button
              disabled
              className="w-full py-2.5 rounded-xl bg-secondary/50 text-muted-foreground font-semibold text-xs border border-border cursor-not-allowed flex items-center justify-center gap-2 opacity-60"
            >
              <UserCheck className="w-4 h-4" />
              <span>Demo account already used on this device</span>
            </button>
          ) : (
            <button
              onClick={handleDemoSignIn}
              className="w-full py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-semibold text-xs border border-purple-500/30 flex items-center justify-center gap-2 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              <span>Continue with Demo Account</span>
            </button>
          )}

          <button
            onClick={() => alert('SSO sign in redirecting to authentication provider...')}
            className="w-full py-2.5 rounded-xl bg-secondary/80 hover:bg-accent text-foreground font-medium text-xs border border-border flex items-center justify-center gap-2 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border text-xs text-muted-foreground flex justify-between">
          <span>New to DevForge AI?</span>
          <Link href="/auth/sign-up" className="text-blue-500 font-semibold hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

