import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { queryKeys }     from '@/lib/query-client';
import {
  emblematicosService,
  type EmblematicoParams,
  type CreateEmblematicoDto,
  type UpdateEmblematicoDto,
  type CreateReconocimientoDto,
  type UpdateReconocimientoDto,
} from '@/services/emblematicos.service';
import { getErrorMessage } from '@/services/axios';

export function useEmblematicos(
  params: EmblematicoParams = {}
) {
  return useQuery({
    queryKey: queryKeys.emblematicos.list(params),
    queryFn:  () => emblematicosService.listar(params),
    placeholderData: (prev) => prev,
  });
}

export function useEmblematico(id: string | null) {
  return useQuery({
    queryKey: queryKeys.emblematicos.detail(id ?? ''),
    queryFn:  () => emblematicosService.obtener(id!),
    enabled:  !!id,
  });
}

// NOTA: Los reconocimientos se cargan desde el objeto
// emblemático directamente (ya vienen en la respuesta).
// Este query es un backup para refrescar desde el
// endpoint dedicado si fuera necesario.
export function useReconocimientos(
  emblematicoId: string | null
) {
  return useQuery({
    queryKey: ['reconocimientos', emblematicoId ?? ''],
    queryFn:  () =>
      emblematicosService.listarReconocimientos(
        emblematicoId!
      ),
    enabled: !!emblematicoId,
  });
}

export function useCrearEmblematico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: CreateEmblematicoDto) =>
      emblematicosService.crear(datos),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.emblematicos.all,
      });
      notifications.show({
        title:   'Emblemático creado',
        message: 'El proyecto emblemático fue registrado.',
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

export function useActualizarEmblematico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id:    string;
      datos: UpdateEmblematicoDto;
    }) => emblematicosService.actualizar(id, datos),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({
        queryKey: queryKeys.emblematicos.all,
      });
      qc.invalidateQueries({
        queryKey: queryKeys.emblematicos.detail(id),
      });
      notifications.show({
        title:   'Emblemático actualizado',
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

export function useEliminarEmblematico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      emblematicosService.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.emblematicos.all,
      });
      notifications.show({
        title:   'Emblemático eliminado',
        message: 'El proyecto emblemático fue eliminado.',
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

export function usePublicarEmblematico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, es_publico }: { id: string; es_publico: boolean }) =>
      emblematicosService.publicar(id, es_publico),
    onSuccess: (emblematico, variables) => {
      qc.invalidateQueries({
        queryKey: queryKeys.emblematicos.all,
      });
      qc.invalidateQueries({
        queryKey: queryKeys.emblematicos.detail(variables.id),
      });
      notifications.show({
        title: emblematico.es_publico
          ? 'Publicado en portal público'
          : 'Retirado del portal público',
        message: `"${emblematico.titulo}"`,
        color:   emblematico.es_publico ? 'green' : 'orange',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al publicar',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}

// ── RECONOCIMIENTOS ──────────────────────────────────

export function useCrearReconocimiento(
  emblematicoId: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: CreateReconocimientoDto) =>
      emblematicosService.crearReconocimiento(
        emblematicoId,
        datos
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.emblematicos.detail(emblematicoId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.emblematicos.all,
      });
      notifications.show({
        title:   'Reconocimiento agregado',
        message: 'El reconocimiento fue registrado.',
        color:   'green',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al agregar reconocimiento',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}

export function useActualizarReconocimiento(
  emblematicoId: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      reconocimientoId,
      datos,
    }: {
      reconocimientoId: string;
      datos:            UpdateReconocimientoDto;
    }) =>
      emblematicosService.actualizarReconocimiento(
        emblematicoId,
        reconocimientoId,
        datos
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.emblematicos.detail(emblematicoId),
      });
      notifications.show({
        title:   'Reconocimiento actualizado',
        message: 'Los datos del reconocimiento fueron actualizados.',
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

export function useEliminarReconocimiento(
  emblematicoId: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reconocimientoId: string) =>
      emblematicosService.eliminarReconocimiento(
        emblematicoId,
        reconocimientoId
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.emblematicos.detail(emblematicoId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.emblematicos.all,
      });
      notifications.show({
        title:   'Reconocimiento eliminado',
        message: 'El reconocimiento fue eliminado.',
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
