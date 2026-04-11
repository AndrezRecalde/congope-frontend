import type { BuenaPractica } from '@/services/axios';

export type { BuenaPractica };

export interface PracticaFiltros {
  search?:          string;
  provincia_id?:    string;
  replicabilidad?:  'Alta' | 'Media' | 'Baja' | '';
  es_destacada?:    boolean | undefined;
  page?:            number;
}

export interface PracticaFormValues {
  provincia_id:         string;
  proyecto_id:          string;
  titulo:               string;
  descripcion_problema: string;
  metodologia:          string;
  resultados:           string;
  replicabilidad:       'Alta' | 'Media' | 'Baja' | '';
  es_destacada:         boolean;
}

// Color por nivel de replicabilidad
export const COLOR_REPLICABILIDAD: Record<string, string> = {
  Alta:  'green',
  Media: 'yellow',
  Baja:  'orange',
};
