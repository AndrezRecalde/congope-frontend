import apiClient, {
  extractData,
  type CompromisoEvento,
  type ApiResponse,
} from './axios';
import type {
  DashboardData,
  GraficaAnualItem,
  GraficaOdsItem,
} from '@/types/dashboard.types';

export const dashboardService = {
  /**
   * GET /api/v1/dashboard
   * KPIs y alertas principales.
   * monto_total viene como string — parsear antes de usar.
   * por_tipo es un objeto dinámico — iterar con
   * Object.entries().
   */
  obtener: async (): Promise<DashboardData> => {
    const res = await apiClient.get('/dashboard');
    return extractData<DashboardData>(res);
  },

  /**
   * GET /api/v1/dashboard/grafica-anual
   * Proyectos y monto por año.
   * anio viene como string ("2026").
   * monto viene como string decimal ("2500000.50").
   */
  graficaAnual: async (): Promise<GraficaAnualItem[]> => {
    const res = await apiClient.get(
      '/dashboard/grafica-anual'
    );
    const apiRes = res.data as
      ApiResponse<GraficaAnualItem[]>;
    return apiRes.data;
  },

  /**
   * GET /api/v1/dashboard/grafica-ods
   * Distribución de proyectos por ODS.
   * color_hex: color oficial ONU del ODS.
   */
  graficaOds: async (): Promise<GraficaOdsItem[]> => {
    const res = await apiClient.get(
      '/dashboard/grafica-ods'
    );
    const apiRes = res.data as
      ApiResponse<GraficaOdsItem[]>;
    return apiRes.data;
  },

  /**
   * GET /api/v1/mis-compromisos-pendientes
   * Compromisos del usuario autenticado.
   * fecha_limite: "DD/MM/YYYY"
   */
  misCompromisosPendientes: async (): Promise<
    CompromisoEvento[]
  > => {
    const res = await apiClient.get(
      '/mis-compromisos-pendientes'
    );
    const apiRes = res.data as
      ApiResponse<CompromisoEvento[]>;
    return apiRes.data;
  },
};
