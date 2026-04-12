import apiClient from './axios';

/**
 * Todos los endpoints de reportes usan POST para recibir parámetros en el body.
 * Todos devuelven un archivo binario (PDF).
 * Usar responseType: 'blob' y descargar con URL temporal.
 */

async function descargarReportePdf(
  url:      string,
  body:     Record<string, unknown> | undefined,
  filename: string
): Promise<void> {
  const res = await apiClient.post(url, body, {
    responseType: 'blob',
  });

  // Crear URL temporal y disparar descarga
  const blobUrl = window.URL.createObjectURL(
    new Blob([res.data], { type: 'application/pdf' })
  );
  const link    = document.createElement('a');
  link.href     = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Limpiar la URL temporal
  setTimeout(
    () => window.URL.revokeObjectURL(blobUrl),
    1000
  );
}

export const reportesService = {
  /**
   * POST /api/v1/reportes/provincia
   * Body required: { provincia_id: string (UUID) }
   * Genera el reporte de proyectos de una provincia.
   */
  provincia: async (
    provincia_id: string
  ): Promise<void> => {
    await descargarReportePdf(
      '/reportes/provincia',
      { provincia_id },
      `reporte-provincia-${new Date().toISOString().split('T')[0]}.pdf`
    );
  },

  /**
   * POST /api/v1/reportes/ods
   * Body required: { ods_id: number (integer 1-17) }
   * Genera el reporte de proyectos alineados con un ODS.
   */
  ods: async (ods_id: number): Promise<void> => {
    await descargarReportePdf(
      '/reportes/ods',
      { ods_id },
      `reporte-ods-${ods_id}-${new Date().toISOString().split('T')[0]}.pdf`
    );
  },

  /**
   * POST /api/v1/reportes/cooperante
   * Body required: { actor_id: string (UUID) }
   * Genera el reporte de actividad de un cooperante.
   */
  cooperante: async (actor_id: string): Promise<void> => {
    await descargarReportePdf(
      '/reportes/cooperante',
      { actor_id },
      `reporte-cooperante-${new Date().toISOString().split('T')[0]}.pdf`
    );
  },

  /**
   * POST /api/v1/reportes/anual
   * Body: { anio: string }
   * NOTA: anio es string según el OpenAPI.
   * El backend devuelve 422 si falta el campo.
   * Genera el reporte consolidado de un año.
   */
  anual: async (anio: string): Promise<void> => {
    await descargarReportePdf(
      '/reportes/anual',
      { anio },
      `reporte-anual-${anio}.pdf`
    );
  },

  /**
   * POST /api/v1/reportes/global
   * Sin body requerido.
   * Genera el reporte consolidado global del CONGOPE.
   */
  global: async (): Promise<void> => {
    await descargarReportePdf(
      '/reportes/global',
      undefined,
      `reporte-global-congope-${new Date().toISOString().split('T')[0]}.pdf`
    );
  },
};
