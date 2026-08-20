import React from 'react';
import { AuroraPageSkeleton } from '@/components/AuroraSkeleton';

export default function Loading() {
  return (
    <div className="p-6 lg:p-10 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <AuroraPageSkeleton />
      </div>
    </div>
  );
}
