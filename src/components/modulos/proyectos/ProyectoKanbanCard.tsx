'use client'

import {
  Paper, Text, Badge, Group, Stack,
  Progress, ActionIcon, Tooltip,
} from '@mantine/core';
import { useDraggable } from '@dnd-kit/core';
import {
  IconEdit, IconEye, IconBuilding,
} from '@tabler/icons-react';
import Link from 'next/link';
import { getColorOds }   from '@/utils/colores-ods';
import { RiesgoBadge }   from '@/components/ui/RiesgoBadge/RiesgoBadge';
import type { Proyecto } from '@/services/axios';

interface ProyectoKanbanCardProps {
  proyecto:    Proyecto;
  index:       number;
  onEditar:    (proyecto: Proyecto) => void;
  puedeEditar: boolean;
  isOverlay?:  boolean;
}

// ─── Contenido visual compartido ─────────────────────────────────────────────
// Se extrae en una función pura para no duplicar 150 líneas de JSX.
function CardContent({
  proyecto,
  puedeEditar,
  onEditar,
  avancePromedio,
}: {
  proyecto:       Proyecto;
  puedeEditar:    boolean;
  onEditar:       (proyecto: Proyecto) => void;
  avancePromedio: number;
}) {
  return (
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
          <Progress value={avancePromedio} size="xs" color="congope" />
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
          {proyecto.provincias.map((p) => p.nombre).join(', ')}
        </Text>
      )}

      {/* Semáforo de Riesgo */}
      {proyecto.estado !== 'Finalizado' &&
       proyecto.estado !== 'Suspendido' && (
        <div style={{ marginTop: 4 }}>
          <RiesgoBadge
            datos={{
              estado:               proyecto.estado,
              fecha_fin_planificada:proyecto.fecha_fin_planificada ?? null,
              fecha_inicio:         proyecto.fecha_inicio ?? null,
            }}
            variante="badge"
          />
        </div>
      )}
    </Stack>
  );
}

// ─── Tarjeta ARRASTRABLE (llama a useDraggable con ref directo) ───────────────
function DraggableCard({
  proyecto,
  puedeEditar,
  onEditar,
  avancePromedio,
}: {
  proyecto:       Proyecto;
  puedeEditar:    boolean;
  onEditar:       (proyecto: Proyecto) => void;
  avancePromedio: number;
}) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id:   String(proyecto.id),
    data: { estado: proyecto.estado, proyecto },
  });

  // Placeholder fantasma cuando está siendo arrastrada
  if (isDragging) {
    return (
      <Paper
        ref={setNodeRef}
        p="sm"
        radius="md"
        mb="xs"
        style={{
          border:          '2px dashed var(--mantine-color-default-border)',
          backgroundColor: 'transparent',
          minHeight:        100,
          opacity:          0.4,
        }}
      />
    );
  }

  return (
    <Paper
      ref={setNodeRef}
      p="sm"
      radius="md"
      mb="xs"
      style={{
        border:          '1px solid var(--mantine-color-default-border)',
        backgroundColor: 'var(--mantine-color-default)',
        boxShadow:       'var(--mantine-shadow-xs)',
        cursor:          'grab',
        userSelect:      'none',
      }}
      {...listeners}
      {...attributes}
    >
      <CardContent
        proyecto={proyecto}
        puedeEditar={puedeEditar}
        onEditar={onEditar}
        avancePromedio={avancePromedio}
      />
    </Paper>
  );
}

// ─── Tarjeta OVERLAY (estática, sin useDraggable) ────────────────────────────
function OverlayCard({
  proyecto,
  avancePromedio,
}: {
  proyecto:       Proyecto;
  avancePromedio: number;
}) {
  return (
    <Paper
      p="sm"
      radius="md"
      mb="xs"
      style={{
        border:          '1px solid var(--mantine-color-default-border)',
        backgroundColor: 'var(--mantine-color-congope-light)',
        boxShadow:       'var(--mantine-shadow-xl)',
        cursor:          'grabbing',
        userSelect:      'none',
        rotate:          '1.5deg',
      }}
    >
      <CardContent
        proyecto={proyecto}
        puedeEditar={false}
        onEditar={() => {}}
        avancePromedio={avancePromedio}
      />
    </Paper>
  );
}

// ─── Exportación pública ──────────────────────────────────────────────────────
export function ProyectoKanbanCard({
  proyecto,
  index: _index,
  onEditar,
  puedeEditar,
  isOverlay = false,
}: ProyectoKanbanCardProps) {
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

  if (isOverlay) {
    return (
      <OverlayCard
        proyecto={proyecto}
        avancePromedio={avancePromedio}
      />
    );
  }

  return (
    <DraggableCard
      proyecto={proyecto}
      puedeEditar={puedeEditar}
      onEditar={onEditar}
      avancePromedio={avancePromedio}
    />
  );
}
