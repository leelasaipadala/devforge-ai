'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, Mail, Lock, UserCheck, ShieldCheck, Loader2, KeyRound, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DevForgeLogo } from '@/components/DevForgeLogo';
import { AuroraButton } from '@/components/AuroraButton';
import { formatClerkError } from '@/lib/clerkErrors';
import { AuthLayout } from '@/components/auth/AuthLayout';

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
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

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

  // Live password validation criteria (memoized for zero keystroke lag)
  const { reqMinLength, reqCase, reqNumber, reqSpecial, strength } = useMemo(() => {
    const minLen = password.length >= 6;
    const isCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const num = /\d/.test(password);
    const spec = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const count = [minLen, isCase, num, spec].filter(Boolean).length;

    let info = { label: '', barBg: 'bg-transparent', textColor: 'text-muted-foreground', width: 'w-0' };
    if (password) {
      if (count <= 1) info = { label: 'Weak', barBg: 'bg-red-500', textColor: 'text-red-500', width: 'w-1/4' };
      else if (count === 2) info = { label: 'Fair', barBg: 'bg-amber-500', textColor: 'text-amber-500', width: 'w-2/4' };
      else if (count === 3) info = { label: 'Good', barBg: 'bg-blue-500', textColor: 'text-blue-500', width: 'w-3/4' };
      else info = { label: 'Strong', barBg: 'bg-emerald-500', textColor: 'text-emerald-500', width: 'w-full' };
    }
    return { reqMinLength: minLen, reqCase: isCase, reqNumber: num, reqSpecial: spec, strength: info };
  }, [password]);

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
      const lastName = nameParts.slice(1).join(' ') || 'User';

      const result = await clerk.client.signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      // Since OTP is removed, we check if sign-up completed automatically
      if (result.status === 'complete') {
        if (result.createdSessionId) {
          await clerk.setActive({ session: result.createdSessionId });
        }
        router.push('/onboarding');
        return;
      } else {
        await clerk.client.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
      }
    } catch (err: any) {
      const formatted = formatClerkError(err);
      setError(formatted);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (!clerk?.client?.signUp) throw new Error("Clerk not loaded");
      const completeSignUp = await clerk.client.signUp.attemptEmailAddressVerification({ code });
      if (completeSignUp.status !== 'complete') {
        setError('Verification failed. Please try again.');
      } else {
        if (completeSignUp.createdSessionId) {
          await clerk.setActive({ session: completeSignUp.createdSessionId });
        }
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError(formatClerkError(err));
    } finally {
      setIsSubmitting(false);
    }
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
    <AuthLayout
      title="Create your account"
      subtitle="Join DEVFORGE AI and start building your career command center today."
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
              {error.includes('already exists') && (
                <div className="pt-1">
                  <Link href="/auth/sign-in" className="text-primary font-bold underline hover:text-primary/80">
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

        {/* Container for Clerk Bot Protection / CAPTCHA */}
        <div id="clerk-captcha" />

        {!pendingVerification ? (
          <motion.div variants={containerVariants} initial="hidden" animate="show" exit="exit">
            <form onSubmit={handleSignUp} className="space-y-4">
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3 transition-colors group-focus-within:text-primary" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/30 border border-border/60 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 hover:bg-secondary/50 backdrop-blur-sm shadow-sm"
                    required
                  />
                </div>
              </motion.div>

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

              {/* Password Input with Show/Hide toggle */}
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 ml-1">Password</label>
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

              {/* Live Password Strength Meter */}
              <AnimatePresence>
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 pt-0.5 pb-2">
                      <div className="flex justify-between items-center text-[11px] font-medium px-1">
                        <span className="text-muted-foreground">Password strength:</span>
                        <span className={strength.textColor}>{strength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden border border-border/40">
                        <div className={`h-full ${strength.barBg} transition-all duration-500 ease-out ${strength.width}`} />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-secondary/40 border border-border/50 space-y-1.5 text-[11px] backdrop-blur-sm mb-3">
                      <div className="font-semibold text-muted-foreground mb-1">Requirements:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { condition: reqMinLength, text: "6+ characters" },
                          { condition: reqCase, text: "Uppercase & lowercase" },
                          { condition: reqNumber, text: "At least one number" },
                          { condition: reqSpecial, text: "Special character" }
                        ].map((req, i) => (
                          <div key={i} className={`flex items-center gap-1.5 transition-colors duration-300 ${req.condition ? 'text-emerald-500 font-medium' : 'text-muted-foreground'}`}>
                            {req.condition ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/40 flex-shrink-0" />
                            )}
                            <span>{req.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confirm Password Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3 transition-colors group-focus-within:text-primary" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-secondary/30 border border-border/60 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 hover:bg-secondary/50 backdrop-blur-sm shadow-sm"
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
                <AnimatePresence>
                  {confirmPassword && password !== confirmPassword && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0 }} 
                      className="text-[11px] text-red-500 font-medium mt-1.5 ml-1"
                    >
                      Passwords do not match.
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 ml-1">Target Software Role</label>
                <div className="relative group">
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/30 border border-border/60 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:bg-secondary/50 backdrop-blur-sm shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="AI/ML Engineer">AI/ML Engineer</option>
                    <option value="Cloud/DevOps Engineer">Cloud/DevOps Engineer</option>
                    <option value="Software Engineer">Software Engineer</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
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
                    <span className="font-semibold">{isSubmitting ? 'Creating Account...' : 'Create Account & Continue'}</span>
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
                  onClick={handleGoogleSignUp}
                  disabled={!clerk?.loaded}
                  className="w-full py-2.5 rounded-xl text-xs shadow-sm bg-secondary/30 backdrop-blur-sm border border-border/60 hover:bg-secondary/60"
                >
                  <span className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Sign Up with Google</span>
                  </span>
                </AuroraButton>

                <AuroraButton
                  variant="ai"
                  onClick={handleDemoSignUp}
                  className="w-full py-2.5 rounded-xl text-xs shadow-md border border-ai/20"
                >
                  <span className="flex items-center justify-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    <span className="font-semibold">Explore with Demo Profile</span>
                  </span>
                </AuroraButton>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Verification Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                We sent a verification code to <span className="font-semibold text-foreground">{email}</span>. Please enter it above.
              </p>
            </div>
            <AuroraButton
              variant="primary"
              type="submit"
              disabled={isSubmitting || !code}
              className="w-full py-2.5 rounded-xl text-xs shadow-lg shadow-primary/20"
            >
              <span className="flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{isSubmitting ? 'Verifying...' : 'Verify Email & Continue'}</span>
              </span>
            </AuroraButton>
          </form>
        )}

        {/* Footer */}
        <div className="pt-4 text-xs text-center text-muted-foreground">
          Already registered?{' '}
          <Link href="/auth/sign-in" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
