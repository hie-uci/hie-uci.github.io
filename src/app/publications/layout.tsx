import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Publications',
  description:
    'Browse HIE Lab journal papers, conference publications, patents, and invited talks in RF, mm-wave, THz, radar, and AI-driven integrated circuit design.',
  path: '/publications',
});

export default function PublicationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
