'use client';

import { useState, useMemo } from 'react';
import PageWrapper from '@/components/PageWrapper';
import SectionHeader from '@/components/SectionHeader';
import CircuitBackground from '@/components/CircuitBackground';
import { serializeJsonLd, SITE_URL } from '@/lib/metadata';

// --------------- types ---------------

type PubType = 'journal' | 'conference' | 'patent' | 'talk';

interface Publication {
  authors: string;
  title: string;
  venue: string;
  year: number;
  type: PubType;
  highlight?: string; // e.g. "Best Student Paper Nominee"
  status?: string; // e.g. "Under Review"
  link?: string; // DOI or publisher URL
}

// --------------- data ---------------

const publications: Publication[] = [
  // ===== SELECTED JOURNAL PUBLICATIONS (22) =====
  // #25
  { authors: 'Y. Huang, H. R. Aghasi', title: 'AI-Assisted Radio-Frequency and mm-Wave Layout Using Electromagnetic Surrogates and Frequency-Adaptive Rules', venue: 'IEEE JSTEAP', year: 2026, type: 'journal', status: 'Published', link: 'https://ieeexplore.ieee.org/document/11647306' },
  // #24
  { authors: 'M. Berahman, A. Montazar, Y. Huang, H. Aghasi', title: 'Gigahertz frequency mixing and multiplication in an all-van der Waals ambipolar MoTe2 transistor', venue: 'Applied Physics Letters', year: 2026, type: 'journal', status: 'Published', link: 'https://pubs.aip.org/aip/apl/article/128/25/253504/3396329' },
  // #23
  { authors: 'X. Liu, Z. Zhang and H. Aghasi', title: 'A 25/75 GHz 2TX-4RX FMCW Radar Transceiver Utilizing Non-uniform Linear Arrays and Phase Dithering to Achieve 5.1° Angular Resolution', venue: 'IEEE TMTT', year: 2026, type: 'journal', status: 'Published', link: 'https://ieeexplore.ieee.org/document/11483145' },
  // #22
  { authors: 'M. H. Maktoomi, X. Liu, H. R. Aghasi', title: 'A 19 dBm Psat 110-142 GHz Power Amplifier in 65-nm CMOS with Device-Centric Power Boosted Stage and a Dual-Coupled 4-Way Slotline Combiner', venue: 'IEEE JSSC', year: 2025, type: 'journal', status: 'Published', link: 'https://ieeexplore.ieee.org/abstract/document/11389191' },
  // #20
  { authors: 'A. Mahdavifar, X. Zhao, Y. Niu, M. Alesheikh, H. R. Aghasi, S. Avestimehr', title: 'Supervised Learning for Analog and RF Circuit Design: Benchmarks and Comparative Insights', venue: 'IEEE TCAD', year: 2025, type: 'journal', status: 'Published', link: 'https://ieeexplore.ieee.org/document/10844444' },
  // #18
  { authors: 'J. Gruber, H. Alotaibi, A. Tabatabavakili, L. Chen, H. R. Aghasi, H. Naghavi, E. Afshari', title: 'Sub-THz Communication Systems in Silicon: Combating the f_max Barrier', venue: 'Nature Communications Engineering', year: 2025, type: 'journal', status: 'Published', link: 'https://www.nature.com/articles/s44172-025-00545-9' },
  // #17
  { authors: 'A. Montazar, X. Liu, Z. Zhang, H. R. Aghasi', title: 'A Hybrid CMOS-Polyimide Adaptive Force Radiometric Array with 3-5 GHz Wireless Connectivity', venue: 'IEEE MWTL', year: 2025, type: 'journal', status: 'Published', link: 'https://ieeexplore.ieee.org/document/10969567' },
  // #16
  { authors: 'M. Berahman, H. R. Aghasi', title: 'Tunneling Field Effect Transistors Based on Janus Monolayer PtSSe', venue: 'IEEE TNANO', year: 2025, type: 'journal', status: 'Published', link: 'https://ieeexplore.ieee.org/document/11082011' },
  // #15
  { authors: 'X. Liu, M. Maktoomi, M. Alesheikh, P. Heydari, H. R. Aghasi', title: 'A CMOS 49-63-GHz Phase-Locked Stepped-Chirp FMCW Radar Transceiver', venue: 'IEEE JSSC', year: 2025, type: 'journal', status: 'Published', link: 'https://ieeexplore.ieee.org/document/10964133' },
  // #14
  { authors: 'H. R. Aghasi, X. Liu, M. Tavakolli Taba, F. Khoeini, E. Afshari', title: 'Broadband Harmonic-Assisted Power and Efficiency Enhancement in a 174-232 GHz SiGe Voltage-Controlled Oscillator', venue: 'IEEE JSSC', year: 2024, type: 'journal', status: 'Published', link: 'https://ieeexplore.ieee.org/document/10758425' },
  // #13
  { authors: 'X. Liu, B. Moradi, H. R. Aghasi', title: 'A Single-Switch 3.1-4.7 GHz 194.52-dB FoM Class-D VCO with 495 μW Power Consumption', venue: 'IEEE TCAS-II', year: 2024, type: 'journal', status: 'Published', link: 'https://ieeexplore.ieee.org/document/10543114' },
  // #12
  { authors: 'B. Moradi, X. Liu, H. R. Aghasi', title: 'A 76-82 GHz VCO in 65 nm CMOS With 189.3 dBc/Hz PN FOM and -0.6 dBm Harmonic Power for mm-Wave FMCW Applications', venue: 'IEEE TCAS-I', year: 2024, type: 'journal', status: 'Published', link: 'https://ieeexplore.ieee.org/document/10296176' },
  // #11
  { authors: 'H. Maktoomi, S. Saadat, O. Momeni, P. Heydari, H. R. Aghasi', title: 'Broadband Antenna Design for Terahertz Communication Systems', venue: 'IEEE Access', year: 2023, type: 'journal', status: 'Published', link: 'https://ieeexplore.ieee.org/abstract/document/10056150' },
  // #10
  { authors: 'H. Maktoomi, Z. Wang, H. Wang, S. Saadat, P. Heydari, H. R. Aghasi', title: 'A Sub-Terahertz Wideband Stacked-Patch Antenna on a Flexible Printed Circuit for 6G Applications', venue: 'IEEE TAP', year: 2022, type: 'journal', status: 'Published', link: 'https://ieeexplore.ieee.org/abstract/document/9810798' },
  // #9
  { authors: 'H. R. Aghasi, P. Heydari', title: 'Millimeter-Wave Radars-on-Chip Enabling Next Generation Cyberphysical Infrastructures', venue: 'IEEE Communications Magazine', year: 2020, type: 'journal', status: 'Published', link: 'https://ieeexplore.ieee.org/abstract/document/9311904' },
  // #8
  { authors: 'H. R. Aghasi, H. Naghavi, S. M. Tavakolitaba, M. Aseeri, A. Cathelin, E. Afshari', title: 'Terahertz Electronics: Application of Wave Propagations and Nonlinear Processes', venue: 'Applied Physics Reviews', year: 2020, type: 'journal', status: 'Published', link: 'https://pubs.aip.org/aip/apr/article-abstract/7/2/021302/124062' },
  // #7
  { authors: 'H. R. Aghasi, E. Afshari', title: 'An 88 GHz Compact Fundamental Oscillator with 19.4% DC-to-RF Efficiency and 7.5 dBm Output Power in 130 nm SiGe BiCMOS', venue: 'IEEE SSCL', year: 2018, type: 'journal', status: 'Published', link: 'https://ieeexplore.ieee.org/abstract/document/8490693' },
  // #6
  { authors: 'H. R. Aghasi, A. Cathelin, E. Afshari', title: 'A 0.92 THz SiGe Power radiator Based on a Nonlinear Harmonic Generation Theory', venue: 'IEEE JSSC', year: 2017, type: 'journal', status: 'Published', link: 'https://ieeexplore.ieee.org/abstract/document/7819530' },
  // #5
  { authors: 'H. R. Aghasi, R. M. Iraei, A. Naeemi, E. Afshari', title: 'Smart Detector Cell: A Scalable All-Spin Circuit for Low Power Non-Boolean Pattern Recognition', venue: 'IEEE TNANO', year: 2016, type: 'journal', status: 'Published', link: 'https://ieeexplore.ieee.org/abstract/document/7407630' },
  // #4
  { authors: 'R. Han, C. Jiang, A. Mostajeran, M. Emadi, H. R. Aghasi, A. Cathelin, E. Afshari', title: 'A SiGe Terahertz Heterodyne Imaging Transmitter with 3.3 mW Radiated Power and Fully-Integrated Phase-Locked Loop', venue: 'IEEE JSSC', year: 2015, type: 'journal', status: 'Published', link: 'https://ieeexplore.ieee.org/abstract/document/7109923' },
  // #3
  { authors: 'S. Saadat, H. R. Aghasi, E. Afshari, H. Mosallaei', title: 'Low Power Negative Inductance Integrated Circuit for GHz Applications', venue: 'IEEE MWCL', year: 2015, type: 'journal', status: 'Published', link: 'http://ieeexplore.ieee.org/abstract/document/7004068' },
  // #2
  { authors: 'H. R. Aghasi, H. Amindavar, A. Aghasi', title: 'A Hybrid Global Minimization Scheme for Accurate Source Localization in Sensor Networks', venue: 'EURASIP JASP', year: 2011, type: 'journal', status: 'Published', link: 'https://link.springer.com/article/10.1186/1687-6180-2011-81' },
  // #1
  { authors: 'H. R. Aghasi, M. Hashemi, B. H. Khalaj', title: 'A Source Localization Based on Signal Attenuation and Time Delay Estimation in Sensor Networks', venue: 'IJCEE', year: 2012, type: 'journal', status: 'Published', link: 'http://www.ijcee.org/papers/498-E0736.pdf' },

  // ===== SELECTED CONFERENCE PUBLICATIONS (22) =====
  // #1
  { authors: 'Z. Zhang, X. Liu, Y. Huang, H. Aghasi', title: 'A Doppler-Assisted 76 GHz PMCW Radar with Meter-Scale Unambiguous Range and μm-Scale Range Accuracy', venue: 'IEEE RFIC', year: 2026, type: 'conference', status: 'Published', link: 'https://ieeexplore.ieee.org/abstract/document/11602168' },
  // #2
  { authors: 'Y. Huang, A. Mehradfar, S. Avestimehr, H. R. Aghasi', title: 'EM-Aware Physical Synthesis: Neural Inductor Modeling and Intelligent Placement & Routing for RF Circuits', venue: 'IEEE ISCAS', year: 2026, type: 'conference', status: 'Published', link: 'https://ieeexplore.ieee.org/abstract/document/11562320' },
  // #3
  { authors: 'M. Maktoomi, X. Liu, H. R. Aghasi', title: 'A 110-142 GHz 19 dBm Psat Power Amplifier with Enhanced-Power Cascode Stage and 4-Way Dual-Coupled Slotline Combiner in 65-nm CMOS', venue: 'IEEE RWW', year: 2025, type: 'conference', highlight: 'Best Student Paper Award nominee', link: 'https://ieeexplore.ieee.org/document/10431872' },
  // #4
  { authors: 'A. Ding, Y. Huang, S. Jeong, X. Liu, H. R. Aghasi, M. Imani', title: 'Attention-Based Cognitive Beam Steering for 24 GHz FMCW Radar Systems', venue: 'IEEE RadarConf', year: 2025, type: 'conference', highlight: 'Best Student Paper Award nominee (Warsaw, Poland)', link: 'https://ieeexplore.ieee.org/abstract/document/11204903' },
  // #5
  { authors: 'A. Mehradfar, X. Zhao, Y. Huang, E. Ceyani, Yankai Yang, Shihao Han, Hamidreza Aghasi, Salman Avestimehr', title: 'FALCON: An ML Framework for Fully Automated Layout-Constrained Analog Circuit Design', venue: 'NeurIPS', year: 2025, type: 'conference', link: 'https://openreview.net/forum?id=HUUQmnwUIx' },
  // #6
  { authors: 'H. R. Aghasi', title: 'Data-Efficient Supervised Learning for RF and mm-Wave Circuit Design: Techniques, Challenges, and Benefits', venue: 'IEEE APWC', year: 2025, type: 'conference', highlight: 'Invited Talk', link: 'https://ieeexplore.ieee.org/document/11190414' },
  // #7
  { authors: 'A. Montazar, X. Liu, Z. Zhang, H. R. Aghasi', title: 'A Hybrid CMOS-Polyimide Adaptive Force Radiometric Array with 3-5 GHz Wireless Connectivity', venue: 'IEEE IMS', year: 2025, type: 'conference' },
  // #8
  { authors: 'M. Alesheikh, S. Saadat, A. Montazar, H. R. Aghasi', title: 'A 55-65 GHz Half-Width Leaky Wave Antenna with Linear Beam-Steering Profile for Monostatic FMCW Radars', venue: 'IEEE APS', year: 2025, type: 'conference', link: 'https://ieeexplore.ieee.org/document/11266191' },
  // #9
  { authors: 'M. Alesheikh, S. Saadat, H. R. Aghasi', title: 'A Study on Curvature Effect of Flexible Antenna Arrays and Its Impact on 2D Beamforming Capability of 6G Wireless Systems', venue: 'IEEE APS', year: 2025, type: 'conference', link: 'https://arxiv.org/abs/2409.09590' },
  // #10
  { authors: 'A. Mahdavifar, X. Zhao, Y. Niu, M. Alesheikh, H. R. Aghasi, S. Avestimehr', title: 'AICircuit: A Multi-Level Dataset and Benchmark for AI-Driven Analog Integrated Circuit Design', venue: 'NeurIPS ML4PS Workshop', year: 2024, type: 'conference', link: 'https://ml4physicalsciences.github.io/2024/files/NeurIPS_ML4PS_2024_156.pdf' },
  // #11
  { authors: 'M. Alesheikh, M. Maktoomi, S. Saadat, H. R. Aghasi', title: 'An Electronically Tunable 28-34 GHz 2D Steerable Leaky Wave Antenna', venue: 'IEEE APS', year: 2024, type: 'conference', link: 'https://ieeexplore.ieee.org/document/10636401' },
  // #12
  { authors: 'X. Liu, M. Maktoomi, M. Alesheikh, P. Heydari, H. R. Aghasi', title: 'A 49-63 GHz Phase-Locked FMCW Radar Transceiver for High Resolution Applications', venue: 'ESSCIRC', year: 2023, type: 'conference', link: 'https://ieeexplore.ieee.org/abstract/document/10268798' },
  // #13
  { authors: 'D. Krylov, P. Khajeh, T. Reeves, J. Ouyang, T. Liu, H. R. Aghasi, R. Fox', title: 'Learning to Design Analog Circuits to Meet Threshold Specifications', venue: 'ICML', year: 2023, type: 'conference', link: 'https://openreview.net/forum?id=38W1BXgAqx' },
  // #14
  { authors: 'F. Shirani, H. R. Aghasi', title: 'Quantifying the Capacity Gains in Coarsely Quantized SISO Systems with Nonlinear Analog Operators', venue: 'IEEE Globecom', year: 2022, type: 'conference', link: 'https://ieeexplore.ieee.org/abstract/document/10008530' },
  // #15
  { authors: 'F. Shirani, H. R. Aghasi', title: 'MIMO Systems with One-Bit ADCs: Capacity Gains Using Nonlinear Analog Operations', venue: 'IEEE ISIT', year: 2022, type: 'conference', link: 'https://ieeexplore.ieee.org/abstract/document/9834405' },
  // #16
  { authors: 'B. Moradi, X. Liu, M. Green, H. R. Aghasi', title: 'A Compact CMOS 76-82 GHz Super-Harmonic VCO with 189 dBc/Hz FoM Based on Harmonic-Assisted ISF Manipulation', venue: 'IEEE RFIC', year: 2022, type: 'conference', link: 'https://ieeexplore.ieee.org/abstract/document/9863140' },
  // #17
  { authors: 'H. Maktoomi, Z. Wang, H. Wang, S. Saadat, P. Heydari, H. R. Aghasi', title: 'A GSG-Excited Ultra-Wideband 103-147 GHz Stacked Patch Antenna on Flexible Printed Circuit', venue: 'IEEE APS', year: 2021, type: 'conference', link: 'https://ieeexplore.ieee.org/document/9703901' },
  // #18
  { authors: 'A. Mostajeran, H. R. Aghasi, M. H. Naghavi, E. Afshari', title: 'Fully Integrated Solutions for High Resolution Terahertz Imaging', venue: 'IEEE CICC', year: 2019, type: 'conference', link: 'https://ieeexplore.ieee.org/document/8780216' },
  // #19
  { authors: 'H. R. Aghasi, E. Afshari', title: 'Power-Efficient Terahertz Communication Circuits', venue: 'ACM NANOCOM', year: 2017, type: 'conference', link: 'https://dl.acm.org/citation.cfm?id=3122844' },
  // #20
  { authors: 'H. R. Aghasi, E. Afshari', title: 'Design of Broadband mm-Wave and Terahertz Frequency Doublers', venue: 'ESSCIRC', year: 2016, type: 'conference', link: 'http://ieeexplore.ieee.org/abstract/document/7598318' },
  // #21
  { authors: 'R. Han, C. Jiang, A. Mostajeran, M. Emadi, H. R. Aghasi, A. Cathelin, E. Afshari', title: 'A 320 GHz Phase-Locked Transmitter with 3.3 mW Radiated Power and 22.5 dBm EIRP for Heterodyne THz Imaging Systems', venue: 'IEEE ISSCC', year: 2015, type: 'conference', link: 'https://ieeexplore.ieee.org/document/7067008' },
  // #22
  { authors: 'H. R. Aghasi, M. Hashemi, B. H. Khalaj', title: 'Source Localization Through Adaptive Signal Attenuation Model and Time Delay Estimation', venue: 'IEEE ICT', year: 2011, type: 'conference', link: 'https://ieeexplore.ieee.org/document/5898231' },

  // ===== PENDING PATENTS AND INVENTIONS (2) =====
  { authors: 'A. Montazar, X. Liu, H. R. Aghasi', title: 'Hybrid CMOS-Polyimide Force Radiometric Array with GHz Wireless Link', venue: 'US Patent', year: 2025, type: 'patent' },
  { authors: 'H. R. Aghasi, P. Heydari', title: 'Integrated Wideband Stepped-Chirp Radar Sensor', venue: 'US Patent', year: 2022, type: 'patent' },

  // ===== INVITED PRESENTATIONS AND TALKS (17) =====
  { authors: 'H. R. Aghasi', title: 'IEEE Optical Interconnects and Packaging Conference', venue: 'Fort Collins', year: 2025, type: 'talk' },
  { authors: 'H. R. Aghasi', title: 'University of Michigan', venue: 'Ann Arbor', year: 2025, type: 'talk' },
  { authors: 'H. R. Aghasi', title: 'University of Washington', venue: 'Seattle', year: 2024, type: 'talk' },
  { authors: 'H. R. Aghasi', title: 'IEEE RFIC Symposium', venue: '', year: 2022, type: 'talk' },
  { authors: 'H. R. Aghasi', title: 'MaxLinear Inc.', venue: 'Carlsbad, CA', year: 2020, type: 'talk' },
  { authors: 'H. R. Aghasi', title: 'Intel Corporation', venue: 'Hillsboro, OR', year: 2019, type: 'talk' },
  { authors: 'H. R. Aghasi', title: 'University of California, Irvine', venue: '', year: 2019, type: 'talk' },
  { authors: 'H. R. Aghasi', title: 'Acacia Communications', venue: 'Holmdel, NJ', year: 2018, type: 'talk' },
  { authors: 'H. R. Aghasi', title: 'Nokia Bell Labs', venue: 'Murray Hill, NJ', year: 2018, type: 'talk' },
  { authors: 'H. R. Aghasi', title: 'Anokiwave Inc.', venue: 'Billerica, MA', year: 2018, type: 'talk' },
  { authors: 'H. R. Aghasi', title: 'Integrated Device Technology (IDT)', venue: 'San Diego, CA', year: 2018, type: 'talk' },
  { authors: 'H. R. Aghasi', title: 'Qualcomm Inc.', venue: 'San Diego, CA', year: 2018, type: 'talk' },
  { authors: 'H. R. Aghasi', title: 'University of Michigan School of Medicine', venue: 'Ann Arbor', year: 2018, type: 'talk' },
  { authors: 'H. R. Aghasi', title: 'Goodix Technology Inc.', venue: 'Irvine, CA', year: 2017, type: 'talk' },
  { authors: 'H. R. Aghasi', title: 'Analog Photonics Inc.', venue: 'Boston, MA', year: 2017, type: 'talk' },
  { authors: 'H. R. Aghasi', title: 'University of Massachusetts', venue: 'Amherst, MA', year: 2017, type: 'talk' },
  { authors: 'H. R. Aghasi', title: 'Cornell University – EDS Seminar Series', venue: 'Ithaca, NY', year: 2016, type: 'talk' },
];

const publicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'HIE Lab Publications',
  url: `${SITE_URL}/publications/`,
  itemListElement: publications
    .filter((publication) =>
      Boolean(publication.link) &&
      (publication.type === 'journal' || publication.type === 'conference'),
    )
    .map((publication, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'ScholarlyArticle',
        headline: publication.title,
        datePublished: String(publication.year),
        url: publication.link,
        author: publication.authors
          .replace(/,?\s+and\s+/g, ', ')
          .split(',')
          .map((name) => ({ '@type': 'Person', name: name.trim() })),
        isPartOf: {
          '@type': 'Periodical',
          name: publication.venue,
        },
      },
    })),
};

const publicationCounts: Record<PubType, number> = { journal: 0, conference: 0, patent: 0, talk: 0 };
for (const publication of publications) publicationCounts[publication.type] += 1;

// --------------- helpers ---------------

const filterTabs: { label: string; value: PubType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Journal', value: 'journal' },
  { label: 'Conference', value: 'conference' },
  { label: 'Patent', value: 'patent' },
  { label: 'Talks', value: 'talk' },
];

const countOf = (value: PubType | 'all') =>
  value === 'all' ? publications.length : publicationCounts[value];

const typeLabel: Record<PubType, string> = {
  journal: 'Journal',
  conference: 'Conference',
  patent: 'Patent',
  talk: 'Invited talk',
};

