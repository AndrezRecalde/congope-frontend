import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { queryKeys }     from '@/lib/query-client';
import {
  eventosService,
  type EventosParams,
  type CreateEventoDto,
  type UpdateEventoDto,
  type CreateCompromisoDto,
} from '@/services/eventos.service';
import { getErrorMessage } from '@/services/axios';

export function useEventos(params: EventosParams = {}) {
  return useQuery({
    queryKey: queryKeys.eventos.list(params),
    queryFn:  () => eventosService.listar(params),
    placeholderData: (prev) => prev,
  });
}

export function useEvento(id: string | null) {
  return useQuery({
    queryKey: queryKeys.eventos.detail(id ?? ''),
    queryFn:  () => eventosService.obtener(id!),
    enabled:  !!id,
  });
}

export function useCompromisosEvento(
  eventoId: string | null
) {
  return useQuery({
    queryKey: queryKeys.eventos.compromisos(
      eventoId ?? ''
    ),
    queryFn:  () =>
      eventosService.listarCompromisos(eventoId!),
    enabled:  !!eventoId,
  });
}

export function useCrearEvento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: CreateEventoDto) =>
      eventosService.crear(datos),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.eventos.all,
      });
      notifications.show({
        title:   'Evento creado',
        message: 'El evento fue registrado correctamente.',
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

export function useActualizarEvento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id, datos,
    }: {
      id: string; datos: UpdateEventoDto;
    }) => eventosService.actualizar(id, datos),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({
        queryKey: queryKeys.eventos.all,
      });
      qc.invalidateQueries({
        queryKey: queryKeys.eventos.detail(id),
      });
      notifications.show({
        title:   'Evento actualizado',
        message: 'Los datos del evento fueron actualizados.',
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

export function useEliminarEvento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      eventosService.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['eventos', 'list'],
      });
      notifications.show({
        title:   'Evento eliminado',
        message: 'El evento fue eliminado.',
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

export function useAgregarParticipantes(
  eventoId: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userIds: number[]) =>
      eventosService.agregarParticipantes(
        eventoId, userIds
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.eventos.detail(eventoId),
      });
      notifications.show({
        title:   'Participantes agregados',
        message: 'Los participantes fueron agregados.',
        color:   'green',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al agregar participantes',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}

export function useEliminarParticipante(
  eventoId: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      eventosService.eliminarParticipante(eventoId, userId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.eventos.detail(eventoId),
      });
      notifications.show({
        title:   'Participante removido',
        message: 'El participante fue removido del evento.',
        color:   'orange',
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

export function useMarcarAsistencia(eventoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId, asistio,
    }: {
      userId: number; asistio: boolean;
    }) =>
      eventosService.marcarAsistencia(
        eventoId, userId, asistio
      ),
    onMutate: async ({ userId, asistio }) => {
      await qc.cancelQueries({ queryKey: queryKeys.eventos.detail(eventoId) });
      const previousEvento = qc.getQueryData(queryKeys.eventos.detail(eventoId));
      qc.setQueryData(queryKeys.eventos.detail(eventoId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          participantes: old.participantes.map((p: any) =>
            p.id === userId ? { ...p, asistio } : p
          ),
        };
      });
      return { previousEvento };
    },
    onError: (error, variables, context: any) => {
      if (context?.previousEvento) {
        qc.setQueryData(queryKeys.eventos.detail(eventoId), context.previousEvento);
      }
      notifications.show({
        title:   'Error al marcar asistencia',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      });
    },
    onSettled: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.eventos.detail(eventoId),
      });
    },
  });
}

export function useCrearCompromiso(eventoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: CreateCompromisoDto) =>
      eventosService.crearCompromiso(eventoId, datos),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.eventos.compromisos(eventoId),
      });
      notifications.show({
        title:   'Compromiso creado',
        message: 'El compromiso fue registrado.',
        color:   'green',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al crear compromiso',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}

export function useResolverCompromiso(eventoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ compromisoId, resuelto = true }: { compromisoId: string, resuelto: boolean }) =>
      eventosService.resolverCompromiso(
        eventoId, compromisoId, resuelto
      ),
    onMutate: async ({ compromisoId, resuelto }) => {
      await qc.cancelQueries({ queryKey: queryKeys.eventos.compromisos(eventoId) });
      const previousCompromisos = qc.getQueryData(queryKeys.eventos.compromisos(eventoId));
      qc.setQueryData(queryKeys.eventos.compromisos(eventoId), (old: any) => {
        if (!old) return old;
        return old.map((c: any) =>
          c.id === compromisoId ? { ...c, resuelto } : c
        );
      });
      return { previousCompromisos, resuelto };
    },
    onSuccess: (_, variables) => {
      notifications.show({
        title:   variables.resuelto ? 'Compromiso resuelto' : 'Compromiso reabierto',
        message: variables.resuelto ? '¡El compromiso fue marcado como resuelto!' : 'El compromiso ha sido revertido a pendiente.',
        color:   variables.resuelto ? 'teal' : 'orange',
      });
    },
    onError: (error, variables, context: any) => {
      if (context?.previousCompromisos) {
        qc.setQueryData(queryKeys.eventos.compromisos(eventoId), context.previousCompromisos);
      }
      notifications.show({
        title:   'Error',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      });
    },
    onSettled: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.eventos.compromisos(eventoId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.misCompromisos.pendientes,
      });
    },
  });
}
