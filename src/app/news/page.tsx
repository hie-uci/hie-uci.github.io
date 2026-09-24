'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/PageWrapper';
import SectionHeader from '@/components/SectionHeader';
import CircuitBackground from '@/components/CircuitBackground';
import WaveformDivider from '@/components/WaveformDivider';
import { labNews, type NewsCategory } from '@/data/news';

const categoryConfig: Record<NewsCategory, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
  award: {
    color: 'text-uci-gold',
    bg: 'bg-uci-gold/10',
    border: 'border-uci-gold/30',
    label: 'Award',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  defense: {
    color: 'text-eecs-teal',
    bg: 'bg-eecs-teal/10',
    border: 'border-eecs-teal/30',
    label: 'Defense',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
      </svg>
    ),
  },
  publication: {
    color: 'text-uci-blue',
    bg: 'bg-uci-blue/10',
    border: 'border-uci-blue/30',
    label: 'Publication',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
    ),
  },
  conference: {
    color: 'text-eng-gold',
    bg: 'bg-eng-gold/10',
    border: 'border-eng-gold/30',
    label: 'Conference',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
      </svg>
    ),
  },
  milestone: {
    color: 'text-accent-glow',
    bg: 'bg-accent-glow/10',
    border: 'border-accent-glow/30',
    label: 'Milestone',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z" />
      </svg>
    ),
  },
};

const categories: NewsCategory[] = ['award', 'defense', 'publication', 'conference', 'milestone'];

export default function NewsPage() {
  const [filter, setFilter] = useState<NewsCategory | 'all'>('all');

  const filtered = filter === 'all' ? labNews : labNews.filter(n => n.category === filter);

  const years = [...new Set(filtered.map(n => n.year))].sort((a, b) => b - a);

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-eng-blue via-navy to-uci-blue-dark text-white py-20 overflow-hidden">
        <CircuitBackground density={30} variant="radar" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader
            as="h1"
            title="News & Highlights"
            subtitle="Latest achievements, publications, and milestones from the HIE Lab"
            badge="Stay Updated"
            centered
            light
          />
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-16 lg:top-20 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setFilter('all')}
              aria-pressed={filter === 'all'}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-eng-blue text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                aria-pressed={filter === cat}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  filter === cat
                    ? `${categoryConfig[cat].bg} ${categoryConfig[cat].color} border ${categoryConfig[cat].border} shadow-md`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className={filter === cat ? categoryConfig[cat].color : 'text-gray-400'}>
                  {categoryConfig[cat].icon}
                </span>
                {categoryConfig[cat].label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <WaveformDivider color="teal" />

      {/* Timeline */}
      <section className="py-16 bg-slate-warm min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {years.map(year => {
            const yearItems = filtered.filter(n => n.year === year);
            return (
              <div key={year} className="mb-12">
                {/* Year Divider */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 mb-8"
                >
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-uci-blue/20" />
                  <h2 className="text-2xl font-bold text-eng-blue bg-white px-6 py-2 rounded-full shadow-md border border-uci-blue/10">
                    {year}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-uci-blue/20" />
                </motion.div>

                {/* Timeline Items */}
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-uci-blue/30 via-eecs-teal/20 to-uci-gold/30 hidden md:block" />
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-uci-blue/30 via-eecs-teal/20 to-uci-gold/30 md:hidden" />

                  {yearItems.map((item, idx) => {
                    const isLeft = idx % 2 === 0;
                    const config = categoryConfig[item.category];
                    return (
                      <motion.div
                        key={`${item.date}-${idx}`}
                        initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-30px' }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className={`relative flex items-center mb-8 ${
                          isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                        }`}
                      >
                        {/* Mobile layout - always left aligned */}
                        <div className="md:hidden flex items-start gap-4 w-full pl-2">
                          {/* Node */}
                          <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full ${config.bg} border-2 ${config.border} flex items-center justify-center ${config.color}`}>
                            {config.icon}
                          </div>
                          {/* Card */}
                          <div className="flex-1 glass rounded-xl p-4 shadow-md card-hover hover:shadow-lg hover:shadow-uci-blue/8">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.color} mb-2`}>
                              {config.icon}
                              {config.label}
                            </span>
                            {item.link ? (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-800 font-medium text-sm leading-relaxed hover:text-uci-blue hover:underline underline-offset-2"
                              >
                                {item.title}
                              </a>
                            ) : (
                              <p className="text-gray-800 font-medium text-sm leading-relaxed">{item.title}</p>
                            )}
                            <span className="text-xs text-gray-400 mt-2 block">{item.date}</span>
                          </div>
                        </div>

                        {/* Desktop layout - alternating */}
                        <div className={`hidden md:flex items-center w-full`}>
                          {/* Left content */}
                          <div className={`w-[calc(50%-24px)] ${isLeft ? '' : 'order-2'}`}>
                            <div className={`glass rounded-xl p-5 shadow-md card-hover hover:shadow-lg hover:shadow-uci-blue/8 ${isLeft ? 'mr-4 text-right' : 'ml-4 text-left'}`}>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.color} mb-2`}>
                                {config.icon}
                                {config.label}
                              </span>
                              {item.link ? (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-800 font-medium leading-relaxed hover:text-uci-blue hover:underline underline-offset-2"
                                >
                                  {item.title}
                                </a>
                              ) : (
                                <p className="text-gray-800 font-medium leading-relaxed">{item.title}</p>
                              )}
                              <span className="text-xs text-gray-400 mt-2 block">{item.date}</span>
                            </div>
                          </div>

                          {/* Center node */}
                          <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full ${config.bg} border-2 ${config.border} flex items-center justify-center ${config.color} shadow-lg bg-white ${isLeft ? '' : 'order-1'}`}>
                            {config.icon}
                          </div>

                          {/* Spacer */}
                          <div className={`w-[calc(50%-24px)] ${isLeft ? 'order-2' : 'order-0'}`} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No news items match the selected filter.</p>
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
}
