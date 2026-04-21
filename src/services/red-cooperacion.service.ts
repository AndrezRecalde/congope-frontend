import apiClient from './axios';
import type {
  DatosGrafo,
  FiltrosGrafo,
} from '@/types/red-cooperacion.types';

export const redCooperacionService = {
  obtener: async (
    filtros: Partial<FiltrosGrafo> = {}
  ): Promise<DatosGrafo> => {
    const params = Object.fromEntries(
      Object.entries(filtros).filter(
        ([, v]) => v !== '' && v !== undefined
      )
    );
    const res = await apiClient.get(
      '/analisis/red-cooperacion',
      { params }
    );
    return res.data.data as DatosGrafo;
  },
};
