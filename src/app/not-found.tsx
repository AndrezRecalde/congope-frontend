'use client';

import { Button, Center, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Center style={{ minHeight: '100vh' }}>
      <Stack align="center" gap="md" maw={400} px="md">
        <Title
          order={1}
          style={{
            fontSize:    '6rem',
            fontWeight:  700,
            lineHeight:  1,
            color:       'var(--mantine-color-congope-8)',
            opacity:     0.3,
          }}
        >
          404
        </Title>
        <Title order={2} ta="center">
          Página no encontrada
        </Title>
        <Text c="dimmed" ta="center" size="sm">
          La página que buscas no existe o fue movida
          a otra dirección.
        </Text>
        <Button
          component={Link}
          href="/dashboard"
          color="congope"
          size="md"
          mt="xs"
        >
          Ir al Dashboard
        </Button>
      </Stack>
    </Center>
  );
}
