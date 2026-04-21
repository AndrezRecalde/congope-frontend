import type {
  DocumentoItem,
  CategoriaDocumento,
  EntidadDocumento,
} from '@/services/axios';

export type {
  DocumentoItem,
  CategoriaDocumento,
  EntidadDocumento,
};

export interface VersionDocumento {
  id:                 string;
  titulo:             string;
  categoria:          string;
  nombre_archivo:     string;
  mime_type:          string;
  tamano_bytes:       number;
  tamano_legible:     string;
  es_publico:         boolean;
  fecha_vencimiento:  string | null;
  provincia_id:       string | null;
  version:            number;
  version_activa:     boolean;
  documento_padre_id: string | null;
  dias_para_vencer:   number | null;
  vencido:            boolean;
  url_descarga:       string;
  created_at:         string;
}

export interface VersionesResponse {
  data: VersionDocumento[];
  meta: {
    total:               number;
    version_actual:      number;
    documento_padre_id:  string;
  };
}

export interface DocumentoFiltro {
  entidad_tipo: EntidadDocumento | '';
  entidad_id:   string;
}

export interface SubirDocumentoValues {
  titulo:            string;
  categoria:         CategoriaDocumento | '';
  es_publico:        boolean;
  fecha_vencimiento: string;
  provincia_id:      string;
  archivo:           File | null;
}

export interface EditarDocumentoValues {
  titulo:            string;
  categoria:         CategoriaDocumento | '';
  es_publico:        boolean;
  fecha_vencimiento: string;
  provincia_id:      string;
}

// Colores de badge por categoría
export const COLOR_CATEGORIA: Record<
  CategoriaDocumento, string
> = {
  Convenio:      'blue',
  Informe:       'violet',
  Acta:          'teal',
  Anexo:         'gray',
  Normativa:     'red',
  Comunicación:  'orange',
  Fotografía:    'pink',
};

// Determina el ícono a mostrar según mime_type
export type TipoArchivoIcono =
  | 'pdf'
  | 'imagen'
  | 'excel'
  | 'word'
  | 'generico';

export function getTipoArchivo(
  mimeType: string
): TipoArchivoIcono {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/'))  return 'imagen';
  if (mimeType.includes('spreadsheet') ||
      mimeType.includes('excel') ||
      mimeType.includes('csv'))       return 'excel';
  if (mimeType.includes('word') ||
      mimeType.includes('document'))  return 'word';
  return 'generico';
}
