"use client";

import { useRef, useEffect, forwardRef } from "react";
import maplibregl from "maplibre-gl";
import { env } from "@/lib/env";

// Coordenadas del centro geográfico de Ecuador
const ECUADOR_CENTER: [number, number] = [-78.1834, -1.8312];
const ECUADOR_ZOOM = 6.2;

interface MapaBaseProps {
  onMapLoaded?: (map: maplibregl.Map) => void;
  style?: React.CSSProperties;
  className?: string;
}

export const MapaBase = forwardRef<maplibregl.Map | null, MapaBaseProps>(
  ({ onMapLoaded, style, className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);

    useEffect(() => {
      if (!containerRef.current || mapRef.current) return;

      const map = new maplibregl.Map({
        container: containerRef.current,
        // Estilo limpio y neutro de Maptiler
        // que no compita visualmente con los datos
        style: `https://api.maptiler.com/maps/openstreetmap/style.json?key=${env.NEXT_PUBLIC_MAPTILER_KEY}`,
        center: ECUADOR_CENTER,
        zoom: ECUADOR_ZOOM,
        minZoom: 5,
        maxZoom: 14,
        // Restringir el mapa al territorio ecuatoriano
        // para que el usuario no pueda salir del contexto
        /* maxBounds: [
          [-82.0, -6.0], // SW
          [-74.5, 2.0], // NE
        ], */
      });

      // Controles de navegación
      map.addControl(
        new maplibregl.NavigationControl({
          showCompass: false,
        }),
        "bottom-right",
      );

      // Escala del mapa
      map.addControl(
        new maplibregl.ScaleControl({ unit: "metric" }),
        "bottom-left",
      );

      mapRef.current = map;

      // Exponer la referencia al padre si se usa ref
      if (typeof ref === "function") {
        ref(map);
      } else if (ref) {
        ref.current = map;
      }

      map.on("load", () => {
        onMapLoaded?.(map);
      });

      return () => {
        map.remove();
        mapRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          ...style,
        }}
        className={className}
      />
    );
  },
);

MapaBase.displayName = "MapaBase";
