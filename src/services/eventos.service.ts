import apiClient, {
  extractData,
  type Evento,
  type CompromisoEvento,
  type PaginatedResponse,
  type ApiResponse,
} from './axios';
import type {
  ParticipanteEvento,
} from '@/types/evento.types';

export interface EventosParams {
  search?:      string;
  tipo_evento?: string;
  page?:        number;
  per_page?:    number;
}

export interface CreateEventoDto {
  titulo:       string;
  tipo_evento:  string;
  fecha_evento: string;
  lugar?:       string | null;
  es_virtual?:  boolean;
  url_virtual?: string | null;
  descripcion?: string | null;
}

export type UpdateEventoDto = Partial<CreateEventoDto>;

// Payload para AGREGAR o ELIMINAR participantes
export interface GestionarParticipantesDto {
  accion:   'agregar' | 'eliminar';
  user_ids: number[];  // array de INTEGER
}

// Payload para MARCAR ASISTENCIA (estructura distinta)
export interface MarcarAsistenciaDto {
  accion:  'marcar_asistencia';
  user_id: number;   // singular INTEGER
  asistio: boolean;
}

export interface CreateCompromisoDto {
  descripcion:    string;
  responsable_id: number;  // INTEGER (usuario)
  fecha_limite:   string;
}

export const eventosService = {
  /**
   * GET /api/v1/eventos
   */
  listar: async (
    params: EventosParams = {}
  ): Promise<PaginatedResponse<Evento>> => {
    const queryParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== '' && v !== undefined
      )
    );
    const res = await apiClient.get('/eventos', {
      params: queryParams,
    });
    return res.data as PaginatedResponse<Evento>;
  },

  /**
   * GET /api/v1/eventos/:id
   * Detalle con campo "participantes" (no en listado).
   * NOTA: participante.nombres (plural, no "name")
   */
  obtener: async (id: string): Promise<
    Evento & { participantes: ParticipanteEvento[] }
  > => {
    const res = await apiClient.get(`/eventos/${id}`);
    return extractData(res);
  },

  /**
   * POST /api/v1/eventos
   * Required: titulo, tipo_evento, fecha_evento
   */
  crear: async (
    datos: CreateEventoDto
  ): Promise<Evento> => {
    const res = await apiClient.post('/eventos', datos);
    return extractData<Evento>(res);
  },

  /**
   * PUT /api/v1/eventos/:id
   */
  actualizar: async (
    id: string,
    datos: UpdateEventoDto
  ): Promise<Evento> => {
    const res = await apiClient.put(
      `/eventos/${id}`,
      datos
    );
    return extractData<Evento>(res);
  },

  /**
   * DELETE /api/v1/eventos/:id
   */
  eliminar: async (id: string): Promise<void> => {
    await apiClient.delete(`/eventos/${id}`);
  },

  /**
   * POST /api/v1/eventos/:id/participantes
   *
   * Tres acciones distintas con estructuras diferentes:
   *
   * "agregar"/"eliminar":
   *   { accion, user_ids: number[] }
   *
   * "marcar_asistencia":
   *   { accion, user_id: number, asistio: boolean }
   *
   * user_ids son INTEGER (no UUID).
   */
  gestionarParticipantes: async (
    eventoId: string,
    payload:
      | GestionarParticipantesDto
      | MarcarAsistenciaDto
  ): Promise<void> => {
    await apiClient.post(
      `/eventos/${eventoId}/participantes`,
      payload
    );
  },

  // Helpers de conveniencia para participantes
  agregarParticipantes: async (
    eventoId: string,
    userIds:  number[]
  ): Promise<void> => {
    await eventosService.gestionarParticipantes(
      eventoId,
      { accion: 'agregar', user_ids: userIds }
    );
  },

  eliminarParticipante: async (
    eventoId: string,
    userId:   number
  ): Promise<void> => {
    await eventosService.gestionarParticipantes(
      eventoId,
      { accion: 'eliminar', user_ids: [userId] }
    );
  },

  marcarAsistencia: async (
    eventoId: string,
    userId:   number,
    asistio:  boolean
  ): Promise<void> => {
    await eventosService.gestionarParticipantes(
      eventoId,
      { accion: 'marcar_asistencia', user_id: userId, asistio }
    );
  },

  // ── COMPROMISOS ──────────────────────────────────

  /**
   * GET /api/v1/eventos/:evento_id/compromisos
   */
  listarCompromisos: async (
    eventoId: string
  ): Promise<CompromisoEvento[]> => {
    const res = await apiClient.get(
      `/eventos/${eventoId}/compromisos`
    );
    const apiRes = res.data as
      ApiResponse<CompromisoEvento[]>;
    return apiRes.data;
  },

  /**
   * POST /api/v1/eventos/:evento_id/compromisos
   * responsable_id es INTEGER (no UUID)
   */
  crearCompromiso: async (
    eventoId: string,
    datos:    CreateCompromisoDto
  ): Promise<CompromisoEvento> => {
    const res = await apiClient.post(
      `/eventos/${eventoId}/compromisos`,
      datos
    );
    return extractData<CompromisoEvento>(res);
  },

  /**
   * PATCH /api/v1/eventos/:evento_id/compromisos
   *         /:compromiso_id/resolver
   * Sin body. Marca el compromiso como resuelto.
   */
  resolverCompromiso: async (
    eventoId:      string,
    compromisoId:  string,
    resuelto:      boolean = true
  ): Promise<void> => {
    await apiClient.patch(
      `/eventos/${eventoId}/compromisos/${compromisoId}/resolver`,
      { resuelto }
    );
  },
};
