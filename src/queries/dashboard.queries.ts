import { useQuery } from '@tanstack/react-query';
import { queryKeys }       from '@/lib/query-client';
import { dashboardService } from
  '@/services/dashboard.service';
import { heatmapService }
  from '@/services/heatmap.service';

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.index,
    queryFn:  dashboardService.obtener,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
  });
}

export function useGraficaAnual() {
  return useQuery({
    queryKey: queryKeys.dashboard.graficaAnual,
    queryFn:  dashboardService.graficaAnual,
    staleTime: 1000 * 60 * 10,
  });
}

export function useGraficaOds() {
  return useQuery({
    queryKey: queryKeys.dashboard.graficaOds,
    queryFn:  dashboardService.graficaOds,
    staleTime: 1000 * 60 * 10,
  });
}

export function useMisCompromisosPendientes() {
  return useQuery({
    queryKey: queryKeys.misCompromisos.pendientes,
    queryFn:  dashboardService.misCompromisosPendientes,
    staleTime: 1000 * 60 * 3, // 3 min — datos frecuentes
    refetchOnWindowFocus: true,
  });
}

export function useMapaCalorOds() {
  return useQuery({
    queryKey:  ['dashboard', 'mapa-calor-ods'],
    queryFn:   heatmapService.obtenerMapaCalorOds,
    staleTime: 1000 * 60 * 30, // 30 min
  });
}
