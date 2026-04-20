import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  territoriosService,
  type CantonesParams,
} from '@/services/territorios.service';
import { getErrorMessage } from '@/services/axios';
import type { ProvinciaEditForm, CantonEditForm } from '@/types/territorio.types';

// ── Claves de query ──────────────────────────────

const KEYS = {
  provincias:        ['territorios', 'provincias'],
  cantones:          ['territorios', 'cantones'],
  cantonesFiltrados: (p: CantonesParams) =>
    ['territorios', 'cantones', p],
} as const;

// ── Provincias ───────────────────────────────────

export function useProvinciasAdmin() {
  return useQuery({
    queryKey: KEYS.provincias,
    queryFn:  territoriosService.listarProvincias,
    staleTime: 1000 * 60 * 10, // 10 min
  });
}

export function useEditarProvincia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id, datos,
    }: {
      id: string;
      datos: Partial<ProvinciaEditForm>;
    }) => territoriosService.editarProvincia(id, datos),
    onSuccess: () => {
      // Invalidar tanto la lista admin como
      // los catálogos usados en otros módulos
      qc.invalidateQueries({ queryKey: KEYS.provincias });
      qc.invalidateQueries({
        queryKey: ['provincias'],
      });
      notifications.show({
        title:   'Provincia actualizada',
        message: 'Los datos fueron guardados.',
        color:   'green',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al guardar',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}

// ── Cantones ─────────────────────────────────────

export function useCantonesAdmin(
  params: CantonesParams = {}
) {
  return useQuery({
    queryKey: KEYS.cantonesFiltrados(params),
    queryFn:  () =>
      territoriosService.listarCantones(params),
    placeholderData: (prev) => prev,
  });
}

export function useEditarCanton() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id, datos,
    }: {
      id: string;
      datos: CantonEditForm;
    }) => territoriosService.editarCanton(id, datos),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.cantones });
      notifications.show({
        title:   'Cantón actualizado',
        message: 'El nombre fue actualizado.',
        color:   'green',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al guardar',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}
