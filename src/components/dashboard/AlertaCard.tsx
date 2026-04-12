import { Paper, Group, Text, ThemeIcon, Anchor, Stack }
  from '@mantine/core';
import type { MantineColor } from '@mantine/core';
import Link from 'next/link';

interface AlertaCardProps {
  label:    string;
  valor:    number;
  icono:    React.ReactNode;
  color:    MantineColor;
  href?:    string;
}

export function AlertaCard({
  label,
  valor,
  icono,
  color,
  href,
}: AlertaCardProps) {
  const contenido = (
    <Paper
      p="md"
      radius="md"
      style={{
        border: `1px solid var(--mantine-color-${color}-3)`,
        background:
          `var(--mantine-color-${color}-0)`,
        cursor: href ? 'pointer' : 'default',
        transition: 'box-shadow 150ms ease',
      }}
    >
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon
          size={36}
          radius="md"
          color={color}
          variant="light"
        >
          {icono}
        </ThemeIcon>
        <Stack gap={2}>
          <Text
            size="xl"
            fw={700}
            c={`${color}.8`}
            lh={1}
          >
            {valor}
          </Text>
          <Text size="xs" c="dimmed" lh={1.3}>
            {label}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );

  if (href) {
    return (
      <Anchor
        component={Link}
        href={href}
        style={{ textDecoration: 'none' }}
      >
        {contenido}
      </Anchor>
    );
  }

  return contenido;
}
