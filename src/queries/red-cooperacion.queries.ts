import { useQuery } from '@tanstack/react-query';
import { redCooperacionService }
  from '@/services/red-cooperacion.service';
import type { FiltrosGrafo }
  from '@/types/red-cooperacion.types';

export function useRedCooperacion(
  filtros: Partial<FiltrosGrafo> = {}
) {
  return useQuery({
    queryKey:  ['analisis', 'red-cooperacion',
                filtros],
    queryFn:   () =>
      redCooperacionService.obtener(filtros),
    staleTime: 1000 * 60 * 15, // 15 min
  });
}
