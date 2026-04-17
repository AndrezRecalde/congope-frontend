import apiClient, {
  extractData,
  type BuenaPractica,
  type PaginatedResponse,
} from './axios';

export interface PracticasParams {
  search?:         string;
  provincia_id?:   string;
  replicabilidad?: string;
  es_destacada?:   boolean;
  page?:           number;
  per_page?:       number;
}

export interface CreatePracticaDto {
  provincia_id:         string;
  proyecto_id?:         string | null;
  titulo:               string;
  descripcion_problema: string;
  metodologia:          string;
  resultados:           string;
  replicabilidad:       'Alta' | 'Media' | 'Baja';
  es_destacada?:        boolean;
}

export type UpdatePracticaDto = Partial<CreatePracticaDto>;

export interface ValorarPracticaDto {
  puntuacion: number;   // integer 1-5
  comentario?: string | null;
}

export const practicasService = {
  /**
   * GET /api/v1/buenas-practicas
   * El listado NO incluye el campo "proyecto".
   */
  listar: async (
    params: PracticasParams = {}
  ): Promise<PaginatedResponse<BuenaPractica>> => {
    const queryParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== '' && v !== undefined && v !== null
      )
    );
    const res = await apiClient.get('/buenas-practicas', {
      params: queryParams,
    });
    return res.data as PaginatedResponse<BuenaPractica>;
  },

  /**
   * GET /api/v1/buenas-practicas/:id
   * Incluye campo "proyecto" y datos completos de mi_valoracion.
   */
  obtener: async (id: string): Promise<BuenaPractica> => {
    const res = await apiClient.get(`/buenas-practicas/${id}`);
    return extractData<BuenaPractica>(res);
  },

  /**
   * POST /api/v1/buenas-practicas
   * Required: provincia_id, titulo, descripcion_problema,
   *           metodologia, resultados, replicabilidad
   */
  crear: async (
    datos: CreatePracticaDto
  ): Promise<BuenaPractica> => {
    const res = await apiClient.post('/buenas-practicas', datos);
    return extractData<BuenaPractica>(res);
  },

  /**
   * PUT /api/v1/buenas-practicas/:id
   */
  actualizar: async (
    id: string,
    datos: UpdatePracticaDto
  ): Promise<BuenaPractica> => {
    const res = await apiClient.put(
      `/buenas-practicas/${id}`,
      datos
    );
    return extractData<BuenaPractica>(res);
  },

  /**
   * DELETE /api/v1/buenas-practicas/:id
   */
  eliminar: async (id: string): Promise<void> => {
    await apiClient.delete(`/buenas-practicas/${id}`);
  },

  /**
   * PATCH /api/v1/buenas-practicas/:id/destacar
   * Sin body. El backend alterna es_destacada internamente.
   */
  destacar: async (id: string, es_destacada: boolean): Promise<BuenaPractica> => {
    const res = await apiClient.patch(
      `/buenas-practicas/${id}/destacar`, { es_destacada }
    );
    return extractData<BuenaPractica>(res);
  },

  /**
   * POST /api/v1/buenas-practicas/:id/valoraciones
   * Crea o actualiza la valoración del usuario actual.
   * puntuacion: integer 1-5 (requerido)
   * comentario: string | null (opcional)
   */
  valorar: async (
    id: string,
    datos: ValorarPracticaDto
  ): Promise<void> => {
    await apiClient.post(
      `/buenas-practicas/${id}/valoraciones`,
      datos
    );
  },

  /**
   * DELETE /api/v1/buenas-practicas/:id/valoraciones
   * Elimina la valoración del usuario actual.
   */
  eliminarValoracion: async (id: string): Promise<void> => {
    await apiClient.delete(
      `/buenas-practicas/${id}/valoraciones`
    );
  },

  /**
   * GET /api/v1/buenas-practicas/exportar
   * NOTA: El OpenAPI documenta respuesta 500 para este endpoint.
   * El backend aún tiene un bug conocido aquí.
   */
  exportar: async (): Promise<void> => {
    await apiClient.get('/buenas-practicas/exportar');
  },
};
