export interface OdsHeatmap {
  id:       number;
  numero:   number;
  nombre:   string;
  color_hex:string;
}

export interface ProvinciaHeatmap {
  id:     string;
  nombre: string;
  codigo: string;
}

export interface CeldaHeatmap {
  ods_id:       number;
  provincia_id: string;
  total:        number;
}

export interface DatosHeatmap {
  ods:        OdsHeatmap[];
  provincias: ProvinciaHeatmap[];
  matriz:     CeldaHeatmap[];
  max_valor:  number;
}
