import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevForge AI — Your AI-Powered Developer Career & Project Command Center',
  description: 'DevForge AI analyzes your skills, resume, GitHub, and career goals to create a personalized path from learning to job readiness.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isValidClerkKey = Boolean(
    clerkKey &&
    clerkKey.startsWith('pk_') &&
    !clerkKey.includes('sample') &&
    !clerkKey.includes('placeholder')
  );

  const appContent = (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );

  if (!isValidClerkKey) {
    return (
      <html lang="en" suppressHydrationWarning className="h-full antialiased">
        <body className="min-h-full flex flex-col font-sans transition-colors duration-200">
          {appContent}
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <html lang="en" suppressHydrationWarning className="h-full antialiased">
        <body className="min-h-full flex flex-col font-sans transition-colors duration-200">
          {appContent}
        </body>
      </html>
    </ClerkProvider>
  );
}
