// Colores por tipo de evento para FullCalendar
export const COLORES_EVENTO: Record<string, string> = {
  'Misión técnica':    '#1c7ed6',
  'Reunión bilateral': '#2f9e44',
  'Conferencia':       '#7048e8',
  'Visita de campo':   '#e67700',
  'Virtual':           '#0ca678',
  'Otro':              '#868e96',
};

export const getColorEvento = (tipo: string): string =>
  COLORES_EVENTO[tipo] ?? '#868e96';
