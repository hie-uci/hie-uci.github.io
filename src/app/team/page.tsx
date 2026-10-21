'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { GraduationCap } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import SectionHeader from '@/components/SectionHeader';
import CircuitBackground from '@/components/CircuitBackground';
import { serializeJsonLd, SITE_URL } from '@/lib/metadata';

// --------------- data ---------------

const director = {
  name: 'Prof. Hamidreza Aghasi',
  initials: 'HA',
  image: '/images/members/pi-aghasi.jpeg',
  title: 'Associate Professor of EECS',
  email: 'haghasi@uci.edu',
  phone: '(949)-824-8810',
  education: 'B.Sc. in Electrical Engineering, Sharif University of Technology, Tehran, Iran (2011); M.S. and Ph.D. in Electrical Engineering, Cornell University (2015, 2017)',
  expertise: 'mm-wave and terahertz electronics for applications in communication, biomedical imaging, and molecular spectroscopy',
  experience: [
    'Samsung Research America Display Lab Intern (Summer 2014)',
    'Postdoctoral Fellow, University of Michigan (2017–2018)',
    'mm-Wave Research Scientist, Acacia Communications Inc. (2018–2019)',
  ],
  service: [
    'Associate Editor, IEEE Transactions on VLSI Systems (2025–present)',
    'Technical Program Committee, IEEE CICC (2020–present)',
    'Technical Program Committee, IEEE RFIC (2024–present)',
  ],
  memberships: [
    'Senior Member, IEEE',
    'IEEE Solid-State Circuits Society',
    'IEEE Microwave Theory and Techniques Society',
  ],
  achievements: [
    'NSF CAREER Award (2025)',
    'NeurIPS ML4PS Reproducibility Award (2024)',
    'Best Invited Paper Award, IEEE CICC (2019)',
    'Cornell Graduate Fellowship (2011)',
    'Jacobs Fellowship (2012)',
    'Cornell ECE Innovation Award (2013)',
    'Cornell Scale-Up and Prototyping Award (2017)',
  ],
};

const directorJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/team/#hamidreza-aghasi`,
  name: 'Hamidreza Aghasi',
  honorificPrefix: 'Prof.',
  image: `${SITE_URL}${director.image}`,
  jobTitle: director.title,
  email: director.email,
  telephone: director.phone,
  url: `${SITE_URL}/team/`,
  affiliation: {
    '@type': 'CollegeOrUniversity',
    name: 'University of California, Irvine',
    url: 'https://uci.edu',
  },
  memberOf: {
    '@id': `${SITE_URL}/#organization`,
  },
  knowsAbout: [
    'Millimeter-wave integrated circuits',
    'Terahertz electronics',
    'Radar systems',
    'AI-driven circuit design',
  ],
};

interface Member {
  name: string;
  /** Google Scholar profile. Present only where the profile was verified as
      belonging to this person -- a wrong link here misattributes real work. */
  scholar?: string;
  initials: string;
  image: string;
  focus: string;
  bio: string;
}

