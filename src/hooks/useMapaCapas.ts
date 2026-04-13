"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import type { ProvinciaMapaData, ProyectoPin } from "@/types/mapa.types";
import { getColorPoligono, COLOR_PIN_ESTADO } from "@/types/mapa.types";

const LAYER_PROVINCIAS_FILL = "provincias-fill";
const LAYER_PROVINCIAS_BORDER = "provincias-border";
const LAYER_PINES = "proyectos-pines";
const SOURCE_PROVINCIAS = "ecuador-provincias";
const SOURCE_PINES = "proyectos-pines-source";

interface UseMapaCapasProps {
  map: maplibregl.Map | null;
  datosProvincias: ProvinciaMapaData[];
  maxProyectosProvincia: number;
  pines: ProyectoPin[];
  mostrarProvincias: boolean;
  mostrarPines: boolean;
  onClickPin: (proyectoId: string) => void;
  onHoverProvincia: (
    data: ProvinciaMapaData | null,
    lngLat?: maplibregl.LngLat,
  ) => void;
}

export function useMapaCapas({
  map,
  datosProvincias,
  maxProyectosProvincia,
  pines,
  mostrarProvincias,
  mostrarPines,
  onClickPin,
  onHoverProvincia,
}: UseMapaCapasProps) {
  const capasCreadasRef = useRef(false);
  const geojsonBaseRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const hoveredStateId = useRef<number | null>(null);

  // ── Inicializar capas al cargar el mapa ──
  const inicializarCapas = useCallback(async () => {
    if (!map || capasCreadasRef.current) return;
    capasCreadasRef.current = true;

    // Cargar el GeoJSON de provincias
    let geojson: GeoJSON.FeatureCollection;
    try {
      const res = await fetch(
        "https://raw.githubusercontent.com/jpmarindiaz/geo-collection/refs/heads/master/ecu/ecuador.geojson",
      );
      geojson = (await res.json()) as GeoJSON.FeatureCollection;
      geojsonBaseRef.current = geojson;
    } catch (err) {
      console.error("Error al cargar GeoJSON:", err);
      return;
    }

    // Agregar colores de intensidad a las propiedades
    // del GeoJSON basado en datos de la API
    const datosMap = new Map(datosProvincias.map((d) => [d.codigo, d]));

    const geojsonConDatos: GeoJSON.FeatureCollection = {
      ...geojson,
      features: geojson.features.map((feature) => {
        const codigo = feature.properties?.dpa_provin ?? String(feature.properties?.codigo ?? "");
        const datos = datosMap.get(codigo);
        const count = datos?.proyectos_count ?? 0;
        const featureId = feature.properties?.cartodb_id ?? parseInt(codigo, 10) ?? Math.random();
        return {
          ...feature,
          id: featureId,
          properties: {
            ...feature.properties,
            proyectos_count: count,
            color_fill: getColorPoligono(count, maxProyectosProvincia),
            // Datos para el tooltip
            provincia_id: datos?.id ?? "",
            nombre: datos?.nombre ?? feature.properties?.nombre ?? "",
            monto_formateado: datos?.monto_formateado ?? "",
            en_gestion: datos?.estados.en_gestion ?? 0,
            en_ejecucion: datos?.estados.en_ejecucion ?? 0,
            finalizado: datos?.estados.finalizado ?? 0,
          },
        };
      }),
    };

    // Source de provincias
    map.addSource(SOURCE_PROVINCIAS, {
      type: "geojson",
      data: geojsonConDatos,
    });

    // Capa de relleno de provincias
    map.addLayer({
      id: LAYER_PROVINCIAS_FILL,
      type: "fill",
      source: SOURCE_PROVINCIAS,
      paint: {
        "fill-color": ["get", "color_fill"],
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          0.95,
          0.70,
        ],
      },
    });

    // Capa de borde de provincias
    map.addLayer({
      id: LAYER_PROVINCIAS_BORDER,
      type: "line",
      source: SOURCE_PROVINCIAS,
      paint: {
        "line-color": "#0d7509",
        "line-width": 2,
      },
    });

    // Source de pines de proyectos
    map.addSource(SOURCE_PINES, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

    // Capa de pines (círculos)
    map.addLayer({
      id: LAYER_PINES,
      type: "circle",
      source: SOURCE_PINES,
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          5,
          5,
          10,
          8,
          14,
          12,
        ],
        "circle-color": ["get", "color"],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#81F09F",
        "circle-opacity": 0.9,
      },
    });

    // ── Eventos de hover en provincias ──
    map.on("mousemove", LAYER_PROVINCIAS_FILL, (e) => {
      if (!e.features?.length) return;
      map.getCanvas().style.cursor = "pointer";

      const featureId = Number(e.features[0].id);
      if (hoveredStateId.current !== null && hoveredStateId.current !== featureId) {
        map.setFeatureState(
          { source: SOURCE_PROVINCIAS, id: hoveredStateId.current },
          { hover: false }
        );
      }
      hoveredStateId.current = featureId;
      map.setFeatureState(
        { source: SOURCE_PROVINCIAS, id: hoveredStateId.current },
        { hover: true }
      );

      const props = e.features[0].properties as Record<string, unknown>;
      const codigo = String(props.dpa_provin ?? "");
      const datosProv = datosProvincias.find((d) => d.codigo === codigo);

      if (datosProv) {
        onHoverProvincia(datosProv, e.lngLat);
      }
    });

    map.on("mouseleave", LAYER_PROVINCIAS_FILL, () => {
      map.getCanvas().style.cursor = "";
      
      if (hoveredStateId.current !== null) {
        map.setFeatureState(
          { source: SOURCE_PROVINCIAS, id: hoveredStateId.current },
          { hover: false }
        );
        hoveredStateId.current = null;
      }
      
      onHoverProvincia(null);
    });

    // ── Evento de clic en pines ──
    map.on("click", LAYER_PINES, (e) => {
      if (!e.features?.length) return;
      const props = e.features[0].properties as Record<string, unknown>;
      const proyectoId = String(props.proyecto_id ?? "");
      if (proyectoId) {
        onClickPin(proyectoId);
      }
    });

    map.on("mouseenter", LAYER_PINES, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", LAYER_PINES, () => {
      map.getCanvas().style.cursor = "";
    });
  }, [
    map,
    datosProvincias,
    maxProyectosProvincia,
    onClickPin,
    onHoverProvincia,
  ]);

  // ── Actualizar pines cuando cambian los datos ──
  useEffect(() => {
    if (!map || !capasCreadasRef.current) return;

    const source = map.getSource(SOURCE_PINES) as
      | maplibregl.GeoJSONSource
      | undefined;
    if (!source) return;

    const features: GeoJSON.Feature[] = pines.map((pin, index) => ({
      type: "Feature" as const,
      id: index,
      geometry: {
        type: "Point" as const,
        coordinates: [Number(pin.coordenadas.lng), Number(pin.coordenadas.lat)],
      },
      properties: {
        proyecto_id: pin.id,
        codigo: pin.codigo,
        nombre: pin.nombre,
        estado: pin.estado,
        color: COLOR_PIN_ESTADO[pin.estado] ?? "#6B7280",
        ubicacion_nombre: pin.ubicacion_nombre,
      },
    }));

    source.setData({
      type: "FeatureCollection",
      features,
    });
  }, [map, pines]);

  // ── Actualizar colores de provincias ──
  useEffect(() => {
    if (!map || !capasCreadasRef.current || !geojsonBaseRef.current) return;

    const source = map.getSource(SOURCE_PROVINCIAS) as
      | maplibregl.GeoJSONSource
      | undefined;
    if (!source) return;

    const baseGeojson = geojsonBaseRef.current;

    const datosMap = new Map(datosProvincias.map((d) => [d.codigo, d]));

    const updated: GeoJSON.FeatureCollection = {
      ...baseGeojson,
      features: baseGeojson.features.map((f) => {
        const codigo = f.properties?.dpa_provin ?? String(f.properties?.codigo ?? "");
        const datos = datosMap.get(codigo);
        const count = datos?.proyectos_count ?? 0;
        const featureId = f.properties?.cartodb_id ?? parseInt(codigo, 10) ?? Math.random();
        return {
          ...f,
          id: featureId,
          properties: {
            ...f.properties,
            proyectos_count: count,
            color_fill: getColorPoligono(count, maxProyectosProvincia),
            provincia_id: datos?.id ?? "",
            monto_formateado: datos?.monto_formateado ?? "",
            en_gestion: datos?.estados.en_gestion ?? 0,
            en_ejecucion: datos?.estados.en_ejecucion ?? 0,
            finalizado: datos?.estados.finalizado ?? 0,
          },
        };
      }),
    };

    source.setData(updated);
  }, [map, datosProvincias, maxProyectosProvincia]);

  // ── Control de visibilidad de capas ──
  useEffect(() => {
    if (!map || !capasCreadasRef.current) return;
    const vis = mostrarProvincias ? "visible" : "none";
    map.setLayoutProperty(LAYER_PROVINCIAS_FILL, "visibility", vis);
    map.setLayoutProperty(LAYER_PROVINCIAS_BORDER, "visibility", vis);
  }, [map, mostrarProvincias]);

  useEffect(() => {
    if (!map || !capasCreadasRef.current) return;
    map.setLayoutProperty(
      LAYER_PINES,
      "visibility",
      mostrarPines ? "visible" : "none",
    );
  }, [map, mostrarPines]);

  return { inicializarCapas };
}
