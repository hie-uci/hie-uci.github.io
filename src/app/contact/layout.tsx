import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Contact',
  description:
    'Contact the High-speed Integrated Electronics Laboratory and Prof. Hamidreza Aghasi at UC Irvine.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
