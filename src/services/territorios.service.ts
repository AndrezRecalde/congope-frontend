import apiClient, {
  type ApiResponse,
  type PaginatedResponse,
} from './axios';
import type {
  ProvinciaAdmin,
  CantonAdmin,
  ProvinciaEditForm,
  CantonEditForm,
} from '@/types/territorio.types';

export interface CantonesParams {
  provincia_id?: string;
  search?:       string;
  page?:         number;
  per_page?:     number;
}

export const territoriosService = {

  // ── PROVINCIAS ────────────────────────────────

  listarProvincias: async (): Promise<ProvinciaAdmin[]> => {
    const res = await apiClient.get('/provincias');
    const api = res.data as ApiResponse<ProvinciaAdmin[]>;
    return api.data;
  },

  editarProvincia: async (
    id:   string,
    datos: Partial<ProvinciaEditForm>
  ): Promise<ProvinciaAdmin> => {
    const res = await apiClient.put(
      `/provincias/${id}`, datos
    );
    const api = res.data as ApiResponse<ProvinciaAdmin>;
    return api.data;
  },

  // ── CANTONES ──────────────────────────────────

  listarCantones: async (
    params: CantonesParams = {}
  ): Promise<PaginatedResponse<CantonAdmin>> => {
    const queryParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== '' && v !== undefined
      )
    );
    const res = await apiClient.get('/cantones', {
      params: queryParams,
    });
    return res.data as PaginatedResponse<CantonAdmin>;
  },

  editarCanton: async (
    id:    string,
    datos: CantonEditForm
  ): Promise<CantonAdmin> => {
    const res = await apiClient.put(
      `/cantones/${id}`, datos
    );
    const api = res.data as ApiResponse<CantonAdmin>;
    return api.data;
  },
};
