/**
 * CONGOPE — Cliente HTTP tipado
 * Generado a partir de openapi.yaml v1.0.0
 * Base URL: http://congope.test
 * Auth: Bearer token (header Authorization)
 *
 * IMPORTANTE: Si un endpoint se comporta diferente a lo
 * documentado aquí, consultar al desarrollador antes de
 * modificar este archivo.
 */

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { env } from '@/lib/env';

// ─────────────────────────────────────────────────────────
// TIPOS BASE — extraídos del OpenAPI
// ─────────────────────────────────────────────────────────

/** Respuesta estándar simple */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

/** Respuesta paginada */
export interface PaginatedResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ─────────────────────────────────────────────────────────
// TIPOS DEL DOMINIO — basados en ejemplos del OpenAPI
// ─────────────────────────────────────────────────────────

// AUTH
// NOTA: Usuario.id es INTEGER según el OpenAPI (no UUID)
export interface Usuario {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  roles: string[];
  permissions: string[];
  provincias: Array<{ id: string; nombre: string }>;
  created_at: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Usuario;
}

export type Rol =
  | 'super_admin'
  | 'admin_provincial'
  | 'editor'
  | 'visualizador'
  | 'publico';

// ACTORES DE COOPERACIÓN
// NOTA: areas_tematicas es string[] directamente (no array de objetos)
export interface ActorCooperacion {
  id: string;           // UUID
  nombre: string;
  tipo: TipoActor;
  pais_origen: string;
  estado: EstadoActor;
  contacto_nombre: string | null;
  contacto_email: string | null;
  contacto_telefono: string | null;
  sitio_web: string | null;
  notas?: string | null;
  areas_tematicas: string[]; // ← array de strings, NO objetos
  proyectos_count?: number;
  created_at: string;        // formato: "DD/MM/YYYY HH:mm"
}

export type TipoActor =
  | 'ONG'
  | 'Multilateral'
  | 'Embajada'
  | 'Bilateral'
  | 'Privado'
  | 'Academia';

export type EstadoActor = 'Activo' | 'Inactivo' | 'Potencial';

export interface CreateActorDto {
  nombre: string;
  tipo: TipoActor;
  pais_origen: string;
  estado?: EstadoActor;
  contacto_nombre?: string | null;
  contacto_email?: string | null;
  contacto_telefono?: string | null;
  sitio_web?: string | null;
  notas?: string | null;
  areas_tematicas?: string[];
}

export type UpdateActorDto = Partial<CreateActorDto>;

// PROYECTOS
// NOTA: Campos adicionales revelados en el OpenAPI:
//   descripcion, color_marcador, monto_formateado,
//   flujo_direccion, modalidad_cooperacion,
//   cantones, parroquias, ubicaciones
export interface Proyecto {
  id: string;              // UUID
  codigo: string;
  nombre: string;
  descripcion: string | null;
  estado: EstadoProyecto;
  color_marcador: string;  // ej: "#10B981" — calculado por backend
  monto_total: string;     // ej: "2500000.50" — viene como string
  monto_formateado: string;// ej: "2,500,000.50 USD" — ya formateado
  moneda: string;
  fecha_inicio: string | null;          // formato: "YYYY-MM-DD"
  fecha_fin_planificada: string | null; // formato: "YYYY-MM-DD"
  fecha_fin_real: string | null;
  sector_tematico: string | null;
  flujo_direccion: FlujoDireccion | null;
  modalidad_cooperacion: ModalidadCooperacion[];
  actor: ActorResumen | null;
  provincias: ProvinciaProyecto[];
  cantones: CantomResumen[];
  parroquias: ParroquiaResumen[];
  ubicaciones: UbicacionProyecto[];
  ods: OdsResumen[];
  hitos?: HitoProyecto[];
  hitos_count?: number;
  created_at: string;      // formato: "DD/MM/YYYY HH:mm"
}

export type EstadoProyecto =
  | 'En gestión'
  | 'En ejecución'
  | 'Finalizado'
  | 'Suspendido';

export type FlujoDireccion =
  | 'Norte-Sur'
  | 'Sur-Sur'
  | 'Triangular'
  | 'Interna'
  | 'Descentralizada';

export type ModalidadCooperacion =
  | 'Técnica'
  | 'Financiera No Reembolsable'
  | 'Financiera Reembolsable'
  | 'En Especies';

export interface ActorResumen {
  id: string;
  nombre: string;
  tipo: TipoActor;
  pais_origen: string;
  estado: EstadoActor;
  contacto_nombre: string | null;
  contacto_email: string | null;
  contacto_telefono: string | null;
  sitio_web: string | null;
  created_at: string;
}

export interface ProvinciaProyecto {
  id: string;
  nombre: string;
  rol: 'Líder' | 'Co-ejecutora' | 'Beneficiaria';
  porcentaje_avance: number | null;
  beneficiarios_directos: number | null;
  beneficiarios_indirectos: number | null;
}

export interface CantomResumen {
  id: string;
  nombre: string;
}

export interface ParroquiaResumen {
  id: string;
  nombre: string;
}

