export interface EstadisticasProvincia {
  id:     string;
  nombre: string;
  codigo: string;
  capital:string;
  proyectos: {
    total:        number;
    en_gestion:   number;
    en_ejecucion: number;
    finalizado:   number;
    suspendido:   number;
  };
  monto_total:       number;
  monto_formateado:  string;
  ods_top: Array<{
    id:              number;
    numero:          number;
    nombre:          string;
    color_hex:       string;
    total_proyectos: number;
  }>;
  actores_count:      number;
  emblematicos_count: number;
  practicas_count:    number;
  flujos: {
    'Norte-Sur':      number;
    'Sur-Sur':        number;
    'Triangular':     number;
    'Interna':        number;
    'Descentralizada':number;
  };
  sectores_top: Array<{
    sector: string;
    total:  number;
  }>;
}

// Colores para cada provincia en la comparación
export const COLORES_PROVINCIAS = [
  '#1E4D8C',  // Provincia 1 — azul institucional
  '#C9A84C',  // Provincia 2 — dorado ecuatoriano
  '#10B981',  // Provincia 3 — verde esmeralda
] as const;
