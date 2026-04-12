import {
  Paper,
  Group,
  Stack,
  Text,
  Title,
  ThemeIcon,
  Skeleton,
  Badge,
  Anchor,
} from "@mantine/core";
import type { MantineColor } from "@mantine/core";
import Link from "next/link";

interface KpiCardProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icono: React.ReactNode;
  color: MantineColor;
  isLoading?: boolean;
  href?: string;
  badge?: {
    label: string;
    color: MantineColor;
  };
  // Desglose secundario (ej: tipos de actores)
  desglose?: Array<{
    label: string;
    valor: number;
  }>;
}

export function KpiCard({
  titulo,
  valor,
  subtitulo,
  icono,
  color,
  isLoading = false,
  href,
  badge,
  desglose,
}: KpiCardProps) {
  if (isLoading) {
    return (
      <Paper
        p="lg"
        radius="lg"
        style={{
          border: "1px solid var(--mantine-color-gray-3)",
        }}
      >
        <Skeleton height={16} width="60%" mb="sm" />
        <Skeleton height={36} width="40%" mb="xs" />
        <Skeleton height={12} width="80%" />
      </Paper>
    );
  }

  const content = (
    <Paper
      p="lg"
      radius="lg"
      style={{
        border: "1px solid var(--mantine-color-gray-3)",
        transition: "all 200ms ease",
        cursor: href ? "pointer" : "default",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = "var(--mantine-shadow-md)";
        el.style.transform = href ? "translateY(-2px)" : "none";
        el.style.borderColor = `var(--mantine-color-${color}-3)`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = "";
        el.style.transform = "none";
        el.style.borderColor = "var(--mantine-color-gray-3)";
      }}
    >
      <Group wrap="nowrap" align="center" gap="md">
        {/* Izquierda: Ícono */}
        <ThemeIcon size={48} radius="md" color={color} variant="light">
          {icono}
        </ThemeIcon>

        {/* Derecha: Valores y Detalles */}
        <Stack gap={2} style={{ flex: 1 }}>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Text
              size="xs"
              fw={700}
              c="gray.6"
              style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              {titulo}
            </Text>
            {badge && (
              <Badge color={badge.color} variant="light" size="xs">
                {badge.label}
              </Badge>
            )}
          </Group>

          <Group align="baseline" gap="xs">
            <Title order={3} fw={700} lh={1} c="gray.9">
              {valor}
            </Title>
          </Group>
          <Group>
            {subtitulo && (
              <Text size="xs" c="dimmed" fw={500}>
                {subtitulo}
              </Text>
            )}
          </Group>

          {/* Desglose secundario */}
          {desglose && desglose.length > 0 && (
            <Group gap={4} wrap="wrap" mt={4}>
              {desglose.map((item) => (
                <Badge key={item.label} variant="dot" color="gray" size="xs">
                  {item.label}: {item.valor}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>
      </Group>
    </Paper>
  );

  return href ? (
    <Anchor component={Link} href={href} style={{ textDecoration: "none" }}>
      {content}
    </Anchor>
  ) : (
    content
  );
}