export interface UbicacionProyecto {
  id: string;
  nombre: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
}

export interface OdsResumen {
  id: number;
  numero: number;
  nombre: string;
  color_hex?: string;
}

export interface CreateProyectoDto {
  nombre: string;
  actor_id: string;
  codigo?: string | null;
  descripcion?: string | null;
  estado?: EstadoProyecto;
  monto_total?: number;
  moneda?: string;
  sector_tematico?: string;
  flujo_direccion?: FlujoDireccion | null;
  modalidad_cooperacion?: ModalidadCooperacion[];
  fecha_inicio?: string;
  fecha_fin_planificada?: string;
  fecha_fin_real?: string | null;
  provincias?: Array<{
    id: string;
    rol?: 'Líder' | 'Co-ejecutora' | 'Beneficiaria' | null;
    porcentaje_avance?: number | null;
    beneficiarios_directos?: number | null;
    beneficiarios_indirectos?: number | null;
  }>;
  canton_ids?: string[];
  parroquia_ids?: string[];
  ubicaciones?: Array<{
    nombre?: string | null;
    lat: number;
    lng: number;
  }>;
  ods_ids?: number[];
}

export type UpdateProyectoDto = Partial<CreateProyectoDto>;

// HITOS
// NOTA: fechas en ISO 8601 completo (formato diferente a otros endpoints)
export interface HitoProyecto {
  id: string;
  proyecto_id: string;
  titulo: string;
  descripcion: string | null;
  fecha_limite: string;    // ISO: "2026-06-15T00:00:00.000000Z"
  completado: boolean;
  completado_en: string | null;
  created_at: string;      // ISO completo
  updated_at: string;
}

export interface CreateHitoDto {
  titulo: string;
  fecha_limite: string;
  descripcion?: string | null;
  completado?: boolean;
}

export type UpdateHitoDto = Partial<CreateHitoDto>;

// BUENAS PRÁCTICAS
export interface BuenaPractica {
  id: string;
  titulo: string;
  descripcion_problema: string;
  metodologia: string;
  resultados: string;
  replicabilidad: 'Alta' | 'Media' | 'Baja';
  calificacion_promedio: string; // viene como string decimal
  es_destacada: boolean;
  provincia: { id: string; nombre: string } | null;
  proyecto: { id: string; codigo: string; nombre: string } | null;
  registrado_por: {
    id: number; name: string; email: string;
  } | null;
  mi_valoracion: ValoracionPractica | null;
  valoraciones_count?: number;
  created_at: string;
}

export interface ValoracionPractica {
  id?: string;
  puntuacion: number;
  comentario: string | null;
}

// REDES
// NOTA: actor dentro de miembros tiene "pais" no "pais_origen"
export interface Red {
  id: string;
  nombre: string;
  tipo: TipoRed;
  objetivo: string | null;
  rol_congope: 'Miembro' | 'Coordinador' | 'Observador';
  fecha_adhesion: string | null;  // formato: "DD/MM/YYYY"
  miembros: MiembroRed[];
  miembros_count?: number;
  documentos?: DocumentoItem[];
  created_at: string;             // formato: "DD/MM/YYYY"
}

export type TipoRed = 'Regional' | 'Nacional' | 'Internacional' | 'Temática';

export interface MiembroRed {
  id: string;
  actor: {
    id: string;
    nombre: string;
    tipo: TipoActor;
    pais: string;  // ← "pais" no "pais_origen" en este contexto
  };
  rol_miembro: string | null;
  fecha_ingreso: string | null;  // formato: "DD/MM/YYYY"
}

// PROYECTOS EMBLEMÁTICOS
export interface ProyectoEmblematico {
  id: string;
  titulo: string;
  descripcion_impacto: string;
  periodo: string | null;
  es_publico: boolean;
  provincia: { id: string; nombre: string } | null;
  proyecto: { id: string; codigo: string; nombre: string } | null;
  reconocimientos: Reconocimiento[];
  reconocimientos_count?: number;
  created_at: string;
}

export interface Reconocimiento {
  id: string;
  titulo: string;
  organismo_otorgante: string;
  ambito: 'Nacional' | 'Internacional';
  anio: number;
  descripcion: string | null;
  created_at: string;
}

// DOCUMENTOS
// NOTA: categoria incluye "Fotografía" que no estaba en el contrato anterior
// NOTA: GET usa request body, no query params
export type CategoriaDocumento =
  | 'Convenio'
  | 'Informe'
  | 'Acta'
  | 'Anexo'
  | 'Normativa'
  | 'Comunicación'
  | 'Fotografía';

export type EntidadDocumento = 'proyecto' | 'actor' | 'red' | 'evento';

export interface DocumentoItem {
  id: string;
  titulo: string;
  categoria: CategoriaDocumento;
  nombre_archivo: string;
  mime_type: string;
  tamano_bytes: number;
  tamano_legible: string;
  es_publico: boolean;
  fecha_vencimiento: string | null;  // formato: "YYYY-MM-DD"
  provincia_id: string | null;
  version: number;
  dias_para_vencer: number | null;
  vencido: boolean;
  url_descarga: string;
  created_at: string;               // formato: "DD/MM/YYYY HH:mm"
}

