export interface DashboardKpis {
  proyectos: {
    total:        number;
    en_gestion:   number;
    en_ejecucion: number;
    finalizados:  number;
    monto_total:  string; // string según el OpenAPI
  };
  actores: {
    total:    number;
    activos:  number;
    por_tipo: Record<string, number>; // objeto dinámico
  };
  practicas: {
    total:      number;
    destacadas: number;
  };
  redes: {
    total:    number;
    por_tipo: Record<string, number>; // objeto dinámico
  };
  proyectos_destacados?: ProyectoDestacado[]; // En el backend se agrupa con los kpis
}

export interface DashboardAlertas {
  documentos_venciendo:   number;
  hitos_vencidos:         number;
  compromisos_pendientes: number;
}

export interface ProyectoDestacado {
  id: string;
  nombre: string;
  avance?: number;
  inversion: string; // O el string que enviemos del backend
  actor: string; // Nombre del actor o contraparte
  provincias?: { nombre: string; porcentaje_avance: number | null }[];
}

export interface DashboardData {
  kpis:    DashboardKpis;
  alertas: DashboardAlertas;
  proyectos_destacados?: ProyectoDestacado[];
}

export interface GraficaAnualItem {
  anio:  string; // string según OpenAPI ("2026")
  total: number;
  monto: string; // string decimal ("2500000.50")
}

export interface GraficaOdsItem {
  numero:          number;
  nombre:          string;
  color_hex:       string;
  total_proyectos: number;
}
