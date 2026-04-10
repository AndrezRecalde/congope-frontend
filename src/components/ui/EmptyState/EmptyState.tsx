import {
  Stack, Text, Title, ThemeIcon, Box,
} from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';

interface EmptyStateProps {
  titulo:      string;
  descripcion: string;
  accion?:     React.ReactNode;
  icono?:      React.ReactNode;
}

export function EmptyState({
  titulo,
  descripcion,
  accion,
  icono = <IconInbox size={32} />,
}: EmptyStateProps) {
  return (
    <Box py="3xl">
      <Stack align="center" gap="md">
        <ThemeIcon
          size={72}
          variant="light"
          color="gray"
          radius="xl"
        >
          {icono}
        </ThemeIcon>

        <Stack align="center" gap={6}>
          <Title order={4} c="gray.7">
            {titulo}
          </Title>
          <Text
            size="sm"
            c="dimmed"
            ta="center"
            maw={380}
            lh={1.6}
          >
            {descripcion}
          </Text>
        </Stack>

        {accion}
      </Stack>
    </Box>
  );
}
