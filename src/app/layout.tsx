import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { Providers } from '@/components/ui/Providers';

// Cargar Inter con next/font para optimización automática
const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  weight:   ['400', '500', '600', '700'],
  display:  'swap',
});

// Importar estilos en el orden correcto
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';
import '@mantine/dropzone/styles.css';
import 'mantine-datatable/styles.layer.css';
import 'mantine-contextmenu/styles.layer.css';
import '@/styles/globals.css';
import '@/styles/fullcalendar.css';
import '@/styles/mapa.css';

export const metadata: Metadata = {
  title: {
    template: '%s | CONGOPE',
    default:  'CONGOPE — Plataforma de Cooperación Internacional',
  },
  description:
    'Sistema de gestión de cooperación internacional y nacional ' +
    'de los 23 Gobiernos Autónomos Provinciales del Ecuador.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={inter.variable}
      {...mantineHtmlProps}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
