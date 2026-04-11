import apiClient, {
  extractData,
  type ProyectoEmblematico,
  type Reconocimiento,
  type PaginatedResponse,
  type ApiResponse,
} from './axios';

export interface EmblematicoParams {
  search?:      string;
  provincia_id?: string;
  es_publico?:  boolean;
  page?:        number;
  per_page?:    number;
}

export interface CreateEmblematicoDto {
  proyecto_id:         string;
  provincia_id:        string;
  titulo:              string;
  descripcion_impacto: string;
  periodo?:            string | null;
}

export type UpdateEmblematicoDto =
  Partial<CreateEmblematicoDto>;

export interface CreateReconocimientoDto {
  titulo:              string;
  organismo_otorgante: string;
  ambito:              'Nacional' | 'Internacional';
  anio:                number;
  descripcion?:        string | null;
}

export type UpdateReconocimientoDto =
  Partial<CreateReconocimientoDto>;

export const emblematicosService = {
  /**
   * GET /api/v1/emblematicos
   * Incluye reconocimientos completos y proyecto anidado.
   * NOTA: created_at en ISO 8601 completo.
   */
  listar: async (
    params: EmblematicoParams = {}
  ): Promise<PaginatedResponse<ProyectoEmblematico>> => {
    const queryParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== '' && v !== undefined && v !== null
      )
    );
    const res = await apiClient.get('/emblematicos', {
      params: queryParams,
    });
    return res.data as PaginatedResponse<ProyectoEmblematico>;
  },

  /**
   * GET /api/v1/emblematicos/:id
   * Detalle simplificado: proyecto solo {id,nombre,codigo},
   * provincia solo {id,nombre}. Fechas en ISO 8601.
   */
  obtener: async (
    id: string
  ): Promise<ProyectoEmblematico> => {
    const res = await apiClient.get(`/emblematicos/${id}`);
    return extractData<ProyectoEmblematico>(res);
  },

  /**
   * POST /api/v1/emblematicos
   * Required: proyecto_id, provincia_id, titulo,
   *           descripcion_impacto
   * es_publico NO es campo del POST — usar /publicar
   */
  crear: async (
    datos: CreateEmblematicoDto
  ): Promise<ProyectoEmblematico> => {
    const res = await apiClient.post('/emblematicos', datos);
    return extractData<ProyectoEmblematico>(res);
  },

  /**
   * PUT /api/v1/emblematicos/:id
   */
  actualizar: async (
    id: string,
    datos: UpdateEmblematicoDto
  ): Promise<ProyectoEmblematico> => {
    const res = await apiClient.put(
      `/emblematicos/${id}`,
      datos
    );
    return extractData<ProyectoEmblematico>(res);
  },

  /**
   * DELETE /api/v1/emblematicos/:id
   * Soft delete — rellena deleted_at en el backend.
   */
  eliminar: async (id: string): Promise<void> => {
    await apiClient.delete(`/emblematicos/${id}`);
  },

  /**
   * PATCH /api/v1/emblematicos/:id/publicar
   */
  publicar: async (
    id: string,
    es_publico: boolean
  ): Promise<ProyectoEmblematico> => {
    const res = await apiClient.patch(
      `/emblematicos/${id}/publicar`,
      { es_publico }
    );
    return extractData<ProyectoEmblematico>(res);
  },

  // ── RECONOCIMIENTOS ─────────────────────────────────

  /**
   * GET /api/v1/emblematicos/:id/reconocimientos
   * Array simple, no paginado.
   */
  listarReconocimientos: async (
    emblematicoId: string
  ): Promise<Reconocimiento[]> => {
    const res = await apiClient.get(
      `/emblematicos/${emblematicoId}/reconocimientos`
    );
    const apiRes = res.data as ApiResponse<Reconocimiento[]>;
    return apiRes.data;
  },

  /**
   * POST /api/v1/emblematicos/:id/reconocimientos
   * Required: titulo, organismo_otorgante, ambito, anio
   * anio: integer 1990–2026
   */
  crearReconocimiento: async (
    emblematicoId: string,
    datos: CreateReconocimientoDto
  ): Promise<Reconocimiento> => {
    const res = await apiClient.post(
      `/emblematicos/${emblematicoId}/reconocimientos`,
      datos
    );
    return extractData<Reconocimiento>(res);
  },

  /**
   * PUT /api/v1/emblematicos/:id/reconocimientos/:recId
   */
  actualizarReconocimiento: async (
    emblematicoId: string,
    reconocimientoId: string,
    datos: UpdateReconocimientoDto
  ): Promise<Reconocimiento> => {
    const res = await apiClient.put(
      `/emblematicos/${emblematicoId}/reconocimientos/${reconocimientoId}`,
      datos
    );
    return extractData<Reconocimiento>(res);
  },

  /**
   * DELETE /api/v1/emblematicos/:id/reconocimientos/:recId
   */
  eliminarReconocimiento: async (
    emblematicoId: string,
    reconocimientoId: string
  ): Promise<void> => {
    await apiClient.delete(
      `/emblematicos/${emblematicoId}/reconocimientos/${reconocimientoId}`
    );
  },
};
