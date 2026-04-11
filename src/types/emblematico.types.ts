import type {
  ProyectoEmblematico,
  Reconocimiento,
} from '@/services/axios';

export type { ProyectoEmblematico, Reconocimiento };

export interface EmblematicoFiltros {
  search?:      string;
  provincia_id?: string;
  es_publico?:  boolean | undefined;
  page?:        number;
}

export interface EmblematicoFormValues {
  proyecto_id:         string;
  provincia_id:        string;
  titulo:              string;
  descripcion_impacto: string;
  periodo:             string;
}

export interface ReconocimientoFormValues {
  titulo:               string;
  organismo_otorgante:  string;
  ambito:               'Nacional' | 'Internacional' | '';
  anio:                 number | '';
  descripcion:          string;
}
