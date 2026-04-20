import axios from 'axios';
import { env } from '@/lib/env';
import type { EstadisticasProvincia } from '@/types/comparador.types';

// Cliente HTTP PÚBLICO — sin token de autenticación
// El portal es accesible sin login.
const portalClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

export interface ProvinciaPortal {
  id:               string;
  nombre:           string;
  codigo:           string;
  proyectos_count:  number;
  monto_total:      number;
  monto_formateado: string;
  tooltip: {
    total:        number;
    en_gestion:   number;
    en_ejecucion: number;
    finalizado:   number;
  };
}

export interface OpcionesFiltro {
  provincias: Array<{ value: string; label: string }>;
  cantones:   Array<{
    value:         string;
    label:         string;
    provincia_id:  string;
    provincia?:    string;
  }>;
  actores:    Array<{
    value: string;
    label: string;
    tipo:  string;
  }>;
}

export interface CatalogosMapa {
  provincias:      ProvinciaPortal[];
  opciones_filtro: OpcionesFiltro;
}

export interface ProyectoPortal {
  id:                    string;
  codigo:                string;
  nombre:                string;
  estado:                string;
  color_marcador:        string;
  monto_formateado:      string;
  sector_tematico:       string;
  flujo_direccion:       string;
  fecha_inicio:          string | null;
  fecha_fin_planificada: string | null;
  actor: {
    id:          string;
    nombre:      string;
    tipo:        string;
    pais_origen: string;
  } | null;
  provincias: Array<{ id: string; nombre: string }>;
  ods:        Array<{
    id:        string;
    numero:    number;
    nombre:    string;
    color_hex: string;
  }>;
  ubicaciones: Array<{
    id:          string;
    nombre:      string;
    coordenadas: { lat: number; lng: number };
  }>;
}

export interface EmblematicoPortal {
  id:                  string;
  titulo:              string;
  descripcion_impacto: string;
  periodo:             string | null;
  provincia: {
    id:     string;
    nombre: string;
  } | null;
  proyecto: {
    id:               string;
    codigo:           string;
    nombre:           string;
    estado:           string;
    sector_tematico:  string;
    monto_formateado: string;
  } | null;
  reconocimientos: Array<{
    id:                  string;
    titulo:              string;
    organismo_otorgante: string;
    ambito:              string;
    anio:                number;
  }>;
  reconocimientos_count: number;
  created_at:            string;
}

export interface BuenaPracticaPortal {
  id:                   string;
  titulo:               string;
  descripcion_problema: string;
  resultados:           string;
  replicabilidad:       string;
  calificacion_promedio:string;
  provincia: {
    id:     string;
    nombre: string;
  } | null;
  created_at: string;
}

export interface ResultadosFiltro {
  proyectos:        ProyectoPortal[];
  emblematicos:     EmblematicoPortal[];
  buenas_practicas: BuenaPracticaPortal[];
  resumen: {
    total_proyectos:        number;
    total_emblematicos:     number;
    total_buenas_practicas: number;
    provincia_resaltada:    string | null;
    search_aplicado:        string | null;
  };
}

export interface ConteosPortal {
  total_proyectos:          number;
  total_emblematicos:       number;
  total_buenas_practicas:   number;
  total_provincias_activas: number;
}

export interface EstadisticasPortal {
  kpis: {
    total_proyectos:       number;
    total_actores:         number;
    total_provincias:      number;
    monto_formateado:      string;
  };
  por_ods: Array<{
    id:               string;
    numero:           number;
    nombre:           string;
    color_hex:        string;
    total_proyectos:  number;
  }>;
  por_tipo_actor: Array<{
    tipo:  string;
    total: number;
  }>;
  por_flujo: Array<{
    flujo: string;
    total: number;
  }>;
}