const phdStudents: Member[] = [
  { name: 'Md Hedayatullah Maktoomi', scholar: 'https://scholar.google.com/citations?user=WlRBLIUAAAAJ', initials: 'MH', image: '/images/members/phd-maktoomi.png', focus: 'RF/microwave and power amplifier design', bio: 'B. Engg. from Jamia Millia Islamia, New Delhi (2015), M.S. from Washington State University (2020). Intern and research assistant at IIIT Delhi (2016-2017) on passive RF/microwave circuits. RF engineering intern at Wolfspeed Inc. (2019) working on Doherty power amplifier design. Published in IEEE TCAS-II and IEEE TMTT. Frequent reviewer for multiple IEEE journals.' },
  { name: 'Mahdi Alesheikh', scholar: 'https://scholar.google.com/citations?user=gA_Bu2YAAAAJ', initials: 'MA', image: '/images/members/phd-alesheikh.png', focus: 'Analog/RF circuits', bio: 'BSc in Electronics from Sharif University of Technology, Tehran, Iran. BSc thesis on IoT circuits under Prof. Safarian. MSc in ECE from University of Alberta, with master\'s work on RFIC and microwave circuits under Prof. Karumudi and Hossain. Currently pursuing PhD at UCI.' },
  { name: 'Yilun (Allen) Huang', scholar: 'https://scholar.google.com/citations?user=Fpr6OqsAAAAJ', initials: 'YH', image: '/images/members/phd-allen-huang.png', focus: 'Analog, RF, and mm-wave circuits, AI-driven IC design', bio: 'received the B.S. from Iowa State (2022) and M.S. from UCLA (2024). Currently a Ph.D. student at UCI, his research focuses on analog, RF, and mm-wave IC design, and AI-driven optimization for circuits and radar systems.' },
  { name: 'Zhengyang (Mark) Zhang', scholar: 'https://scholar.google.com/citations?user=L1xO0-0AAAAJ', initials: 'ZZ', image: '/images/members/phd-mark-zhang.png', focus: 'Radar, Analog/mixed-signal/RF circuits', bio: 'BSEE (2024) from SUSTech, Shenzhen, China, with work on integrated power management for wireline transceivers. MSEE (2026) from UCI. Currently pursuing PhD at UCI. Current research focuses on radar systems.' },
  { name: 'Mohammadamin (Amin) Montazar', initials: 'AM', image: '/images/members/phd-montazar.png', focus: 'mm-wave and terahertz integrated circuits', bio: 'B.S. and M.S. in Electrical Engineering from UC Davis (2020, 2022). Under Prof. Omeed Momeni, designed LC VCO in C-band with thesis on low power, low phase noise VCO for PLL applications. Senior RF Design Engineer for two years specializing in military communication systems VHF to C-Band.' },
  { name: 'Yuncheng Tu', initials: 'YT', image: '/images/members/phd-yuncheng-tu.png', focus: 'Analog, RF, and mm-wave circuits', bio: 'B.S. in Electrical Engineering from Southern University of Science and Technology, Shenzhen, China (2025). Currently pursuing Ph.D. at UCI.' },
];

const undergradResearchers: Member[] = [
  { name: 'Albert Huang', initials: 'AH', image: '/images/members/undergrad-albert-huang.png', focus: 'Analog circuit design', bio: 'Pursuing BSc in Electrical and Computer Engineering at UCI, specializing in Electronic Circuit Design, Semiconductors, and RF, Antennas, and Microwaves.' },
];

interface Alumnus {
  name: string;
  scholar?: string;
  initials: string;
  image: string;
  detail: string;
  now?: string;
  bio?: string;
}

const phdAlumni: Alumnus[] = [
  { name: 'Masoud Berahman', scholar: 'https://scholar.google.com/citations?user=BZgCwmkAAAAJ', initials: 'MB', image: '/images/members/alumni-berahman.png', detail: 'Ph.D./Postdoc', now: undefined, bio: 'Completed PhD in electrical engineering and postdoctoral fellowship in physics. Primary research interests in two and one-dimensional materials applications in future electronic devices.' },
  { name: 'Xuyang Liu', scholar: 'https://scholar.google.com/citations?user=X43HexAAAAAJ', initials: 'XL', image: '/images/members/alumni-xuyang-liu.png', detail: '2020-2025', now: 'Staff Engineer, Marvell Technology', bio: 'BS in Electronic Information Engineering from Jilin University, China (2018), MS in Electrical Engineering from Columbia University (2019), PhD from UCI (2025). Research interests in mmWave front-end, VCO and PLL, FMCW radar system.' },
  { name: 'Behnam Moradi Shahrbabak', initials: 'BM', image: '/images/members/alumni-behnam.jpg', detail: '2019-2024', now: 'Senior RFIC Engineer, Kyocera', bio: 'Research interests in analog, RF, millimeter-wave circuits, and system design.' },
];

