'use client'

import { useState, useEffect } from 'react';
import {
  Stack, Group, Text, Badge,
  Skeleton, Center, ThemeIcon,
  Pagination, ScrollArea,
} from '@mantine/core';
import {
  IconFolderOpen,
} from '@tabler/icons-react';
import { useKanbanColumna }
  from '@/queries/proyectos.queries';
import { ProyectoKanbanCard }
  from '../ProyectoKanbanCard';
import { useDroppable } from '@dnd-kit/core';
import type {
  EstadoProyecto,
  FiltrosKanban,
} from '@/types/kanban.types';
import {
  COLOR_ESTADO as COLORES,
  BG_ESTADO    as FONDOS,
} from '@/types/kanban.types';
import type { Proyecto } from '@/services/axios';

interface KanbanColumnaProps {
  estado:       EstadoProyecto;
  filtros:      FiltrosKanban;
  totalEstado:  number | undefined;
  onEditarProyecto?: (proyecto: Proyecto) => void;
  puedeEditar?: boolean;
}

export function KanbanColumna({
  estado,
  filtros,
  totalEstado,
  onEditarProyecto,
  puedeEditar = false,
}: KanbanColumnaProps) {
  const [page, setPage] = useState(1);

  // Resetear a página 1 cuando cambian los filtros
  const filtrosKey = JSON.stringify(filtros);
  useEffect(() => {
    setPage(1);
  }, [filtrosKey]);

  const { data, isLoading, isFetching } =
    useKanbanColumna(estado, filtros, page);

  const { isOver, setNodeRef } = useDroppable({
    id: estado,
  });

  const proyectos = data?.data  ?? [];
  const meta      = data?.meta;
  const color     = COLORES[estado];
  const fondo     = FONDOS[estado];

  // El total viene del endpoint de conteos
  // (más eficiente) o del meta de esta query
  const total = totalEstado ?? meta?.total ?? 0;

  return (
    <Stack
      gap={0}
      style={{
        minWidth:     280,
        maxWidth:     320,
        flex:         '1 1 280px',
        background:   `light-dark(${fondo}, var(--mantine-color-dark-7))`,
        borderRadius: 16,
        border:       `1px solid light-dark(${color}25, var(--mantine-color-dark-5))`,
        overflow:     'hidden',
        height:       '100%',
        display:      'flex',
        flexDirection:'column',
      }}
    >
      {/* ── Cabecera de columna ── */}
      <div style={{
        padding:      '14px 16px 12px',
        borderBottom: `2px solid light-dark(${color}30, ${color}50)`,
        background:   `light-dark(${color}10, ${color}20)`,
        flexShrink:   0,
      }}>
        <Group justify="space-between"
          align="center">
          <Group gap="xs">
            {/* Indicador de color */}
            <div style={{
              width:        10,
              height:       10,
              borderRadius: '50%',
              background:   color,
              boxShadow:    `0 0 0 3px ${color}25`,
              flexShrink:   0,
            }} />
            <Text fw={700} size="sm"
              style={{ color }}>
              {estado}
            </Text>
          </Group>

          {/* Badge con total */}
          <Badge
            size="sm"
            style={{
              background: `${color}15`,
              color,
              border:     `1px solid ${color}30`,
            }}
          >
            {total.toLocaleString()}
          </Badge>
        </Group>

        {/* Indicador de fetching */}
        {isFetching && !isLoading && (
          <Text size="xs" c="dimmed" mt={4}>
            Actualizando...
          </Text>
        )}
      </div>

      {/* ── Contenido de la columna ── */}
      <ScrollArea
        style={{ flex: 1 }}
        type="hover"
        scrollbarSize={4}
      >
            <div
              ref={setNodeRef}
              style={{
                minHeight: '100%',
                padding: '12px',
                background: isOver
                  ? `light-dark(${color}10, ${color}25)`
                  : 'transparent',
                transition: 'background 150ms ease',
              }}
            >
              <Stack gap="sm">
                {/* Estado de carga */}
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      height={120}
                      radius="lg"
                    />
                  ))
                ) : proyectos.length === 0 ? (
                  // Estado vacío
                  <Center py="xl">
                    <Stack align="center" gap="xs">
                      <ThemeIcon
                        size={40}
                        radius="xl"
                        style={{
                          background: `${color}15`,
                          color,
                        }}
                      >
                        <IconFolderOpen size={20} />
                      </ThemeIcon>
                      <Text size="xs" c="dimmed"
                        ta="center">
                        Sin proyectos
                        {filtros.provincia_id
                          ? ' en esta provincia'
                          : ''}
                      </Text>
                    </Stack>
                  </Center>
                ) : (
                  // Cards de proyectos
                  proyectos.map((proyecto, index) => (
                    <ProyectoKanbanCard
                      key={proyecto.id}
                      proyecto={proyecto}
                      index={index}
                      onEditar={(p) => onEditarProyecto?.(p)}
                      puedeEditar={puedeEditar}
                    />
                  ))
                )}
              </Stack>
            </div>
      </ScrollArea>

      {/* ── Paginación de la columna ── */}
      {meta && meta.last_page > 1 && (
        <div style={{
          padding:    '10px 12px',
          borderTop:  `1px solid light-dark(${color}20, ${color}40)`,
          background: `light-dark(${color}05, ${color}15)`,
          flexShrink: 0,
        }}>
          <Group
            justify="space-between"
            align="center"
          >
            <Text size="xs" c="dimmed">
              Pág. {meta.current_page} de{' '}
              {meta.last_page}
            </Text>
            <Pagination
              total={meta.last_page}
              value={page}
              onChange={setPage}
              size="xs"
              siblings={0}
              boundaries={0}
              style={{ gap: 4 }}
              styles={{
                control: {
                  minWidth:    28,
                  height:      28,
                  fontSize:    11,
                  borderColor: `${color}30`,
                  color,
                  '&[dataActive]': {
                    background: color,
                    color:      'white',
                  },
                },
              }}
            />
          </Group>
        </div>
      )}

      {/* Contador de página actual */}
      {meta && (
        <div style={{
          padding:   '4px 12px 8px',
          flexShrink:0,
        }}>
          <Text size="xs" c="dimmed" ta="center">
            {proyectos.length} de{' '}
            {total.toLocaleString()} proyectos
          </Text>
        </div>
      )}
    </Stack>
  );
}
