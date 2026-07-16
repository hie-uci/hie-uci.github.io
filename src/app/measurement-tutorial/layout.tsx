import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'RF Measurement Tutorials',
  description:
    'Educational video guides for RF and mm-wave measurements, radar demonstrations, VCO characterization, and antenna-to-PCB design workflows.',
  path: '/measurement-tutorial',
});

export default function MeasurementTutorialLayout({ children }: { children: React.ReactNode }) {
  return children;
}
