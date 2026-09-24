'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageWrapper from '@/components/PageWrapper';
import SectionHeader from '@/components/SectionHeader';
import CircuitBackground from '@/components/CircuitBackground';

function FloatingInput({ label, type = 'text', name, required }: { label: string; type?: string; name: string; required?: boolean }) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');
  const isActive = focused || value.length > 0;

  return (
    <div className="relative">
      <input
        id={`contact-${name}`}
        type={type}
        name={name}
        autoComplete={name === 'name' ? 'name' : name === 'email' ? 'email' : undefined}
        required={required}
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-4 pt-6 pb-2 bg-white border-2 border-gray-200 rounded-xl outline-none transition-all duration-200 text-gray-800 focus:border-uci-blue focus:shadow-[0_0_0_3px_rgba(0,100,164,0.1)]"
      />
      <label
        htmlFor={`contact-${name}`}
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          isActive
            ? 'top-2 text-xs font-semibold text-uci-blue'
            : 'top-4 text-sm text-gray-400'
        }`}
      >
        {label}
      </label>
    </div>
  );
}

function FloatingTextarea({ label, name, required }: { label: string; name: string; required?: boolean }) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');
  const isActive = focused || value.length > 0;

  return (
    <div className="relative">
      <textarea
        id={`contact-${name}`}
        name={name}
        required={required}
        rows={5}
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-4 pt-6 pb-2 bg-white border-2 border-gray-200 rounded-xl outline-none transition-all duration-200 text-gray-800 resize-none focus:border-uci-blue focus:shadow-[0_0_0_3px_rgba(0,100,164,0.1)]"
      />
      <label
        htmlFor={`contact-${name}`}
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          isActive
            ? 'top-2 text-xs font-semibold text-uci-blue'
            : 'top-4 text-sm text-gray-400'
        }`}
      >
        {label}
      </label>
    </div>
  );
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const subject = String(formData.get('subject') ?? 'HIE Lab inquiry').trim() || 'HIE Lab inquiry';
    const message = String(formData.get('message') ?? '').trim();
    const body = [`Name: ${name}`, `Email: ${email}`, '', message].join('\n');

    window.location.href = `mailto:haghasi@uci.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  };

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-eng-blue via-navy to-uci-blue-dark text-white py-20 overflow-hidden">
        <CircuitBackground density={25} variant="thz-waves" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader
            as="h1"
            title="Contact Us"
            subtitle="Get in touch with the HIE Lab at UC Irvine"
            badge="Reach Out"
            centered
            light
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-slate-warm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left - Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass rounded-2xl p-6 shadow-lg"
              >
                <h2 className="text-lg font-bold text-eng-blue mb-5">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-uci-blue/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-uci-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Hamidreza Aghasi</p>
                      <p className="text-sm text-gray-500">Associate Professor, EECS</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-uci-blue/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-uci-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">haghasi@uci.edu</p>
                      <p className="text-sm text-gray-500">Email</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-uci-blue/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-uci-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">(949) 824-8810</p>
                      <p className="text-sm text-gray-500">Phone</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-uci-blue/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-uci-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">University of California, Irvine</p>
                      <p className="text-sm text-gray-500">Dept. of Electrical Engineering & Computer Science</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Map Placeholder */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl overflow-hidden shadow-lg"
              >
                <div className="relative h-48 bg-gradient-to-br from-uci-blue/5 to-eecs-teal/5 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-10 h-10 text-uci-blue/40 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-600">Engineering Hall, UC Irvine</p>
                    <p className="text-xs text-gray-400">Irvine, CA 92697</p>
                  </div>
                  {/* Decorative grid */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="w-full h-full" style={{
                      backgroundImage: 'linear-gradient(rgba(0,100,164,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,100,164,0.3) 1px, transparent 1px)',
                      backgroundSize: '30px 30px',
                    }} />
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Right - Form & Positions */}
            <div className="lg:col-span-3 space-y-6">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass rounded-2xl p-6 sm:p-8 shadow-lg"
              >
                <h2 className="text-lg font-bold text-eng-blue mb-2">Prepare an Email</h2>
                <p className="mb-6 text-sm text-gray-500">
                  This form opens a pre-filled draft in your default email application; it does not send automatically.
                </p>
                {!submitted ? (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FloatingInput label="Full Name" name="name" required />
                      <FloatingInput label="Email Address" type="email" name="email" required />
                    </div>
                    <FloatingInput label="Subject" name="subject" required />
                    <FloatingTextarea label="Message" name="message" required />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-uci-blue to-uci-blue-light text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                      Open Email Draft
                    </motion.button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Email Draft Opened</h3>
                    <p className="text-gray-500 text-sm mb-4">Please review and send the prepared email from your mail app.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-uci-blue font-medium text-sm hover:underline"
                    >
                      Prepare another email
                    </button>
                  </motion.div>
                )}
              </motion.div>

              {/* Available Positions */}
              <motion.div
                id="positions"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6 sm:p-8 shadow-lg border border-uci-gold/20"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-uci-gold/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-uci-gold" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-eng-blue">Available Positions</h2>
                </div>

                <p className="text-gray-600 leading-relaxed mb-5">
                  Review the current postdoctoral, graduate, and undergraduate research pathways,
                  including relevant backgrounds and the materials to send with an inquiry.
                </p>
                <Link
                  href="/available-positions"
                  className="inline-flex items-center gap-2 rounded-xl bg-uci-gold px-5 py-2.5 text-sm font-bold text-eng-blue transition-transform hover:-translate-y-0.5"
                >
                  View positions and application details
                  <span aria-hidden="true">→</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
