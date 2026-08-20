'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, UserCheck, Loader2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DevForgeLogo } from '@/components/DevForgeLogo';
import { AuroraButton } from '@/components/AuroraButton';
import { formatClerkError } from '@/lib/clerkErrors';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function SignInPage() {
  const router = useRouter();
  const clerk = useClerk();
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();
  const { signInDemo, isAuthenticated, isDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Framer Motion Variants for smooth 60fps animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 300, damping: 24 } }
  } as const;

  // Prefetch dashboard route for instant navigation after login
  useEffect(() => {
    router.prefetch('/dashboard');
    router.prefetch('/onboarding');
  }, [router]);

  // If user is ALREADY signed in, automatically redirect to dashboard
  useEffect(() => {
    if ((isUserLoaded && isSignedIn) || (isAuthenticated && !isDemo)) {
      router.replace('/dashboard');
    }
  }, [isSignedIn, isUserLoaded, isAuthenticated, isDemo, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (clerk?.user || isSignedIn) {
      router.replace('/dashboard');
      return;
    }

    // Clerk must be loaded for real authentication
    if (!clerk?.loaded) {
      setError('Authentication system is loading. Please wait a moment and try again.');
      return;
    }

    if (!clerk?.client?.signIn) {
      setError('Authentication is currently unavailable. Please verify your Clerk configuration.');
      return;
    }

    setIsSubmitting(true);

    try {
      const signinAttempt = await clerk.client.signIn.create({
        identifier: email,
        password,
      });

      if (signinAttempt.status === 'complete') {
        if (signinAttempt.createdSessionId) {
          await clerk.setActive({ session: signinAttempt.createdSessionId });
        }
        router.push('/dashboard');
        return;
      } else {
        setError('Sign in requires additional verification steps. Please try another method.');
      }
    } catch (err: any) {
      const rawMessage = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || '';
      const errCode = err?.errors?.[0]?.code;

      if (errCode === 'form_identifier_not_found' || rawMessage.toLowerCase().includes("couldn't find your account")) {
        setError('No account was found with these credentials. Click "Create account" below to register.');
      } else if (errCode === 'form_password_incorrect' || rawMessage.toLowerCase().includes('incorrect password')) {
        setError('Incorrect email or password. Please try again.');
      } else if (rawMessage.toLowerCase().includes('already signed in') || errCode === 'session_exists') {
        router.replace('/dashboard');
        return;
      } else if (rawMessage.toLowerCase().includes('verify this account') || rawMessage.toLowerCase().includes('restart registration')) {
        setError('This account is either unverified or was created using Google. Please click "Continue with Google" or try the Demo Account.');
      } else {
        setError(formatClerkError(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (clerk?.user || isSignedIn) {
      router.replace('/dashboard');
      return;
    }

    if (!clerk?.loaded || !clerk?.client?.signIn) {
      setError('Authentication is temporarily unavailable. Please try again.');
      return;
    }

    try {
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
    } catch (err: any) {
      setError('Unable to initiate Google Sign In. Please try again.');
    }
  };

  const handleDemoSignIn = () => {
    signInDemo('demo@devforge.ai', 'Demo Developer', 'Full Stack Developer');
    router.push('/dashboard');
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to your command center to continue building your career."
    >
      <div className="space-y-6">

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-medium text-center leading-relaxed space-y-1 overflow-hidden"
            >
              <div>{error}</div>
              {(error.includes('No account was found') || error.includes('Google')) && (
                <div className="pt-1">
                  <Link href="/auth/sign-up" className="text-blue-400 font-bold underline hover:text-blue-300">
                    New to DevForge? Click here to Create Account →
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!clerk?.loaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-card/80 backdrop-blur-md rounded-2xl"
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-xs font-medium text-muted-foreground animate-pulse">Initializing Security...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={containerVariants} initial="hidden" animate="show" exit="exit">
          <form onSubmit={handleSignIn} className="space-y-4">
            <motion.div variants={itemVariants}>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3 transition-colors group-focus-within:text-primary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/30 border border-border/60 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 hover:bg-secondary/50 backdrop-blur-sm shadow-sm"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-xs font-semibold text-muted-foreground">Password</label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset options can be configured in your Clerk dashboard.');
                  }}
                  className="text-[11px] text-blue-500 font-medium hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3 transition-colors group-focus-within:text-primary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-secondary/30 border border-border/60 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 hover:bg-secondary/50 backdrop-blur-sm shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <AuroraButton
                variant="primary"
                type="submit"
                disabled={isSubmitting || !clerk?.loaded}
                className="w-full py-2.5 rounded-xl text-xs shadow-lg shadow-primary/20"
              >
                <span className="flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span className="font-semibold">{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                </span>
              </AuroraButton>
            </motion.div>
          </form>

          <motion.div variants={itemVariants}>
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-border/80 w-full"></div>
              <span className="bg-card px-3 text-[11px] text-muted-foreground font-semibold uppercase absolute rounded-full border border-border/50 py-0.5">Or</span>
            </div>

            <div className="space-y-3">
              <AuroraButton
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={!clerk?.loaded}
                className="w-full py-2.5 rounded-xl text-xs shadow-sm bg-secondary/30 backdrop-blur-sm border border-border/60 hover:bg-secondary/60"
              >
                <span className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Continue with Google</span>
                </span>
              </AuroraButton>

              <AuroraButton
                variant="ai"
                onClick={handleDemoSignIn}
                className="w-full py-2.5 rounded-xl text-xs shadow-md border border-ai/20"
              >
                <span className="flex items-center justify-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  <span className="font-semibold">Try Demo Account</span>
                </span>
              </AuroraButton>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4 text-xs text-center text-muted-foreground">
            New to DevForge AI?{' '}
            <Link href="/auth/sign-up" className="text-primary font-semibold hover:underline">
              Create account
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </AuthLayout>
  );
}
