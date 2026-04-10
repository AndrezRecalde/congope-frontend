import apiClient, {
  extractData,
  type LoginCredentials,
  type LoginResponse,
  type Usuario,
} from './axios';

export const authService = {
  /**
   * POST /api/v1/auth/login
   * No requiere token. Devuelve token + usuario.
   */
  login: async (
    credentials: LoginCredentials
  ): Promise<LoginResponse> => {
    const res = await apiClient.post(
      '/auth/login',
      credentials
    );
    return extractData<LoginResponse>(res);
  },

  /**
   * POST /api/v1/auth/logout
   * Requiere Bearer token en header.
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /**
   * GET /api/v1/auth/me
   * Devuelve el usuario autenticado con roles y permisos.
   * NOTA: usuario.id es INTEGER según el OpenAPI.
   */
  me: async (): Promise<Usuario> => {
    const res = await apiClient.get('/auth/me');
    return extractData<Usuario>(res);
  },

  /**
   * POST /api/v1/auth/refresh
   * Renueva el token de acceso.
   */
  refresh: async (): Promise<LoginResponse> => {
    const res = await apiClient.post('/auth/refresh');
    return extractData<LoginResponse>(res);
  },
};
