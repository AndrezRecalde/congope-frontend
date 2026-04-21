import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { queryKeys } from "@/lib/query-client";
import {
  proyectosService,
  type ProyectosParams,
} from "@/services/proyectos.service";
import { getErrorMessage } from "@/services/axios";
import type {
  CreateProyectoDto,
  UpdateProyectoDto,
  CreateHitoDto,
  Proyecto,
} from "@/services/axios";
import type { EstadoProyecto } from "@/types/proyecto.types";

export function useProyectos(params: ProyectosParams = {}) {
  return useQuery({
    queryKey: queryKeys.proyectos.list(params),
    queryFn: () => proyectosService.listar(params),
    placeholderData: (prev) => prev,
  });
}

export function useProyecto(id: string | null) {
  return useQuery({
    queryKey: queryKeys.proyectos.detail(id ?? ""),
    queryFn: () => proyectosService.obtener(id!),
    enabled: !!id,
  });
}

export function useHitosProyecto(proyectoId: string | null) {
  return useQuery({
    queryKey: queryKeys.proyectos.hitos(proyectoId ?? ""),
    queryFn: () => proyectosService.listarHitos(proyectoId!),
    enabled: !!proyectoId,
  });
}

export function useCrearProyecto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: CreateProyectoDto) => proyectosService.crear(datos),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.proyectos.all,
      });
      notifications.show({
        title: "Proyecto creado",
        message: "El proyecto fue registrado correctamente.",
        color: "green",
      });
    },
    onError: (error) =>
      notifications.show({
        title: "Error al crear",
        message: getErrorMessage(error),
        color: "red",
        autoClose: 6000,
      }),
  });
}

export function useActualizarProyecto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: UpdateProyectoDto }) =>
      proyectosService.actualizar(id, datos),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.proyectos.all });
      qc.invalidateQueries({
        queryKey: queryKeys.proyectos.detail(id),
      });
      notifications.show({
        title: "Proyecto actualizado",
        message: "Los datos del proyecto fueron actualizados.",
        color: "green",
      });
    },
    onError: (error) =>
      notifications.show({
        title: "Error al actualizar",
        message: getErrorMessage(error),
        color: "red",
        autoClose: 6000,
      }),
  });
}

export function useEliminarProyecto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proyectosService.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.proyectos.all });
      notifications.show({
        title: "Proyecto eliminado",
        message: "El proyecto fue eliminado correctamente.",
        color: "orange",
      });
    },
    onError: (error) =>
      notifications.show({
        title: "Error al eliminar",
        message: getErrorMessage(error),
        color: "red",
        autoClose: 6000,
      }),
  });
}

export function useCambiarEstadoProyecto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoProyecto }) =>
      proyectosService.cambiarEstado(id, estado),
    onMutate: async ({ id, estado }) => {
      await qc.cancelQueries({ queryKey: ['proyectos', 'kanban'] });

      let proyectoMovido: Proyecto | null = null;

      // 1. Buscar el proyecto en alguna query y quitarlo
      qc.setQueriesData(
        { queryKey: ['proyectos', 'kanban'] },
        (oldData: unknown) => {
          const data = oldData as { data?: Proyecto[] } | undefined;
          if (!data || !data.data) return oldData;
          
          const found = data.data.find((p) => p.id === id);
          if (found && found.estado !== estado) {
            proyectoMovido = { ...found, estado }; // Copia actualizada
            return { ...data, data: data.data.filter((p) => p.id !== id) };
          }
          return oldData;
        }
      );

      // 2. Si lo encontramos, lo insertamos optimísticamente en el nuevo estado
      if (proyectoMovido) {
        qc.setQueriesData(
          { queryKey: ['proyectos', 'kanban', estado] },
          (oldData: unknown) => {
            const data = oldData as { data?: Proyecto[] } | undefined;
            if (!data || !data.data) return oldData;
            
            if (!data.data.some((p) => p.id === id)) {
              return { ...data, data: [proyectoMovido, ...data.data] };
            }
            return oldData;
          }
        );
      }
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.proyectos.all });
      qc.invalidateQueries({
        queryKey: queryKeys.proyectos.detail(id),
      });
      notifications.show({
        title: "Estado actualizado",
        message: "El estado del proyecto fue actualizado.",
        color: "blue",
      });
    },
    onError: (error) =>
      notifications.show({
        title: "Error al cambiar estado",
        message: getErrorMessage(error),
        color: "red",
        autoClose: 6000,
      }),
  });
}

