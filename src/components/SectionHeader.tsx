'use client';

import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  centered?: boolean;
  light?: boolean;
  as?: 'h1' | 'h2';
}

export default function SectionHeader({
  title,
  subtitle,
  badge,
  centered = true,
  light = false,
  as = 'h2',
}: SectionHeaderProps) {
  const Heading = as;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${centered ? 'text-center' : ''}`}
    >
      {badge && (
        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 ${
          light
            ? 'bg-white/10 text-white/80 border border-white/20'
            : 'bg-uci-blue/5 text-uci-blue border border-uci-blue/10'
        }`}>
          {badge}
        </span>
      )}
      <Heading className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${
        light ? 'text-white' : 'text-eng-blue dark:text-white'
      }`}>
        {title}
      </Heading>
      {subtitle && (
        <p className={`mt-4 text-lg max-w-2xl ${centered ? 'mx-auto' : ''} ${
          light ? 'text-white/70' : 'text-slate-800 dark:text-slate-300'
        }`}>
          {subtitle}
        </p>
      )}
      <div className={`mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-uci-blue to-uci-gold ${centered ? 'mx-auto' : ''}`} />
    </motion.div>
  );
}
