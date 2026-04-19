import apiClient from "./axios";
import type { RegistroHistorial } from "@/types/historial.types";

export interface HistorialParams {
  page?: number;
  per_page?: number;
}

export interface RespuestaHistorial {
  data: RegistroHistorial[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  proyecto: {
    id: string;
    codigo: string;
    nombre: string;
  };
}

export const historialService = {
  /**
   * GET /api/v1/proyectos/:id/historial
   * Historial completo de cambios de un proyecto.
   * Incluye cambios del proyecto y sus hitos.
   */
  obtenerHistorialProyecto: async (
    proyectoId: string,
    params: HistorialParams = {},
  ): Promise<RespuestaHistorial> => {
    const res = await apiClient.get(`/proyectos/${proyectoId}/historial`, {
      params,
    });
    return res.data as RespuestaHistorial;
  },
};