// EVENTOS
export interface Evento {
  id: string;
  titulo: string;
  tipo_evento: TipoEvento;
  fecha_evento: string;   // formato: "DD/MM/YYYY"
  lugar: string | null;
  es_virtual: boolean;
  url_virtual: string | null;
  descripcion: string | null;
  creado_por: { id: number; name: string; email: string } | null;
  participantes_count?: number;
  compromisos_count?: number;
  created_at: string;
}

export type TipoEvento =
  | 'Misión técnica'
  | 'Reunión bilateral'
  | 'Conferencia'
  | 'Visita de campo'
  | 'Virtual'
  | 'Otro';

export interface CompromisoEvento {
  id: string;
  descripcion: string;
  fecha_limite: string;          // formato: "DD/MM/YYYY"
  resuelto: boolean;
  resuelto_en: string | null;
  // NOTA: responsable.id es INTEGER (usuario)
  responsable: { id: number; name: string; email: string } | null;
  evento?: { id: string; titulo: string; tipo_evento: string; fecha_evento: string };
  dias_restantes: number;
  vencido: boolean;
  created_at: string;
}

// CATÁLOGOS
export interface Provincia {
  id: string;              // UUID
  nombre: string;
  codigo: string;
  capital: string;
}

export interface Canton {
  id: string;
  nombre: string;
  codigo: string;
  provincia_id: string;
}

export interface Parroquia {
  id: string;
  nombre: string;
  codigo: string;
  canton_id: string;
}

export interface Ods {
  id: number;              // INTEGER (1-17, es el número del ODS)
  numero: number;
  nombre: string;
  descripcion: string | null;
  color_hex: string;
  icono_url: string | null;
}

// USUARIOS (administración)
// NOTA: Usuario admin tiene estructura diferente a Usuario autenticado
export interface UsuarioAdmin {
  id: number;              // INTEGER
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: Array<{
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    pivot: { model_type: string; model_id: number; role_id: number };
  }>;
  provincias: Array<{ id: string; nombre: string }>;
}

// AUDITORÍA
export interface RegistroAuditoria {
  id: string;
  user_id: number;
  accion: 'crear' | 'editar' | 'eliminar' | 'exportar' | 'login' | 'logout' | 'restaurar';
  modelo_tipo: string;    // ej: "App\\Models\\Proyecto"
  modelo_id: string;
  valores_anteriores: Record<string, unknown> | null;
  valores_nuevos: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;     // formato: "YYYY-MM-DD HH:mm:ss"
  usuario: { id: number; name: string; email: string };
}

// ─────────────────────────────────────────────────────────
// INSTANCIA AXIOS CONFIGURADA
// ─────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

// Request interceptor — inyectar Bearer token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('congope_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — manejo global de errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('congope_token');
        document.cookie =
          'congope_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

/** Extrae el campo data de la respuesta estándar del backend */
export function extractData<T>(response: AxiosResponse): T {
  return (response.data as ApiResponse<T>).data;
}

/** Extrae errores de validación de la respuesta de error */
export function extractErrors(
  error: unknown
): Record<string, string[]> {
  if (axios.isAxiosError(error) && error.response?.data?.errors) {
    return error.response.data.errors as Record<string, string[]>;
  }
  return {};
}

/** Extrae el mensaje de error legible para el usuario */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse | undefined;
    
    // Si es un 422 y hay errores de validación, concatenarlos para depuración real
    if (error.response?.status === 422 && data?.errors) {
      const fieldErrors = Object.entries(data.errors)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join(' | ');
      return `${data?.message ?? 'Error de validación'} -> Detalles: ${fieldErrors}`;
    }

    return (
      data?.message ??
      error.message ??
      'Error de conexión con el servidor'
    );
  }
  if (error instanceof Error) return error.message;
  return 'Ha ocurrido un error inesperado';
}

/**
 * Descarga un archivo binario desde el backend.
 * Usado para reportes y exportaciones.
 *
 * IMPORTANTE: Los reportes aceptan parámetros en el REQUEST BODY
 * del GET request (comportamiento no estándar del backend CONGOPE).
 */
export async function descargarBlob(
  url: string,
  data?: Record<string, unknown>,
  filename?: string
): Promise<void> {
  const config: AxiosRequestConfig = {
    responseType: 'blob',
    ...(data && { data }),  // body en GET para reportes
  };

  const response = await apiClient.get(url, config);

  // Intentar leer nombre del archivo desde Content-Disposition
  const disposition = response.headers['content-disposition'] as string | undefined;
  let nombreArchivo = filename ?? 'descarga';
  if (disposition) {
    const match = disposition.match(/filename="?([^";\n]+)"?/);
    if (match?.[1]) nombreArchivo = match[1];
  }

  // Crear enlace temporal y disparar descarga
  const blobUrl = window.URL.createObjectURL(
    new Blob([response.data as BlobPart])
  );
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}
