import apiClient, {
  extractData,
  descargarBlob,
  type ActorCooperacion,
  type CreateActorDto,
  type UpdateActorDto,
  type PaginatedResponse,
} from './axios';

export interface ActoresParams {
  search?:   string;
  tipo?:     string;
  estado?:   string;
  page?:     number;
  per_page?: number;
}

export const actoresService = {
  /**
   * GET /api/v1/actores
   * Lista actores con filtros y paginación.
   */
  listar: async (
    params: ActoresParams = {}
  ): Promise<PaginatedResponse<ActorCooperacion>> => {
    // Limpiar params vacíos antes de enviar
    const queryParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== '' && v !== undefined && v !== null
      )
    );
    const res = await apiClient.get('/actores', {
      params: queryParams,
    });
    return res.data as PaginatedResponse<ActorCooperacion>;
  },

  /**
   * GET /api/v1/actores/:id
   * NOTA: El OpenAPI documenta una respuesta 500 para este
   * endpoint. Manejar el error apropiadamente.
   */
  obtener: async (id: string): Promise<ActorCooperacion> => {
    const res = await apiClient.get(`/actores/${id}`);
    return extractData<ActorCooperacion>(res);
  },

  /**
   * POST /api/v1/actores
   * Crea un nuevo actor. nombre, tipo y pais_origen son requeridos.
   */
  crear: async (
    datos: CreateActorDto
  ): Promise<ActorCooperacion> => {
    const formData = new FormData();
    Object.entries(datos).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'areas_tematicas' && Array.isArray(value)) {
          value.forEach((v) => formData.append(`${key}[]`, v));
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    });

    const res = await apiClient.post('/actores', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractData<ActorCooperacion>(res);
  },

  /**
   * PUT /api/v1/actores/:id
   * Actualiza un actor existente. Todos los campos son opcionales.
   * NOTA: Laravel requiere enviar multipart/form-data vía POST con _method='PUT'
   */
  actualizar: async (
    id: string,
    datos: UpdateActorDto
  ): Promise<ActorCooperacion> => {
    const formData = new FormData();
    formData.append('_method', 'PUT');

    Object.entries(datos).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'areas_tematicas' && Array.isArray(value)) {
          value.forEach((v) => formData.append(`${key}[]`, v));
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    });

    const res = await apiClient.post(`/actores/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractData<ActorCooperacion>(res);
  },

  /**
   * DELETE /api/v1/actores/:id
   */
  eliminar: async (id: string): Promise<void> => {
    await apiClient.delete(`/actores/${id}`);
  },

  /**
   * GET /api/v1/actores/exportar
   * Descarga el listado completo como archivo.
   * Devuelve text/plain según el OpenAPI.
   */
  exportar: async (
    params: ActoresParams = {}
  ): Promise<void> => {
    const queryString = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(
          ([, v]) => v !== '' && v !== undefined
        )
      ) as Record<string, string>
    ).toString();
    const url = `/actores/exportar${queryString ? '?' + queryString : ''}`;
    await descargarBlob(url, undefined, 'actores.xlsx');
  },
};