const otherAlumni: Alumnus[] = [
  { name: 'Xuzhe Zhao', initials: 'XZ', image: '/images/members/alumni-xuzhe-zhao.png', detail: 'M.S.' },
  { name: 'Tanqin He', initials: 'TH', image: '/images/members/alumni-tanqin-he.png', detail: 'M.S.' },
  { name: 'Pooya Khajeh', initials: 'PK', image: '/images/members/alumni-pooya.jpg', detail: 'M.S.', now: 'R&D Test Engineer, Broadcom' },
  { name: 'Wei Dai', initials: 'WD', image: '/images/members/undergrad-wei-dai.png', detail: 'B.Sc.' },
  { name: 'Mengjie (Kaylee) Xie', initials: 'MX', image: '/images/members/alumni-annika.png', detail: 'B.Sc.', now: 'Graduate Student, Stanford' },
  { name: 'Kelly Aung Lu', initials: 'KL', image: '/images/members/alumni-kaylee.jpg', detail: 'B.Sc.' },
  { name: 'Annika Ageles Del Rosario', initials: 'AA', image: '/images/members/alumni-kelly.jpg', detail: 'B.Sc.', now: 'Hardware Engineer, Western Digital' },
  { name: 'Marcus Clark Wong', initials: 'MW', image: '/images/members/alumni-marcus.png', detail: 'B.Sc.', now: 'PhD Student, UCSC' },
  { name: 'Shihao Han', initials: 'SH', image: '/images/members/alumni-shihao.png', detail: 'M.S.' },
  { name: 'Yankai Yang', initials: 'YY', image: '/images/members/alumni-yankai.png', detail: 'M.S.' },
];

// --------------- animation helpers ---------------

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

// --------------- sub-components ---------------

