// Roles disponibles en el sistema
export type RolSistema =
  | 'super_admin'
  | 'admin_provincial'
  | 'editor'
  | 'visualizador'
  | 'publico';

// Etiquetas amigables para cada rol
export const LABEL_ROL: Record<RolSistema, string> = {
  super_admin:       'Super Administrador',
  admin_provincial:  'Administrador Provincial',
  editor:            'Editor',
  visualizador:      'Visualizador',
  publico:           'Público',
};

// Colores de badge por rol
export const COLOR_ROL: Record<RolSistema, string> = {
  super_admin:       'red',
  admin_provincial:  'blue',
  editor:            'teal',
  visualizador:      'gray',
  publico:           'orange',
};

// Usuario en el LISTADO (roles como objetos completos)
export interface UsuarioListado {
  id:                number;   // INTEGER
  name:              string;
  email:             string;
  email_verified_at: string | null;
  created_at:        string;   // ISO 8601
  updated_at:        string;   // ISO 8601
  roles:             RolObj[]; // objetos con id y name
  provincias:        ProvinciaBasica[];
}

export interface RolObj {
  id:         number;
  name:       RolSistema;
  guard_name: string;
}

export interface ProvinciaBasica {
  id:     string;  // UUID
  nombre: string;
}

// Usuario en el DETALLE (roles como string[])
export interface UsuarioDetalle {
  id:                number;
  name:              string;
  email:             string;
  two_factor_enabled:null;
  roles:             string[];      // solo nombres
  provincias:        ProvinciaBasica[];
  created_at:        string;        // "DD/MM/YYYY"
  email_verified_at: string | null;
}

// Registro de auditoría
export interface RegistroAuditoria {
  id:                 string;    // UUID
  user_id:            number;
  accion:             string;    // "crear"|"editar"|...
  modelo_tipo:        string;    // "App\Models\Proyecto"
  modelo_id:          string;
  valores_anteriores: Record<string, unknown> | null;
  valores_nuevos:     Record<string, unknown> | null;
  ip_address:         string;
  user_agent:         string;
  created_at:         string;    // "YYYY-MM-DD HH:mm:ss"
  usuario: {
    id:    number;
    name:  string;
    email: string;
  };
}

// Extrae el nombre del modelo desde el namespace PHP
// "App\\Models\\Proyecto" → "Proyecto"
export function getNombreModelo(modeloTipo: string): string {
  const partes = modeloTipo.split('\\');
  return partes[partes.length - 1] ?? modeloTipo;
}

// Colores de badge por acción de auditoría
export const COLOR_ACCION: Record<string, string> = {
  crear:     'green',
  editar:    'blue',
  eliminar:  'red',
  publicar:  'teal',
  restaurar: 'orange',
};

export interface UsuarioFormValues {
  name:         string;
  email:        string;
  password:     string;
  rol:          RolSistema | '';
  provincia_ids:string[];
}

export interface EditarUsuarioValues {
  name:     string;
  email:    string;
  password: string;
}
