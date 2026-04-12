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

            // Filtrar provincias que SÍ tienen registrado un porcentaje
            const provinciasConAvance = p.provincias.filter(
              (prov) => prov.porcentaje_avance !== null && prov.porcentaje_avance !== undefined
            );

            // Calcular el promedio general
            let avancePromedio: number | undefined = undefined;
            if (provinciasConAvance.length > 0) {
              const suma = provinciasConAvance.reduce(
                (acc, prov) => acc + (prov.porcentaje_avance || 0),
                0
              );
              avancePromedio = Math.round(suma / provinciasConAvance.length);
            }

            return (
              <Stack gap={4}>
                <Text size="xs" truncate
                  title={p.provincias.map((pv) => pv.nombre).join(', ')} // Tooltip nativo rápido de texto
                >
                  {p.provincias.map((pv) => pv.nombre).join(', ')}
                </Text>

                {avancePromedio !== undefined && (
                  <Tooltip
                    color="dark"
                    disabled={provinciasConAvance.length <= 1} // Solo mostrar si hay desglose útil
                    label={
                      <Stack gap={4} py={2}>
                        <Text size="xs" fw={700} c="dimmed" mb={2}>
                          Desglose por provincia:
                        </Text>
                        {provinciasConAvance.map((prov, i) => (
                          <Group key={i} justify="space-between" miw={180} wrap="nowrap">
                            <Text size="xs">{prov.nombre}</Text>
                            <Group gap={6} style={{ flex: 1 }} justify="flex-end">
                              <Progress
                                value={prov.porcentaje_avance!}
                                size="sm"
                                color="congope"
                                style={{ flex: 1, minWidth: 60 }}
                              />
                              <Text size="xs" fw={500} w={28} ta="right">
                                {prov.porcentaje_avance}%
                              </Text>
                            </Group>
                          </Group>
                        ))}
                      </Stack>
                    }
                  >
                    <Group gap={4} style={{ cursor: provinciasConAvance.length > 1 ? 'help' : 'default' }}>
                      <Progress
                        value={avancePromedio}
                        size="xs"
                        color={avancePromedio === 100 ? "green" : "congope"}
                        style={{ flex: 1 }}
                      />
                      <Text size="xs" fw={500}>{avancePromedio}%</Text>
                    </Group>
                  </Tooltip>
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
