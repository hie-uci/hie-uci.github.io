import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Teaching',
  description:
    'Courses taught by Prof. Hamidreza Aghasi in network analysis, advanced analog circuits, and mm-wave and terahertz circuit design.',
  path: '/teaching',
});

export default function TeachingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