function ScholarLink({ href, name }: { href: string; name: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} on Google Scholar`}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 text-[11px] font-medium text-uci-blue/80 hover:text-uci-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uci-gold transition-colors"
    >
      <GraduationCap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      Google Scholar
    </a>
  );
}

/** Portraits sit in a circle at their stored crop; a few need their own focal point. */
function photoPosition(name: string) {
  if (name.includes('Allen') || name.includes('Yilun')) return 'object-center';
  if (name.includes('Behnam')) return 'object-[center_25%]';
  return 'object-[center_15%]';
}

function MemberCard({ member, label = 'PhD student' }: { member: Member; label?: string }) {
  return (
    <motion.div variants={cardVariants} className="glass-ios rounded-2xl p-6 flex flex-col items-center text-center">
      <Image
        src={member.image}
        alt={member.name}
        width={120}
        height={120}
        className={`w-28 h-28 rounded-full object-cover ${photoPosition(member.name)} ring-1 ring-black/5 dark:ring-white/10`}
      />
      <h3 className="mt-4 font-bold text-eng-blue text-base leading-tight">{member.name}</h3>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-uci-blue">{member.focus}</p>
      {member.scholar && (
        <div className="mt-2">
          <ScholarLink href={member.scholar} name={member.name} />
        </div>
      )}
      {member.bio && <p className="mt-4 text-left text-[13px] leading-relaxed text-gray-500">{member.bio}</p>}
    </motion.div>
  );
}

function AlumnusCard({ alumnus }: { alumnus: Alumnus }) {
  return (
    <motion.div variants={cardVariants} className="glass-ios rounded-2xl p-6 flex flex-col items-center text-center">
      <Image
        src={alumnus.image}
        alt={alumnus.name}
        width={120}
        height={120}
        className={`w-24 h-24 rounded-full object-cover ${photoPosition(alumnus.name)} ring-1 ring-black/5 dark:ring-white/10`}
      />
      <h3 className="mt-4 font-bold text-eng-blue text-base leading-tight">{alumnus.name}</h3>
      <p className="mt-1 text-sm text-gray-500">{alumnus.detail}</p>
      {alumnus.now && <p className="mt-2 text-sm font-medium text-teal-700 dark:text-teal-300">Currently {alumnus.now}</p>}
      {alumnus.scholar && (
        <div className="mt-2">
          <ScholarLink href={alumnus.scholar} name={alumnus.name} />
        </div>
      )}
      {alumnus.bio && <p className="mt-4 text-left text-[13px] leading-relaxed text-gray-500">{alumnus.bio}</p>}
    </motion.div>
  );
}

/** Earlier members as rows of one panel: who, which degree, where they are now. */
function AlumniList({ alumni }: { alumni: Alumnus[] }) {
  return (
    <motion.ul
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto glass-ios rounded-2xl divide-y divide-panel-line"
    >
      {alumni.map((a) => (
        <li key={a.name} className="flex items-center gap-4 px-5 py-3 sm:px-6">
          <Image
            src={a.image}
            alt={a.name}
            width={80}
            height={80}
            className={`w-10 h-10 shrink-0 rounded-full object-cover ${photoPosition(a.name)}`}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-eng-blue">{a.name}</p>
            <p className="text-xs text-gray-500">{a.detail}</p>
          </div>
          {a.now && <p className="text-right text-sm text-teal-700 dark:text-teal-300"><span className="sr-only">Currently </span>{a.now}</p>}
        </li>
      ))}
    </motion.ul>
  );
}

export default function TeamPage() {
  return (
    <PageWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(directorJsonLd) }}
      />
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-eng-blue via-navy to-eng-blue py-24 overflow-hidden">
        <CircuitBackground density={50} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader as="h1" title="Our Team" subtitle="Meet the researchers driving innovation in high-frequency integrated electronics at UCI." centered light />
        </div>
      </section>

      {/* Director */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="rounded-2xl bg-[#ffffff] dark:bg-[#0b1220] border border-panel-line">
          <div className="p-8 sm:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="shrink-0">
              <Image src={director.image} alt={director.name} width={176} height={176} className="w-44 h-44 rounded-full object-cover object-[center_15%] ring-1 ring-black/5 dark:ring-white/10" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-eng-blue">{director.name}</h2>
              <p className="text-uci-blue font-medium mt-1">{director.title}</p>
              <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start text-sm text-gray-500">
                <a href={`mailto:${director.email}`} className="hover:text-uci-blue transition-colors">{director.email}</a>
                <span className="hidden sm:inline text-gray-300">|</span>
                <span>{director.phone}</span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Education</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{director.education}</p>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Research focus</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{director.expertise}</p>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Experience</h3>
                <ul className="space-y-1">
                  {director.experience.map((e) => (
                    <li key={e} className="text-sm text-gray-500 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-400 mt-2 shrink-0" />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Professional service</h3>
                <ul className="space-y-1">
                  {director.service.map((s) => (
                    <li key={s} className="text-sm text-gray-500 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-400 mt-2 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Memberships</h3>
                <ul className="space-y-1">
                  {director.memberships.map((m) => (
                    <li key={m} className="text-sm text-gray-500 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-400 mt-2 shrink-0" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Awards & honors</h3>
                <ul className="space-y-1.5">
                  {director.achievements.map((a) => (
                    <li key={a} className="text-sm text-gray-500 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-400 mt-2 shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* PhD Students */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <SectionHeader title="PhD Students" subtitle="Current doctoral researchers advancing the frontiers of integrated electronics." />
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {phdStudents.map((m) => (
            <MemberCard key={m.name} member={m} />
          ))}
        </motion.div>
      </section>

      {/* Undergraduate Researchers */}
      <section className="py-20 bg-white/35 dark:bg-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader title="Undergraduate Researchers" />
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {undergradResearchers.map((m) => (
              <MemberCard key={m.name} member={m} label="Undergraduate researcher" />
            ))}
          </motion.div>
        </div>
      </section>

      {/* PhD / Postdoc Alumni */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <SectionHeader title="PhD & Postdoc Alumni" />
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {phdAlumni.map((a) => (
            <AlumnusCard key={a.name} alumnus={a} />
          ))}
        </motion.div>
      </section>

      {/* Other Alumni */}
      <section className="py-20 bg-white/35 dark:bg-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader title="Other Alumni" />
          <AlumniList alumni={otherAlumni} />
        </div>
      </section>
    </PageWrapper>
  );
}
