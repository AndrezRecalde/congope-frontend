export interface NodoGrafo {
  id: string;
  tipo: "actor" | "provincia";
  nombre: string;
  subtipo: string;
  valor: number;
  monto: number;
  extra: {
    pais_origen?: string;
    estado?: string;
    codigo?: string;
    capital?: string;
  };
}

export interface AristaGrafo {
  id: string;
  source: string;
  target: string;
  peso: number;
  proyectos: number;
  nombres_proyectos: string[];
}

export interface MetaGrafo {
  total_nodos: number;
  total_aristas: number;
  total_actores: number;
  total_provincias: number;
  total_proyectos: number;
  monto_total: number;
  monto_formateado: string;
  max_grado: number;
  max_monto: number;
  // Campos de autorización
  vista_global: boolean;
  provincias_usuario: string[];
  solo_mi_provincia: boolean;
}

export interface DatosGrafo {
  nodos: NodoGrafo[];
  aristas: AristaGrafo[];
  meta: MetaGrafo;
}

export interface FiltrosGrafo {
  estado: string;
  tipo_actor: string;
  min_proyectos: string;
  solo_mi_provincia: string; // "true" | "false"
}

// Colores por tipo de actor
export const COLOR_TIPO_ACTOR: Record<string, string> = {
  Multilateral: "#1E4D8C",
  Bilateral: "#2E6DA4",
  ONG: "#10B981",
  Privado: "#F59E0B",
  Academia: "#8B5CF6",
  Gobierno: "#EF4444",
  Internacional: "#0EA5E9",
};

export const COLOR_PROVINCIA = "#C9A84C";
export const COLOR_DEFAULT = "#6B7280";
