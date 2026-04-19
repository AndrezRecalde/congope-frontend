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
