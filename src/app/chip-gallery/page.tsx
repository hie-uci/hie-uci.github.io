'use client';

import { useState } from 'react';
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
            badge="Silicon Showcase"
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === cat
                    ? 'bg-eng-blue text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
                {cat !== 'All' && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({chips.filter(c => c.category === cat).length})
                  </span>
                )}
              </button>
            ))}
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
                  className="group cursor-zoom-in"
                  onClick={() => setLightbox(chip)}
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:border-uci-blue/20 transition-all duration-300">
                    {/* Die photo — large */}
                    <div className="relative bg-gray-50 overflow-hidden">
                      <Image
                        src={chip.image}
                        alt={chip.name}
                        width={chip.width}
                        height={chip.height}
                        className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                        quality={95}
                      />
                      {/* Hover zoom hint */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="bg-white/90 backdrop-blur-sm text-eng-blue font-medium px-4 py-1.5 rounded-full text-xs shadow-lg flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                          Click to enlarge
                        </span>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-6">
                      <h2 className="font-bold text-eng-blue text-xl leading-snug">{chip.name}</h2>
                      <div className="mt-3 flex flex-wrap gap-2.5">
                        <span className="px-3 py-1 rounded-full bg-uci-blue/8 text-uci-blue text-sm font-medium border border-uci-blue/10">
                          {chip.technology}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-eecs-teal/8 text-eecs-teal text-sm font-medium border border-eecs-teal/10">
                          {chip.frequency}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-sm font-medium">
                          {chip.category}
                        </span>
                      </div>
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
              onClick={() => setLightbox(null)}
              className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="absolute top-5 left-5 z-10">
              <p className="text-white font-semibold text-2xl">{lightbox.name}</p>
              <p className="text-white/60 text-base mt-1">{lightbox.technology} · {lightbox.frequency}</p>
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
