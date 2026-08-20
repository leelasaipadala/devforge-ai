'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/nextjs';
import { ApiClient } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  targetRole: string;
  avatarUrl?: string;
  experienceLevel?: string;
  educationLevel?: string;
  githubUsername?: string;
  careerGoal?: string;
  weeklyLearningHours?: number;
  bio?: string;
  onboardingCompleted?: boolean;
  isDemo?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isClerkAuthenticated: boolean;
  isDemo: boolean;
  isLoading: boolean;
  signInDemo: (email?: string, name?: string, targetRole?: string) => boolean;
  signOut: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isClerkAuthenticated: false,
  isDemo: false,
  isLoading: true,
  signInDemo: () => false,
  signOut: () => {},
  updateUser: () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Clerk Hooks — always available because ClerkProvider wraps the app
  const { user: clerkUser, isLoaded: isClerkUserLoaded, isSignedIn: isClerkSignedIn } = useUser();
  const { getToken } = useClerkAuth();
  const { signOut: clerkSignOut } = useClerk();

  // Local Demo User State
  const [demoUser, setDemoUser] = useState<User | null>(null);
  const [backendProfile, setBackendProfile] = useState<Partial<User> | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Setup ApiClient token getter dynamically for Clerk & Demo Mode
  useEffect(() => {
    ApiClient.setTokenGetter(async () => {
      if (isClerkSignedIn) {
        try {
          const token = await getToken();
          if (token) return token;
        } catch {
          // Clerk token retrieval failed
        }
      }
      if (typeof window !== 'undefined') {
        const demoSession = localStorage.getItem('devforge_demo_session');
        if (demoSession) {
          try {
            const parsed = JSON.parse(demoSession);
            if (parsed && parsed.token) {
              return parsed.token;
            }
          } catch {
            // Ignore parse error
          }
        }
      }
      return null;
    });
  }, [isClerkSignedIn, getToken]);

  // One-time cleanup: remove legacy localStorage keys that should never exist
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('devforge_user_name');
      localStorage.removeItem('devforge_user_email');
      localStorage.removeItem('devforge_user_role');
      localStorage.removeItem('devforge_user_github');
      localStorage.removeItem('devforge_auth_token');
      localStorage.removeItem('devforge_demo_used');
      localStorage.removeItem('clerk_session_token');
    }
  }, []);

  // Initialize Demo session from localStorage if user explicitly started one
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // If a real Clerk user is signed in, discard any stale demo session
      if (isClerkSignedIn) {
        localStorage.removeItem('devforge_demo_session');
        setDemoUser(null);
        setIsInitializing(false);
        return;
      }

      const storedDemo = localStorage.getItem('devforge_demo_session');
      if (storedDemo) {
        try {
          const parsed = JSON.parse(storedDemo);
          if (parsed && parsed.user) {
            setDemoUser(parsed.user);
          }
        } catch {
          localStorage.removeItem('devforge_demo_session');
        }
      }
      setIsInitializing(false);
    }
  }, [isClerkSignedIn]);

  // Fetch backend MongoDB profile when Clerk user is signed in
  const fetchBackendProfile = useCallback(async () => {
    if (!isClerkSignedIn) return;
    try {
      const data = await ApiClient.get<{ success: boolean; profile: any }>('/profile');
      if (data && data.success && data.profile) {
        setBackendProfile({
          name: data.profile.name || '',
          targetRole: data.profile.targetRole || 'Full Stack Developer',
          experienceLevel: data.profile.experienceLevel || 'Undergraduate Student',
          githubUsername: data.profile.githubUsername || '',
          onboardingCompleted: data.profile.onboardingCompleted ?? false,
          avatarUrl: data.profile.avatarUrl || '',
        });
      }
    } catch (err: any) {
      console.warn('[AuthContext] Backend profile sync note:', err);
      // Auto-logout if the server rejects the token as invalid or expired
      if (err?.message && err.message.includes('expired or is invalid')) {
        try {
          await clerkSignOut();
          if (typeof window !== 'undefined') window.location.href = '/auth/sign-in';
        } catch (signOutErr) {
          console.warn('[AuthContext] Auto-signout failed', signOutErr);
        }
      }
    }
  }, [isClerkSignedIn, clerkSignOut]);

  useEffect(() => {
    if (isClerkSignedIn) {
      fetchBackendProfile();
    }
  }, [isClerkSignedIn, fetchBackendProfile]);

  // Determine active User identity
  let activeUser: User | null = null;
  let isDemoMode = false;

  if (isClerkSignedIn && clerkUser) {
    // REAL CLERK USER Identity — this is the single source of truth
    isDemoMode = false;
    const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress || '';
    const fullName = clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || primaryEmail.split('@')[0] || 'Developer';

    let resolvedName = backendProfile?.name || fullName || 'Developer';
    if (resolvedName === 'Developer (Local)' || resolvedName === 'DevForge Developer' || resolvedName === 'DevForge Engineer') {
      resolvedName = fullName || 'Developer';
    }

    activeUser = {
      id: clerkUser.id,
      name: resolvedName,
      email: primaryEmail,
      targetRole: backendProfile?.targetRole || 'Full Stack Developer',
      avatarUrl: clerkUser.imageUrl || backendProfile?.avatarUrl,
      experienceLevel: backendProfile?.experienceLevel || 'Undergraduate Student',
      githubUsername: backendProfile?.githubUsername || '',
      onboardingCompleted: backendProfile?.onboardingCompleted ?? false,
      isDemo: false,
    };
  } else if (demoUser) {
    // EXPLICIT DEMO USER Identity — only when user explicitly clicked "Try Demo"
    isDemoMode = true;
    activeUser = demoUser;
  }

  /**
   * signInDemo: ONLY called when user explicitly clicks "Try Demo Account".
   * NEVER called as a fallback for failed Clerk auth.
   */
  const signInDemo = (
    email = 'demo@devforge.ai',
    name = 'Demo Developer',
    targetRole = 'Full Stack Developer'
  ): boolean => {
    if (typeof window !== 'undefined') {
      const newDemoUser: User = {
        id: `demo_session_${Date.now()}`,
        name,
        email,
        targetRole,
        onboardingCompleted: true,
        isDemo: true,
      };

      localStorage.setItem(
        'devforge_demo_session',
        JSON.stringify({
          user: newDemoUser,
          token: newDemoUser.id,
        })
      );
      setDemoUser(newDemoUser);
      return true;
    }
    return false;
  };

  const signOut = async () => {
    // If Clerk user is signed in, sign out of Clerk
    if (isClerkSignedIn) {
      try {
        await clerkSignOut();
      } catch (err) {
        console.warn('[AuthContext] Clerk signOut note:', err);
      }
    }

    // Clear demo session
    if (typeof window !== 'undefined') {
      localStorage.removeItem('devforge_demo_session');
      setDemoUser(null);
      setBackendProfile(null);
      window.location.href = '/auth/sign-in';
    }
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (isDemoMode && demoUser) {
      const updatedDemo = { ...demoUser, ...updatedData };
      setDemoUser(updatedDemo);
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'devforge_demo_session',
          JSON.stringify({
            user: updatedDemo,
            token: updatedDemo.id,
          })
        );
      }
    } else {
      try {
        await ApiClient.put('/profile', updatedData);
        setBackendProfile((prev) => ({ ...prev, ...updatedData }));
      } catch (err) {
        console.error('[AuthContext] Failed to update backend profile:', err);
      }
    }
  };

  const refreshProfile = async () => {
    await fetchBackendProfile();
  };

  const isLoading = isInitializing || !isClerkUserLoaded;

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        isAuthenticated: Boolean(activeUser),
        isClerkAuthenticated: Boolean(isClerkSignedIn),
        isDemo: isDemoMode,
        isLoading,
        signInDemo,
        signOut,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
