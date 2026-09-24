import Link from 'next/link';
import PageHero from '@/components/PageHero';
import PageWrapper from '@/components/PageWrapper';
import Shell from '@/components/Shell';
import ContactForm from '@/components/contact/ContactForm';
import { contact } from '@/data/site';

const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Engineering+Hall%2C+University+of+California%2C+Irvine';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-t border-line py-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
      <dt className="kicker pt-0.5 text-[10.5px]">{label}</dt>
      <dd className="text-[15px] leading-relaxed">{children}</dd>
    </div>
  );
}

export default function ContactPage() {
  return (
    <PageWrapper>
      <PageHero trail="Contact" title="Contact Us" lede="Get in touch with the HIE Lab at UC Irvine." />
      <Shell className="py-16 lg:py-24">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          <section aria-labelledby="directory-heading" className="lg:col-span-5">
            <h2 id="directory-heading" className="kicker">
              Directory
            </h2>
            <dl className="mt-5 border-b border-line">
              <Row label="Director">
                <span className="font-semibold">Hamidreza Aghasi</span>
                <span className="block text-ink-2">Associate Professor, EECS</span>
              </Row>
              <Row label="Email">
                <a href={`mailto:${contact.email}`} className="link-inline font-mono text-[14px] [font-stretch:87.5%]">
                  {contact.email}
                </a>
              </Row>
              <Row label="Phone">
                <a href={contact.phoneHref} className="font-mono text-[14px] transition-colors [font-stretch:87.5%] hover:text-accent-ink">
                  {contact.phone}
                </a>
              </Row>
              <Row label="Address">
                {contact.university}
                <span className="block text-ink-2">{contact.department}</span>
                <span className="block text-ink-2">Engineering Hall · {contact.city}</span>
                <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="link-arrow mt-3 text-[14px]">
                  Open in Maps <span className="arrow">↗</span>
                </a>
              </Row>
            </dl>

            <div className="ticks ticks-marker mt-12 border border-line p-6">
              <p className="kicker text-marker-ink">Available positions</p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
                Review the current postdoctoral, graduate, and undergraduate research pathways, including relevant backgrounds and the materials to send with an inquiry.
              </p>
              <Link href="/available-positions/" className="link-arrow mt-5">
                View positions and application details <span className="arrow">→</span>
              </Link>
            </div>
          </section>

          <section aria-labelledby="email-heading" className="lg:col-span-7">
            <h2 id="email-heading" className="kicker">
              Prepare an email
            </h2>
            <p className="lede mt-5 max-w-xl">This form opens a pre-filled draft in your default email application; it does not send automatically.</p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </section>
        </div>
      </Shell>
    </PageWrapper>
  );
}
