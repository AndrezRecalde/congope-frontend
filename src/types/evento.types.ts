import type {
  Evento,
  TipoEvento,
  CompromisoEvento,
} from '@/services/axios';

export type { Evento, TipoEvento, CompromisoEvento };

// Participante según el OpenAPI
// NOTA: campo "nombres" (plural) NO "name"
export interface ParticipanteEvento {
  id:            number;   // INTEGER (usuario)
  nombres:       string;   // PLURAL según OpenAPI
  email:         string;
  asistio:       boolean;
  confirmado_en: string;   // "DD/MM/YYYY HH:mm"
}

export interface EventoFiltros {
  search?:     string;
  tipo_evento?: TipoEvento | '';
  page?:       number;
}

export interface EventoFormValues {
  titulo:      string;
  tipo_evento: TipoEvento | '';
  fecha_evento:string;
  lugar:       string;
  es_virtual:  boolean;
  url_virtual: string;
  descripcion: string;
}

export interface CompromisoFormValues {
  descripcion:    string;
  responsable_id: number | '';
  fecha_limite:   string;
}

// Colores por tipo de evento para FullCalendar
export const COLOR_TIPO_EVENTO: Record<TipoEvento, string> = {
  'Misión técnica':    '#1c7ed6',
  'Reunión bilateral': '#2f9e44',
  'Conferencia':       '#7048e8',
  'Visita de campo':   '#e67700',
  'Virtual':           '#0ca678',
  'Otro':              '#868e96',
};
