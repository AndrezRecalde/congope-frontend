import type { Metadata } from 'next';
import { cookies }   from 'next/headers';
import { redirect }  from 'next/navigation';
import { Box, Stack, Text, Group } from '@mantine/core';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server Layout Guard inverso:
  // Si ya hay sesión activa → ir al dashboard
  const cookieStore = await cookies();
  const token = cookieStore.get('congope_token');
  if (token) redirect('/dashboard');

  return (
    <Box
      style={{
        minHeight:       '100vh',
        background:      'linear-gradient(150deg, #0F2444 0%, #1A3A5C 45%, #2E6DA4 100%)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '1rem',
      }}
    >
      <Stack align="center" gap="xl" w="100%" maw={420}>

        {/* Cabecera institucional */}
        <Stack align="center" gap="xs">
          <Box
            style={{
              width:        72,
              height:       72,
              borderRadius: '50%',
              background:   'rgba(255,255,255,0.1)',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              border:       '2px solid rgba(255,255,255,0.2)',
            }}
          >
            {/* Placeholder del logo — reemplazar con
                <Image src="/logo-congope-blanco.svg" ... />
                cuando el asset esté disponible */}
            <Text fw={700} size="xl" c="white">C</Text>
          </Box>
          <Text
            fw={700}
            size="lg"
            c="white"
            ta="center"
            style={{ letterSpacing: '0.05em' }}
          >
            CONGOPE
          </Text>
          <Text
            size="xs"
            c="rgba(255,255,255,0.6)"
            ta="center"
            maw={280}
            lh={1.5}
          >
            Plataforma de Cooperación Internacional
            y Nacional
          </Text>
        </Stack>

        {/* Contenido de la página (formulario de login) */}
        {children}

        {/* Footer */}
        <Text size="xs" c="rgba(255,255,255,0.4)" ta="center">
          © {new Date().getFullYear()} CONGOPE · Ecuador
        </Text>
      </Stack>
    </Box>
  );
}
