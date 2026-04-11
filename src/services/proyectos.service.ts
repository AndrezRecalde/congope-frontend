import apiClient, {
  extractData,
  descargarBlob,
  type Proyecto,
  type CreateProyectoDto,
  type UpdateProyectoDto,
  type HitoProyecto,
  type CreateHitoDto,
  type PaginatedResponse,
  type ApiResponse,
} from './axios';
import type { EstadoProyecto } from '@/types/proyecto.types';

export interface ProyectosParams {
  search?:       string;
  estado?:       string;
  actor_id?:     string;
  provincia_id?: string;
  page?:         number;
  per_page?:     number;
}

export const proyectosService = {
  /**
   * GET /api/v1/proyectos
   */
  listar: async (
    params: ProyectosParams = {}
  ): Promise<PaginatedResponse<Proyecto>> => {
    const queryParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== '' && v !== undefined && v !== null
      )
    );
    const res = await apiClient.get('/proyectos', {
      params: queryParams,
    });
    return res.data as PaginatedResponse<Proyecto>;
  },

  /**
   * GET /api/v1/proyectos/:id
   * Incluye cantones, parroquias y ubicaciones.
   */
  obtener: async (id: string): Promise<Proyecto> => {
    const res = await apiClient.get(`/proyectos/${id}`);
    return extractData<Proyecto>(res);
  },

  /**
   * POST /api/v1/proyectos
   * nombre, actor_id, estado, monto_total, moneda,
   * sector_tematico, fecha_inicio, fecha_fin_planificada
   * son REQUERIDOS según el OpenAPI.
   */
  crear: async (
    datos: CreateProyectoDto
  ): Promise<Proyecto> => {
    const res = await apiClient.post('/proyectos', datos);
    return extractData<Proyecto>(res);
  },

  /**
   * PUT /api/v1/proyectos/:id
   */
  actualizar: async (
    id: string,
    datos: UpdateProyectoDto
  ): Promise<Proyecto> => {
    const res = await apiClient.put(`/proyectos/${id}`, datos);
    return extractData<Proyecto>(res);
  },

  /**
   * DELETE /api/v1/proyectos/:id
   */
  eliminar: async (id: string): Promise<void> => {
    await apiClient.delete(`/proyectos/${id}`);
  },

  /**
   * PATCH /api/v1/proyectos/:proyecto/estado
   */
  cambiarEstado: async (
    id: string,
    estado: EstadoProyecto
  ): Promise<Proyecto> => {
    const res = await apiClient.patch(
      `/proyectos/${id}/estado`,
      { estado }
    );
    return extractData<Proyecto>(res);
  },

  /**
   * GET /api/v1/proyectos/exportar
   */
  exportar: async (
    params: ProyectosParams = {}
  ): Promise<void> => {
    const queryString = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(
          ([, v]) => v !== '' && v !== undefined
        )
      ) as Record<string, string>
    ).toString();
    const url = `/proyectos/exportar${
      queryString ? '?' + queryString : ''
    }`;
    await descargarBlob(url, undefined, 'proyectos.xlsx');
  },

  // ── HITOS ────────────────────────────────────────────

  /**
   * GET /api/v1/proyectos/:proyecto/hitos
   * NOTA: Fechas en ISO 8601 completo.
   */
  listarHitos: async (
    proyectoId: string
  ): Promise<HitoProyecto[]> => {
    const res = await apiClient.get(
      `/proyectos/${proyectoId}/hitos`
    );
    const apiRes = res.data as ApiResponse<HitoProyecto[]>;
    return apiRes.data;
  },

  /**
   * POST /api/v1/proyectos/:proyecto/hitos
   * Required: titulo, fecha_limite
   */
  crearHito: async (
    proyectoId: string,
    datos: CreateHitoDto
  ): Promise<HitoProyecto> => {
    const res = await apiClient.post(
      `/proyectos/${proyectoId}/hitos`,
      datos
    );
    return extractData<HitoProyecto>(res);
  },

  /**
   * PUT /api/v1/proyectos/:proyecto/hitos/:id
   */
  actualizarHito: async (
    proyectoId: string,
    hitoId: string,
    datos: Partial<CreateHitoDto>
  ): Promise<HitoProyecto> => {
    const res = await apiClient.put(
      `/proyectos/${proyectoId}/hitos/${hitoId}`,
      datos
    );
    return extractData<HitoProyecto>(res);
  },

  /**
   * DELETE /api/v1/proyectos/:proyecto/hitos/:id
   */
  eliminarHito: async (
    proyectoId: string,
    hitoId: string
  ): Promise<void> => {
    await apiClient.delete(
      `/proyectos/${proyectoId}/hitos/${hitoId}`
    );
  },

  /**
   * PATCH /api/v1/proyectos/:proyecto/hitos/:hito/completar
   * Sin body. Marca el hito como completado.
   */
  completarHito: async (
    proyectoId: string,
    hitoId: string
  ): Promise<HitoProyecto> => {
    const res = await apiClient.patch(
      `/proyectos/${proyectoId}/hitos/${hitoId}/completar`
    );
    return extractData<HitoProyecto>(res);
  },
};
