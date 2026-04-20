'use client'

import { useState, useCallback, useRef } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectToken } from '@/store/slices/authSlice';

export type TipoPreview = 'imagen' | 'pdf' | 'none';

export interface EstadoPreview {
  cargando:   boolean;
  blobUrl:    string | null;
  error:      string | null;
  tipo:       TipoPreview;
}

/**
 * Detecta si un mime_type soporta previsualización
 * nativa en el navegador.
 */
export function getTipoPreview(
  mimeType: string
): TipoPreview {
  if (!mimeType) return 'none';

  const mime = mimeType.toLowerCase().trim();

  if (
    mime.startsWith('image/jpeg') ||
    mime.startsWith('image/jpg')  ||
    mime.startsWith('image/png')  ||
    mime.startsWith('image/gif')  ||
    mime.startsWith('image/webp') ||
    mime.startsWith('image/svg')  ||
    mime === 'image/bmp'
  ) {
    return 'imagen';
  }

  if (mime === 'application/pdf') {
    return 'pdf';
  }

  return 'none';
}

/**
 * Hook que gestiona la previsualización de
 * un documento. Descarga el archivo con el token
 * y crea una URL temporal para el visor.
 */
export function useDocumentoPreview() {
  const token = useAppSelector(selectToken);

  const [estado, setEstado] = useState<EstadoPreview>({
    cargando: false,
    blobUrl:  null,
    error:    null,
    tipo:     'none',
  });

  // Guardar la blobUrl para revocarla al cerrar
  const blobUrlRef = useRef<string | null>(null);

  /**
   * Carga el documento desde url_descarga usando
   * el token de autenticación y genera una
   * URL temporal para el visor.
   */
  const cargarPreview = useCallback(async (
    urlDescarga: string,
    mimeType:    string
  ) => {
    const tipo = getTipoPreview(mimeType);

    // Si el tipo no es soportado, no cargar
    if (tipo === 'none') {
      setEstado({
        cargando: false,
        blobUrl:  null,
        error:    'Este tipo de archivo no tiene ' +
                  'previsualización disponible.',
        tipo:     'none',
      });
      return;
    }

    // Limpiar previsualización anterior
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    setEstado({
      cargando: true,
      blobUrl:  null,
      error:    null,
      tipo,
    });

    try {
      // Fetch con el token de autenticación
      const response = await fetch(urlDescarga, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept:        '*/*',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Error al cargar el archivo (${response.status})`
        );
      }

      const blob    = await response.blob();
      // Forzar el mime_type correcto para que el
      // navegador lo interprete bien
      const tipado  = new Blob([blob], {
        type: mimeType,
      });
      const blobUrl = URL.createObjectURL(tipado);

      blobUrlRef.current = blobUrl;

      setEstado({
        cargando: false,
        blobUrl,
        error:    null,
        tipo,
      });
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : 'Error desconocido al cargar el archivo';

      setEstado({
        cargando: false,
        blobUrl:  null,
        error:    mensaje,
        tipo:     'none',
      });
    }
  }, [token]);

  /**
   * Limpia la URL temporal al cerrar el modal.
   * Llamar siempre al cerrar para liberar memoria.
   */
  const limpiarPreview = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setEstado({
      cargando: false,
      blobUrl:  null,
      error:    null,
      tipo:     'none',
    });
  }, []);

  return { estado, cargarPreview, limpiarPreview };
}
