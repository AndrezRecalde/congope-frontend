import apiClient, {
  extractData,
  type DocumentoItem,
  type CategoriaDocumento,
  type EntidadDocumento,
  descargarBlob,
} from './axios';

export interface SubirDocumentoDto {
  entidad_tipo:       EntidadDocumento;
  entidad_id:         string;
  titulo:             string;
  categoria:          CategoriaDocumento;
  archivo:            File;
  es_publico?:        boolean;
  fecha_vencimiento?: string | null;
  provincia_id?:      string | null;
}

export interface EditarDocumentoDto {
  titulo?:            string;
  categoria?:         CategoriaDocumento;
  es_publico?:        boolean;
  fecha_vencimiento?: string | null;
  provincia_id?:      string | null;
}

export const documentosService = {
  /**
   * GET /api/v1/documentos
   *
   * CRÍTICO: Este endpoint usa REQUEST BODY en un GET.
   * Axios lo soporta con la opción "data".
   * El OpenAPI documenta 500 — manejar con try/catch.
   */
  listar: async (
    entidad_tipo: EntidadDocumento,
    entidad_id:   string
  ): Promise<DocumentoItem[]> => {
    const res = await apiClient.post('/documentos/buscar', {
      entidad_tipo,
      entidad_id,
    });
    // El backend puede retornar 500 — el try/catch
    // está en el query para manejarlo con gracia
    return (res.data as { data: DocumentoItem[] }).data;
  },

  /**
   * GET /api/v1/documentos/{id}
   */
  obtener: async (id: string): Promise<DocumentoItem> => {
    const res = await apiClient.get(`/documentos/${id}`);
    return extractData<DocumentoItem>(res);
  },

  /**
   * POST /api/v1/documentos
   * Content-Type: multipart/form-data
   * El archivo se envía como objeto File en FormData.
   * Axios detecta FormData y setea el Content-Type
   * con el boundary correcto automáticamente.
   */
  subir: async (
    dto: SubirDocumentoDto
  ): Promise<DocumentoItem> => {
    const formData = new FormData();
    formData.append('entidad_tipo', dto.entidad_tipo);
    formData.append('entidad_id',   dto.entidad_id);
    formData.append('titulo',       dto.titulo);
    formData.append('categoria',    dto.categoria);
    formData.append('archivo',      dto.archivo);

    if (dto.es_publico !== undefined) {
      // FormData requiere string — convertir boolean
      formData.append(
        'es_publico',
        dto.es_publico ? '1' : '0'
      );
    }
    if (dto.fecha_vencimiento) {
      formData.append(
        'fecha_vencimiento',
        dto.fecha_vencimiento
      );
    }
    if (dto.provincia_id) {
      formData.append('provincia_id', dto.provincia_id);
    }

    // NO setear Content-Type manualmente.
    // Axios lo hace automáticamente con FormData
    // incluyendo el boundary correcto.
    const res = await apiClient.post(
      '/documentos',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return extractData<DocumentoItem>(res);
  },

  /**
   * PUT /api/v1/documentos/{id}
   * Solo metadatos — NO reemplaza el archivo.
   * Body: application/json (no multipart)
   */
  editar: async (
    id:  string,
    dto: EditarDocumentoDto
  ): Promise<DocumentoItem> => {
    // Limpiar campos undefined para no enviarlos
    const body = Object.fromEntries(
      Object.entries(dto).filter(
        ([, v]) => v !== undefined
      )
    );
    const res = await apiClient.put(
      `/documentos/${id}`,
      body
    );
    return extractData<DocumentoItem>(res);
  },

  /**
   * DELETE /api/v1/documentos/{id}
   */
  eliminar: async (id: string): Promise<void> => {
    await apiClient.delete(`/documentos/${id}`);
  },

  /**
   * GET /api/v1/documentos/{id}/descargar
   * Descarga el archivo binario.
   * url_descarga viene directamente en la respuesta
   * del documento — usar esa URL directamente
   * en lugar de llamar a este endpoint desde Axios.
   */
  descargar: async (
    documento: DocumentoItem
  ): Promise<void> => {
    // Las URL estáticas no envían encabezados Auth, debemos usar XHR a través del helper
    await descargarBlob(
      `/documentos/${documento.id}/descargar`,
      undefined,
      documento.nombre_archivo
    );
  },

  /**
   * PATCH /api/v1/documentos/{id}/publicar
   * Manda el estado booleano para publicar o despublicar.
   */
  publicar: async (id: string, es_publico: boolean): Promise<DocumentoItem> => {
    const res = await apiClient.patch(
      `/documentos/${id}/publicar`,
      { es_publico }
    );
    return extractData<DocumentoItem>(res);
  },
};
