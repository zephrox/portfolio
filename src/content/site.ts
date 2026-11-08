/** Site-wide facts and links. Edit here, not inside components. */
export const site = {
  name: 'Anjir Jaman',
  email: 'anjir.jm@gmail.com',
  nav: [
    { label: 'Work', href: '#work' },
    { label: 'Research', href: '#research' },
    { label: 'CV', href: '#cv' },
  ],
  links: {
    work: '#work',
    research: '#research',
    disasterXPaper: '#research',
    cogniLink: '#work',
    shohojLipi: '#work',
  },
} as const;
