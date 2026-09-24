// People of the HIE Lab. The team page, the homepage counts and the site
// search all read from here, so a change lands everywhere at once.

export interface Member {
  name: string;
  /** Google Scholar profile. Present only where the profile was verified as
      belonging to this person -- a wrong link here misattributes real work. */
  scholar?: string;
  initials: string;
  image: string;
  /** CSS object-position for the portrait crop. */
  photoPosition: string;
  focus: string;
  bio: string;
}

export interface Alumnus {
  name: string;
  scholar?: string;
  initials: string;
  image: string;
  photoPosition: string;
  detail: string;
  now?: string;
  bio?: string;
}

export const director = {
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

export const phdStudents: Member[] = [
  { name: 'Md Hedayatullah Maktoomi', scholar: 'https://scholar.google.com/citations?user=WlRBLIUAAAAJ', initials: 'MH', image: '/images/members/phd-maktoomi.png', focus: 'RF/microwave and power amplifier design', bio: 'B. Engg. from Jamia Millia Islamia, New Delhi (2015), M.S. from Washington State University (2020). Intern and research assistant at IIIT Delhi (2016-2017) on passive RF/microwave circuits. RF engineering intern at Wolfspeed Inc. (2019) working on Doherty power amplifier design. Published in IEEE TCAS-II and IEEE TMTT. Frequent reviewer for multiple IEEE journals.', photoPosition: 'center 15%' },
  { name: 'Mahdi Alesheikh', scholar: 'https://scholar.google.com/citations?user=gA_Bu2YAAAAJ', initials: 'MA', image: '/images/members/phd-alesheikh.png', focus: 'Analog/RF circuits', bio: 'BSc in Electronics from Sharif University of Technology, Tehran, Iran. BSc thesis on IoT circuits under Prof. Safarian. MSc in ECE from University of Alberta, with master\'s work on RFIC and microwave circuits under Prof. Karumudi and Hossain. Currently pursuing PhD at UCI.', photoPosition: 'center 15%' },
  { name: 'Yilun (Allen) Huang', scholar: 'https://scholar.google.com/citations?user=Fpr6OqsAAAAJ', initials: 'YH', image: '/images/members/phd-allen-huang.png', focus: 'Analog, RF, and mm-wave circuits, AI-driven IC design', bio: 'received the B.S. from Iowa State (2022) and M.S. from UCLA (2024). Currently a Ph.D. student at UCI, his research focuses on analog, RF, and mm-wave IC design, and AI-driven optimization for circuits and radar systems.', photoPosition: 'center' },
  { name: 'Zhengyang (Mark) Zhang', scholar: 'https://scholar.google.com/citations?user=L1xO0-0AAAAJ', initials: 'ZZ', image: '/images/members/phd-mark-zhang.png', focus: 'Radar, Analog/mixed-signal/RF circuits', bio: 'BSEE (2024) from SUSTech, Shenzhen, China, with work on integrated power management for wireline transceivers. MSEE (2026) from UCI. Currently pursuing PhD at UCI. Current research focuses on radar systems.', photoPosition: 'center 15%' },
  { name: 'Mohammadamin (Amin) Montazar', initials: 'AM', image: '/images/members/phd-montazar.png', focus: 'mm-wave and terahertz integrated circuits', bio: 'B.S. and M.S. in Electrical Engineering from UC Davis (2020, 2022). Under Prof. Omeed Momeni, designed LC VCO in C-band with thesis on low power, low phase noise VCO for PLL applications. Senior RF Design Engineer for two years specializing in military communication systems VHF to C-Band.', photoPosition: 'center 15%' },
  { name: 'Yuncheng Tu', initials: 'YT', image: '/images/members/phd-yuncheng-tu.png', focus: 'Analog, RF, and mm-wave circuits', bio: 'B.S. in Electrical Engineering from Southern University of Science and Technology, Shenzhen, China (2025). Currently pursuing Ph.D. at UCI.', photoPosition: 'center 15%' },
];

export const undergradResearchers: Member[] = [
  { name: 'Albert Huang', initials: 'AH', image: '/images/members/undergrad-albert-huang.png', focus: 'Analog circuit design', bio: 'Pursuing BSc in Electrical and Computer Engineering at UCI, specializing in Electronic Circuit Design, Semiconductors, and RF, Antennas, and Microwaves.', photoPosition: 'center 15%' },
];

export const phdAlumni: Alumnus[] = [
  { name: 'Masoud Berahman', scholar: 'https://scholar.google.com/citations?user=BZgCwmkAAAAJ', initials: 'MB', image: '/images/members/alumni-berahman.png', detail: 'Ph.D./Postdoc', now: undefined, bio: 'Completed PhD in electrical engineering and postdoctoral fellowship in physics. Primary research interests in two and one-dimensional materials applications in future electronic devices.', photoPosition: 'center 15%' },
  { name: 'Xuyang Liu', scholar: 'https://scholar.google.com/citations?user=X43HexAAAAAJ', initials: 'XL', image: '/images/members/alumni-xuyang-liu.png', detail: '2020-2025', now: 'Staff Engineer, Marvell Technology', bio: 'BS in Electronic Information Engineering from Jilin University, China (2018), MS in Electrical Engineering from Columbia University (2019), PhD from UCI (2025). Research interests in mmWave front-end, VCO and PLL, FMCW radar system.', photoPosition: 'center 15%' },
  { name: 'Behnam Moradi Shahrbabak', initials: 'BM', image: '/images/members/alumni-behnam.jpg', detail: '2019-2024', now: 'Senior RFIC Engineer, Kyocera', bio: 'Research interests in analog, RF, millimeter-wave circuits, and system design.', photoPosition: 'center 25%' },
];

export const otherAlumni: Alumnus[] = [
  { name: 'Xuzhe Zhao', initials: 'XZ', image: '/images/members/alumni-xuzhe-zhao.png', detail: 'M.S.', photoPosition: 'center 15%' },
  { name: 'Tanqin He', initials: 'TH', image: '/images/members/alumni-tanqin-he.png', detail: 'M.S.', photoPosition: 'center 15%' },
  { name: 'Pooya Khajeh', initials: 'PK', image: '/images/members/alumni-pooya.jpg', detail: 'M.S.', now: 'R&D Test Engineer, Broadcom', photoPosition: 'center 15%' },
  { name: 'Wei Dai', initials: 'WD', image: '/images/members/undergrad-wei-dai.png', detail: 'B.Sc.', photoPosition: 'center 15%' },
  { name: 'Mengjie (Kaylee) Xie', initials: 'MX', image: '/images/members/alumni-annika.png', detail: 'B.Sc.', now: 'Graduate Student, Stanford', photoPosition: 'center 15%' },
  { name: 'Kelly Aung Lu', initials: 'KL', image: '/images/members/alumni-kaylee.jpg', detail: 'B.Sc.', photoPosition: 'center 15%' },
  { name: 'Annika Ageles Del Rosario', initials: 'AA', image: '/images/members/alumni-kelly.jpg', detail: 'B.Sc.', now: 'Hardware Engineer, Western Digital', photoPosition: 'center 15%' },
  { name: 'Marcus Clark Wong', initials: 'MW', image: '/images/members/alumni-marcus.png', detail: 'B.Sc.', now: 'PhD Student, UCSC', photoPosition: 'center 15%' },
  { name: 'Shihao Han', initials: 'SH', image: '/images/members/alumni-shihao.png', detail: 'M.S.', photoPosition: 'center 15%' },
  { name: 'Yankai Yang', initials: 'YY', image: '/images/members/alumni-yankai.png', detail: 'M.S.', photoPosition: 'center 15%' },
];
