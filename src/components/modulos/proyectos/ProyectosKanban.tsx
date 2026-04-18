"use client";

import { useState } from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import {
  Group,
  Paper,
  Text,
  Badge,
  ScrollArea,
} from "@mantine/core";
import { ProyectoKanbanCard } from "./ProyectoKanbanCard";
import {
  ESTADOS_KANBAN,
  COLOR_ESTADO,
  type EstadoProyecto,
} from "@/types/proyecto.types";
import type { Proyecto } from "@/services/axios";

interface ProyectosKanbanProps {
  proyectos: Proyecto[];
  isLoading: boolean;
  onCambiarEstado: (id: string, estado: EstadoProyecto) => void;
  onEditar: (proyecto: Proyecto) => void;
  puedeEditar: boolean;
  puedeCambiarEstado: boolean;
}

export function ProyectosKanban({
  proyectos,
  isLoading: _isLoading,
  onCambiarEstado,
  onEditar,
  puedeEditar,
  puedeCambiarEstado,
}: ProyectosKanbanProps) {
  // Estado local optimista para evitar el "rubber-banding" o delay visual
  const [optimisticProyectos, setOptimisticProyectos] =
    useState<Proyecto[]>(proyectos);
  const [prevProyectos, setPrevProyectos] = useState(proyectos);

  // Sincronizar estado local con prop durante el render (Patrón oficial React)
  if (proyectos !== prevProyectos) {
    setPrevProyectos(proyectos);
    setOptimisticProyectos(proyectos);
  }

  // Agrupar proyectos optimistas por estado
  const grupos = ESTADOS_KANBAN.reduce<Record<EstadoProyecto, Proyecto[]>>(
    (acc, estado) => {
      acc[estado] = optimisticProyectos.filter((p) => p.estado === estado);
      return acc;
    },
    {} as Record<EstadoProyecto, Proyecto[]>,
  );

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // Si cambió de columna → actualizar UI localmente (Optimistic Update)
    if (destination.droppableId !== source.droppableId && puedeCambiarEstado) {
      const nuevoEstado = destination.droppableId as EstadoProyecto;

      setOptimisticProyectos((prev) =>
        prev.map((p) =>
          p.id === draggableId ? { ...p, estado: nuevoEstado } : p,
        ),
      );

      // Disparar acción real hacia el backend en segundo plano
      onCambiarEstado(draggableId, nuevoEstado);
    }
  };

  /* if (isLoading) {
    return (
      <Group align="flex-start" wrap="nowrap" gap="md">
        {ESTADOS_KANBAN.map((estado) => (
          <Paper
            key={estado}
            p="md"
            radius="lg"
            w={280}
            style={{ flexShrink: 0 }}
          >
            <Skeleton height={20} mb="md" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={100} mb="xs" radius="md" />
            ))}
          </Paper>
        ))}
      </Group>
    );
  } */

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <ScrollArea type="auto">
        <Group align="flex-start" wrap="nowrap" gap="md" pb="md">
          {ESTADOS_KANBAN.map((estado) => {
            const items = grupos[estado];
            return (
              <Paper
                key={estado}
                p="md"
                radius="lg"
                w={280}
                style={{
                  flexShrink: 0,
                  border: "1px solid var(--mantine-color-default-border)",
                  backgroundColor: "var(--mantine-color-default)",
                  minHeight: 400,
                }}
              >
                {/* Cabecera de columna */}
                <Group justify="space-between" mb="md">
                  <Group gap="xs">
                    <Badge
                      color={COLOR_ESTADO[estado]}
                      variant="light"
                      size="sm"
                    >
                      {estado}
                    </Badge>
                  </Group>
                  <Text size="xs" fw={600} c="dimmed">
                    {items.length}
                  </Text>
                </Group>

                {/* Columna droppable */}
                <Droppable droppableId={estado}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        minHeight: 200,
                        borderRadius: 8,
                        padding: snapshot.isDraggingOver ? "4px" : "0",
                        background: snapshot.isDraggingOver
                          ? "var(--mantine-color-congope-0)"
                          : "transparent",
                        transition: "background 150ms ease",
                      }}
                    >
                      {items.map((proyecto, index) => (
                        <ProyectoKanbanCard
                          key={proyecto.id}
                          proyecto={proyecto}
                          index={index}
                          onEditar={onEditar}
                          puedeEditar={puedeEditar}
                        />
                      ))}
                      {provided.placeholder}

                      {items.length === 0 && (
                        <Text size="xs" c="dimmed" ta="center" py="xl">
                          Sin proyectos
                        </Text>
                      )}
                    </div>
                  )}
                </Droppable>
              </Paper>
            );
          })}
        </Group>
      </ScrollArea>
    </DragDropContext>
  );
}
