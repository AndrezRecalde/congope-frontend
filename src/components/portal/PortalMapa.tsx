"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import { env } from "@/lib/env";
import type {
  ProvinciaPortal,
  ResultadosFiltro,
  CatalogosMapa,
} from "@/services/portal.service";

// Colores de polígonos según cantidad de proyectos
function getColorPoligonoPortal(count: number, maxCount: number): string {
  if (count === 0) return "#E2E8F0";
  const ratio = count / Math.max(maxCount, 1);
  if (ratio < 0.2) return "#DBEAFE";
  if (ratio < 0.4) return "#93C5FD";
  if (ratio < 0.6) return "#3B82F6";
  if (ratio < 0.8) return "#1E4D8C";
  return "#0B1F3A";
}

// Colores de pines por estado
const COLOR_PIN: Record<string, string> = {
  "En gestión": "#F59E0B",
  "En ejecución": "#3B82F6",
  Finalizado: "#10B981",
  Suspendido: "#EF4444",
};

interface FiltrosPortal {
  provincia_id: string;
  canton_id: string;
  actor_id: string;
}

interface PortalMapaProps {
  catalogos: CatalogosMapa | null;
  filtros: FiltrosPortal;
  resultados: ResultadosFiltro | null;
  hayFiltros: boolean;
  onClickPin: (id: string) => void;
  onHoverProvincia: (
    datos: ProvinciaPortal | null,
    pos: { x: number; y: number } | null,
  ) => void;
}

