'use client'

import { useState, useMemo, useCallback } from 'react';
import {
  useProyectosMapa,
  useProyectoMapaDetalle,
  useProvinciasMapa,
  useOdsMapa,
} from '@/queries/mapa.queries';
import type {
  MapaFiltros,
  ProvinciaMapaData,
  ProyectoPin,
} from '@/types/mapa.types';

export function useMapa() {
  const [filtros, setFiltros] = useState<MapaFiltros>({});
  const [drawerProyectoId, setDrawerProyectoId] =
    useState<string | null>(null);
  const [drawerAbierto, setDrawerAbierto] = useState(false);

  // Datos de la API
  const {
    data: proyectos = [],
    isLoading: cargandoProyectos,
  } = useProyectosMapa(filtros);

  const {
    data: provincias = [],
  } = useProvinciasMapa();

  const {
    data: ods = [],
  } = useOdsMapa();

  // Proyecto seleccionado para el Drawer
  const {
    data: proyectoSeleccionado,
    isLoading: cargandoDetalle,
  } = useProyectoMapaDetalle(drawerProyectoId);

  // ── Procesar datos de provincias para el mapa ──
  // Calcula estadísticas por provincia haciendo join
  // entre los proyectos cargados y las provincias.
  const datosProvincias = useMemo((): ProvinciaMapaData[] => {
    return provincias.map((prov) => {
      const proysProvincia = proyectos.filter((p) =>
        p.provincias?.some((pp) => pp.id === prov.id)
      );

      const total       = proysProvincia.length;
      const montoTotal  = proysProvincia.reduce(
        (sum, p) => sum + parseFloat(p.monto_total ?? '0'),
        0
      );

      return {
        id:    prov.id,
        nombre:prov.nombre,
        codigo:prov.codigo ?? '',
        proyectos_count:  total,
        monto_total:      montoTotal,
        monto_formateado: `$${montoTotal.toLocaleString(
          'es-EC', { maximumFractionDigits: 0 }
        )} USD`,
        estados: {
          en_gestion:   proysProvincia.filter(
            p => p.estado === 'En gestión').length,
          en_ejecucion: proysProvincia.filter(
            p => p.estado === 'En ejecución').length,
          finalizado:   proysProvincia.filter(
            p => p.estado === 'Finalizado').length,
          suspendido:   proysProvincia.filter(
            p => p.estado === 'Suspendido').length,
        },
      };
    });
  }, [proyectos, provincias]);

  // Máximo de proyectos en una provincia
  // (para calcular la intensidad de color)
  const maxProyectosProvincia = useMemo(
    () => Math.max(
      ...datosProvincias.map((p) => p.proyectos_count),
      1
    ),
    [datosProvincias]
  );

  // ── Extraer pines del mapa ──
  // Un proyecto puede generar múltiples pines
  // si tiene múltiples ubicaciones registradas.
  const pines = useMemo((): ProyectoPin[] => {
    const resultado: ProyectoPin[] = [];
    proyectos.forEach((proyecto) => {
      (proyecto.ubicaciones ?? []).forEach((ub) => {
        resultado.push({
          id:               proyecto.id,
          codigo:           proyecto.codigo,
          nombre:           proyecto.nombre,
          estado:           proyecto.estado,
          color_marcador:   proyecto.color_marcador ?? '#6B7280',
          coordenadas: {
            lat: ub.coordenadas.lat,
            lng: ub.coordenadas.lng,
          },
          ubicacion_nombre: ub.nombre ?? proyecto.nombre,
        });
      });
    });
    return resultado;
  }, [proyectos]);

  // ── Acciones ──
  const abrirDrawer = useCallback((proyectoId: string) => {
    setDrawerProyectoId(proyectoId);
    setDrawerAbierto(true);
  }, []);

  const cerrarDrawer = useCallback(() => {
    setDrawerAbierto(false);
    // Limpiar el ID después de la animación
    setTimeout(() => setDrawerProyectoId(null), 300);
  }, []);

  const actualizarFiltros = useCallback(
    (nuevosFiltros: MapaFiltros) => {
      setFiltros(nuevosFiltros);
    }, []
  );

  const limpiarFiltros = useCallback(() => {
    setFiltros({});
  }, []);

  return {
    // Estado
    filtros,
    drawerAbierto,
    cargandoProyectos,
    cargandoDetalle,
    // Datos procesados
    proyectos,
    datosProvincias,
    maxProyectosProvincia,
    pines,
    provincias,
    ods,
    proyectoSeleccionado: proyectoSeleccionado ?? null,
    // Acciones
    abrirDrawer,
    cerrarDrawer,
    actualizarFiltros,
    limpiarFiltros,
  };
}
