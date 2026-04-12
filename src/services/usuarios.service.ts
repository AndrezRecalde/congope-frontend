import apiClient, {
  extractData,
  type PaginatedResponse,
} from './axios';
import type {
  UsuarioListado,
  UsuarioDetalle,
  RolSistema,
} from '@/types/usuario.types';

export interface UsuariosParams {
  search?:   string;
  rol?:      string;
  page?:     number;
  per_page?: number;
}

export interface CreateUsuarioDto {
  name:          string;
  email:         string;
  password:      string;
  rol:           RolSistema;
  provincia_ids?: string[];
}

export interface UpdateUsuarioDto {
  name?:     string;
  email?:    string;
  password?: string;
}

export const usuariosService = {
  /**
   * GET /api/v1/usuarios
   * roles en listado son objetos con id y name.
   */
  listar: async (
    params: UsuariosParams = {}
  ): Promise<PaginatedResponse<UsuarioListado>> => {
    const queryParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== '' && v !== undefined
      )
    );
    const res = await apiClient.get('/usuarios', {
      params: queryParams,
    });
    return res.data as PaginatedResponse<UsuarioListado>;
  },

  /**
   * GET /api/v1/usuarios/:id
   * roles en detalle son string[] (solo nombres).
   * created_at: "DD/MM/YYYY"
   * id es INTEGER en el path.
   */
  obtener: async (
    id: number
  ): Promise<UsuarioDetalle> => {
    const res = await apiClient.get(`/usuarios/${id}`);
    return extractData<UsuarioDetalle>(res);
  },

  /**
   * POST /api/v1/usuarios
   * Required: name, email, password, rol
   * Optional: provincia_ids[]
   */
  crear: async (
    datos: CreateUsuarioDto
  ): Promise<UsuarioListado> => {
    const res = await apiClient.post('/usuarios', datos);
    return extractData<UsuarioListado>(res);
  },

  /**
   * PUT /api/v1/usuarios/:id
   * Solo name, email, password.
   * NO cambia rol ni provincias.
   * id es INTEGER en el path.
   */
  actualizar: async (
    id:    number,
    datos: UpdateUsuarioDto
  ): Promise<UsuarioListado> => {
    // Filtrar campos vacíos para no enviarlos
    const body = Object.fromEntries(
      Object.entries(datos).filter(
        ([, v]) => v !== '' && v !== undefined
      )
    );
    const res = await apiClient.put(
      `/usuarios/${id}`,
      body
    );
    return extractData<UsuarioListado>(res);
  },

  /**
   * DELETE /api/v1/usuarios/:id
   */
  eliminar: async (id: number): Promise<void> => {
    await apiClient.delete(`/usuarios/${id}`);
  },

  /**
   * PATCH /api/v1/usuarios/:id/rol
   * Body required: { rol: string }
   */
  cambiarRol: async (
    id:  number,
    rol: RolSistema
  ): Promise<void> => {
    await apiClient.patch(`/usuarios/${id}/rol`, { rol });
  },

  /**
   * PATCH /api/v1/usuarios/:id/provincias
   * Body: { provincia_ids: string[] }
   * Array vacío = quitar todas las provincias.
   */
  asignarProvincias: async (
    id:           number,
    provincia_ids: string[]
  ): Promise<void> => {
    await apiClient.patch(
      `/usuarios/${id}/provincias`,
      { provincia_ids }
    );
  },
};
