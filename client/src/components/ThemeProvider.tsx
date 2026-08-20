'use client';

import * as React from 'react';

// Bypassing next-themes to fix the React 19 / Next.js 15 <script> tag hydration error.
// The app is currently forced to light mode, so this has no functional impact.
export function ThemeProvider({ children }: { children: React.ReactNode; [key: string]: any }) {
  return <>{children}</>;
}
