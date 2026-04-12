import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { queryKeys }      from '@/lib/query-client';
import {
  documentosService,
  type SubirDocumentoDto,
  type EditarDocumentoDto,
} from '@/services/documentos.service';
import { getErrorMessage } from '@/services/axios';
import type { EntidadDocumento } from '@/services/axios';

export function useDocumentos(
  entidad_tipo: EntidadDocumento | '',
  entidad_id:   string
) {
  return useQuery({
    queryKey: queryKeys.documentos.list({
      entidad_tipo,
      entidad_id,
    }),
    queryFn: () =>
      documentosService.listar(
        entidad_tipo as EntidadDocumento,
        entidad_id
      ),
    enabled: !!entidad_tipo && !!entidad_id,
    // El backend puede dar 500 — no reintentar
    retry: 0,
  });
}

export function useSubirDocumento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: SubirDocumentoDto) =>
      documentosService.subir(dto),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.documentos.all,
      });
      notifications.show({
        title:   'Documento subido',
        message: 'El archivo fue cargado correctamente.',
        color:   'green',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al subir archivo',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}

export function useEditarDocumento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id, dto,
    }: {
      id:  string;
      dto: EditarDocumentoDto;
    }) => documentosService.editar(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.documentos.all,
      });
      notifications.show({
        title:   'Documento actualizado',
        message: 'Los metadatos fueron actualizados.',
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

export function useEliminarDocumento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      documentosService.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.documentos.all,
      });
      notifications.show({
        title:   'Documento eliminado',
        message: 'El documento fue eliminado.',
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

export function usePublicarDocumento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, es_publico }: { id: string; es_publico: boolean }) =>
      documentosService.publicar(id, es_publico),
    onSuccess: (doc) => {
      qc.invalidateQueries({
        queryKey: queryKeys.documentos.all,
      });
      notifications.show({
        title: doc.es_publico
          ? 'Documento publicado'
          : 'Documento despublicado',
        message: `"${doc.titulo}"`,
        color: doc.es_publico ? 'green' : 'orange',
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
