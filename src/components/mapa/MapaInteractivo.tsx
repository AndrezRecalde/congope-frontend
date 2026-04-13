'use client'

import { useState, useCallback, useEffect } from 'react';
import { Box, LoadingOverlay } from '@mantine/core';
import maplibregl         from 'maplibre-gl';
import { MapaBase }       from './MapaBase';
import { MapaFiltrosPanel }  from './MapaFiltrosPanel';
import { MapaLeyenda }    from './MapaLeyenda';
import { MapaControlCapas }  from './MapaControlCapas';
import { TooltipProvincia }  from './TooltipProvincia';
import { ProyectoDrawer } from './ProyectoDrawer';
import { useMapaCapas }   from '@/hooks/useMapaCapas';
import { useMapa }        from '@/hooks/useMapa';
import { useActores }     from '@/queries/actores.queries';
import type { ProvinciaMapaData } from '@/types/mapa.types';

export function MapaInteractivo() {
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const [mapaListo, setMapaListo] = useState(false);

  // Estado del tooltip de hover
  const [tooltipData, setTooltipData] =
    useState<ProvinciaMapaData | null>(null);
  const [tooltipPos, setTooltipPos] =
    useState({ x: 0, y: 0 });

  // Control de capas
  const [mostrarProvincias, setMostrarProvincias] =
    useState(true);
  const [mostrarPines, setMostrarPines] = useState(true);

  // Hook principal del mapa
  const {
    filtros,
    drawerAbierto,
    cargandoProyectos,
    datosProvincias,
    maxProyectosProvincia,
    pines,
    provincias,
    ods,
    proyectoSeleccionado,
    abrirDrawer,
    cerrarDrawer,
    actualizarFiltros,
    limpiarFiltros,
  } = useMapa();

  // Actores para el select de filtros
  const { data: actoresData } = useActores({
    per_page: 100,
  });
  const actores = (actoresData?.data ?? []).map((a) => ({
    id:     a.id,
    nombre: a.nombre,
    tipo:   a.tipo,
  }));

  // ── Eventos del mapa ──
  const handleHoverProvincia = useCallback(
    (
      datos: ProvinciaMapaData | null,
      lngLat?: maplibregl.LngLat
    ) => {
      setTooltipData(datos);
      if (datos && lngLat && mapInstance) {
        const punto = mapInstance.project(
          [lngLat.lng, lngLat.lat]
        );
        setTooltipPos({ x: punto.x, y: punto.y });
      }
    },
    [mapInstance]
  );

  // ── Capas de MapLibre ──
  const { inicializarCapas } = useMapaCapas({
    map:                   mapInstance,
    datosProvincias,
    maxProyectosProvincia,
    pines:                 mostrarPines ? pines : [],
    mostrarProvincias,
    mostrarPines,
    onClickPin:            abrirDrawer,
    onHoverProvincia:      handleHoverProvincia,
  });

  const handleMapLoaded = useCallback(
    (map: maplibregl.Map) => {
      setMapInstance(map);
      setMapaListo(true);
    },
    []
  );

  useEffect(() => {
    if (mapaListo) {
      inicializarCapas();
    }
  }, [mapaListo, inicializarCapas]);

  return (
    <Box
      style={{
        position: 'relative',
        width:    '100%',
        height:   '100%',
      }}
    >
      {/* Mapa base */}
      <MapaBase
        onMapLoaded={handleMapLoaded}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Overlay de carga */}
      <LoadingOverlay
        visible={cargandoProyectos && mapaListo}
        overlayProps={{ blur: 1, opacity: 0.3 }}
        loaderProps={{ size: 'sm', color: 'congope' }}
      />

      {/* Panel de filtros — esquina superior derecha */}
      {mapaListo && (
        <MapaFiltrosPanel
          filtros={filtros}
          provincias={provincias}
          ods={ods}
          actores={actores}
          onChange={actualizarFiltros}
          onLimpiar={limpiarFiltros}
        />
      )}

      {/* Leyenda — esquina inferior derecha */}
      {mapaListo && <MapaLeyenda />}

      {/* Control de capas — esquina inferior izquierda */}
      {mapaListo && (
        <MapaControlCapas
          mostrarProvincias={mostrarProvincias}
          mostrarPines={mostrarPines}
          onToggleProvincias={() =>
            setMostrarProvincias((v) => !v)
          }
          onTogglePines={() =>
            setMostrarPines((v) => !v)
          }
        />
      )}

      {/* Tooltip de hover en provincias */}
      {tooltipData && (
        <TooltipProvincia
          datos={tooltipData}
          posicion={tooltipPos}
        />
      )}

      {/* Drawer lateral de detalle del proyecto */}
      <ProyectoDrawer
        proyectoId={
          proyectoSeleccionado?.id ?? null
        }
        abierto={drawerAbierto}
        onCerrar={cerrarDrawer}
      />
    </Box>
  );
}
