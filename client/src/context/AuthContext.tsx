'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  targetRole: string;
  avatarUrl?: string;
  experienceLevel?: string;
  educationLevel?: string;
  githubUsername?: string;
  onboardingCompleted?: boolean;
  isDemo?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isClerkActive: boolean;
  isDemoUsed: boolean;
  signInDemo: (email?: string, name?: string, targetRole?: string) => boolean;
  signOut: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isClerkActive: false,
  isDemoUsed: false,
  signInDemo: () => false,
  signOut: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isDemoUsed, setIsDemoUsed] = useState<boolean>(false);

  const clerkKey = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY : undefined;
  const isClerkActive = Boolean(clerkKey && clerkKey.startsWith('pk_') && !clerkKey.includes('sample'));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const demoFlag = localStorage.getItem('devforge_demo_used') === 'true';
      setIsDemoUsed(demoFlag);

      const storedToken = localStorage.getItem('devforge_auth_token');
      const storedName = localStorage.getItem('devforge_user_name');
      const storedEmail = localStorage.getItem('devforge_user_email');
      const storedRole = localStorage.getItem('devforge_user_role');
      const storedGithub = localStorage.getItem('devforge_user_github');

      if (storedName && storedEmail) {
        setUser({
          id: storedToken || 'user_devforge_session_01',
          name: storedName,
          email: storedEmail,
          targetRole: storedRole || 'Full Stack Developer',
          githubUsername: storedGithub || '',
          onboardingCompleted: true,
          isDemo: storedEmail === 'demo@devforge.ai',
        });
      }
    }
  }, []);

  const signInDemo = (
    email = 'demo@devforge.ai',
    name = 'Demo Developer',
    targetRole = 'Full Stack Developer'
  ): boolean => {
    if (typeof window !== 'undefined') {
      const demoFlag = localStorage.getItem('devforge_demo_used') === 'true';
      if (demoFlag) {
        return false;
      }

      const demoUser: User = {
        id: `demo_user_${Date.now()}`,
        name,
        email,
        targetRole,
        onboardingCompleted: true,
        isDemo: true,
      };

      setUser(demoUser);
      setIsDemoUsed(true);

      localStorage.setItem('devforge_demo_used', 'true');
      localStorage.setItem('devforge_user_name', name);
      localStorage.setItem('devforge_user_email', email);
      localStorage.setItem('devforge_user_role', targetRole);
      localStorage.setItem('devforge_auth_token', demoUser.id);
      return true;
    }
    return false;
  };

  const signOut = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      if (user?.isDemo || user?.email === 'demo@devforge.ai') {
        localStorage.setItem('devforge_demo_used', 'true');
        setIsDemoUsed(true);
      }

      localStorage.removeItem('devforge_user_name');
      localStorage.removeItem('devforge_user_email');
      localStorage.removeItem('devforge_user_role');
      localStorage.removeItem('devforge_user_github');
      localStorage.removeItem('devforge_auth_token');
      localStorage.removeItem('clerk_session_token');
      window.location.href = '/auth/sign-in';
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
    if (typeof window !== 'undefined') {
      if (updatedData.name) localStorage.setItem('devforge_user_name', updatedData.name);
      if (updatedData.email) localStorage.setItem('devforge_user_email', updatedData.email);
      if (updatedData.targetRole) localStorage.setItem('devforge_user_role', updatedData.targetRole);
      if (updatedData.githubUsername !== undefined) localStorage.setItem('devforge_user_github', updatedData.githubUsername);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isClerkActive,
        isDemoUsed,
        signInDemo,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


