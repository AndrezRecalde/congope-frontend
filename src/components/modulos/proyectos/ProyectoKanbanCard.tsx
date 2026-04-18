'use client'

import {
  Paper, Text, Badge, Group, Stack,
  Progress, ActionIcon, Tooltip,
} from '@mantine/core';
import { Draggable } from '@hello-pangea/dnd';
import {
  IconEdit, IconEye, IconBuilding,
} from '@tabler/icons-react';
import Link from 'next/link';
import { getColorOds }   from '@/utils/colores-ods';
import type { Proyecto } from '@/services/axios';

interface ProyectoKanbanCardProps {
  proyecto:    Proyecto;
  index:       number;
  onEditar:    (proyecto: Proyecto) => void;
  puedeEditar: boolean;
}

export function ProyectoKanbanCard({
  proyecto,
  index,
  onEditar,
  puedeEditar,
}: ProyectoKanbanCardProps) {
  // Calcular porcentaje de avance promedio de provincias
  const provinciasConAvance = proyecto.provincias.filter(
    (p) => p.porcentaje_avance !== null
  );
  const avancePromedio =
    provinciasConAvance.length > 0
      ? Math.round(
          provinciasConAvance.reduce(
            (sum, p) => sum + (p.porcentaje_avance ?? 0),
            0
          ) / provinciasConAvance.length
        )
      : 0;

  return (
    <Draggable draggableId={proyecto.id} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          p="sm"
          radius="md"
          mb="xs"
          style={{
            ...provided.draggableProps.style,
            border: '1px solid var(--mantine-color-default-border)',
            backgroundColor: snapshot.isDragging
              ? 'var(--mantine-color-congope-light)'
              : 'var(--mantine-color-body)',
            boxShadow: snapshot.isDragging
              ? 'var(--mantine-shadow-lg)'
              : 'var(--mantine-shadow-xs)',
            cursor: 'grab',
            userSelect: 'none',
          }}
        >
          <Stack gap="xs">
            {/* Código y acciones */}
            <Group justify="space-between" wrap="nowrap">
              <Text size="xs" c="dimmed" fw={500}>
                {proyecto.codigo}
              </Text>
              <Group gap={4}>
                <Tooltip label="Ver detalle">
                  <ActionIcon
                    component={Link}
                    href={`/proyectos/${proyecto.id}`}
                    variant="subtle"
                    color="gray"
                    size="xs"
                  >
                    <IconEye size={13} />
                  </ActionIcon>
                </Tooltip>
                {puedeEditar && (
                  <Tooltip label="Editar">
                    <ActionIcon
                      variant="subtle"
                      color="congope"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditar(proyecto);
                      }}
                    >
                      <IconEdit size={13} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </Group>

            {/* Nombre del proyecto */}
            <Text size="sm" fw={600} lh={1.3} lineClamp={2}>
              {proyecto.nombre}
            </Text>

            {/* Actores cooperantes */}
            {proyecto.actores && proyecto.actores.length > 0 && (
              <Tooltip
                label={proyecto.actores.map((a) => a.nombre).join(' · ')}
                disabled={proyecto.actores.length <= 1}
                multiline
                maw={220}
              >
                <Group gap={4} wrap="nowrap">
                  <IconBuilding
                    size={12}
                    color="var(--mantine-color-gray-5)"
                  />
                  <Text size="xs" c="dimmed" truncate style={{ flex: 1 }}>
                    {proyecto.actores[0].nombre}
                  </Text>
                  {proyecto.actores.length > 1 && (
                    <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                      +{proyecto.actores.length - 1}
                    </Text>
                  )}
                </Group>
              </Tooltip>
            )}

            {/* Monto */}
            {proyecto.monto_total && (
              <Text size="xs" fw={500} style={{ color: 'var(--mantine-color-congope-light-color)' }}>
                {proyecto.monto_formateado}
              </Text>
            )}

            {/* Progreso */}
            {avancePromedio > 0 && (
              <Stack gap={4}>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Avance</Text>
                  <Text size="xs" fw={600}>{avancePromedio}%</Text>
                </Group>
                <Progress
                  value={avancePromedio}
                  size="xs"
                  color="congope"
                />
              </Stack>
            )}

            {/* ODS badges */}
            {proyecto.ods.length > 0 && (
              <Group gap={4}>
                {proyecto.ods.slice(0, 4).map((ods) => (
                  <Tooltip
                    key={ods.id}
                    label={`ODS ${ods.numero}: ${ods.nombre}`}
                  >
                    <Badge
                      size="xs"
                      circle
                      style={{
                        background: getColorOds(ods.numero),
                        color:      'white',
                        minWidth:   20,
                        fontSize:   10,
                      }}
                    >
                      {ods.numero}
                    </Badge>
                  </Tooltip>
                ))}
                {proyecto.ods.length > 4 && (
                  <Text size="xs" c="dimmed">
                    +{proyecto.ods.length - 4}
                  </Text>
                )}
              </Group>
            )}

            {/* Provincias */}
            {proyecto.provincias.length > 0 && (
              <Text size="xs" c="dimmed">
                {proyecto.provincias
                  .map((p) => p.nombre)
                  .join(', ')}
              </Text>
            )}
          </Stack>
        </Paper>
      )}
    </Draggable>
  );
}
