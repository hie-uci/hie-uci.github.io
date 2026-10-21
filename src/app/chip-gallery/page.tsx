'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import PageWrapper from '@/components/PageWrapper';
import SectionHeader from '@/components/SectionHeader';
import CircuitBackground from '@/components/CircuitBackground';

interface ChipData {
  id: number;
  name: string;
  technology: string;
  frequency: string;
  category: string;
  image: string;
  width: number;
  height: number;
}

const chips: ChipData[] = [
  // --- Radar Systems ---
  { id: 1, name: 'Doppler-Assisted PMCW Radar', technology: '65nm CMOS', frequency: 'mm-Wave', category: 'Radar Systems', image: '/images/chips/individual/sheet1-01-pmcw-radar.png', width: 838, height: 544 },
  { id: 2, name: '49–63 GHz FMCW Radar', technology: '22nm CMOS', frequency: '49–63 GHz', category: 'Radar Systems', image: '/images/chips/individual/sheet1-04-49-63-ghz-fmcw-radar.png', width: 835, height: 445 },
  { id: 3, name: '23–27 & 69–81 GHz MIMO FMCW Radar', technology: '65nm CMOS', frequency: '23–27, 69-81 GHz', category: 'Radar Systems', image: '/images/chips/individual/DB_MIMO.png', width: 760, height: 564 },
  { id: 4, name: 'Monostatic 50–60 GHz FMCW Radar', technology: '65nm CMOS', frequency: '50–60 GHz', category: 'Radar Systems', image: '/images/chips/individual/sheet2-02-monostatic-50-60-ghz-fmcw-radar.png', width: 834, height: 472 },
  
  // --- High-Power & Amplifiers ---
  { id: 5, name: '110–143 GHz PA (19 dBm Psat)', technology: '65nm CMOS', frequency: '110–143 GHz', category: 'Power Generation & PA', image: '/images/chips/individual/sheet1-03-110-143-ghz-pa-in-65nm-cmos.png', width: 838, height: 513 },

  // --- Oscillators & VCOs ---
  { id: 6, name: 'Low-Noise 76–82 GHz VCO', technology: '65nm CMOS', frequency: '76–82 GHz', category: 'VCOs & Oscillators', image: '/images/chips/individual/sheet1-02-low-noise-76-82-ghz-vco.png', width: 640, height: 567 },
  { id: 7, name: '3.1–4.7 GHz Class-D VCO', technology: '65nm CMOS', frequency: '3.1–4.7 GHz', category: 'VCOs & Oscillators', image: '/images/chips/individual/sheet1-05-3.1-4.7-ghz-class-d-vco.png', width: 838, height: 425 },
  { id: 8, name: '174–232 GHz SiGe VCO', technology: 'SiGe BiCMOS', frequency: '174–232 GHz', category: 'VCOs & Oscillators', image: '/images/chips/individual/sheet1-06-174-232-ghz-sige-vco.png', width: 772, height: 556 },
  { id: 9, name: '90 GHz Efficient Oscillator', technology: 'CMOS', frequency: '90 GHz', category: 'VCOs & Oscillators', image: '/images/chips/individual/sheet3-02-90-ghz-efficient-oscillator.png', width: 710, height: 624 },

  // --- Sub-THz & THz Sources ---
  { id: 10, name: '0.32 THz SiGe Transmitter', technology: 'SiGe BiCMOS', frequency: '0.32 THz', category: 'Sub-THz & THz Sources', image: '/images/chips/individual/sheet2-0.32-thz-sige-transmitter.png', width: 743, height: 546 },
  { id: 11, name: '0.48 THz Frequency Doubler', technology: 'SiGe BiCMOS', frequency: '0.48 THz', category: 'Sub-THz & THz Sources', image: '/images/chips/individual/sheet2-0.48-thz-frequency-doubler.png', width: 721, height: 554 },
  { id: 12, name: '0.92 THz SiGe Quadrupler', technology: 'SiGe BiCMOS', frequency: '0.92 THz', category: 'Sub-THz & THz Sources', image: '/images/chips/individual/sheet2-0.92-thz-sige-quadrupler.png', width: 741, height: 574 },

  // --- Analog & Specialized ---
  { id: 13, name: '4-Channel TIA for MEMS PNT', technology: 'CMOS', frequency: 'Broadband', category: 'Analog & Special Circuits', image: '/images/chips/individual/sheet2-4-channel-tia-for-mems-pnt.png', width: 745, height: 568 },
  { id: 14, name: '0.1–6 GHz Negative L Circuit', technology: 'CMOS', frequency: '0.1–6 GHz', category: 'Analog & Special Circuits', image: '/images/chips/individual/sheet3-01-0.1-6-ghz-negative-l-circuit.png', width: 563, height: 601 },
];

const categories = ['All', 'Radar Systems', 'Power Generation & PA', 'VCOs & Oscillators', 'Sub-THz & THz Sources', 'Analog & Special Circuits'];

export default function ChipGalleryPage() {
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState<ChipData | null>(null);

  const filtered = filter === 'All' ? chips : chips.filter(c => c.category === filter);

  // Escape closes the enlarged photo, as it would any dialog.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-navy via-eng-blue to-uci-blue-dark text-white py-20 overflow-hidden">
        <CircuitBackground density={35} variant="ic-layout" interactive={false} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader
            as="h1"
            title="Chip Gallery"
            subtitle="High-resolution die photographs of integrated circuits designed and fabricated by the HIE Lab"
            centered
            light
          />
          <div className="text-center mt-2">
            <p className="text-white/50 text-sm">{chips.length} fabricated chips across {categories.length - 1} categories</p>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="sticky top-16 lg:top-20 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div role="group" aria-label="Filter chips by category" className="flex flex-wrap gap-x-7 justify-center">
            {categories.map(cat => {
              const active = filter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  aria-pressed={active}
                  className={`-mb-px border-b-2 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'border-uci-blue text-slate-900 dark:border-uci-gold dark:text-white'
                      : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {cat}
                  <span className="ml-1.5 tabular-nums text-slate-500 dark:text-slate-400">
                    {cat === 'All' ? chips.length : chips.filter(c => c.category === cat).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12 bg-slate-warm min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((chip) => (
                <motion.div
                  key={chip.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="glass-ios rounded-2xl">
                    {/* The photo is a button, so it opens from the keyboard as well as by click. */}
                    <button
                      type="button"
                      onClick={() => setLightbox(chip)}
                      aria-label={`Enlarge ${chip.name}`}
                      className="block w-full cursor-zoom-in bg-gray-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-uci-blue-light"
                    >
                      <Image
                        src={chip.image}
                        alt=""
                        width={chip.width}
                        height={chip.height}
                        className="w-full h-auto"
                        quality={95}
                      />
                    </button>
                    <div className="p-6">
                      <h2 className="font-bold text-eng-blue text-xl leading-snug">{chip.name}</h2>
                      <p className="mt-2 text-sm text-gray-700">{chip.technology}, {chip.frequency}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{chip.category}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No chips match the selected filter.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox — full resolution */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Close"
              className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="absolute top-5 left-5 z-10">
              <p className="text-white font-semibold text-2xl">{lightbox.name}</p>
              <p className="text-white/60 text-base mt-1">{lightbox.technology}, {lightbox.frequency}</p>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-[92vw] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox.image}
                alt={lightbox.name}
                width={lightbox.width * 2}
                height={lightbox.height * 2}
                className="max-h-[85vh] w-auto object-contain rounded-lg shadow-2xl"
                quality={100}
                unoptimized
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
