import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'RF & Microwave Toolbox',
  description:
    'Interactive RF and microwave calculators for cascade analysis, radar, antennas, transmission lines, oscillator design, and Touchstone S-parameter analysis.',
  path: '/rf-toolbox',
});

export default function RFToolboxLayout({ children }: { children: React.ReactNode }) {
  return children;
}
