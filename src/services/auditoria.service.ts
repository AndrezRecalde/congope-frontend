import apiClient from './axios';
import type {
  RegistroAuditoria,
} from '@/types/usuario.types';
import type { PaginatedResponse } from './axios';

export interface AuditoriaParams {
  accion?:      string;
  modelo_tipo?: string;
  user_id?:     number;
  page?:        number;
  per_page?:    number;
}

export const auditoriaService = {
  /**
   * GET /api/v1/auditoria
   * per_page default: 20
   * created_at: "YYYY-MM-DD HH:mm:ss"
   * modelo_tipo: "App\Models\Proyecto"
   */
  listar: async (
    params: AuditoriaParams = {}
  ): Promise<PaginatedResponse<RegistroAuditoria>> => {
    const queryParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== '' && v !== undefined
      )
    );
    const res = await apiClient.get('/auditoria', {
      params: queryParams,
    });
    return res.data as
      PaginatedResponse<RegistroAuditoria>;
  },
};
