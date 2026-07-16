import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Available Positions',
  description:
    'Learn how to apply for postdoctoral, graduate, and undergraduate research opportunities at the HIE Lab at UC Irvine.',
  path: '/available-positions',
});

export default function AvailablePositionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
