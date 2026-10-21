'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/PageWrapper';
import SectionHeader from '@/components/SectionHeader';
import CircuitBackground from '@/components/CircuitBackground';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const positions = [
  {
    title: 'Postdoctoral Scholars',
    status: 'Actively recruiting',
    text: 'We welcome postdoctoral candidates whose research experience aligns with the laboratory’s high-frequency circuits, devices, and systems programs.',
    backgrounds: ['RF/mm-wave circuit design', 'Microwave theory', 'Solid-state device physics', 'Nonlinear dynamics'],
    materials: ['Cover letter', 'Curriculum vitae', 'Research statement', 'Contact information for 2–3 references'],
    emailSubject: 'HIE Lab postdoctoral scholar inquiry',
  },
  {
    title: 'Graduate Students',
    status: 'Prospective students welcome',
    text: 'Prospective M.S. and Ph.D. students should complete the official UCI graduate application and may also email the lab to introduce their interests and preparation.',
    backgrounds: ['Analog and RF circuit design', 'Microwave engineering', 'Electromagnetics and antennas', 'AI-assisted hardware design'],
    materials: ['Curriculum vitae', 'Unofficial transcripts', 'Brief summary of research interests'],
    emailSubject: 'Prospective HIE Lab graduate student',
    applicationLink: 'https://grad.uci.edu/admissions/applying-to-uci/',
  },
  {
    title: 'Undergraduate Researchers',
    status: 'UCI students welcome',
    text: 'UCI undergraduates interested in mm-wave circuits and related hardware research may contact the lab to discuss preparation and potential projects.',
    backgrounds: ['Circuit analysis and electronics', 'Signals and systems', 'Electromagnetics', 'Programming or numerical methods'],
    materials: ['Unofficial transcript', 'Short summary of research interests', 'Relevant coursework or project experience'],
    emailSubject: 'HIE Lab undergraduate research inquiry',
  },
];

export default function AvailablePositionsPage() {
  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-slate-warm via-white to-white dark:from-eng-blue dark:via-navy dark:to-[#090e17]">
        <CircuitBackground className="opacity-30" density={40} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader
            as="h1"
            title="Available Positions"
            subtitle="Our laboratory always welcomes motivated and enthusiastic new members!"
          />
        </div>
      </section>

      {/* Welcome message */}
      <section className="relative py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-lg text-gray-700 leading-relaxed">
              The HIE Lab at UC Irvine welcomes inquiries from motivated postdoctoral scholars,
              graduate students, and undergraduate researchers interested in advancing high-speed
              integrated electronics.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              Application information updated July 2026.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Position cards */}
      <section className="relative py-16 lg:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="space-y-8"
          >
            {positions.map((pos, i) => (
              <motion.div
                key={pos.title}
                variants={fadeUp}
                custom={i}
                className="glass-ios rounded-2xl"
              >
                <div className="p-8">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h2 className="text-2xl font-bold text-eng-blue">{pos.title}</h2>
                    <p className="text-sm font-medium text-teal-700 dark:text-teal-300">{pos.status}</p>
                  </div>
                  <p className="mt-4 text-gray-700 leading-relaxed">{pos.text}</p>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold text-eng-blue">Relevant backgrounds</h3>
                      <ul className="mt-3 space-y-2 text-sm text-gray-600">
                        {pos.backgrounds.map((background) => (
                          <li key={background} className="flex items-start gap-2">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                            {background}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-eng-blue">What to send</h3>
                      <ul className="mt-3 space-y-2 text-sm text-gray-600">
                        {pos.materials.map((material) => (
                          <li key={material} className="flex items-start gap-2">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                            {material}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <a
                      href={`mailto:haghasi@uci.edu?subject=${encodeURIComponent(pos.emailSubject)}`}
                      className="btn btn-primary px-5 py-2.5 text-sm"
                    >
                      Email the lab
                    </a>
                    {'applicationLink' in pos && pos.applicationLink ? (
                      <a
                        href={pos.applicationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline px-5 py-2.5 text-sm"
                      >
                        UCI graduate application
                      </a>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative py-16 lg:py-20 bg-gradient-to-br from-eng-blue via-navy to-eng-blue overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%">
            <pattern id="pos-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#pos-grid)" />
          </svg>
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Interested?</h2>
            <p className="text-lg text-white/60 mb-8 leading-relaxed">
              Reach out to Prof. Hamidreza Aghasi to discuss opportunities.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="mailto:haghasi@uci.edu"
                className="btn btn-lg btn-gold"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                Email haghasi@uci.edu
              </a>
              <Link
                href="/contact"
                className="btn btn-lg btn-on-dark"
              >
                Contact Page
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
}
