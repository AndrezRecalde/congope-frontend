import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useState }         from 'react';
import { notifications }    from '@mantine/notifications';
import { backupService }    from '@/services/backup.service';
import { getErrorMessage }  from '@/services/axios';

const QUERY_KEY = ['sistema', 'backups'];

export function useBackups() {
  return useQuery({
    queryKey:  QUERY_KEY,
    queryFn:   backupService.listar,
    staleTime: 0, // Siempre revalidar
  });
}

export function useGenerarBackup() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: backupService.generar,
    onSuccess: (backup) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      notifications.show({
        title:   '✅ Backup generado',
        message: `${backup.archivo} · ${
          backup.tamano_legible
        }`,
        color:     'green',
        autoClose: 5000,
      });
    },
    onError: (error) => {
      notifications.show({
        title:   'Error al generar backup',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 8000,
      });
    },
  });
}

export function useDescargarBackup() {
  const [descargando, setDescargando] =
    useState<string | null>(null);

  const descargar = async (archivo: string) => {
    if (descargando) return;
    setDescargando(archivo);
    try {
      await backupService.descargar(archivo);
      notifications.show({
        title:   'Descarga iniciada',
        message: `${archivo} se guardará en tu ` +
                 'carpeta de descargas.',
        color:   'blue',
        autoClose: 4000,
      });
    } catch (error) {
      notifications.show({
        title:   'Error al descargar',
        message: getErrorMessage(error),
        color:   'red',
      });
    } finally {
      setDescargando(null);
    }
  };

  return { descargar, descargando };
}

export function useEliminarBackup() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: backupService.eliminar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      notifications.show({
        title:   'Backup eliminado',
        message: 'El archivo fue eliminado del servidor.',
        color:   'green',
        autoClose: 4000,
      });
    },
    onError: (error) => {
      notifications.show({
        title:   'Error al eliminar',
        message: getErrorMessage(error),
        color:   'red',
      });
    },
  });
}