// ── HITOS ──────────────────────────────────────────────

export function useCrearHito(proyectoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: CreateHitoDto) =>
      proyectosService.crearHito(proyectoId, datos),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.proyectos.hitos(proyectoId),
      });
      notifications.show({
        title: "Hito creado",
        message: "El hito fue registrado correctamente.",
        color: "green",
      });
    },
    onError: (error) =>
      notifications.show({
        title: "Error al crear hito",
        message: getErrorMessage(error),
        color: "red",
        autoClose: 6000,
      }),
  });
}

export function useEliminarHito(proyectoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (hitoId: string) =>
      proyectosService.eliminarHito(proyectoId, hitoId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.proyectos.hitos(proyectoId),
      });
      notifications.show({
        title: "Hito eliminado",
        message: "El hito fue eliminado.",
        color: "orange",
      });
    },
    onError: (error) =>
      notifications.show({
        title: "Error al eliminar hito",
        message: getErrorMessage(error),
        color: "red",
        autoClose: 6000,
      }),
  });
}

export function useCompletarHito(proyectoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (hitoId: string) =>
      proyectosService.completarHito(proyectoId, hitoId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.proyectos.hitos(proyectoId),
      });
      notifications.show({
        title: "Hito completado",
        message: "¡El hito fue marcado como completado!",
        color: "teal",
      });
    },
    onError: (error) =>
      notifications.show({
        title: "Error",
        message: getErrorMessage(error),
        color: "red",
        autoClose: 6000,
      }),
  });
}

import { historialService } from "@/services/historial.service";

export function useHistorialProyecto(
  proyectoId: string | null,
  page: number = 1,
) {
  return useQuery({
    queryKey: ["proyectos", "historial", proyectoId, page],
    queryFn: () =>
      historialService.obtenerHistorialProyecto(proyectoId!, {
        page,
        per_page: 15,
      }),
    enabled: !!proyectoId,
    // El historial es dinámico — revalidar cada
    // vez que se navega a la página
    staleTime: 0,
  });
}

// ── KANBAN ─────────────────────────────────────────────

import type {
  FiltrosKanban,
  ConteosEstado,
} from '@/types/kanban.types';

const PER_PAGE_KANBAN = 20;

/**
 * Query para UNA columna del Kanban.
 * Filtra por estado específico + filtros globales.
 */
export function useKanbanColumna(
  estado:   EstadoProyecto,
  filtros:  FiltrosKanban,
  page:     number
) {
  const params: Record<string, string | number> = {
    estado,
    per_page: PER_PAGE_KANBAN,
    page,
  };

  if (filtros.provincia_id) {
    params.provincia_id = filtros.provincia_id;
  }

  if (filtros.search) {
    params.search = filtros.search;
  }

  return useQuery({
    queryKey: [
      'proyectos', 'kanban', estado,
      filtros, page,
    ],
    queryFn:  () =>
      proyectosService.listar(params),
    // Mantener datos anteriores al paginar
    // para evitar parpadeo visual
    placeholderData: (prev) => prev,
    staleTime: 0,
  });
}

import apiClient from "@/services/axios";

/**
 * Conteos por estado para las cabeceras.
 * Se actualiza cuando cambian los filtros globales.
 */
export function useConteosKanban(
  filtros: FiltrosKanban
) {
  const params: Record<string, string> = {};
  if (filtros.provincia_id)
    params.provincia_id = filtros.provincia_id;
  if (filtros.search)
    params.search = filtros.search;

  return useQuery({
    queryKey: ['proyectos', 'kanban', 'conteos',
                filtros],
    queryFn:  async () => {
      const res = await apiClient.get(
        '/proyectos/conteos',
        { params }
      );
      return res.data.data as ConteosEstado;
    },
    staleTime: 0,
  });
}
