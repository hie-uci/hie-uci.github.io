import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'News & Highlights',
  description:
    'Follow the latest HIE Lab publications, awards, student milestones, conference presentations, and research highlights.',
  path: '/news',
});

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
