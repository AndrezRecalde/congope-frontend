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
