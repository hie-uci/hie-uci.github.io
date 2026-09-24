interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Page ground for every route except the homepage. It only clears the fixed
 * header; each page draws its own hero with PageHero.
 */
export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <main className={`relative isolate min-h-dvh bg-bg pt-[66px] text-ink xl:pt-[107px] ${className}`}>
      {children}
    </main>
  );
}
