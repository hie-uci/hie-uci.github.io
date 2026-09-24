'use client';

import { useId, useState, type FormEvent } from 'react';
import { contact } from '@/data/site';

function Field({ label, name, type = 'text', autoComplete, multiline = false }: { label: string; name: string; type?: string; autoComplete?: string; multiline?: boolean }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {multiline ? (
        <textarea id={id} name={name} required rows={6} className="field-input resize-y py-3 leading-relaxed" />
      ) : (
        <input id={id} name={name} type={type} required autoComplete={autoComplete} className="field-input" />
      )}
    </div>
  );
}

/**
 * Builds a mailto: draft in the visitor's own mail app. The site is static, so
 * nothing is sent from here; the note under the heading says so.
 */
export default function ContactForm() {
  const [drafted, setDrafted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const read = (key: string) => String(data.get(key) ?? '').trim();
    const subject = read('subject') || 'HIE Lab inquiry';
    const body = [`Name: ${read('name')}`, `Email: ${read('email')}`, '', read('message')].join('\n');
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setDrafted(true);
  };

  if (drafted) {
    return (
      <div className="border-t border-line-strong py-10" role="status">
        <p className="kicker text-marker-ink">Draft opened</p>
        <p className="display-3 mt-4">Review and send it from your mail app.</p>
        <button type="button" onClick={() => setDrafted(false)} className="link-arrow mt-6">
          Prepare another email <span className="arrow">→</span>
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" autoComplete="name" />
        <Field label="Email address" name="email" type="email" autoComplete="email" />
      </div>
      <Field label="Subject" name="subject" />
      <Field label="Message" name="message" multiline />
      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button type="submit" className="btn btn-primary">
          Open email draft <span aria-hidden="true">→</span>
        </button>
        <p className="text-[13px] text-ink-3">Opens in your mail app. Nothing is sent from this page.</p>
      </div>
    </form>
  );
}
