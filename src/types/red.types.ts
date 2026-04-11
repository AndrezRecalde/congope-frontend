import type { Red, TipoRed, MiembroRed }
  from '@/services/axios';

export type { Red, TipoRed, MiembroRed };

export interface RedFiltros {
  search?:      string;
  tipo?:        TipoRed | '';
  rol_congope?: 'Miembro' | 'Coordinador' | 'Observador' | '';
  page?:        number;
}

export interface RedFormValues {
  nombre:        string;
  tipo:          TipoRed | '';
  rol_congope:   'Miembro' | 'Coordinador' | 'Observador' | '';
  objetivo:      string;
  fecha_adhesion:string;
  // actor_ids solo al crear (shortcut)
  actor_ids:     string[];
  rol_miembro:   string;
}

// Para agregar miembros individualmente desde el detalle
export interface AgregarMiembroValues {
  actor_id:      string;
  rol_miembro:   string;
  fecha_ingreso: string;
}

// Colores por tipo de red
export const COLOR_TIPO_RED: Record<TipoRed, string> = {
  Regional:       'blue',
  Nacional:       'teal',
  Internacional:  'violet',
  'Temática':     'orange',
};

// Colores por rol de CONGOPE
export const COLOR_ROL_CONGOPE: Record<string, string> = {
  Miembro:      'blue',
  Coordinador:  'green',
  Observador:   'gray',
};
