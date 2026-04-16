import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/axios';
import type { CategoriaBeneficiario } from '@/services/axios';

// ─── Query Keys ─────────────────────────────────────────────────────────────
export const categoriasBeneficiarioKeys = {
  all:      ['categorias-beneficiario']      as const,
  agrupadas: ['categorias-beneficiario', 'agrupadas'] as const,
  list:     (params?: object) => [...categoriasBeneficiarioKeys.all, params] as const,
  detail:   (id: number)      => [...categoriasBeneficiarioKeys.all, id]    as const,
};

// ─── Tipos ──────────────────────────────────────────────────────────────────
export interface GrupoCategorias {
  grupo:      string;
  categorias: { id: number; nombre: string }[];
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

/** Lista plana con proyectos_count (para la tabla de configuración) */
export function useCategoriasLista(params?: { search?: string; grupo?: string }) {
  return useQuery({
    queryKey: categoriasBeneficiarioKeys.list(params),
    queryFn:  async () => {
      const res = await apiClient.get('/categorias-beneficiario', { params });
      return res.data.data as CategoriaBeneficiario[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/** Lista agrupada por grupo (para el formulario de proyectos) */
export function useCategoriasAgrupadas() {
  return useQuery({
    queryKey: categoriasBeneficiarioKeys.agrupadas,
    queryFn:  async () => {
      const res = await apiClient.get('/publico/categorias-beneficiario');
      return res.data.data as GrupoCategorias[];
    },
    staleTime: 1000 * 60 * 30, // 30 min — catálogo semi-estático
  });
}

/** Crear categoría */
export function useCrearCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { nombre: string; grupo: string; activo?: boolean }) =>
      apiClient.post('/categorias-beneficiario', data).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriasBeneficiarioKeys.all });
    },
  });
}

/** Actualizar categoría */
export function useActualizarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ nombre: string; grupo: string; activo: boolean }> }) =>
      apiClient.put(`/categorias-beneficiario/${id}`, data).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriasBeneficiarioKeys.all });
    },
  });
}

/** Eliminar categoría */
export function useEliminarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`/categorias-beneficiario/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriasBeneficiarioKeys.all });
    },
  });
}
