'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** The old /research-projects address now lives at /research. */
export default function RedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/research/');
  }, [router]);

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-5 text-center text-ink">
      <div>
        <p className="kicker">Moved</p>
        <h1 className="display-3 mt-4">Research projects are now on the Research page.</h1>
        <Link href="/research/" className="link-arrow mt-6">
          Go to Research <span className="arrow">→</span>
        </Link>
      </div>
    </main>
  );
}
