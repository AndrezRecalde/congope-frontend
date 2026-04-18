'use client'

import {
  Paper, Stack, Title, Text, Group,
  Badge, Skeleton, Anchor, ThemeIcon,
  Divider,
} from '@mantine/core';
import {
  IconCalendarEvent,
  IconAlertTriangle,
  IconCheck,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useMisCompromisosPendientes } from
  '@/queries/dashboard.queries';
import { formatFecha }
  from '@/utils/formatters';

export function CompromisosPendientes() {
  const {
    data: compromisos = [],
    isLoading,
  } = useMisCompromisosPendientes();

  if (isLoading) {
    return (
      <Paper p="lg" radius="lg"
        style={{
          border: '1px solid var(--mantine-color-default-border)',
        }}>
        <Skeleton height={16} width={200} mb="md" />
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i} height={60} radius="md" mb="xs"
          />
        ))}
      </Paper>
    );
  }

  return (
    <Paper
      p="lg"
      radius="lg"
      style={{
        border: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <Group justify="space-between" mb="md">
        <Title order={5}>
          Mis compromisos pendientes
        </Title>
        {compromisos.length > 0 && (
          <Badge
            color={
              compromisos.some((c) => c.vencido)
                ? 'red'
                : 'orange'
            }
            variant="light"
          >
            {compromisos.length}
          </Badge>
        )}
      </Group>

      {compromisos.length === 0 ? (
        <Stack align="center" py="md" gap="xs">
          <ThemeIcon
            size={40}
            radius="xl"
            color="green"
            variant="light"
          >
            <IconCheck size={20} />
          </ThemeIcon>
          <Text size="sm" c="dimmed" ta="center">
            Sin compromisos pendientes
          </Text>
        </Stack>
      ) : (
        <Stack gap="xs">
          {compromisos.map((compromiso, index) => (
            <div key={compromiso.id}>
              {index > 0 && <Divider />}
              <Group
                gap="sm"
                py="xs"
                wrap="nowrap"
                align="flex-start"
              >
                <ThemeIcon
                  size={32}
                  radius="md"
                  color={
                    compromiso.vencido ? 'red' : 'orange'
                  }
                  variant="light"
                  style={{ flexShrink: 0, marginTop: 2 }}
                >
                  <IconAlertTriangle size={16} />
                </ThemeIcon>

                <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" lineClamp={2} lh={1.4}>
                    {compromiso.descripcion}
                  </Text>

                  {/* Evento asociado */}
                  {compromiso.evento && (
                    <Anchor
                      component={Link}
                      href={`/eventos/${compromiso.evento.id}`}
                      size="xs"
                      c="dimmed"
                    >
                      <Group gap={4}>
                        <IconCalendarEvent size={11} />
                        {compromiso.evento.titulo}
                      </Group>
                    </Anchor>
                  )}

                  <Group gap="xs">
                    {/* Fecha límite */}
                    <Badge
                      size="xs"
                      color={
                        compromiso.vencido ? 'red' : 'orange'
                      }
                      variant="light"
                    >
                      {compromiso.vencido
                        ? '⚠ Vencido'
                        : `Límite: ${formatFecha(
                            compromiso.fecha_limite
                          )}`}
                    </Badge>

                    {/* Días restantes */}
                    {!compromiso.vencido && (
                      <Text size="xs" c="dimmed">
                        {compromiso.dias_restantes} día
                        {compromiso.dias_restantes !== 1
                          ? 's'
                          : ''} restantes
                      </Text>
                    )}
                  </Group>
                </Stack>
              </Group>
            </div>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