export interface DetalleProyectoPortal {
  id:                    string;
  codigo:                string;
  nombre:                string;
  descripcion:           string | null;
  estado:                string;
  color_marcador:        string;
  sector_tematico:       string;
  flujo_direccion:       string;
  modalidad_cooperacion: string[];
  monto_formateado:      string;
  moneda:                string;
  fecha_inicio:          string | null;
  fecha_fin_planificada: string | null;
  fecha_fin_real:        string | null;
  actores: Array<{
    id:          string;
    nombre:      string;
    tipo:        string;
    pais_origen: string;
    sitio_web:   string | null;
  }>;
  // retrocompat
  actor: {
    id:          string;
    nombre:      string;
    tipo:        string;
    pais_origen: string;
    sitio_web:   string | null;
  } | null;
  provincias: Array<{
    id:                string;
    nombre:            string;
    rol:               string;
    porcentaje_avance: number | null;
  }>;
  ods: Array<{
    id:        string;
    numero:    number;
    nombre:    string;
    color_hex: string;
  }>;
  ubicaciones: Array<{
    id:          string;
    nombre:      string;
    coordenadas: { lat: number; lng: number };
  }>;
  avance: {
    hitos_total:      number;
    hitos_completados:number;
    porcentaje:       number | null;
  };
  beneficiarios: {
    directos:   number | null;
    indirectos: number | null;
  };
  beneficiarios_por_provincia: Array<{
    provincia_id:      string;
    provincia_nombre:  string;
    total_directos:    number;
    total_indirectos:  number;
    categorias: Array<{
      categoria_nombre:    string | null;
      categoria_grupo:     string | null;
      cantidad_directos:   number | null;
      cantidad_indirectos: number | null;
      observaciones:       string | null;
    }>;
  }>;
}

export const portalService = {
  /**
   * GET /api/v1/publico/mapa/catalogos
   * Datos estáticos: provincias con stats + opciones
   * para los selects de filtro.
   */
  mapaCatalogos: async (): Promise<CatalogosMapa> => {
    const res = await portalClient.get(
      '/publico/mapa/catalogos'
    );
    return res.data.data as CatalogosMapa;
  },

  /**
   * GET /api/v1/publico/mapa/filtrar
   * Proyectos con pines + emblemáticos + prácticas
   * según los filtros activos.
   */
  mapaFiltrar: async (filtros: {
    provincia_id?: string;
    canton_id?:    string;
    actor_id?:     string;
    search?:       string;
  }): Promise<ResultadosFiltro> => {
    const params = Object.fromEntries(
      Object.entries(filtros).filter(
        ([, v]) => v !== '' && v !== undefined && v !== null
      )
    );
    const res = await portalClient.get(
      '/publico/mapa/filtrar',
      { params }
    );
    return res.data.data as ResultadosFiltro;
  },

  /**
   * GET /api/v1/publico/conteos
   * Solo números para mostrar en estado inicial.
   */
  conteos: async (): Promise<ConteosPortal> => {
    const res = await portalClient.get(
      '/publico/conteos'
    );
    return res.data.data as ConteosPortal;
  },

  /**
   * GET /api/v1/publico/estadisticas
   * KPIs y distribuciones para los charts.
   */
  estadisticas: async (): Promise<EstadisticasPortal> => {
    const res = await portalClient.get(
      '/publico/estadisticas'
    );
    return res.data.data as EstadisticasPortal;
  },

  /**
   * GET /api/v1/publico/proyectos/:id
   * Detalle completo para el Drawer del mapa.
   */
  detalleProyecto: async (
    id: string
  ): Promise<DetalleProyectoPortal> => {
    const res = await portalClient.get(
      `/publico/proyectos/${id}`
    );
    return res.data.data as DetalleProyectoPortal;
  },

  /**
   * GET /api/v1/publico/emblematicos
   * Cards de emblemáticos públicos.
   */
  emblematicos: async (
    page: number = 1
  ): Promise<{
    data: EmblematicoPortal[];
    meta: { total: number; last_page: number };
  }> => {
    const res = await portalClient.get(
      '/publico/emblematicos',
      { params: { page, per_page: 12 } }
    );
    return res.data;
  },

  /**
   * GET /api/v1/publico/buenas-practicas
   */
  buenasPracticas: async (
    page: number = 1
  ): Promise<{
    data: BuenaPracticaPortal[];
    meta: { total: number; last_page: number };
  }> => {
    const res = await portalClient.get(
      '/publico/buenas-practicas',
      { params: { page, per_page: 9 } }
    );
    return res.data;
  },

  /**
   * GET /api/v1/publico/comparar
   * Estadísticas comparativas de 2 o 3 provincias.
   */
  compararProvincias: async (
    provinciaIds: string[]
  ): Promise<EstadisticasProvincia[]> => {
    // Construir query string con array
    const params = new URLSearchParams();
    provinciaIds.forEach((id) =>
      params.append('provincia_ids[]', id)
    );
    const res = await portalClient.get(
      `/publico/comparar?${params.toString()}`
    );
    return res.data.data as EstadisticasProvincia[];
  },
};
