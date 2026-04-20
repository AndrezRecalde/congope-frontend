export interface ProvinciaAdmin {
  id:      string;
  nombre:  string;
  codigo:  string;   // código INEC — NO editable
  capital: string;
}

export interface CantonAdmin {
  id:           string;
  provincia_id: string;
  codigo:       string;   // código INEC — NO editable
  nombre:       string;
  provincia: {
    id:      string;
    nombre:  string;
    codigo:  string;
    capital: string;
  } | null;
  creado_el:      string;  // ISO 8601
  actualizado_el: string;  // ISO 8601
}

export interface ProvinciaEditForm {
  nombre:  string;
  capital: string;
}

export interface CantonEditForm {
  nombre: string;
}
