
// Filtros activos en el mapa
export interface MapaFiltros {
  estado?:      string;
  ods_id?:      number | null;
  actor_id?:    string;
  provincia_id?: string;
}

// Datos de una provincia para el mapa
// (join entre GeoJSON y datos de la API)
export interface ProvinciaMapaData {
  id:              string;   // UUID de la API
  nombre:          string;
  codigo:          string;   // código INEC 2 dígitos
  proyectos_count: number;
  monto_total:     number;
  monto_formateado:string;
  estados: {
    en_gestion:   number;
    en_ejecucion: number;
    finalizado:   number;
    suspendido:   number;
  };
}

// Pin de proyecto en el mapa
export interface ProyectoPin {
  id:              string;
  codigo:          string;
  nombre:          string;
  estado:          string;
  color_marcador:  string;
  coordenadas:     { lat: number; lng: number };
  ubicacion_nombre: string;
}

// Colores de pines por estado
export const COLOR_PIN_ESTADO: Record<string, string> = {
  'En gestión':   '#F59E0B',
  'En ejecución': '#3B82F6',
  'Finalizado':   '#10B981',
  'Suspendido':   '#EF4444',
};

// Intensidad de color del polígono provincial
// según cantidad de proyectos (escala azul CONGOPE)
export function getColorPoligono(
  count: number,
  maxCount: number
): string {
  if (count === 0) return '#E5E7EB';  // gris suave
  const intensidad = Math.min(count / Math.max(maxCount, 1), 1);
  // Interpolación entre azul muy suave y azul primario
  if (intensidad < 0.25) return '#DBEAFE';  // congope-1
  if (intensidad < 0.50) return '#93C5FD';  // congope-3
  if (intensidad < 0.75) return '#2E6DA4';  // congope-6
  return '#1A3A5C';                          // congope-8
}
