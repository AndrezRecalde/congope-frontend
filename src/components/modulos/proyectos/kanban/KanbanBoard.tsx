'use client'

import { useState } from 'react';
import {
  Stack, Group, ScrollArea, Alert,
  Text,
} from '@mantine/core';
import { IconInfoCircle } from
  '@tabler/icons-react';
import { KanbanColumna } from './KanbanColumna';
import { KanbanFiltros } from './KanbanFiltros';
import {
  useConteosKanban,
} from '@/queries/proyectos.queries';
import {
  ESTADOS_KANBAN,
  type EstadoProyecto,
} from '@/types/kanban.types';
import type { FiltrosKanban }
  from '@/types/kanban.types';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';
import { ProyectoKanbanCard } from '../ProyectoKanbanCard';
import type { Proyecto } from '@/services/axios';

interface KanbanBoardProps {
  // Filtros preexistentes que vienen de la
  // página de proyectos (sector, actor, etc.)
  filtrosGlobales?: {
    sector_tematico?: string;
    actor_id?:        string;
    flujo_direccion?: string;
  };
  onEditarProyecto?: (proyecto: Proyecto) => void;
  puedeEditar?: boolean;
  puedeCambiarEstado?: boolean;
  onCambiarEstado?: (id: string, estado: EstadoProyecto) => void;
}

export function KanbanBoard({
  filtrosGlobales = {},
  onEditarProyecto,
  puedeEditar = false,
  puedeCambiarEstado = false,
  onCambiarEstado,
}: KanbanBoardProps) {
  const [filtros, setFiltros] =
    useState<FiltrosKanban>({
      provincia_id: '',
      search:       '',
    });

  // Obtener conteos para las cabeceras
  const { data: conteos } =
    useConteosKanban({
      ...filtros,
      ...filtrosGlobales,
    } as FiltrosKanban);

  const [activeProyecto, setActiveProyecto] = useState<Proyecto | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // evita clics accidentales como drag
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const proyecto = event.active.data.current?.proyecto as Proyecto | undefined;
    if (proyecto) setActiveProyecto(proyecto);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveProyecto(null);
    const { active, over } = event;
    
    if (!over) return;

    // Asumimos que los droppables (columnas) tienen como ID el nombre del estado
    const destinationEstado = over.id as EstadoProyecto;
    
    // El estado de origen lo pasamos en el data del Draggable
    const sourceEstado = active.data.current?.estado as EstadoProyecto | undefined;

    if (
      sourceEstado &&
      sourceEstado !== destinationEstado &&
      puedeCambiarEstado &&
      onCambiarEstado
    ) {
      onCambiarEstado(String(active.id), destinationEstado);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Stack gap="md">

        {/* Barra de filtros del Kanban */}
        <KanbanFiltros
          filtros={filtros}
          onChange={setFiltros}
          totalGeneral={conteos?.total}
        />

        {/* Aviso informativo */}
        {!filtros.provincia_id && (
          <Alert
            icon={<IconInfoCircle size={14} />}
            color="blue"
            variant="light"
            radius="md"
            py={8}
          >
            <Text size="xs">
              Mostrando todos los proyectos del
              sistema. Filtra por provincia para
              ver solo los proyectos de un
              territorio específico.
            </Text>
          </Alert>
        )}

        {/* Columnas del Kanban */}
        <ScrollArea
          type="hover"
          scrollbarSize={6}
          offsetScrollbars
        >
          <Group
            align="flex-start"
            wrap="nowrap"
            gap="md"
            style={{
              minHeight:  600,
              paddingBottom: 8,
            }}
          >
            {ESTADOS_KANBAN.map((estado) => (
              <KanbanColumna
                key={estado}
                estado={estado}
                filtros={{
                  ...filtros,
                  // Combinar con filtros globales
                  // si existen
                }}
                totalEstado={conteos?.[estado]}
                onEditarProyecto={onEditarProyecto}
                puedeEditar={puedeEditar}
              />
            ))}
          </Group>
        </ScrollArea>

        {/* Overlay que flota por toda la pantalla sin cortarse por el ScrollArea */}
        <DragOverlay>
          {activeProyecto ? (
            <ProyectoKanbanCard
              proyecto={activeProyecto}
              index={0}
              onEditar={() => {}}
              puedeEditar={false}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </Stack>
    </DndContext>
  );
}
