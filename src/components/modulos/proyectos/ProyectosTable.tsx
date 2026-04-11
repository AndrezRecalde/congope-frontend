'use client'

import { DataTable }   from 'mantine-datatable';
import {
  Group, Text, Badge, Stack,
  ActionIcon, Tooltip, Progress, Anchor,
} from '@mantine/core';
import {
  IconEye, IconEdit, IconTrash,
  IconRefresh,
} from '@tabler/icons-react';
import Link from 'next/link';
import { StatusBadge }   from
  '@/components/ui/StatusBadge/StatusBadge';
import { formatFecha, formatMoneda }
  from '@/utils/formatters';
import { getColorOds }  from '@/utils/colores-ods';
import type { Proyecto } from '@/services/axios';

interface ProyectosTableProps {
  proyectos:         Proyecto[];
  total:             number;
  page:              number;
  perPage:           number;
  isLoading:         boolean;
  onPageChange:      (page: number) => void;
  onEditar:          (p: Proyecto) => void;
  onEliminar:        (p: Proyecto) => void;
  onCambiarEstado:   (p: Proyecto) => void;
  puedeEditar:       boolean;
  puedeEliminar:     boolean;
  puedeCambiarEstado:boolean;
}

export function ProyectosTable({
  proyectos,
  total,
  page,
  perPage,
  isLoading,
  onPageChange,
  onEditar,
  onEliminar,
  onCambiarEstado,
  puedeEditar,
  puedeEliminar,
  puedeCambiarEstado,
}: ProyectosTableProps) {
  return (
    <DataTable
      records={proyectos}
      fetching={isLoading}
      totalRecords={total}
      recordsPerPage={perPage}
      page={page}
      onPageChange={onPageChange}
      striped
      highlightOnHover
      withTableBorder
      withColumnBorders={false}
      borderRadius="md"
      minHeight={320}
      noRecordsText="No se encontraron proyectos"
      loadingText="Cargando proyectos..."
      paginationText={({ from, to, totalRecords }) =>
        `Mostrando ${from}–${to} de ${totalRecords} proyectos`
      }
      styles={{
        header: {
          backgroundColor: 'var(--mantine-color-gray-1)',
        },
      }}
      columns={[
        {
          accessor: 'codigo',
          title:    'Código',
          width:    140,
          render:   (p) => (
            <Text size="xs" c="dimmed" fw={500}>
              {p.codigo}
            </Text>
          ),
        },
        {
          accessor: 'nombre',
          title:    'Proyecto',
          render:   (p) => (
            <Stack gap={2}>
              <Anchor
                component={Link}
                href={`/proyectos/${p.id}`}
                size="sm"
                fw={500}
                c="congope.8"
                style={{ textDecoration: 'none' }}
                lineClamp={2}
              >
                {p.nombre}
              </Anchor>
              {p.actor && (
                <Text size="xs" c="dimmed" truncate>
                  {p.actor.nombre}
                </Text>
              )}
            </Stack>
          ),
        },
        {
          accessor: 'estado',
          title:    'Estado',
          width:    130,
          render:   (p) => (
            <StatusBadge estado={p.estado} tipo="proyecto" />
          ),
        },
        {
          accessor: 'provincias',
          title:    'Provincias',
          width:    160,
          render:   (p) => {
            if (p.provincias.length === 0)
              return <Text size="xs" c="dimmed">—</Text>;
            const avance = p.provincias.find(
              (prov) => prov.porcentaje_avance !== null
            )?.porcentaje_avance;
            return (
              <Stack gap={4}>
                <Text size="xs" truncate>
                  {p.provincias.map((pv) => pv.nombre).join(', ')}
                </Text>
                {avance !== undefined && avance !== null && (
                  <Group gap={4}>
                    <Progress
                      value={avance}
                      size="xs"
                      color="congope"
                      style={{ flex: 1 }}
                    />
                    <Text size="xs" fw={500}>{avance}%</Text>
                  </Group>
                )}
              </Stack>
            );
          },
        },
        {
          accessor: 'monto_formateado',
          title:    'Monto',
          width:    150,
          render:   (p) => (
            <Text size="sm" fw={500}>
              {p.monto_formateado ?? '—'}
            </Text>
          ),
        },
        {
          accessor: 'ods',
          title:    'ODS',
          width:    120,
          render:   (p) => (
            <Group gap={4}>
              {p.ods.slice(0, 4).map((o) => (
                <Tooltip
                  key={o.id}
                  label={`ODS ${o.numero}: ${o.nombre}`}
                >
                  <Badge
                    size="xs"
                    circle
                    style={{
                      background: getColorOds(o.numero),
                      color: 'white',
                      minWidth: 20,
                    }}
                  >
                    {o.numero}
                  </Badge>
                </Tooltip>
              ))}
              {p.ods.length > 4 && (
                <Text size="xs" c="dimmed">+{p.ods.length - 4}</Text>
              )}
            </Group>
          ),
        },
        {
          accessor: 'fecha_inicio',
          title:    'Inicio',
          width:    100,
          render:   (p) => (
            <Text size="xs" c="dimmed">
              {formatFecha(p.fecha_inicio, 'MM/YYYY')}
            </Text>
          ),
        },
        {
          accessor: 'acciones',
          title:    '',
          width:    120,
          textAlign: 'right',
          render:   (p) => (
            <Group gap={4} justify="flex-end" wrap="nowrap">
              <Tooltip label="Ver detalle">
                <ActionIcon
                  component={Link}
                  href={`/proyectos/${p.id}`}
                  variant="subtle"
                  color="gray"
                  size="sm"
                >
                  <IconEye size={15} />
                </ActionIcon>
              </Tooltip>
              {puedeCambiarEstado && (
                <Tooltip label="Cambiar estado">
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    size="sm"
                    onClick={() => onCambiarEstado(p)}
                  >
                    <IconRefresh size={15} />
                  </ActionIcon>
                </Tooltip>
              )}
              {puedeEditar && (
                <Tooltip label="Editar">
                  <ActionIcon
                    variant="subtle"
                    color="congope"
                    size="sm"
                    onClick={() => onEditar(p)}
                  >
                    <IconEdit size={15} />
                  </ActionIcon>
                </Tooltip>
              )}
              {puedeEliminar && (
                <Tooltip label="Eliminar">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => onEliminar(p)}
                  >
                    <IconTrash size={15} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          ),
        },
      ]}
    />
  );
}
