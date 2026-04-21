'use client'

import {
  Collapse, Stack, Group, Text, Badge,
  ActionIcon, Tooltip, Skeleton, Paper,
  ThemeIcon,
} from '@mantine/core';
import {
  IconDownload,
  IconEye,
  IconClockHour3,
  IconCheck,
} from '@tabler/icons-react';
import { useVersionesDocumento }
  from '@/queries/documentos.queries';
import type { VersionDocumento }
  from '@/types/documento.types';

interface HistorialVersionesProps {
  documentoId: string;
  abierto:     boolean;
  onPrevisualizar?: (doc: VersionDocumento) => void;
}

export function HistorialVersiones({
  documentoId,
  abierto,
  onPrevisualizar,
}: HistorialVersionesProps) {
  const { data, isLoading } =
    useVersionesDocumento(documentoId, abierto);

  const versiones = data?.data ?? [];

  return (
    <Collapse in={abierto}>
      <Paper
        p="sm"
        radius="md"
        mt="xs"
        style={{
          background:
            'var(--mantine-color-gray-0)',
          border:
            '1px solid var(--mantine-color-gray-3)',
        }}
      >
        {isLoading ? (
          <Stack gap="xs">
            {[1, 2].map((i) => (
              <Skeleton key={i}
                height={40} radius="sm" />
            ))}
          </Stack>
        ) : versiones.length === 0 ? (
          <Text size="xs" c="dimmed" ta="center"
            py="xs">
            Sin historial de versiones
          </Text>
        ) : (
          <Stack gap={6}>
            <Text
              size="xs"
              fw={700}
              c="dimmed"
              tt="uppercase"
              style={{ letterSpacing: '0.06em' }}
              mb={4}
            >
              Historial de versiones
            </Text>
            {versiones.map((version) => (
              <div
                key={version.id}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  gap:            8,
                  padding:        '6px 8px',
                  borderRadius:   8,
                  background:     version.version_activa
                    ? 'var(--mantine-color-blue-0)'
                    : 'white',
                  border:         `1px solid ${
                    version.version_activa
                      ? 'var(--mantine-color-blue-2)'
                      : 'var(--mantine-color-gray-2)'
                  }`,
                }}
              >
                {/* Badge de versión */}
                <Badge
                  size="xs"
                  variant={
                    version.version_activa
                      ? 'filled'
                      : 'outline'
                  }
                  color={
                    version.version_activa
                      ? 'blue'
                      : 'gray'
                  }
                  style={{ flexShrink: 0 }}
                >
                  v{version.version}
                </Badge>

                {/* Icono activo */}
                {version.version_activa && (
                  <ThemeIcon
                    size={16}
                    radius="xl"
                    color="green"
                    variant="light"
                    style={{ flexShrink: 0 }}
                  >
                    <IconCheck size={12} />
                  </ThemeIcon>
                )}

                {/* Info */}
                <div style={{ flex: 1,
                  overflow: 'hidden' }}>
                  <Text size="xs" fw={500}
                    lineClamp={1}>
                    {version.nombre_archivo}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {version.tamano_legible} ·{' '}
                    {version.created_at}
                  </Text>
                </div>

                {/* Acciones */}
                <Group gap={4} wrap="nowrap"
                  style={{ flexShrink: 0 }}>
                  {onPrevisualizar && (
                    <Tooltip label="Previsualizar">
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color="blue"
                        onClick={() =>
                          onPrevisualizar(version)
                        }
                      >
                        <IconEye size={12} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  <Tooltip label="Descargar esta versión">
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="gray"
                      component="a"
                      href={version.url_descarga}
                      download={version.nombre_archivo}
                    >
                      <IconDownload size={12} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </div>
            ))}
          </Stack>
        )}
      </Paper>
    </Collapse>
  );
}
