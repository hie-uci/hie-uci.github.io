import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Team',
  description:
    'Meet Prof. Hamidreza Aghasi and the students, researchers, and alumni of the High-speed Integrated Electronics Laboratory at UC Irvine.',
  path: '/team',
});

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
