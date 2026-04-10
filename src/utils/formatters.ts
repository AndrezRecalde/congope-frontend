import dayjs from 'dayjs';
import 'dayjs/locale/es';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

// Activar locale español y plugins de dayjs
dayjs.locale('es');
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

/**
 * Formatea cualquier fecha al formato DD/MM/YYYY.
 * Maneja los distintos formatos que devuelve el backend:
 *   "DD/MM/YYYY HH:mm", "YYYY-MM-DD", ISO 8601 completo
 */
export const formatFecha = (
  fecha: string | null | undefined,
  formato = 'DD/MM/YYYY'
): string => {
  if (!fecha) return '—';
  return dayjs(fecha).format(formato);
};

export const formatFechaHora = (
  fecha: string | null | undefined
): string => {
  if (!fecha) return '—';
  return dayjs(fecha).format('DD/MM/YYYY HH:mm');
};

export const formatFechaRelativa = (
  fecha: string | null | undefined
): string => {
  if (!fecha) return '—';
  return dayjs(fecha).fromNow();
};

/**
 * Formatea un monto monetario.
 * NOTA: el campo monto_total de Proyecto viene como string
 * desde el backend. Parsear antes de formatear.
 */
export const formatMoneda = (
  monto: number | string | null | undefined,
  moneda = 'USD'
): string => {
  if (monto === null || monto === undefined) return '—';
  const valor = typeof monto === 'string'
    ? parseFloat(monto)
    : monto;
  if (isNaN(valor)) return '—';
  return new Intl.NumberFormat('es-EC', {
    style:                 'currency',
    currency:              moneda,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor);
};

export const formatBytes = (
  bytes: number | null | undefined
): string => {
  if (!bytes) return '—';
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatPorcentaje = (
  valor: number | null | undefined
): string => {
  if (valor === null || valor === undefined) return '—';
  return `${valor}%`;
};

/** Trunca texto largo con elipsis */
export const truncar = (
  texto: string,
  maxLength = 80
): string => {
  if (texto.length <= maxLength) return texto;
  return `${texto.substring(0, maxLength)}...`;
};
