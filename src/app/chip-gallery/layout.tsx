import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Chip Gallery',
  description:
    'View fabricated HIE Lab integrated circuits spanning radar systems, power amplifiers, oscillators, sub-THz sources, and specialized analog circuits.',
  path: '/chip-gallery',
});

export default function ChipGalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
