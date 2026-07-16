export type NewsCategory = 'award' | 'defense' | 'publication' | 'conference' | 'milestone';

export interface NewsItem {
  date: string;
  month: number;
  year: number;
  title: string;
  category: NewsCategory;
  link?: string;
}

export const newsCategoryLabels: Record<NewsCategory, string> = {
  award: 'Award',
  defense: 'Defense',
  publication: 'Publication',
  conference: 'Conference',
  milestone: 'Milestone',
};

export const labNews: NewsItem[] = [
  {
    date: 'Jun 2026',
    month: 6,
    year: 2026,
    title: 'All-van der Waals MoTe₂ transistor paper published in Applied Physics Letters',
    category: 'publication',
    link: 'https://pubs.aip.org/aip/apl/article/128/25/253504/3396329',
  },
  { date: 'Oct 2025', month: 10, year: 2025, title: "Hedayat's IEEE RWW paper among finalists for best student paper award", category: 'award' },
  { date: 'Sep 2025', month: 9, year: 2025, title: 'Xuyang successfully defends his Ph.D. dissertation', category: 'defense' },
  { date: 'Sep 2025', month: 9, year: 2025, title: 'IEEE Radar Conference paper top 5 nominated for best student paper award (Allen and Xuyang)', category: 'award' },
  { date: 'Jul 2025', month: 7, year: 2025, title: 'Mahdi presented two articles at IEEE APS 2025', category: 'conference' },
  { date: 'Apr 2025', month: 4, year: 2025, title: 'FALCON accepted to NeurIPS 2025', category: 'milestone' },
  { date: 'Feb 2025', month: 2, year: 2025, title: "Xuyang's JSSC paper on phase-locked radar transceiver published", category: 'publication' },
  { date: 'Feb 2025', month: 2, year: 2025, title: 'Sub-THz communication paper published in Nature Communications Engineering', category: 'publication' },
  { date: 'Dec 2024', month: 12, year: 2024, title: "Behnam's TCAS-I paper on low-noise mm-wave VCOs published", category: 'publication' },
  { date: 'Oct 2024', month: 10, year: 2024, title: "Xuyang's TCAS-II paper on ultra-low-power Class-D VCOs published", category: 'publication' },
  { date: 'Sep 2024', month: 9, year: 2024, title: 'Behnam successfully defends his Ph.D. dissertation', category: 'defense' },
  { date: 'Jun 2024', month: 6, year: 2024, title: "Amin's NeurIPS ML4PS Workshop paper received Reproducibility Award", category: 'award' },
  { date: 'Mar 2024', month: 3, year: 2024, title: 'Xuyang and Hedayat advanced to doctoral candidacy', category: 'milestone' },
  { date: 'Oct 2023', month: 10, year: 2023, title: "Behnam's TCAS-I publication on mm-wave VCO design", category: 'publication' },
  { date: 'Jul 2023', month: 7, year: 2023, title: "Amin's IEEE MWTL paper on hybrid CMOS-polyimide force-sensing array published", category: 'publication' },
  { date: 'Mar 2023', month: 3, year: 2023, title: 'Hedayat receives IEEE MTT-S Pre-Doctoral Fellowship', category: 'award' },
  { date: 'Feb 2023', month: 2, year: 2023, title: "Hedayat's broadband terahertz antenna paper published in IEEE Access", category: 'publication' },
  { date: 'Jan 2023', month: 1, year: 2023, title: 'Collaborative paper with FIU accepted in IEEE TAP', category: 'publication' },
  { date: 'Dec 2022', month: 12, year: 2022, title: 'MFLEX Inc. sponsors lab for multi-phase research proposal', category: 'milestone' },
  { date: 'Nov 2022', month: 11, year: 2022, title: 'Behnam receives NSF Travel Grant Award to attend IEEE ESSCIRC', category: 'award' },
  { date: 'Oct 2022', month: 10, year: 2022, title: "Hedayat's first journal paper accepted in IEEE TCAS-II", category: 'publication' },
  { date: 'Sep 2022', month: 9, year: 2022, title: 'Collaborative paper accepted in IEEE TAP on sub-THz stacked-patch antenna', category: 'publication' },
  { date: 'Jul 2022', month: 7, year: 2022, title: 'Hedayat receives IEEE CICC Student Education Grant 2022', category: 'award' },
  { date: 'Jun 2022', month: 6, year: 2022, title: "Behnam and Xuyang's 76–82 GHz VCO paper accepted at IEEE RFIC", category: 'conference' },
  { date: 'Mar 2022', month: 3, year: 2022, title: "Hedayat's first HIE Lab paper accepted in IEEE MWTL", category: 'publication' },
  { date: 'Feb 2022', month: 2, year: 2022, title: 'Xuyang and Hedayat pass Ph.D. preliminary exams', category: 'milestone' },
  { date: 'Dec 2021', month: 12, year: 2021, title: 'mm-Wave Radars-on-Chip paper published in IEEE Communications Magazine', category: 'publication' },
  { date: 'Sep 2020', month: 9, year: 2020, title: 'Xuyang Liu joins HIE Lab as Ph.D. student', category: 'milestone' },
  { date: 'Sep 2020', month: 9, year: 2020, title: 'Hedayat Maktoomi joins HIE Lab as Ph.D. student', category: 'milestone' },
  { date: 'Jun 2019', month: 6, year: 2019, title: 'UCI Samueli School highlights our Applied Physics Reviews article', category: 'milestone' },
  { date: 'May 2019', month: 5, year: 2019, title: "Applied Physics Reviews article featured as Editor's Pick", category: 'award' },
  { date: 'Apr 2019', month: 4, year: 2019, title: 'IEEE TAP paper selected as featured article', category: 'award' },
  { date: 'Mar 2019', month: 3, year: 2019, title: 'Hafsah Arain joins HIE Lab as undergraduate researcher', category: 'milestone' },
  { date: 'Jan 2019', month: 1, year: 2019, title: 'Marcus Clark Wong joins HIE Lab as undergraduate researcher', category: 'milestone' },
];
