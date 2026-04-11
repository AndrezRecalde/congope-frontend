import type {
  Proyecto,
  EstadoProyecto,
  FlujoDireccion,
  ModalidadCooperacion,
  HitoProyecto,
} from '@/services/axios';

export type {
  Proyecto,
  EstadoProyecto,
  FlujoDireccion,
  ModalidadCooperacion,
  HitoProyecto,
};

export interface ProyectoFiltros {
  search?:      string;
  estado?:      EstadoProyecto | '';
  actor_id?:    string;
  provincia_id?: string;
  page?:        number;
}

// El formulario maneja provincias como un array
// de objetos para poder capturar rol y beneficiarios
export interface ProvinciaFormItem {
  id:                    string;
  nombre:                string;
  rol:                   'Líder' | 'Co-ejecutora' | 'Beneficiaria';
  porcentaje_avance:     number | null;
  beneficiarios_directos: number | null;
  beneficiarios_indirectos: number | null;
}

export interface ProyectoFormValues {
  nombre:               string;
  actor_id:             string;
  estado:               EstadoProyecto;
  codigo:               string;
  descripcion:          string;
  monto_total:          number | '';
  moneda:               string;
  sector_tematico:      string;
  flujo_direccion:      FlujoDireccion | '';
  modalidad_cooperacion: string[];
  fecha_inicio:         string;
  fecha_fin_planificada: string;
  fecha_fin_real:       string;
  provincias:           ProvinciaFormItem[];
  ods_ids:              number[];
  canton_ids:           string[];
  parroquia_ids:        string[];
  ubicaciones:          Array<{nombre: string; lat: number | ''; lng: number | ''}>;
}

export interface HitoFormValues {
  titulo:       string;
  descripcion:  string;
  fecha_limite: string;
}

// Colores por estado — usados en tabla y kanban
export const COLOR_ESTADO: Record<EstadoProyecto, string> = {
  'En gestión':   'yellow',
  'En ejecución': 'blue',
  'Finalizado':   'green',
  'Suspendido':   'red',
};

// Grupos del Kanban en el orden correcto
export const ESTADOS_KANBAN: EstadoProyecto[] = [
  'En gestión',
  'En ejecución',
  'Finalizado',
  'Suspendido',
];
