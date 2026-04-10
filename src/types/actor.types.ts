import type {
  ActorCooperacion,
  TipoActor,
  EstadoActor,
} from '@/services/axios';

// Re-exportar para que los componentes del módulo
// importen desde un solo lugar
export type { ActorCooperacion, TipoActor, EstadoActor };

// Filtros de la tabla
export interface ActorFiltros {
  search?:  string;
  tipo?:    TipoActor | '';
  estado?:  EstadoActor | '';
  page?:    number;
}

// Valores iniciales del formulario
export interface ActorFormValues {
  nombre:            string;
  tipo:              TipoActor | '';
  pais_origen:       string;
  estado:            EstadoActor;
  contacto_nombre:   string;
  contacto_email:    string;
  contacto_telefono: string;
  sitio_web:         string;
  notas:             string;
  areas_tematicas:   string[];
}
