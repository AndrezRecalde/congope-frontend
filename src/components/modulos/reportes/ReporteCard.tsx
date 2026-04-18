"use client";

import { useState } from "react";
import {
  Paper,
  Stack,
  Title,
  Text,
  Button,
  Group,
  Select,
  ThemeIcon,
  Badge,
  Alert,
  Loader,
} from "@mantine/core";
import {
  IconDownload,
  IconFileAnalytics,
  IconMap,
  IconLeaf,
  IconBuildingBank,
  IconCalendar,
  IconWorld,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import apiClient, { extractData } from "@/services/axios";
import { useActores } from "@/queries/actores.queries";
import type { Provincia, Ods } from "@/services/axios";
import { getColorOds } from "@/utils/colores-ods";

// Mapeo de nombres de ícono a componentes Tabler
const ICONOS: Record<
  string,
  React.ComponentType<{
    size?: number;
  }>
> = {
  IconMap: IconMap,
  IconLeaf: IconLeaf,
  IconBuildingBank: IconBuildingBank,
  IconCalendar: IconCalendar,
  IconWorld: IconWorld,
  IconFileAnalytics: IconFileAnalytics,
};

interface ReporteCardProps {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  color: string;
  onGenerar: (params: Record<string, unknown>) => Promise<void>;
  tienePermiso: boolean;
}

export function ReporteCard({
  id,
  titulo,
  descripcion,
  icono,
  color,
  onGenerar,
  tienePermiso,
}: ReporteCardProps) {
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  // Parámetros del formulario según el tipo de reporte
  const [provinciaId, setProvinciaId] = useState("");
  const [odsId, setOdsId] = useState("");
  const [actorId, setActorId] = useState("");
  const [anio, setAnio] = useState(String(new Date().getFullYear()));

  // Cargar datos para los selects
  const { data: provinciasData } = useQuery({
    queryKey: queryKeys.provincias.list,
    queryFn: async () => {
      const res = await apiClient.get("/publico/provincias");
      return extractData<Provincia[]>(res);
    },
    staleTime: Infinity,
    enabled: id === "provincia",
  });

  const { data: odsData } = useQuery({
    queryKey: queryKeys.ods.list,
    queryFn: async () => {
      const res = await apiClient.get("/ods");
      return extractData<Ods[]>(res);
    },
    staleTime: Infinity,
    enabled: id === "ods",
  });

  const { data: actoresData } = useActores({
    per_page: 100,
  });

  // Validar si el formulario está completo
  const formularioValido = (() => {
    switch (id) {
      case "provincia":
        return !!provinciaId;
      case "ods":
        return !!odsId;
      case "cooperante":
        return !!actorId;
      case "anual":
        return !!anio;
      case "global":
        return true;
      default:
        return false;
    }
  })();

  const handleGenerar = async () => {
    if (!formularioValido) return;
    setGenerando(true);
    setError(null);
    setExito(false);

    try {
      const params: Record<string, unknown> = {};
      if (id === "provincia") params.provincia_id = provinciaId;
      if (id === "ods") params.ods_id = Number(odsId);
      if (id === "cooperante") params.actor_id = actorId;
      if (id === "anual") params.anio = anio;

      await onGenerar(params);
      setExito(true);
      setTimeout(() => setExito(false), 3000);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } | Blob | unknown };
      };

      // Fallback para Blob responses que contienen JSON en error
      const responseData = axiosErr?.response?.data;
      if (responseData instanceof Blob) {
        try {
          const text = await responseData.text();
          const json = JSON.parse(text);
          if (
            json &&
            typeof json === "object" &&
            "message" in json &&
            json.message
          ) {
            setError(String(json.message));
            return;
          }
        } catch {
          // Not JSON inside Blob
        }
      }

      const dataTyped = axiosErr?.response?.data as
        | { message?: string }
        | undefined;
      setError(
        dataTyped?.message ??
          "Error al generar el reporte. Intenta nuevamente.",
      );
    } finally {
      setGenerando(false);
    }
  };

  const IconoComponente = ICONOS[icono] ?? IconFileAnalytics;

  // Opciones de años para el reporte anual
  const anioActual = new Date().getFullYear();
  const opcionesAnio = Array.from({ length: 10 }, (_, i) => {
    const a = String(anioActual - i);
    return { value: a, label: a };
  });

  const opcionesProvincias = (provinciasData ?? []).map((p) => ({
    value: p.id,
    label: p.nombre,
  }));

  const opcionesOds = (odsData ?? []).map((o) => ({
    value: String(o.id),
    label: `ODS ${o.numero} — ${o.nombre}`,
  }));

  const opcionesActores = (actoresData?.data ?? []).map((a) => ({
    value: a.id,
    label: `${a.nombre} (${a.tipo})`,
  }));

  return (
    <Paper
      p="lg"
      radius="lg"
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        opacity: tienePermiso ? 1 : 0.6,
      }}
    >
      <Stack gap="md">
        {/* Cabecera */}
        <Group gap="md" align="flex-start">
          <ThemeIcon size={48} radius="md" color={color} variant="light">
            <IconoComponente size={24} />
          </ThemeIcon>
          <Stack gap={4} style={{ flex: 1 }}>
            <Group justify="space-between">
              <Title order={5}>
                {titulo}
              </Title>
              {!tienePermiso && (
                <Badge size="xs" color="gray" variant="outline">
                  Sin permiso
                </Badge>
              )}
            </Group>
            <Text size="sm" c="dimmed" lh={1.5}>
              {descripcion}
            </Text>
          </Stack>
        </Group>

        {/* Parámetros del reporte */}
        {id === "provincia" && (
          <Select
            label="Provincia"
            placeholder="Seleccionar provincia..."
            data={opcionesProvincias}
            value={provinciaId}
            onChange={(v) => setProvinciaId(v ?? "")}
            searchable
            disabled={!tienePermiso || generando}
            size="sm"
          />
        )}

        {id === "ods" && (
          <Select
            label="ODS"
            placeholder="Seleccionar ODS..."
            data={opcionesOds}
            value={odsId}
            onChange={(v) => setOdsId(v ?? "")}
            searchable
            disabled={!tienePermiso || generando}
            size="sm"
            renderOption={({ option }) => {
              const num = Number(option.value);
              return (
                <Group gap="xs">
                  <Badge
                    size="xs"
                    circle
                    style={{
                      background: getColorOds(num),
                      color: "white",
                      minWidth: 20,
                    }}
                  >
                    {num}
                  </Badge>
                  <Text size="sm">{option.label.split("— ")[1]}</Text>
                </Group>
              );
            }}
          />
        )}

        {id === "cooperante" && (
          <Select
            label="Actor cooperante"
            placeholder="Seleccionar actor..."
            data={opcionesActores}
            value={actorId}
            onChange={(v) => setActorId(v ?? "")}
            searchable
            disabled={!tienePermiso || generando}
            size="sm"
          />
        )}

        {id === "anual" && (
          <Select
            label="Año"
            data={opcionesAnio}
            value={anio}
            onChange={(v) => setAnio(v ?? String(anioActual))}
            disabled={!tienePermiso || generando}
            size="sm"
          />
        )}

        {/* Mensaje de error */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={14} />}
            color="red"
            variant="light"
            py="xs"
            radius="md"
          >
            <Text size="xs">{error}</Text>
          </Alert>
        )}

        {/* Botón de descarga */}
        <Button
          color={color}
          leftSection={
            generando ? (
              <Loader size={14} color="white" />
            ) : exito ? (
              <IconCheck size={15} />
            ) : (
              <IconDownload size={15} />
            )
          }
          onClick={handleGenerar}
          disabled={!tienePermiso || !formularioValido}
          loading={generando}
          fullWidth
          variant={exito ? "light" : "filled"}
        >
          {generando
            ? "Generando PDF..."
            : exito
              ? "¡Descargado!"
              : "Descargar reporte PDF"}
        </Button>

        {generando && (
          <Text size="xs" c="dimmed" ta="center">
            El reporte puede tardar unos segundos en generarse...
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
