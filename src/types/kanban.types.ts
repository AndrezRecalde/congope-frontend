import type { Proyecto } from '@/services/axios';

export type EstadoProyecto =
  | 'En gestión'
  | 'En ejecución'
  | 'Finalizado'
  | 'Suspendido';

export const ESTADOS_KANBAN: EstadoProyecto[] = [
  'En gestión',
  'En ejecución',
  'Finalizado',
  'Suspendido',
];

export const COLOR_ESTADO: Record<EstadoProyecto, string> = {
  'En gestión':   '#F59E0B',
  'En ejecución': '#3B82F6',
  'Finalizado':   '#10B981',
  'Suspendido':   '#EF4444',
};

export const BG_ESTADO: Record<EstadoProyecto, string> = {
  'En gestión':   '#FFFBEB',
  'En ejecución': '#EFF6FF',
  'Finalizado':   '#ECFDF5',
  'Suspendido':   '#FEF2F2',
};

export interface FiltrosKanban {
  provincia_id: string;  // '' = todas
  search:       string;
}

export interface EstadoColumna {
  page:     number;
  cargando: boolean;
}

export interface ConteosEstado {
  'En gestión':   number;
  'En ejecución': number;
  'Finalizado':   number;
  'Suspendido':   number;
  total:          number;
}
