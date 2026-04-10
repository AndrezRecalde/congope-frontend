import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { queryKeys }      from '@/lib/query-client';
import { actoresService, type ActoresParams }
  from '@/services/actores.service';
import { getErrorMessage } from '@/services/axios';
import type { CreateActorDto, UpdateActorDto }
  from '@/services/axios';

/** Lista actores con filtros — se invalida automáticamente */
export function useActores(params: ActoresParams = {}) {
  return useQuery({
    queryKey: queryKeys.actores.list(params),
    queryFn:  () => actoresService.listar(params),
    placeholderData: (prev) => prev, // mantiene datos previos
                                      // al cambiar de página
  });
}

/** Obtiene un actor por ID */
export function useActor(id: string | null) {
  return useQuery({
    queryKey: queryKeys.actores.detail(id ?? ''),
    queryFn:  () => actoresService.obtener(id!),
    enabled:  !!id,
    retry:    1, // Solo 1 retry por el bug conocido del 500
  });
}

/** Mutación: crear actor */
export function useCrearActor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: CreateActorDto) =>
      actoresService.crear(datos),
    onSuccess: () => {
      // Invalidar el listado para que se recargue
      queryClient.invalidateQueries({
        queryKey: queryKeys.actores.all,
      });
      notifications.show({
        title:   'Actor creado',
        message: 'El actor de cooperación fue registrado correctamente.',
        color:   'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title:   'Error al crear',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      });
    },
  });
}

/** Mutación: actualizar actor */
export function useActualizarActor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id:    string;
      datos: UpdateActorDto;
    }) => actoresService.actualizar(id, datos),
    onSuccess: (_, { id }) => {
      // Invalidar listado y detalle del actor editado
      queryClient.invalidateQueries({
        queryKey: queryKeys.actores.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.actores.detail(id),
      });
      notifications.show({
        title:   'Actor actualizado',
        message: 'Los datos del actor fueron actualizados correctamente.',
        color:   'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title:   'Error al actualizar',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      });
    },
  });
}

/** Mutación: eliminar actor */
export function useEliminarActor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actoresService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.actores.all,
      });
      notifications.show({
        title:   'Actor eliminado',
        message: 'El actor fue eliminado correctamente.',
        color:   'orange',
      });
    },
    onError: (error) => {
      notifications.show({
        title:   'Error al eliminar',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      });
    },
  });
}
