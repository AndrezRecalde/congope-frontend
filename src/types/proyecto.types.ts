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
// de objetos para poder capturar rol y avance
export interface ProvinciaFormItem {
  id:                    string;
  nombre:                string;
  rol:                   'Líder' | 'Co-ejecutora' | 'Beneficiaria';
  porcentaje_avance:     number | null;
}

export interface BeneficiarioFormItem {
  provincia_id:       string;
  categoria_id:       number;
  cantidad_directos:  number | null;
  cantidad_indirectos: number | null;
  observaciones:      string;
}

export interface ProyectoFormValues {
  nombre:               string;
  actor_ids:            string[];
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
  ubicaciones:          Array<{canton_id: string; nombre: string; lat: number | ''; lng: number | ''}>;
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
