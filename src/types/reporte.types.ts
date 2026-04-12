export type TipoReporte =
  | 'provincia'
  | 'ods'
  | 'cooperante'
  | 'anual'
  | 'global';

export interface ReporteConfig {
  id:          TipoReporte;
  titulo:      string;
  descripcion: string;
  icono:       string;       // nombre del ícono Tabler
  color:       string;       // color Mantine
  permiso:     string;       // permiso requerido
  parametros:  ReporteParametro[];
}

export interface ReporteParametro {
  campo:        string;      // nombre del campo en el body
  label:        string;
  tipo:         'provincia' | 'ods' | 'actor' | 'anio';
  requerido:    boolean;
  descripcion?: string;
}

// Estado de generación de cada reporte
export interface ReporteEstado {
  generando:   boolean;
  error:       string | null;
  ultimaDescarga: string | null; // fecha/hora
}
