'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/PageWrapper';
import SectionHeader from '@/components/SectionHeader';
import CircuitBackground from '@/components/CircuitBackground';
import WaveformDivider from '@/components/WaveformDivider';
import NewsPanel from '@/components/NewsPanel';
import { labNews, newsCategoryLabels, type NewsCategory } from '@/data/news';

type Filter = NewsCategory | 'all';

const filters: Filter[] = ['all', 'award', 'defense', 'publication', 'conference', 'milestone'];

const countOf = (filter: Filter) =>
  filter === 'all' ? labNews.length : labNews.filter(n => n.category === filter).length;

export default function NewsPage() {
  const [filter, setFilter] = useState<Filter>('all');

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
            centered
            light
          />
        </div>
      </section>

      {/* Filter Bar: tabs with an underline, each with its count */}
      <section className="sticky top-16 lg:top-20 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div role="group" aria-label="Filter news by category" className="flex flex-wrap justify-center gap-x-7">
            {filters.map(f => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  aria-pressed={active}
                  className={`-mb-px border-b-2 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'border-uci-blue text-slate-900 dark:border-uci-gold dark:text-white'
                      : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'All' : newsCategoryLabels[f]}
                  <span className="ml-1.5 tabular-nums text-slate-500 dark:text-slate-400">{countOf(f)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <WaveformDivider color="teal" />

      {/* One panel per year */}
      <section className="py-16 bg-slate-warm min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {years.map(year => (
            <motion.div
              key={year}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5 }}
              className="mb-12 last:mb-0"
            >
              <h2 className="mb-4 text-2xl font-bold tabular-nums text-eng-blue dark:text-white">{year}</h2>
              <NewsPanel items={filtered.filter(n => n.year === year)} monthOnly />
            </motion.div>
          ))}

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
