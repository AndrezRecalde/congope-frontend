import type { Metadata } from 'next';
import {
  Playfair_Display,
  DM_Sans,
} from 'next/font/google';
import './portal.css';

const playfair = Playfair_Display({
  subsets:  ['latin'],
  variable: '--font-playfair',
  display:  'swap',
});

const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-dm-sans',
  display:  'swap',
});

export const metadata: Metadata = {
  title:       'CONGOPE — Cooperación Internacional',
  description:
    'Portal de cooperación internacional y nacional ' +
    'de los Gobiernos Autónomos Descentralizados ' +
    'Provinciales del Ecuador.',
  openGraph: {
    title:       'CONGOPE — Cooperación Internacional',
    description: 'Portal público de proyectos de ' +
      'cooperación internacional del CONGOPE.',
    locale:      'es_EC',
    type:        'website',
  },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${playfair.variable} ${dmSans.variable} portal-root`}
    >
      {children}
    </div>
  );
}
