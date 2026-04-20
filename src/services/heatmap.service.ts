import apiClient from './axios';
import type { DatosHeatmap } from '@/types/heatmap.types';

export const heatmapService = {
  obtenerMapaCalorOds: async (): Promise<DatosHeatmap> => {
    const res = await apiClient.get('/publico/mapa-calor-ods');
    return res.data.data as DatosHeatmap;
  },
};
