'use client';

import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
  as?: 'h1' | 'h2';
}

export default function SectionHeader({
  title,
  subtitle,
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
      <Heading className={`text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold ${
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
    </motion.div>
  );
}
