'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, Mail, Lock, UserCheck, ShieldCheck, Loader2, KeyRound, Eye, EyeOff, Check, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DevForgeLogo } from '@/components/DevForgeLogo';
import { formatClerkError } from '@/lib/clerkErrors';

export default function SignUpPage() {
  const router = useRouter();
  const clerk = useClerk();
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();
  const { signInDemo, isAuthenticated, isDemo } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verification state
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');
  const [isResending, setIsResending] = useState(false);

  // Live password validation criteria
  const reqMinLength = password.length >= 8;
  const reqCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const reqNumber = /\d/.test(password);
  const reqSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const satisfiedCount = [reqMinLength, reqCase, reqNumber, reqSpecial].filter(Boolean).length;

  const getStrengthInfo = () => {
    if (!password) return { label: '', barBg: 'bg-transparent', textColor: 'text-muted-foreground', width: 'w-0' };
    if (satisfiedCount <= 1) return { label: 'Weak', barBg: 'bg-red-500', textColor: 'text-red-500', width: 'w-1/4' };
    if (satisfiedCount === 2) return { label: 'Fair', barBg: 'bg-amber-500', textColor: 'text-amber-500', width: 'w-2/4' };
    if (satisfiedCount === 3) return { label: 'Good', barBg: 'bg-blue-500', textColor: 'text-blue-500', width: 'w-3/4' };
    return { label: 'Strong', barBg: 'bg-emerald-500', textColor: 'text-emerald-500', width: 'w-full' };
  };

  const strength = getStrengthInfo();

  // Prefetch onboarding & dashboard routes for instant navigation after registration
  useEffect(() => {
    router.prefetch('/onboarding');
    router.prefetch('/dashboard');
  }, [router]);

  // If user is ALREADY signed in, automatically redirect to dashboard
  useEffect(() => {
    if ((isUserLoaded && isSignedIn) || (isAuthenticated && !isDemo)) {
      router.replace('/dashboard');
    }
  }, [isSignedIn, isUserLoaded, isAuthenticated, isDemo, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (clerk?.user || isSignedIn) {
      router.replace('/dashboard');
      return;
    }

    // Clerk must be loaded for real registration
    if (!clerk?.loaded) {
      setError('Authentication service is loading. Please wait a moment and try again.');
      return;
    }

    if (!clerk?.client?.signUp) {
      setError('Authentication is currently unavailable. Please verify your Clerk configuration.');
      return;
    }

    setIsSubmitting(true);

    try {
      // REAL Clerk Sign Up
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || 'Engineer';
      const lastName = nameParts.slice(1).join(' ') || '';

      const result = await clerk.client.signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      // 1. Check if sign-up completed automatically
      if (result.status === 'complete') {
        if (result.createdSessionId) {
          await clerk.setActive({ session: result.createdSessionId });
        }
        router.push('/onboarding');
        return;
      }

      // 2. Check if email verification is explicitly required
      const verifications = (result as any).verifications;
      const emailVerification = verifications?.emailAddress;
      const isUnverified =
        result.status === 'missing_requirements' ||
        (result as any).unverifiedFields?.includes('email_address') ||
        emailVerification?.status === 'unverified';

      if (isUnverified) {
        try {
          if (!emailVerification || emailVerification.status === 'unverified') {
            await clerk.client.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          }
        } catch (prepErr: any) {
          // Silent catch to prevent Next.js dev overlay console.error popups
        }
        setVerifying(true);
        setSuccessMessage(`We've sent a 6-digit verification code to ${email}`);
        return;
      }

      setVerifying(true);
    } catch (err: any) {
      const formatted = formatClerkError(err);
      setError(formatted);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!code || code.trim().length === 0) {
      setError('Please enter the verification code.');
      return;
    }

    if (!clerk?.client?.signUp) {
      setError('Clerk session lost. Please restart sign-up.');
      return;
    }

    setIsSubmitting(true);

    try {
      const completeSignUp = await clerk.client.signUp.attemptEmailAddressVerification({ code: code.trim() });

      if (completeSignUp.status === 'complete') {
        if (completeSignUp.createdSessionId) {
          await clerk.setActive({ session: completeSignUp.createdSessionId });
        }
        router.push('/onboarding');
        return;
      } else {
        setError('Verification incomplete. Please check the code and try again.');
      }
    } catch (err: any) {
      const formatted = formatClerkError(err);
      setError(formatted);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccessMessage('');

    if (!clerk?.client?.signUp) {
      setError('Clerk session expired. Please restart sign-up.');
      return;
    }

    setIsResending(true);

    try {
      await clerk.client.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setSuccessMessage(`A new verification code has been sent to ${email}`);
    } catch (err: any) {
      const formatted = formatClerkError(err);
      setError(formatted);
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = () => {
    setVerifying(false);
    setCode('');
    setError('');
    setSuccessMessage('');
  };

  const handleGoogleSignUp = async () => {
    if (clerk?.user || isSignedIn) {
      router.replace('/dashboard');
      return;
    }

    if (!clerk?.loaded || !clerk?.client?.signUp) {
      setError('Authentication is currently unavailable. Please try again.');
      return;
    }
    try {
      await clerk.client.signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/onboarding',
      });
    } catch (err: any) {
      setError('Unable to initiate Google Sign Up.');
    }
  };

  const handleDemoSignUp = () => {
    signInDemo('demo@devforge.ai', 'Demo Developer', 'Full Stack Developer');
    router.push('/onboarding');
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
            {verifying ? 'Verify your email' : 'Create your account'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {verifying ? (
              <span>
                We&apos;ve sent a verification code to: <strong className="text-foreground">{email}</strong>
              </span>
            ) : (
              'Start building your career command center today'
            )}
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
              {error.includes('already exists') && (
                <div className="pt-1">
                  <Link href="/auth/sign-in" className="text-blue-400 font-bold underline hover:text-blue-300">
                    Click here to Sign In →
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {successMessage && !error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium text-center leading-relaxed overflow-hidden"
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {!clerk?.loaded && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 text-center font-medium">
            Loading authentication...
          </div>
        )}

        {/* Container for Clerk Bot Protection / CAPTCHA */}
        <div id="clerk-captcha" />

        {verifying ? (
          <div className="space-y-5">
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Verification Code</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter 6-digit code"
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
                <span>{isSubmitting ? 'Verifying...' : 'Verify Email'}</span>
              </button>
            </form>

            <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground">Didn&apos;t receive the code?</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 disabled:opacity-50 hover:underline"
                >
                  {isResending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                  <span>Resend Code</span>
                </button>
                <span className="text-border">|</span>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="text-muted-foreground hover:text-foreground hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Change Email</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

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

            {/* Password Input with Show/Hide toggle */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Password</label>
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

            {/* Live Password Strength Meter */}
            {password && (
              <div className="space-y-1.5 pt-0.5">
                <div className="flex justify-between items-center text-[11px] font-medium">
                  <span className="text-muted-foreground">Password strength:</span>
                  <span className={strength.textColor}>{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${strength.barBg} transition-all duration-300 ${strength.width}`} />
                </div>
              </div>
            )}

            {/* Live Password Requirements Checklist */}
            <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 space-y-1.5 text-[11px]">
              <div className="font-semibold text-muted-foreground mb-1">Password requirements:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <div className={`flex items-center gap-1.5 ${reqMinLength ? 'text-emerald-500 font-medium' : 'text-muted-foreground'}`}>
                  {reqMinLength ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/40 flex-shrink-0" />
                  )}
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${reqCase ? 'text-emerald-500 font-medium' : 'text-muted-foreground'}`}>
                  {reqCase ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/40 flex-shrink-0" />
                  )}
                  <span>Uppercase & lowercase</span>
                </div>
                <div className={`flex items-center gap-1.5 ${reqNumber ? 'text-emerald-500 font-medium' : 'text-muted-foreground'}`}>
                  {reqNumber ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/40 flex-shrink-0" />
                  )}
                  <span>At least one number</span>
                </div>
                <div className={`flex items-center gap-1.5 ${reqSpecial ? 'text-emerald-500 font-medium' : 'text-muted-foreground'}`}>
                  {reqSpecial ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/40 flex-shrink-0" />
                  )}
                  <span>At least one special char</span>
                </div>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <div className="text-[11px] text-red-500 font-medium mt-1">Passwords do not match.</div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Target Software Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="AI/ML Engineer">AI/ML Engineer</option>
                <option value="Cloud/DevOps Engineer">Cloud/DevOps Engineer</option>
                <option value="Software Engineer">Software Engineer</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !clerk?.loaded}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all duration-150 active:scale-[0.99] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{isSubmitting ? 'Creating Account...' : 'Create Account & Continue'}</span>
            </button>
          </form>
        )}

        {!verifying && (
          <>
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-border w-full"></div>
              <span className="bg-card px-3 text-[11px] text-muted-foreground font-medium uppercase absolute">Or</span>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleGoogleSignUp}
                disabled={!clerk?.loaded}
                className="w-full py-2.5 rounded-xl bg-secondary/80 hover:bg-accent text-foreground font-medium text-xs border border-border flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.99] disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span>Sign Up with Google</span>
              </button>

              <button
                onClick={handleDemoSignUp}
                className="w-full py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-semibold text-xs border border-purple-500/30 flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.99]"
              >
                <UserCheck className="w-4 h-4" />
                <span>Explore with Demo Developer Profile</span>
              </button>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-border text-xs text-muted-foreground flex justify-between">
          <span>Already registered?</span>
          <Link href="/auth/sign-in" className="text-blue-500 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
