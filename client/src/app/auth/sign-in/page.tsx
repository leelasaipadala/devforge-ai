'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, UserCheck, Loader2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DevForgeLogo } from '@/components/DevForgeLogo';
import { formatClerkError } from '@/lib/clerkErrors';

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

  // Secondary factor state (only used if Clerk explicitly requires second factor / MFA)
  const [pendingFactorAttempt, setPendingFactorAttempt] = useState<any>(null);
  const [factorCode, setFactorCode] = useState('');

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
      // Step 1: Create Sign-In Attempt with Clerk
      const signinAttempt = await clerk.client.signIn.create({
        identifier: email,
      });

      // If sign-in completed immediately
      if (signinAttempt.status === 'complete') {
        if (signinAttempt.createdSessionId) {
          await clerk.setActive({ session: signinAttempt.createdSessionId });
        }
        router.push('/dashboard');
        return;
      }

      // Step 2: Inspect supported first factors for password strategy
      const supportedFactors = signinAttempt.supportedFirstFactors || [];
      const passwordFactor = supportedFactors.find((f: any) => f.strategy === 'password');

      if (passwordFactor) {
        // Step 3: Attempt Password First Factor
        const result = await signinAttempt.attemptFirstFactor({
          strategy: 'password',
          password,
        });

        if (result.status === 'complete') {
          if (result.createdSessionId) {
            await clerk.setActive({ session: result.createdSessionId });
          }
          router.push('/dashboard');
          return;
        } else if (result.status === 'needs_second_factor' || result.status === 'needs_first_factor') {
          // Additional factor explicitly required by Clerk (e.g., MFA)
          setPendingFactorAttempt(result);
          setError('Additional verification is required to complete sign-in.');
        } else {
          setError('Sign in incomplete. Please verify your credentials and try again.');
        }
      } else {
        // Password strategy not found in supported first factors (e.g. Google OAuth account)
        const emailCodeFactor = supportedFactors.find((f: any) => f.strategy === 'email_code');
        if (emailCodeFactor && (emailCodeFactor as any).emailAddressId) {
          await signinAttempt.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: (emailCodeFactor as any).emailAddressId,
          });
          setPendingFactorAttempt(signinAttempt);
          setError('A verification code has been sent to your email to complete sign in.');
        } else {
          setError('No password sign-in method found for this email. If you signed up with Google, click "Continue with Google".');
        }
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
      } else {
        setError(formatClerkError(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyFactorCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorCode || !pendingFactorAttempt) return;

    setIsSubmitting(true);
    setError('');

    try {
      let result;
      if (pendingFactorAttempt.status === 'needs_second_factor') {
        result = await pendingFactorAttempt.attemptSecondFactor({
          strategy: 'email_code',
          code: factorCode.trim(),
        });
      } else {
        result = await pendingFactorAttempt.attemptFirstFactor({
          strategy: 'email_code',
          code: factorCode.trim(),
        });
      }

      if (result.status === 'complete') {
        if (result.createdSessionId) {
          await clerk.setActive({ session: result.createdSessionId });
        }
        router.push('/dashboard');
      } else {
        setError('Verification code incomplete. Please try again.');
      }
    } catch (err: any) {
      setError(formatClerkError(err));
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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 transition-colors duration-200">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-2xl space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-2 justify-center">
            <DevForgeLogo variant="full" size="lg" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {pendingFactorAttempt ? 'Additional Verification' : 'Welcome back'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {pendingFactorAttempt
              ? `Enter the code sent to ${email} to complete sign-in`
              : 'Career Command Center for Engineers & Developers'}
          </p>
        </div>

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

        {!clerk?.loaded && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 text-center font-medium">
            Loading authentication...
          </div>
        )}

        {pendingFactorAttempt ? (
          <form onSubmit={handleVerifyFactorCode} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Verification Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="text"
                  value={factorCode}
                  onChange={(e) => setFactorCode(e.target.value)}
                  placeholder="Enter code"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none focus:border-blue-500 transition-colors tracking-widest font-mono"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all duration-150 active:scale-[0.99] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{isSubmitting ? 'Verifying...' : 'Complete Sign In'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPendingFactorAttempt(null);
                setFactorCode('');
                setError('');
              }}
              className="w-full text-xs text-muted-foreground hover:underline text-center"
            >
              Back to sign-in form
            </button>
          </form>
        ) : (
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
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset options can be configured in your Clerk dashboard.');
                  }}
                  className="text-[11px] text-blue-500 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none focus:border-blue-500 transition-colors"
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
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !clerk?.loaded}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all duration-150 active:scale-[0.99] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>
        )}

        {!pendingFactorAttempt && (
          <>
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-border w-full"></div>
              <span className="bg-card px-3 text-[11px] text-muted-foreground font-medium uppercase absolute">Or</span>
            </div>

            {/* Google OAuth & Isolated Demo buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handleGoogleSignIn}
                disabled={!clerk?.loaded}
                className="w-full py-2.5 rounded-xl bg-secondary/80 hover:bg-accent text-foreground font-medium text-xs border border-border flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.99] disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span>Continue with Google</span>
              </button>

              <button
                onClick={handleDemoSignIn}
                className="w-full py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-semibold text-xs border border-purple-500/30 flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.99]"
              >
                <UserCheck className="w-4 h-4" />
                <span>Try Demo Account</span>
              </button>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-border text-xs text-muted-foreground flex justify-between">
          <span>New to DevForge AI?</span>
          <Link href="/auth/sign-up" className="text-blue-500 font-semibold hover:underline">
            Create account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
