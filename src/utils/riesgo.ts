import dayjs from 'dayjs';

export type NivelRiesgo =
  | 'verde'
  | 'amarillo'
  | 'rojo'
  | 'gris';

export interface DatosRiesgo {
  estado:               string;
  fecha_fin_planificada:string | null;
  fecha_inicio?:        string | null;
  // Opcionales — solo disponibles en el detalle
  avance?: {
    hitos_total:      number;
    hitos_completados:number;
    porcentaje:       number | null;
  } | null;
}

export interface ResultadoRiesgo {
  nivel:      NivelRiesgo;
  color:      string;
  colorFondo: string;
  etiqueta:   string;
  descripcion:string;
  icono:      string; // nombre del ícono Tabler
}

/**
 * Calcula el nivel de riesgo de un proyecto.
 * Función pura — no hace llamadas a la API.
 * Usa solo los datos disponibles del proyecto.
 */
export function calcularRiesgo(
  datos: DatosRiesgo
): ResultadoRiesgo {
  const { estado, fecha_fin_planificada,
          fecha_inicio, avance } = datos;

  // ── Casos especiales por estado ──────────────

  if (estado === 'Finalizado') {
    return RESULTADOS.verde;
  }

  if (estado === 'Suspendido') {
    return RESULTADOS.gris;
  }

  if (!fecha_fin_planificada) {
    return RESULTADOS.gris;
  }

  const hoy        = dayjs();
  const fechaFin   = dayjs(fecha_fin_planificada);
  const fechaInicio = fecha_inicio
    ? dayjs(fecha_inicio)
    : null;

  // ── CRITERIO 1: Fecha de fin vencida ─────────
  // Si la fecha fin ya pasó y el proyecto no está
  // finalizado → ROJO (el caso más grave)
  if (fechaFin.isBefore(hoy, 'day')) {
    return {
      ...RESULTADOS.rojo,
      descripcion: `Fecha fin vencida el ${
        fechaFin.format('DD/MM/YYYY')
      } — proyecto sin finalizar`,
    };
  }

  // ── CRITERIO 2: Hitos vencidos ───────────────
  // Solo evaluable si hay datos de avance con hitos
  // Esta información viene del detalle del proyecto
  // no del listado.
  // En el listado usamos solo criterios de fechas.

  // ── CRITERIO 3: Tiempo transcurrido vs avance ─
  // Si tenemos fecha de inicio podemos calcular
  // el porcentaje de tiempo transcurrido
  let retrasoDetectado = false;

  if (fechaInicio && avance &&
      avance.hitos_total > 0) {
    const tiempoTotal = fechaFin.diff(
      fechaInicio, 'day'
    );
    const tiempoTranscurrido = hoy.diff(
      fechaInicio, 'day'
    );

    if (tiempoTotal > 0) {
      const porcentajeTiempo = Math.min(
        (tiempoTranscurrido / tiempoTotal) * 100,
        100
      );
      const porcentajeAvance =
        (avance.hitos_completados / avance.hitos_total)
        * 100;

      // Si el avance de hitos está más de 25 puntos
      // por detrás del tiempo transcurrido → ROJO
      if (porcentajeTiempo - porcentajeAvance > 25
          && porcentajeTiempo > 30) {
        return {
          ...RESULTADOS.rojo,
          descripcion:
            `Avance de hitos (${
              porcentajeAvance.toFixed(0)
            }%) muy por debajo del tiempo ` +
            `transcurrido (${
              porcentajeTiempo.toFixed(0)
            }%)`,
        };
      }

      // Si el avance está entre 15-25 puntos
      // por detrás → AMARILLO
      if (porcentajeTiempo - porcentajeAvance > 15
          && porcentajeTiempo > 20) {
        retrasoDetectado = true;
      }
    }
  }

  // ── CRITERIO 4: Proximidad al vencimiento ─────
  const diasRestantes = fechaFin.diff(hoy, 'day');

  if (diasRestantes <= 7) {
    // Menos de una semana → ROJO (urgente)
    return {
      ...RESULTADOS.rojo,
      descripcion: `Vence en ${diasRestantes} día${
        diasRestantes !== 1 ? 's' : ''
      } — acción urgente requerida`,
    };
  }

  if (diasRestantes <= 30 || retrasoDetectado) {
    // Entre 8 y 30 días, o hay retraso en hitos
    return {
      ...RESULTADOS.amarillo,
      descripcion: retrasoDetectado
        ? 'Retraso en avance de hitos detectado'
        : `Vence en ${diasRestantes} días`,
    };
  }

  // ── Sin señales de riesgo ─────────────────────
  // Calcular si queda más del 20% del tiempo
  if (fechaInicio) {
    const tiempoTotal = fechaFin.diff(
      fechaInicio, 'day'
    );
    const tiempoRestante = fechaFin.diff(hoy, 'day');
    const porcentajeRestante =
      tiempoTotal > 0
        ? (tiempoRestante / tiempoTotal) * 100
        : 100;

    if (porcentajeRestante < 20) {
      return {
        ...RESULTADOS.amarillo,
        descripcion: `Queda menos del 20% del plazo ` +
          `(${diasRestantes} días)`,
      };
    }
  }

  return {
    ...RESULTADOS.verde,
    descripcion: `${diasRestantes} días restantes`,
  };
}

// ── Resultados predefinidos ──────────────────────

const RESULTADOS: Record<NivelRiesgo, ResultadoRiesgo> = {
  verde: {
    nivel:       'verde',
    color:       '#10B981',
    colorFondo:  '#ECFDF5',
    etiqueta:    'Sin riesgo',
    descripcion: 'El proyecto avanza correctamente',
    icono:       'IconCircleCheck',
  },
  amarillo: {
    nivel:       'amarillo',
    color:       '#F59E0B',
    colorFondo:  '#FFFBEB',
    etiqueta:    'Riesgo moderado',
    descripcion: 'Requiere seguimiento',
    icono:       'IconAlertTriangle',
  },
  rojo: {
    nivel:       'rojo',
    color:       '#EF4444',
    colorFondo:  '#FEF2F2',
    etiqueta:    'Alto riesgo',
    descripcion: 'Requiere acción inmediata',
    icono:       'IconAlertOctagon',
  },
  gris: {
    nivel:       'gris',
    color:       '#9CA3AF',
    colorFondo:  '#F9FAFB',
    etiqueta:    'Sin datos',
    descripcion: 'No hay suficiente información',
    icono:       'IconMinus',
  },
};

/**
 * Devuelve solo el color del semáforo.
 * Útil para colorear elementos de forma rápida.
 */
export function getColorRiesgo(
  datos: DatosRiesgo
): string {
  return calcularRiesgo(datos).color;
}

/**
 * Versión simplificada para el listado:
 * solo evalúa fechas (sin hitos).
 * Usar en la tabla y el Kanban donde no hay
 * datos de avance de hitos disponibles.
 */
export function calcularRiesgoSimple(
  estado:               string,
  fecha_fin_planificada:string | null,
  fecha_inicio?:        string | null
): ResultadoRiesgo {
  return calcularRiesgo({
    estado,
    fecha_fin_planificada,
    fecha_inicio,
    avance: null, // sin datos de hitos
  });
}
