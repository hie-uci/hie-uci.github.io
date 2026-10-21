'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageWrapper from '@/components/PageWrapper';
import SectionHeader from '@/components/SectionHeader';
import CircuitBackground from '@/components/CircuitBackground';

const fieldClass =
  'mt-1.5 w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-md outline-none transition-colors text-gray-800 focus:border-uci-blue focus:ring-2 focus:ring-uci-blue/20';

function Field({ label, type = 'text', name, required }: { label: string; type?: string; name: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={`contact-${name}`} className="text-sm font-medium text-gray-700">{label}</label>
      <input
        id={`contact-${name}`}
        type={type}
        name={name}
        autoComplete={name === 'name' ? 'name' : name === 'email' ? 'email' : undefined}
        required={required}
        className={fieldClass}
      />
    </div>
  );
}

function TextareaField({ label, name, required }: { label: string; name: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={`contact-${name}`} className="text-sm font-medium text-gray-700">{label}</label>
      <textarea id={`contact-${name}`} name={name} required={required} rows={5} className={`${fieldClass} resize-none`} />
    </div>
  );
}

const MAP_URL = 'https://www.google.com/maps/search/?api=1&query=Engineering+Hall%2C+University+of+California%2C+Irvine';

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
                className="glass-ios rounded-2xl p-6"
              >
                <h2 className="text-lg font-bold text-eng-blue mb-4">Contact information</h2>
                <dl className="divide-y divide-panel-line border-y border-panel-line text-sm">
                  <div className="grid grid-cols-[5.5rem_1fr] gap-x-3 py-3">
                    <dt className="text-gray-500">Faculty</dt>
                    <dd>
                      <p className="font-semibold text-gray-800">Hamidreza Aghasi</p>
                      <p className="text-gray-500">Associate Professor, EECS</p>
                    </dd>
                  </div>
                  <div className="grid grid-cols-[5.5rem_1fr] gap-x-3 py-3">
                    <dt className="text-gray-500">Email</dt>
                    <dd><a href="mailto:haghasi@uci.edu" className="font-medium text-uci-blue hover:underline underline-offset-4">haghasi@uci.edu</a></dd>
                  </div>
                  <div className="grid grid-cols-[5.5rem_1fr] gap-x-3 py-3">
                    <dt className="text-gray-500">Phone</dt>
                    <dd><a href="tel:+19498248810" className="font-medium text-gray-800 hover:text-uci-blue">(949) 824-8810</a></dd>
                  </div>
                  <div className="grid grid-cols-[5.5rem_1fr] gap-x-3 py-3">
                    <dt className="text-gray-500">Address</dt>
                    <dd>
                      <p className="text-gray-800">Engineering Hall, University of California, Irvine</p>
                      <p className="text-gray-500">Dept. of Electrical Engineering &amp; Computer Science, Irvine, CA 92697</p>
                      <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block font-medium text-uci-blue hover:underline underline-offset-4">
                        Open in Google Maps
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </dd>
                  </div>
                </dl>
              </motion.div>
            </div>

            {/* Right - Form & Positions */}
            <div className="lg:col-span-3 space-y-6">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-ios rounded-2xl p-6 sm:p-8"
              >
                <h2 className="text-lg font-bold text-eng-blue mb-2">Prepare an email</h2>
                <p className="mb-6 text-sm text-gray-500">
                  This form opens a pre-filled draft in your default email application; it does not send automatically.
                </p>
                {!submitted ? (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Full name" name="name" required />
                      <Field label="Email address" type="email" name="email" required />
                    </div>
                    <Field label="Subject" name="subject" required />
                    <TextareaField label="Message" name="message" required />
                    <button type="submit" className="btn btn-primary w-full">
                      Open Email Draft
                    </button>
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
                className="glass-ios rounded-2xl p-6 sm:p-8"
              >
                <h2 className="text-lg font-bold text-eng-blue mb-3">Available positions</h2>

                <p className="text-gray-600 leading-relaxed mb-5">
                  Review the current postdoctoral, graduate, and undergraduate research pathways,
                  including relevant backgrounds and the materials to send with an inquiry.
                </p>
                <Link
                  href="/available-positions"
                  className="btn btn-gold px-5 py-2.5 text-sm"
                >
                  View positions and application details
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
