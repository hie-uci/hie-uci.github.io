'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
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
  initials: string;
  image: string;
  focus: string;
  bio: string;
  gradientFrom: string;
  gradientTo: string;
}

const phdStudents: Member[] = [
  { name: 'Md Hedayatullah Maktoomi', initials: 'MH', image: '/images/members/phd-maktoomi.png', focus: 'RF/microwave and power amplifier design', bio: 'B. Engg. from Jamia Millia Islamia, New Delhi (2015), M.S. from Washington State University (2020). Intern and research assistant at IIIT Delhi (2016-2017) on passive RF/microwave circuits. RF engineering intern at Wolfspeed Inc. (2019) working on Doherty power amplifier design. Published in IEEE TCAS-II and IEEE TMTT. Frequent reviewer for multiple IEEE journals.', gradientFrom: 'from-uci-blue', gradientTo: 'to-eecs-teal' },
  { name: 'Mahdi Alesheikh', initials: 'MA', image: '/images/members/phd-alesheikh.png', focus: 'Analog/RF circuits', bio: 'BSc in Electronics from Sharif University of Technology, Tehran, Iran. BSc thesis on IoT circuits under Prof. Safarian. MSc in ECE from University of Alberta, with master\'s work on RFIC and microwave circuits under Prof. Karumudi and Hossain. Currently pursuing PhD at UCI.', gradientFrom: 'from-eng-blue', gradientTo: 'to-uci-gold' },
  { name: 'Allen (Yilun) Huang', initials: 'AH', image: '/images/members/phd-allen-huang.png', focus: 'Analog, RF, and mm-wave circuits, AI-driven IC design', bio: 'received the B.S. from Iowa State (2022) and M.S. from UCLA (2024). Currently a Ph.D. student at UCI, his research focuses on analog, RF, and mm-wave IC design, and AI-driven optimization for circuits and radar systems.', gradientFrom: 'from-uci-gold', gradientTo: 'to-eecs-teal' },
  { name: 'Zhengyang (Mark) Zhang', initials: 'ZZ', image: '/images/members/phd-mark-zhang.png', focus: 'Radar, Analog/mixed-signal/RF circuits', bio: 'BSEE (2024) from SUSTech, Shenzhen, China, with work on integrated power management for wireline transceivers. MSEE (2026) from UCI. Currently pursuing PhD at UCI. Current research focuses on radar systems.', gradientFrom: 'from-eecs-teal', gradientTo: 'to-uci-blue' },
  { name: 'Mohammadamin (Amin) Montazar', initials: 'AM', image: '/images/members/phd-montazar.png', focus: 'mm-wave and terahertz integrated circuits', bio: 'B.S. and M.S. in Electrical Engineering from UC Davis (2020, 2022). Under Prof. Omeed Momeni, designed LC VCO in C-band with thesis on low power, low phase noise VCO for PLL applications. Senior RF Design Engineer for two years specializing in military communication systems VHF to C-Band.', gradientFrom: 'from-uci-blue-dark', gradientTo: 'to-uci-gold' },
  { name: 'Yuncheng Tu', initials: 'YT', image: '/images/members/phd-yuncheng-tu.png', focus: 'Analog, RF, and mm-wave circuits', bio: 'B.S. in Electrical Engineering from Southern University of Science and Technology, Shenzhen, China (2025). Currently pursuing Ph.D. at UCI.', gradientFrom: 'from-eng-blue', gradientTo: 'to-eecs-teal-light' },
];

const undergradResearchers: Member[] = [
  { name: 'Albert Huang', initials: 'AH', image: '/images/members/undergrad-albert-huang.png', focus: 'Analog circuit design', bio: 'Pursuing BSc in Electrical and Computer Engineering at UCI, specializing in Electronic Circuit Design, Semiconductors, and RF, Antennas, and Microwaves.', gradientFrom: 'from-uci-gold', gradientTo: 'to-uci-blue' },
];

