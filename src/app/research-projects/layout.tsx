import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Research Projects',
  description: 'This legacy page redirects to the current HIE Lab research page.',
  path: '/research',
  noIndex: true,
});

export default function ResearchProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
