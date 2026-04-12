'use client'

import { useState }  from 'react';
import { DataTable } from 'mantine-datatable';
import {
  Group, Text, Badge, Stack, Code,
  Collapse, ActionIcon, Tooltip,
  Paper, SimpleGrid,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp }
  from '@tabler/icons-react';
import dayjs from 'dayjs';
import type {
  RegistroAuditoria,
} from '@/types/usuario.types';
import {
  getNombreModelo,
  COLOR_ACCION,
} from '@/types/usuario.types';

interface AuditoriaTableProps {
  registros:   RegistroAuditoria[];
  total:       number;
  page:        number;
  perPage:     number;
  isLoading:   boolean;
  onPageChange:(page: number) => void;
}

// Componente que muestra las diferencias
// entre valores anteriores y nuevos
function DiferenciaValores({
  anteriores,
  nuevos,
}: {
  anteriores: Record<string, unknown> | null;
  nuevos:     Record<string, unknown> | null;
}) {
  if (!anteriores && !nuevos) return null;

  // Para acciones de "crear" solo hay valores nuevos
  // Para "editar" hay ambos — mostrar diferencias
  const todasLasClaves = new Set([
    ...Object.keys(anteriores ?? {}),
    ...Object.keys(nuevos ?? {}),
  ]);

  // Filtrar claves de timestamps y IDs internos
  const clavesFiltradas = [...todasLasClaves].filter(
    (k) => !['updated_at', 'created_at'].includes(k)
  );

  return (
    <Stack gap="xs">
      {anteriores === null && nuevos && (
        // Acción de CREAR — mostrar valores nuevos
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
          {Object.entries(nuevos)
            .filter(([k]) =>
              !['updated_at', 'created_at'].includes(k)
            )
            .slice(0, 8) // Limitar para no sobrecargar
            .map(([clave, valor]) => (
              <Group key={clave} gap="xs" wrap="nowrap"
                align="flex-start">
                <Text size="xs" fw={600} c="dimmed"
                  style={{ minWidth: 100, flexShrink: 0 }}>
                  {clave}:
                </Text>
                <Code fz="xs" style={{
                  wordBreak: 'break-all', flex: 1,
                }}>
                  {String(valor ?? '—')}
                </Code>
              </Group>
            ))}
        </SimpleGrid>
      )}

      {anteriores !== null && nuevos && (
        // Acción de EDITAR — mostrar diferencias
        <Stack gap={4}>
          {clavesFiltradas
            .filter(
              (k) =>
                JSON.stringify(anteriores?.[k]) !==
                JSON.stringify(nuevos?.[k])
            )
            .slice(0, 6)
            .map((clave) => (
              <Group key={clave} gap="xs" wrap="nowrap"
                align="flex-start">
                <Text size="xs" fw={600} c="dimmed"
                  style={{ minWidth: 100, flexShrink: 0 }}>
                  {clave}:
                </Text>
                <Stack gap={2} style={{ flex: 1 }}>
                  {anteriores?.[clave] !== undefined && (
                    <Code fz="xs" color="red"
                      style={{ wordBreak: 'break-all' }}>
                      - {String(anteriores[clave] ?? '')}
                    </Code>
                  )}
                  {nuevos?.[clave] !== undefined && (
                    <Code fz="xs" color="green"
                      style={{ wordBreak: 'break-all' }}>
                      + {String(nuevos[clave] ?? '')}
                    </Code>
                  )}
                </Stack>
              </Group>
            ))}
        </Stack>
      )}
    </Stack>
  );
}

export function AuditoriaTable({
  registros,
  total,
  page,
  perPage,
  isLoading,
  onPageChange,
}: AuditoriaTableProps) {
  const [expandido, setExpandido] =
    useState<string | null>(null);

  const toggleExpandir = (id: string) => {
    setExpandido((prev) => prev === id ? null : id);
  };

  return (
    <DataTable
      records={registros}
      fetching={isLoading}
      totalRecords={total}
      recordsPerPage={perPage}
      page={page}
      onPageChange={onPageChange}
      withTableBorder
      withColumnBorders={false}
      borderRadius="md"
      minHeight={300}
      noRecordsText="Sin registros de auditoría"
      loadingText="Cargando registros..."
      paginationText={({ from, to, totalRecords }) =>
        `Mostrando ${from}–${to} de ${totalRecords}`
      }
      styles={{
        header: {
          backgroundColor:
            'var(--mantine-color-gray-1)',
        },
      }}
      rowExpansion={{
        allowMultiple: false,
        expanded: {
          recordIds: expandido ? [expandido] : [],
          onRecordIdsChange: (ids: unknown[]) =>
            setExpandido((ids[0] as string) ?? null),
        },
        content: ({ record }) => (
          <Paper
            p="md"
            m="xs"
            radius="md"
            style={{
              background:
                'var(--mantine-color-gray-0)',
              border:
                '1px solid var(--mantine-color-gray-3)',
            }}
          >
            <DiferenciaValores
              anteriores={record.valores_anteriores}
              nuevos={record.valores_nuevos}
            />
          </Paper>
        ),
      }}
      columns={[
        {
          accessor:  'expand',
          title:     '',
          width:     40,
          textAlign: 'center',
          render:    (r) => (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => toggleExpandir(r.id)}
            >
              {expandido === r.id
                ? <IconChevronUp size={14} />
                : <IconChevronDown size={14} />}
            </ActionIcon>
          ),
        },
        {
          accessor: 'accion',
          title:    'Acción',
          width:    110,
          render:   (r) => (
            <Badge
              size="sm"
              variant="light"
              color={COLOR_ACCION[r.accion] ?? 'gray'}
            >
              {r.accion}
            </Badge>
          ),
        },
        {
          accessor: 'modelo_tipo',
          title:    'Módulo',
          width:    140,
          render:   (r) => (
            <Text size="sm">
              {getNombreModelo(r.modelo_tipo)}
            </Text>
          ),
        },
        {
          accessor: 'usuario',
          title:    'Usuario',
          render:   (r) => (
            <Stack gap={2}>
              <Text size="sm" fw={500}>
                {r.usuario?.name ?? '—'}
              </Text>
              <Text size="xs" c="dimmed">
                {r.usuario?.email}
              </Text>
            </Stack>
          ),
        },
        {
          accessor: 'ip_address',
          title:    'IP',
          width:    120,
          render:   (r) => (
            <Text size="xs" c="dimmed" ff="monospace">
              {r.ip_address}
            </Text>
          ),
        },
        {
          accessor:  'created_at',
          title:     'Fecha',
          width:     150,
          render:    (r) => (
            <Text size="xs" c="dimmed">
              {/* created_at: "YYYY-MM-DD HH:mm:ss"
                  Formato diferente al resto del sistema */}
              {dayjs(r.created_at,
                'YYYY-MM-DD HH:mm:ss'
              ).format('DD/MM/YYYY HH:mm')}
            </Text>
          ),
        },
      ]}
    />
  );
}