const typeTone: Record<PubType, string> = {
  journal: 'text-uci-blue dark:text-sky-300',
  conference: 'text-teal-700 dark:text-teal-300',
  patent: 'text-amber-700 dark:text-uci-gold',
  talk: 'text-violet-700 dark:text-violet-300',
};

/** One entry, set like a reference: title, authors, venue in italics, then any honour. */
function PublicationRow({ pub }: { pub: Publication }) {
  const status = pub.status && pub.status !== 'Published' ? pub.status : undefined;
  const details = [pub.highlight, status].filter(Boolean).join(', ');
  return (
    <li className="grid gap-x-6 px-5 py-4 sm:grid-cols-[1fr_7rem] sm:px-6">
      <div className="min-w-0">
        <h3 className="font-sans text-[15px] font-semibold leading-snug text-eng-blue [text-wrap:wrap]">
          {pub.link ? (
            <a href={pub.link} target="_blank" rel="noopener noreferrer" className="hover:text-uci-blue hover:underline underline-offset-4">
              {pub.title}
              <svg aria-hidden="true" className="ml-1 inline-block w-3.5 h-3.5 -translate-y-px text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            pub.title
          )}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{pub.authors}</p>
        {(pub.venue || details) && (
          <p className="mt-1 text-sm">
            {pub.venue && <span className="italic text-gray-700">{pub.venue}</span>}
            {pub.venue && details && <span className="text-gray-500">, </span>}
            {details && <span className="font-medium text-amber-700 dark:text-uci-gold">{details}</span>}
          </p>
        )}
      </div>
      <span className={`mt-2 inline-flex items-center gap-1.5 self-start text-xs font-medium sm:mt-1 ${typeTone[pub.type]}`}>
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
        {typeLabel[pub.type]}
      </span>
    </li>
  );
}

