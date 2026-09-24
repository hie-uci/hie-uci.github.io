// Site-wide constants: navigation, contact details, institutional links.

export interface NavLink {
  name: string;
  href: string;
  /** Shown in the site search and the mobile menu. */
  description: string;
}

export const navLinks: NavLink[] = [
  { name: 'Home', href: '/', description: 'The lab, its silicon and latest news' },
  { name: 'Research', href: '/research', description: 'Five active research thrusts' },
  { name: 'RF Toolbox', href: '/rf-toolbox', description: 'Interactive RF and microwave calculators' },
  { name: 'Measurements & Design', href: '/measurement-tutorial', description: 'Video guides for the bench and EM design' },
  { name: 'Publications', href: '/publications', description: 'Journal, conference, talks and patents' },
  { name: 'Team', href: '/team', description: 'Director, PhD students and alumni' },
  { name: 'Chip Gallery', href: '/chip-gallery', description: 'Die photographs of fabricated chips' },
  { name: 'News', href: '/news', description: 'Awards, defenses and publications' },
  { name: 'Teaching', href: '/teaching', description: 'Courses at UCI and Cornell' },
  { name: 'Contact', href: '/contact', description: 'Reach the lab' },
  { name: 'Positions', href: '/available-positions', description: 'Openings for PhD, MS and undergraduate researchers' },
];

// The member portal is a separate application on its own domain, not a route of
// this static site. Sign-in is invitation-only; there is no public registration
// behind this link. This constant is the only coupling between the two.
export const PORTAL_URL = 'https://portal.ai4circuit.com';

export const contact = {
  email: 'haghasi@uci.edu',
  phone: '(949) 824-8810',
  phoneHref: 'tel:+19498248810',
  university: 'University of California, Irvine',
  department: 'Department of Electrical Engineering and Computer Science',
  city: 'Irvine, CA 92697',
};

export const institutionLinks = {
  uci: 'https://uci.edu',
  samueli: 'https://engineering.uci.edu',
  eecs: 'https://engineering.uci.edu/dept/eecs',
  privacy: 'https://uci.edu/privacy/index.php',
};
