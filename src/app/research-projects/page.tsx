'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/research/');
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-uci-blue animate-pulse">Redirecting to Research...</h1>
        <p className="text-gray-500 mt-2">Please wait while we transfer you to the new page.</p>
      </div>
    </main>
  );
}
