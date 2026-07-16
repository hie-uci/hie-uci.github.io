import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Research',
  description:
    'Explore HIE Lab research in multi-band mm-wave radar, sub-THz and THz power generation, wideband signal generation, AI-driven circuit design, and emerging devices.',
  path: '/research',
});

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
