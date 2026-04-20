import apiClient from './axios';
import type {
  BackupItem,
  BackupListResponse,
} from '@/types/backup.types';

export const backupService = {

  /**
   * GET /api/v1/sistema/backups
   * Lista todos los backups disponibles.
   */
  listar: async (): Promise<BackupListResponse> => {
    const res = await apiClient.get(
      '/sistema/backups'
    );
    return res.data as BackupListResponse;
  },

  /**
   * POST /api/v1/sistema/backups
   * Genera un nuevo backup. Puede tardar varios
   * segundos en bases de datos grandes.
   */
  generar: async (): Promise<BackupItem> => {
    const res = await apiClient.post(
      '/sistema/backups'
    );
    const api = res.data as {
      success: boolean;
      data:    BackupItem;
    };
    return api.data;
  },

  /**
   * GET /api/v1/sistema/backups/{archivo}/descargar
   * Descarga el archivo .sql como blob.
   */
  descargar: async (
    archivo: string
  ): Promise<void> => {
    const res = await apiClient.get(
      `/sistema/backups/${encodeURIComponent(archivo)}/descargar`,
      { responseType: 'blob' }
    );

    const url  = window.URL.createObjectURL(
      new Blob([res.data], {
        type: 'application/sql',
      })
    );
    const link = document.createElement('a');
    link.href  = url;
    link.setAttribute('download', archivo);
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() =>
      window.URL.revokeObjectURL(url), 1000
    );
  },

  /**
   * DELETE /api/v1/sistema/backups/{archivo}
   */
  eliminar: async (archivo: string): Promise<void> => {
    await apiClient.delete(
      `/sistema/backups/${encodeURIComponent(archivo)}`
    );
  },
};
