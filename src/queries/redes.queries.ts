import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { queryKeys }     from '@/lib/query-client';
import {
  redesService,
  type RedesParams,
  type CreateRedDto,
  type UpdateRedDto,
} from '@/services/redes.service';
import { getErrorMessage } from '@/services/axios';

export function useRedes(params: RedesParams = {}) {
  return useQuery({
    queryKey: queryKeys.redes.list(params),
    queryFn:  () => redesService.listar(params),
    placeholderData: (prev) => prev,
  });
}

export function useRed(id: string | null) {
  return useQuery({
    queryKey: queryKeys.redes.detail(id ?? ''),
    queryFn:  () => redesService.obtener(id!),
    enabled:  !!id,
  });
}

export function useCrearRed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: CreateRedDto) =>
      redesService.crear(datos),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.redes.all });
      notifications.show({
        title:   'Red creada',
        message: 'La red fue registrada correctamente.',
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

export function useActualizarRed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: string;
      datos: UpdateRedDto;
    }) => redesService.actualizar(id, datos),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.redes.all });
      qc.invalidateQueries({
        queryKey: queryKeys.redes.detail(id),
      });
      notifications.show({
        title:   'Red actualizada',
        message: 'Los datos de la red fueron actualizados.',
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

export function useEliminarRed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => redesService.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.redes.all });
      notifications.show({
        title:   'Red eliminada',
        message: 'La red fue eliminada correctamente.',
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

export function useAgregarMiembro(redId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      actorId,
      rolMiembro,
      fechaIngreso,
    }: {
      actorId:       string;
      rolMiembro?:   string | null;
      fechaIngreso?: string | null;
    }) =>
      redesService.agregarMiembro(
        redId,
        actorId,
        rolMiembro,
        fechaIngreso
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.redes.detail(redId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.redes.all,
      });
      notifications.show({
        title:   'Miembro agregado',
        message: 'El actor fue agregado a la red correctamente.',
        color:   'green',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al agregar miembro',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}

export function useEliminarMiembro(redId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (actorId: string) =>
      redesService.eliminarMiembro(redId, actorId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.redes.detail(redId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.redes.all,
      });
      notifications.show({
        title:   'Miembro eliminado',
        message: 'El actor fue removido de la red.',
        color:   'orange',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al eliminar miembro',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}