// --------------- page ---------------

export default function PublicationsPage() {
  const [filter, setFilter] = useState<PubType | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = publications;
    if (filter !== 'all') list = list.filter((p) => p.type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.authors.toLowerCase().includes(q) ||
          p.venue.toLowerCase().includes(q),
      );
    }
    return list;
  }, [filter, search]);

  // Group by year, newest first; within each year: journals → conferences → patents → talks
  const grouped = useMemo(() => {
    const typeOrder: Record<PubType, number> = { journal: 0, conference: 1, patent: 2, talk: 3 };
    const map = new Map<number, Publication[]>();
    for (const p of filtered) {
      const arr = map.get(p.year) ?? [];
      arr.push(p);
      map.set(p.year, arr);
    }
    const entries = Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
    for (const [, pubs] of entries) {
      pubs.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);
    }
    return entries;
  }, [filtered]);

  return (
    <PageWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(publicationJsonLd) }}
      />
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-eng-blue via-navy to-eng-blue pt-24 pb-20 overflow-hidden">
        <CircuitBackground density={50} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader
            as="h1"
            title="Publications"
            subtitle="Peer-reviewed research in mm-wave, THz electronics, and machine-learning-driven IC design."
            centered
            light
          />
        </div>
      </section>

      {/* Controls: search, and tabs that carry each type's count */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="rounded-2xl bg-[#ffffff] dark:bg-[#0b1220] border border-panel-line px-4 sm:px-5 flex flex-col md:flex-row md:items-center gap-x-6">
          <div className="relative flex-1 w-full pt-4 md:py-3">
            <svg aria-hidden="true" className="absolute left-3 top-1/2 translate-y-[0.125rem] md:-translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              aria-label="Search publications"
              placeholder="Search by title, author, or venue"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-uci-blue/30 focus:border-uci-blue transition-colors"
            />
          </div>
          <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-x-5">
            {filterTabs.map((tab) => {
              const active = filter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setFilter(tab.value)}
                  aria-pressed={active}
                  className={`-mb-px border-b-2 py-4 text-sm font-medium transition-colors ${
                    active
                      ? 'border-uci-blue text-slate-900 dark:border-uci-gold dark:text-white'
                      : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 tabular-nums text-slate-500 dark:text-slate-400">{countOf(tab.value)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* One panel per year */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        {grouped.length === 0 && (
          <p className="text-center text-gray-400 py-20">No publications match your search.</p>
        )}

        {grouped.map(([year, pubs]) => (
          <div key={year} className="mb-12 last:mb-0">
            <h2 className="mb-4 text-2xl font-bold tabular-nums text-eng-blue dark:text-white">{year}</h2>
            <ul className="glass-ios rounded-2xl divide-y divide-panel-line">
              {pubs.map((pub) => (
                <PublicationRow key={`${pub.venue}-${pub.title}`} pub={pub} />
              ))}
            </ul>
          </div>
        ))}
      </section>
    </PageWrapper>
  );
}
