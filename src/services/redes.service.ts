import apiClient, {
  extractData,
  type Red,
  type PaginatedResponse,
} from './axios';

export interface RedesParams {
  search?:      string;
  tipo?:        string;
  rol_congope?: string;
  page?:        number;
  per_page?:    number;
}

export interface CreateRedDto {
  nombre:         string;
  tipo:           string;
  rol_congope:    string;
  objetivo?:      string | null;
  fecha_adhesion?: string | null;
  // Al crear, se pueden agregar actores iniciales
  actor_ids?:     string[];
  rol_miembro?:   string | null;
}

export type UpdateRedDto = Omit<
  CreateRedDto,
  'actor_ids' | 'rol_miembro'
>;

// Payload para AGREGAR miembros
export interface AgregarMiembrosDto {
  accion: 'agregar';
  actores: Array<{
    actor_id:      string;
    rol_miembro?:  string | null;
    fecha_ingreso?: string | null;
  }>;
}

// Payload para ELIMINAR miembros
export interface EliminarMiembrosDto {
  accion:    'eliminar';
  actor_ids: string[];
}

export type GestionarMiembrosDto =
  | AgregarMiembrosDto
  | EliminarMiembrosDto;

export const redesService = {
  /**
   * GET /api/v1/redes
   */
  listar: async (
    params: RedesParams = {}
  ): Promise<PaginatedResponse<Red>> => {
    const queryParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== '' && v !== undefined && v !== null
      )
    );
    const res = await apiClient.get('/redes', {
      params: queryParams,
    });
    return res.data as PaginatedResponse<Red>;
  },

  /**
   * GET /api/v1/redes/:id
   * Incluye documentos: [] (vacío en el backend actual)
   */
  obtener: async (id: string): Promise<Red> => {
    const res = await apiClient.get(`/redes/${id}`);
    return extractData<Red>(res);
  },

  /**
   * POST /api/v1/redes
   * Required: nombre, tipo, rol_congope
   * Al crear se pueden pasar actor_ids para miembros iniciales
   */
  crear: async (datos: CreateRedDto): Promise<Red> => {
    const res = await apiClient.post('/redes', datos);
    return extractData<Red>(res);
  },

  /**
   * PUT /api/v1/redes/:id
   * NO acepta actor_ids — los miembros van por el
   * endpoint dedicado POST /redes/:id/miembros
   */
  actualizar: async (
    id: string,
    datos: UpdateRedDto
  ): Promise<Red> => {
    const res = await apiClient.put(`/redes/${id}`, datos);
    return extractData<Red>(res);
  },

  /**
   * DELETE /api/v1/redes/:id
   */
  eliminar: async (id: string): Promise<void> => {
    await apiClient.delete(`/redes/${id}`);
  },

  /**
   * POST /api/v1/redes/:id/miembros
   * Gestiona agregar Y eliminar según el campo "accion".
   *
   * Para AGREGAR: { accion: "agregar", actores: [{actor_id, ...}] }
   * Para ELIMINAR: { accion: "eliminar", actor_ids: [uuid, ...] }
   *
   * Son estructuras distintas según la acción — ver openapi.yaml.
   */
  gestionarMiembros: async (
    redId: string,
    payload: GestionarMiembrosDto
  ): Promise<void> => {
    await apiClient.post(`/redes/${redId}/miembros`, payload);
  },

  // ── Helpers de conveniencia ─────────────────────────

  /**
   * Agrega un único miembro a la red
   */
  agregarMiembro: async (
    redId: string,
    actorId: string,
    rolMiembro?: string | null,
    fechaIngreso?: string | null
  ): Promise<void> => {
    await redesService.gestionarMiembros(redId, {
      accion: 'agregar',
      actores: [
        {
          actor_id:      actorId,
          rol_miembro:   rolMiembro  ?? null,
          fecha_ingreso: fechaIngreso ?? null,
        },
      ],
    });
  },

  /**
   * Elimina un único miembro de la red
   */
  eliminarMiembro: async (
    redId: string,
    actorId: string
  ): Promise<void> => {
    await redesService.gestionarMiembros(redId, {
      accion:    'eliminar',
      actor_ids: [actorId],
    });
  },
};