interface Alumnus {
  name: string;
  initials: string;
  image: string;
  detail: string;
  now?: string;
  bio?: string;
}

const phdAlumni: Alumnus[] = [
  { name: 'Masoud Berahman', initials: 'MB', image: '/images/members/alumni-berahman.png', detail: 'Ph.D./Postdoc', now: undefined, bio: 'Completed PhD in electrical engineering and postdoctoral fellowship in physics. Primary research interests in two and one-dimensional materials applications in future electronic devices.' },
  { name: 'Xuyang Liu', initials: 'XL', image: '/images/members/alumni-xuyang-liu.png', detail: '2020-2025', now: 'Staff Engineer, Marvell Technology', bio: 'BS in Electronic Information Engineering from Jilin University, China (2018), MS in Electrical Engineering from Columbia University (2019), PhD from UCI (2025). Research interests in mmWave front-end, VCO and PLL, FMCW radar system.' },
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

function MemberCard({ member, label = 'PhD Student' }: { member: Member; index: number; label?: string }) {
  const tags = member.focus.split(/,\s*and\s*|,\\s*|\\s+and\\s+/);
  const isAllen = member.name.includes('Allen') || member.name.includes('Yilun');
  const isBehnam = member.name.includes('Behnam');
  const imgPosition = isAllen ? 'object-center' : (isBehnam ? 'object-[center_25%]' : 'object-[center_15%]');

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8, transition: { duration: 0.3, ease: 'easeOut' } }}
      className="group relative rounded-2xl bg-white border border-gray-100 overflow-hidden transition-all duration-500 hover:border-uci-blue/20 hover:shadow-xl hover:shadow-uci-blue/10"
    >
      <div className={`h-1 w-full bg-gradient-to-r ${member.gradientFrom} ${member.gradientTo}`} />
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-br from-uci-blue/5 via-transparent to-uci-gold/5" />
      <div className="p-6 flex flex-col items-center text-center relative">
        <div className="relative">
          <div className={`absolute -inset-1 rounded-full bg-gradient-to-br ${member.gradientFrom} ${member.gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
          <Image
            src={member.image}
            alt={member.name}
            width={120}
            height={120}
            className={`relative w-32 h-32 rounded-full object-cover ${imgPosition} shadow-xl border-[3px] border-white group-hover:border-white/90 transition-all duration-300 group-hover:scale-105`}
          />
        </div>
        <h3 className="mt-4 font-bold text-eng-blue text-base leading-tight group-hover:text-uci-blue transition-colors duration-300">{member.name}</h3>
        <p className="text-xs text-gray-400 mt-1 font-medium tracking-wide uppercase">{label}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {tags.map((t) => (
            <span key={t} className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-gradient-to-r from-uci-blue/5 to-eecs-teal/5 text-uci-blue border border-uci-blue/10 group-hover:border-uci-blue/20 group-hover:from-uci-blue/10 group-hover:to-eecs-teal/10 transition-all duration-300">
              {t.trim()}
            </span>
          ))}
        </div>
        {member.bio && (
          <p className="mt-4 text-xs text-gray-500 leading-relaxed text-left bg-slate-warm/70 dark:bg-white/[0.04] rounded-xl p-3.5 w-full border border-gray-100 dark:border-white/10 group-hover:border-gray-200 dark:group-hover:border-white/15 transition-colors duration-300">
            {member.bio}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function AlumnusCard({ alumnus, large = false }: { alumnus: Alumnus; large?: boolean }) {
  const imgSize = large ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-14 h-14';
  const isAllen = alumnus.name.includes('Allen') || alumnus.name.includes('Yilun');
  const isBehnam = alumnus.name.includes('Behnam');
  const imgPosition = isAllen ? 'object-center' : (isBehnam ? 'object-[center_25%]' : 'object-[center_15%]');

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass rounded-xl p-4 flex ${large ? 'flex-col items-center text-center' : 'flex-row items-center gap-3'} card-hover`}
    >
      <div className={`relative ${large ? 'mb-4' : 'flex-shrink-0'}`}>
        <Image 
          src={alumnus.image} 
          alt={alumnus.name} 
          width={120} 
          height={120} 
          className={`${imgSize} rounded-full object-cover ${imgPosition} shadow-md border-2 border-white`} 
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`font-bold ${large ? 'text-lg' : 'text-sm'} text-eng-blue truncate`}>{alumnus.name}</p>
        {alumnus.detail && <p className={`text-xs ${large ? 'text-uci-blue font-medium mt-0.5' : 'text-gray-400'}`}>{alumnus.detail}</p>}
        {alumnus.now && (
          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-eecs-teal/10 text-eecs-teal border border-eecs-teal/20">
            <span className="w-1.5 h-1.5 rounded-full bg-eecs-teal" />
            Now at {alumnus.now}
          </span>
        )}
      </div>
      {alumnus.bio && (
        <p className={`mt-3 text-[11px] text-gray-500 leading-relaxed bg-slate-warm/70 dark:bg-white/[0.04] rounded-lg p-3 border border-transparent dark:border-white/10 ${large ? 'text-left w-full' : ''}`}>
          {alumnus.bio}
        </p>
      )}
    </motion.div>
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
          <SectionHeader as="h1" title="Our Team" subtitle="Meet the researchers driving innovation in high-frequency integrated electronics at UCI." badge="People" centered light />
        </div>
      </section>

      {/* Director */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-[2px] rounded-3xl bg-gradient-to-r from-uci-blue via-uci-gold to-eecs-teal">
            <div className="bg-white rounded-[22px] p-8 sm:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="shrink-0">
                <Image src={director.image} alt={director.name} width={160} height={160} className="w-44 h-44 rounded-full object-cover object-[center_15%] shadow-xl ring-4 ring-white" />
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
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Education</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{director.education}</p>
                </div>
                <div className="mt-3">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Research Focus</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{director.expertise}</p>
                </div>
                <div className="mt-3">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Experience</h3>
                  <ul className="space-y-1">
                    {director.experience.map((e) => (
                      <li key={e} className="text-sm text-gray-500 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-eecs-teal mt-2 shrink-0" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-3">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Professional Service</h3>
                  <ul className="space-y-1">
                    {director.service.map((s) => (
                      <li key={s} className="text-sm text-gray-500 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-uci-blue mt-2 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-3">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Memberships</h3>
                  <div className="flex flex-wrap gap-2">
                    {director.memberships.map((m) => (
                      <span key={m} className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-navy/5 text-navy border border-navy/10">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Awards & Honors</h3>
                  <ul className="space-y-1.5">
                    {director.achievements.map((a) => (
                      <li key={a} className="text-sm text-gray-500 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-uci-gold mt-2 shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* PhD Students */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <SectionHeader title="PhD Students" subtitle="Current doctoral researchers advancing the frontiers of integrated electronics." badge="Researchers" />
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {phdStudents.map((m, i) => (
            <MemberCard key={m.name} member={m} index={i} />
          ))}
        </motion.div>
      </section>

      {/* Undergraduate Researchers */}
      <section className="py-20 bg-white/35 dark:bg-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader title="Undergraduate Researchers" badge="Undergrads" />
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {undergradResearchers.map((m, i) => (
              <MemberCard key={m.name} member={m} index={i} label="Undergraduate Researcher" />
            ))}
          </motion.div>
        </div>
      </section>

      {/* PhD / Postdoc Alumni */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <SectionHeader title="PhD & Postdoc Alumni" badge="Alumni" />
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {phdAlumni.map((a) => (
            <AlumnusCard key={a.name} alumnus={a} large />
          ))}
        </motion.div>
      </section>

      {/* Other Alumni */}
      <section className="py-20 bg-white/35 dark:bg-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader title="Other Alumni" badge="Alumni" />
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherAlumni.map((a) => (
              <AlumnusCard key={a.name} alumnus={a} />
            ))}
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
}
