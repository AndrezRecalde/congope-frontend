"use client";

import dynamic from "next/dynamic";
import { Box, Center, Loader, Text, Stack } from "@mantine/core";
import { usePermisos } from "@/hooks/usePermisos";

// Importación dinámica porque MapLibre usa WebGL
// y no puede renderizarse en el servidor (SSR off)
const MapaInteractivo = dynamic(
  () =>
    import("@/components/mapa/MapaInteractivo").then(
      (mod) => mod.MapaInteractivo,
    ),
  {
    ssr: false,
    loading: () => (
      <Center style={{ height: "100%" }}>
        <Stack align="center" gap="md">
          <Loader color="congope" size="lg" />
          <Text size="sm" c="dimmed">
            Cargando mapa interactivo...
          </Text>
        </Stack>
      </Center>
    ),
  },
);

export default function MapaPage() {
  const { can } = usePermisos();

  if (!can("mapa.ver")) {
    return (
      <Box p="md">
        <Text c="dimmed">No tienes permiso para ver el mapa.</Text>
      </Box>
    );
  }

  return (
    <Box
      style={{
        // Anular el padding del AppShell.main
        // para que el mapa sea full en el área
        // de contenido disponible
        margin: "calc(var(--mantine-spacing-md) * -1)",
        height: "calc(100vh - 60px)", // 60px = topbar
        position: "relative",
        overflow: "hidden",
      }}
    >
      <MapaInteractivo />
    </Box>
  );
}
