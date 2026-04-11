import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { queryKeys }     from '@/lib/query-client';
import {
  practicasService,
  type PracticasParams,
  type CreatePracticaDto,
  type UpdatePracticaDto,
  type ValorarPracticaDto,
} from '@/services/practicas.service';
import { getErrorMessage } from '@/services/axios';

export function usePracticas(params: PracticasParams = {}) {
  return useQuery({
    queryKey: queryKeys.practicas.list(params),
    queryFn:  () => practicasService.listar(params),
    placeholderData: (prev) => prev,
  });
}

export function usePractica(id: string | null) {
  return useQuery({
    queryKey: queryKeys.practicas.detail(id ?? ''),
    queryFn:  () => practicasService.obtener(id!),
    enabled:  !!id,
  });
}

export function useCrearPractica() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: CreatePracticaDto) =>
      practicasService.crear(datos),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.practicas.all,
      });
      notifications.show({
        title:   'Buena práctica creada',
        message: 'La buena práctica fue registrada correctamente.',
        color:   'green',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al crear',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}

export function useActualizarPractica() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id:    string;
      datos: UpdatePracticaDto;
    }) => practicasService.actualizar(id, datos),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.practicas.all });
      qc.invalidateQueries({
        queryKey: queryKeys.practicas.detail(id),
      });
      notifications.show({
        title:   'Práctica actualizada',
        message: 'Los datos fueron actualizados correctamente.',
        color:   'green',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al actualizar',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}

export function useEliminarPractica() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => practicasService.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.practicas.all });
      notifications.show({
        title:   'Práctica eliminada',
        message: 'La buena práctica fue eliminada.',
        color:   'orange',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al eliminar',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}

export function useDestacarPractica() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, es_destacada }: { id: string; es_destacada: boolean }) =>
      practicasService.destacar(id, es_destacada),
    onSuccess: (practica, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.practicas.all });
      qc.invalidateQueries({
        queryKey: queryKeys.practicas.detail(id),
      });
      notifications.show({
        title:   practica.es_destacada
                   ? 'Marcada como destacada'
                   : 'Desmarcada como destacada',
        message: `"${practica.titulo}"`,
        color:   practica.es_destacada ? 'yellow' : 'gray',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}

export function useValorarPractica(practicaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: ValorarPracticaDto) =>
      practicasService.valorar(practicaId, datos),
    onSuccess: () => {
      // Invalidar detalle y listado para actualizar
      // calificacion_promedio y mi_valoracion
      qc.invalidateQueries({
        queryKey: queryKeys.practicas.detail(practicaId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.practicas.all,
      });
      notifications.show({
        title:   'Valoración registrada',
        message: 'Tu valoración fue guardada correctamente.',
        color:   'teal',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al valorar',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}

export function useEliminarValoracion(practicaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      practicasService.eliminarValoracion(practicaId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.practicas.detail(practicaId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.practicas.all,
      });
      notifications.show({
        title:   'Valoración eliminada',
        message: 'Tu valoración fue eliminada.',
        color:   'gray',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}