export function PortalMapa({
  catalogos,
  filtros: _filtros,
  resultados,
  hayFiltros,
  onClickPin,
  onHoverProvincia,
}: PortalMapaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const capasCreadRef = useRef(false);
  const hoveredStateId = useRef<number | null>(null);
  const geojsonBaseRef = useRef<GeoJSON.FeatureCollection | null>(null);

  // Inicializar el mapa
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/019d84c2-7548-768b-9185-8a1db27ab0a6/style.json?key=${env.NEXT_PUBLIC_MAPTILER_KEY}`,
      center: [-78.8, -1.5],
      zoom: 6,
      minZoom: 2,
      maxZoom: 14,
      /* maxBounds: [
        [-82.0, -6.0],
        [-74.5, 2.0],
      ], */
    });

    // Sin controles de navegación para look limpio
    // Solo control de escala
    map.addControl(
      new maplibregl.ScaleControl({ unit: "metric" }),
      "bottom-right",
    );

    mapRef.current = map;

    map.on("load", () => {
      inicializarCapas(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      capasCreadRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inicializarCapas = useCallback(
    async (map: maplibregl.Map) => {
      try {
        const geores = await fetch(
          "https://raw.githubusercontent.com/jpmarindiaz/geo-collection/refs/heads/master/ecu/ecuador.geojson",
        );
        const geojson = (await geores.json()) as GeoJSON.FeatureCollection;
        geojsonBaseRef.current = geojson;

        const maxCount = catalogos
          ? Math.max(...catalogos.provincias.map((p) => p.proyectos_count), 1)
          : 1;
        const geojsonConDatos: GeoJSON.FeatureCollection = {
          ...geojson,
          features: geojson.features.map((feature) => {
            const codigo =
              feature.properties?.dpa_provin ??
              String(feature.properties?.codigo ?? "");
            const prov = catalogos?.provincias.find((p) => p.codigo === codigo);
            const count = prov?.proyectos_count ?? 0;
            const featureId =
              feature.properties?.cartodb_id ??
              parseInt(codigo, 10) ??
              Math.random();
            return {
              ...feature,
              id: featureId,
              properties: {
                ...feature.properties,
                color_fill: getColorPoligonoPortal(count, maxCount),
              },
            };
          }),
        };

        // Source de polígonos provinciales
        map.addSource("provincias-portal", {
          type: "geojson",
          data: geojsonConDatos,
        });

        // Capa de relleno
        map.addLayer({
          id: "provincias-fill",
          type: "fill",
          source: "provincias-portal",
          paint: {
            "fill-color": ["get", "color_fill"],
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              0.95,
              0.8,
            ],
          },
        });

        // Capa de borde
        map.addLayer({
          id: "provincias-border",
          type: "line",
          source: "provincias-portal",
          paint: {
            "line-color": "#FFFFFF",
            "line-width": 1.5,
            "line-opacity": 0.9,
          },
        });

        // Source de pines (vacío al inicio)
        map.addSource("pines-portal", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        // Capa de pines
        map.addLayer({
          id: "pines-portal",
          type: "circle",
          source: "pines-portal",
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
            "circle-stroke-width": 2.5,
            "circle-stroke-color": "#FFFFFF",
            "circle-opacity": 0.92,
          },
        });

        // Eventos hover en provincias
        map.on("mousemove", "provincias-fill", (e) => {
          if (!e.features?.length) return;
          map.getCanvas().style.cursor = "pointer";
          const pCodigo =
            e.features[0].properties?.dpa_provin ??
            String(e.features[0].properties?.codigo ?? "");
          const featureId = Number(e.features[0].id);

          if (
            hoveredStateId.current !== null &&
            hoveredStateId.current !== featureId
          ) {
            map.setFeatureState(
              { source: "provincias-portal", id: hoveredStateId.current },
              { hover: false },
            );
          }
          hoveredStateId.current = featureId;
          map.setFeatureState(
            { source: "provincias-portal", id: hoveredStateId.current },
            { hover: true },
          );

          const prov = catalogos?.provincias.find((p) => p.codigo === pCodigo);
          if (prov) {
            const punto = map.project([e.lngLat.lng, e.lngLat.lat]);
            onHoverProvincia(prov, {
              x: punto.x,
              y: punto.y,
            });
          }
        });

        map.on("mouseleave", "provincias-fill", () => {
          map.getCanvas().style.cursor = "";
          if (hoveredStateId.current !== null) {
            map.setFeatureState(
              { source: "provincias-portal", id: hoveredStateId.current },
              { hover: false },
            );
            hoveredStateId.current = null;
          }
          onHoverProvincia(null, null);
        });

        // Click en pines
        map.on("click", "pines-portal", (e) => {
          if (!e.features?.length) return;
          const id = String(e.features[0].properties?.id ?? "");
          if (id) onClickPin(id);
        });

        map.on("mouseenter", "pines-portal", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "pines-portal", () => {
          map.getCanvas().style.cursor = "";
        });

        capasCreadRef.current = true;
      } catch (err) {
        console.error("Error cargando capas del mapa:", err);
      }
    },
    [catalogos, onHoverProvincia, onClickPin],
  );

  // Actualizar colores de polígonos cuando cambian
  // los catálogos o los resultados
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !capasCreadRef.current || !geojsonBaseRef.current) return;
    if (!catalogos) return;

    const provincias = catalogos.provincias;
    const maxCount = Math.max(...provincias.map((p) => p.proyectos_count), 1);

    const source = map.getSource("provincias-portal") as
      | maplibregl.GeoJSONSource
      | undefined;
    if (!source) return;

    const currentData = geojsonBaseRef.current;

    const provMap = new Map(provincias.map((p) => [p.codigo, p]));

    const updated: GeoJSON.FeatureCollection = {
      ...currentData,
      features: currentData.features.map((f) => {
        const codigo =
          f.properties?.dpa_provin ?? String(f.properties?.codigo ?? "");
        const prov = provMap.get(codigo);
        const count = prov?.proyectos_count ?? 0;
        const featureId =
          f.properties?.cartodb_id ?? parseInt(codigo, 10) ?? Math.random();
        return {
          ...f,
          id: featureId,
          properties: {
            ...f.properties,
            color_fill: getColorPoligonoPortal(count, maxCount),
          },
        };
      }),
    };

    source.setData(updated);

    // Actualizar el paint de la capa
    map.setPaintProperty("provincias-fill", "fill-color", [
      "get",
      "color_fill",
    ]);
  }, [catalogos]);

  // Actualizar pines cuando cambian los resultados
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !capasCreadRef.current) return;

    const source = map.getSource("pines-portal") as
      | maplibregl.GeoJSONSource
      | undefined;
    if (!source) return;

    if (!hayFiltros || !resultados) {
      // Sin filtros — limpiar pines
      source.setData({
        type: "FeatureCollection",
        features: [],
      });
      return;
    }

    const features: GeoJSON.Feature[] = [];
    resultados.proyectos.forEach((proyecto, i) => {
      proyecto.ubicaciones.forEach((ub, j) => {
        features.push({
          type: "Feature",
          id: i * 100 + j,
          geometry: {
            type: "Point",
            coordinates: [ub.coordenadas.lng, ub.coordenadas.lat],
          },
          properties: {
            id: proyecto.id,
            nombre: proyecto.nombre,
            estado: proyecto.estado,
            color: COLOR_PIN[proyecto.estado] ?? "#6B7280",
          },
        });
      });
    });

    source.setData({
      type: "FeatureCollection",
      features,
    });
  }, [hayFiltros, resultados]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
