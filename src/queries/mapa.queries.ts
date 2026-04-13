import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { mapaService } from '@/services/mapa.service';
import type { MapaFiltros } from '@/types/mapa.types';

export function useProyectosMapa(filtros: MapaFiltros = {}) {
  return useQuery({
    queryKey: ['mapa', 'proyectos', filtros],
    queryFn:  () => mapaService.listarProyectos(filtros),
    staleTime: 1000 * 60 * 5, // 5 min
    placeholderData: (prev) => prev,
  });
}

export function useProyectoMapaDetalle(id: string | null) {
  return useQuery({
    queryKey: queryKeys.proyectos.detail(id ?? ''),
    queryFn:  () => mapaService.obtenerProyecto(id!),
    enabled:  !!id,
  });
}

export function useProvinciasMapa() {
  return useQuery({
    queryKey: queryKeys.provincias.list,
    queryFn:  mapaService.listarProvincias,
    staleTime: Infinity, // catálogo estático
  });
}

export function useOdsMapa() {
  return useQuery({
    queryKey: queryKeys.ods.list,
    queryFn:  mapaService.listarOds,
    staleTime: Infinity,
  });
}
