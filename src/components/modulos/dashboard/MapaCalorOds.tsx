"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Stack,
  Group,
  Text,
  Badge,
  Paper,
  Skeleton,
  Alert,
  Title,
  Tooltip,
  Button,
  Drawer,
  ScrollArea,
  ThemeIcon,
  Divider,
  ActionIcon,
  useComputedColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAlertCircle,
  IconExternalLink,
  IconX,
  IconLeaf,
  IconWorldFilled,
  IconPin,
  IconMapPin2,
} from "@tabler/icons-react";
import { useMapaCalorOds } from "@/queries/dashboard.queries";
import type { OdsHeatmap, ProvinciaHeatmap } from "@/types/heatmap.types";

// ECharts solo en el cliente
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// ── Escala de colores del heatmap ───────────────
const COLOR_ESCALA_LIGHT = [
  [0, "#F1F5F9"], // 0 proyectos → gris muy claro
  [0.01, "#EFF6FF"], // 1+ → azul fantasma
  [0.2, "#BFDBFE"], // pocos
  [0.4, "#60A5FA"], // moderado
  [0.6, "#2563EB"], // varios
  [0.8, "#1E4D8C"], // muchos
  [1, "#0B1F3A"], // máximo
];

const COLOR_ESCALA_DARK = [
  [0, "rgba(255,255,255,0.03)"], // 0
  [0.01, "rgba(37,99,235,0.15)"], // 1+
  [0.2, "rgba(37,99,235,0.3)"], // pocos
  [0.4, "#3B82F6"], // moderado
  [0.6, "#60A5FA"], // varios
  [0.8, "#93C5FD"], // muchos
  [1, "#BFDBFE"], // máximo
];

// ── Panel lateral de detalle de celda ───────────

interface DetalleCeldaProps {
  ods: OdsHeatmap | null;
  provincia: ProvinciaHeatmap | null;
  total: number;
  abierto: boolean;
  onCerrar: () => void;
}

function DetalleCelda({
  ods,
  provincia,
  total,
  abierto,
  onCerrar,
}: DetalleCeldaProps) {
  const urlPortal = provincia ? `/?provincia_id=${provincia.id}` : "/";

  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const isDark = computedColorScheme === "dark";

  return (
    <Drawer
      opened={abierto}
      onClose={onCerrar}
      position="right"
      size={400}
      title={
        <Group gap="sm">
          {ods && (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: ods.color_hex,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
              }}
            >
              {ods.numero}
            </div>
          )}
          <div>
            <Text fw={700} size="sm">
              {ods?.nombre}
            </Text>
            <Text size="xs" c="dimmed">
              {provincia?.nombre}
            </Text>
          </div>
        </Group>
      }
      styles={{
        header: {
          borderBottom: isDark
            ? "1px solid var(--mantine-color-dark-4)"
            : "1px solid var(--mantine-color-gray-3)",
        },
      }}
    >
      <Stack gap="lg" p="md">
        {/* KPI principal */}
        <Paper
          p="lg"
          radius="lg"
          style={{
            background: "linear-gradient(135deg," + "#0B1F3A 0%, #1E4D8C 100%)",
            textAlign: "center",
          }}
        >
          <Text
            size="xl"
            fw={900}
            style={{
              fontSize: 48,
              color: "white",
              lineHeight: 1,
            }}
          >
            {total}
          </Text>
          <Text size="sm" c="gray.4" mt={4}>
            proyecto{total !== 1 ? "s" : ""} en esta combinación
          </Text>
        </Paper>

        {/* Información del ODS */}
        {ods && (
          <div>
            <Text
              size="xs"
              fw={700}
              c="dimmed"
              tt="uppercase"
              style={{ letterSpacing: "0.08em" }}
              mb={8}
            >
              Objetivo de Desarrollo Sostenible
            </Text>
            <Group gap="sm">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: ods.color_hex,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "white",
                  flexShrink: 0,
                }}
              >
                {ods.numero}
              </div>
              <div>
                <Text fw={600} size="sm">
                  ODS {ods.numero}
                </Text>
                <Text size="xs" c="dimmed">
                  {ods.nombre}
                </Text>
              </div>
            </Group>
          </div>
        )}

        <Divider />

        {/* Información de la provincia */}
        {provincia && (
          <div>
            <Text
              size="xs"
              fw={700}
              c="dimmed"
              tt="uppercase"
              style={{ letterSpacing: "0.08em" }}
              mb={8}
            >
              Provincia
            </Text>
            <Group gap="sm">
              <ThemeIcon size={40} radius="md" color="blue" variant="light">
                <IconMapPin2 size={24} />
              </ThemeIcon>
              <div>
                <Text fw={600} size="sm">
                  {provincia.nombre}
                </Text>
                <Text size="xs" c="dimmed">
                  Código INEC: {provincia.codigo}
                </Text>
              </div>
            </Group>
          </div>
        )}

        <Divider />

        {/* Acciones */}
        <Stack gap="sm">
          <Text
            size="xs"
            fw={700}
            c="dimmed"
            tt="uppercase"
            style={{ letterSpacing: "0.08em" }}
          >
            Acciones
          </Text>

          {/* Ver proyectos en el portal */}
          <Button
            component="a"
            href={urlPortal}
            target="_blank"
            variant="light"
            color="blue"
            leftSection={<IconExternalLink size={14} />}
            fullWidth
          >
            Ver proyectos en el portal
          </Button>

          {/* Celdas vacías */}
          {total === 0 && (
            <Alert color="gray" variant="light" radius="md">
              <Text size="xs">
                No hay proyectos que combinen este ODS con esta provincia. Esta
                combinación podría ser una oportunidad para futuras iniciativas.
              </Text>
            </Alert>
          )}
        </Stack>
      </Stack>
    </Drawer>
  );
}

// ── Componente principal del Heatmap ────────────

export function MapaCalorOds() {
  const { data, isLoading, isError } = useMapaCalorOds();

  // ODS seleccionados para filtrar filas
  // null = mostrar todos
  const [odsSeleccionados, setOdsSeleccionados] = useState<number[] | null>(
    null,
  );

  // Panel de detalle de celda
  const [celdaDetalle, setCeldaDetalle] = useState<{
    ods: OdsHeatmap;
    provincia: ProvinciaHeatmap;
    total: number;
  } | null>(null);

  const [drawerAbierto, { open: abrirDrawer, close: cerrarDrawer }] =
    useDisclosure(false);

  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const isDark = computedColorScheme === "dark";

  // ── Construir la opción de ECharts ──────────

  const option = useMemo(() => {
    if (!data) return {};

    const ods = Array.isArray(data.ods) ? data.ods : [];
    const provincias = Array.isArray(data.provincias) ? data.provincias : [];
    const matriz = Array.isArray(data.matriz) ? data.matriz : [];
    const max_valor = data.max_valor || 0;

    // Filtrar ODS si hay selección activa
    const odsFiltrados = odsSeleccionados
      ? ods.filter((o) => odsSeleccionados.includes(o.id))
      : ods;

    // Crear mapa de búsqueda rápida de celdas
    // Key: "ods_id:provincia_id" → total
    const mapaTotal = new Map<string, number>();
    matriz.forEach((c) => {
      mapaTotal.set(`${c.ods_id}:${c.provincia_id}`, c.total);
    });

    // Construir los datos del heatmap en formato
    // ECharts: [x_index, y_index, value]
    const serieData: [number, number, number][] = [];

    odsFiltrados.forEach((odsItem, yIdx) => {
      provincias.forEach((prov, xIdx) => {
        const key = `${odsItem.id}:${prov.id}`;
        const total = mapaTotal.get(key) ?? 0;
        serieData.push([xIdx, yIdx, total]);
      });
    });

    return {
      backgroundColor: "transparent",

      tooltip: {
        position: "top",
        formatter: (params: { data: [number, number, number] }) => {
          const [xIdx, yIdx, total] = params.data;
          const prov = provincias[xIdx];
          const odsItem = odsFiltrados[yIdx];
          if (!prov || !odsItem) return "";

          return (
            `<div style="font-family:DM Sans;` +
            `font-size:12px;line-height:1.6">` +
            `<strong style="color:${odsItem.color_hex}">` +
            `ODS ${odsItem.numero} · ${odsItem.nombre}</strong>` +
            `<br/>${prov.nombre}` +
            `<br/><span style="font-size:16px;` +
            `font-weight:700">${total}</span> ` +
            `proyecto${total !== 1 ? "s" : ""}` +
            `</div>`
          );
        },
        backgroundColor: isDark ? "rgba(26,27,30,0.95)" : "rgba(11,31,58,0.92)",
        borderColor: isDark ? "rgba(201,168,76,0.4)" : "rgba(201,168,76,0.3)",
        textStyle: { color: "white" },
      },

      grid: {
        top: "8%",
        left: "16%",
        right: "4%",
        bottom: "15%",
      },

      xAxis: {
        type: "category",
        data: provincias.map((p) => p.nombre),
        splitArea: { show: true },
        axisLabel: {
          rotate: 45,
          fontSize: 9,
          color: isDark ? "#A0AEC0" : "#4A5568",
          fontFamily: "DM Sans",
          interval: 0,
          // Truncar nombres largos
          formatter: (v: string) => (v.length > 10 ? v.slice(0, 9) + "…" : v),
        },
        axisLine: {
          lineStyle: { color: isDark ? "#2D3748" : "#E2E8F0" },
        },
      },

      yAxis: {
        type: "category",
        data: odsFiltrados.map((o) => `ODS ${o.numero} · ${o.nombre}`),
        splitArea: { show: true },
        axisLabel: {
          fontSize: 10,
          color: isDark ? "#E2E8F0" : "#0B1F3A",
          fontFamily: "DM Sans",
          fontWeight: 600,
          formatter: (v: string) => (v.length > 22 ? v.slice(0, 20) + "…" : v),
        },
      },

      visualMap: {
        min: 0,
        max: max_valor || 1,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "2%",
        inRange: {
          color: (isDark ? COLOR_ESCALA_DARK : COLOR_ESCALA_LIGHT).map(
            (c) => c[1] as string,
          ),
        },
        text: ["Más proyectos", "Ninguno"],
        textStyle: {
          color: isDark ? "#A0AEC0" : "#4A5568",
          fontSize: 10,
          fontFamily: "DM Sans",
        },
      },

      series: [
        {
          name: "Proyectos",
          type: "heatmap",
          data: serieData,
          label: {
            show: max_valor <= 20,
            // Solo mostrar números si hay pocos datos
            // para no saturar la visualización
            fontSize: 9,
            color: (params: { data: [number, number, number] }) =>
              params.data[2] > max_valor * 0.5
                ? "white"
                : isDark
                  ? "#E2E8F0"
                  : "#0B1F3A",
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 8,
              shadowColor: "rgba(0,0,0,0.3)",
            },
          },
          itemStyle: {
            borderColor: isDark ? "#1A1B1E" : "white",
            borderWidth: 1,
            borderRadius: 2,
          },
        },
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, odsSeleccionados, isDark]);

  // ── Handler de clic en celda ─────────────────

  const handleClick = useCallback(
    (params: { data: [number, number, number]; dataIndex: number }) => {
      if (!data) return;

      const [xIdx, yIdx, total] = params.data;
      const prov = (Array.isArray(data.provincias) ? data.provincias : [])[
        xIdx
      ];
      const odsArray = Array.isArray(data.ods) ? data.ods : [];
      const itemsFiltrados = odsSeleccionados
        ? odsArray.filter((o) => odsSeleccionados.includes(o.id))
        : odsArray;
      const odsItem = itemsFiltrados[yIdx];

      if (!prov || !odsItem) return;

      setCeldaDetalle({ ods: odsItem, provincia: prov, total });
      abrirDrawer();
    },
    [data, odsSeleccionados, abrirDrawer],
  );

  // ── Altura dinámica del gráfico ──────────────
  // Cada fila de ODS ocupa ~28px
  const odsArrayVisible = Array.isArray(data?.ods) ? data.ods : [];
  const itemsVisibles = odsSeleccionados
    ? odsArrayVisible.filter((o) => odsSeleccionados.includes(o.id))
    : odsArrayVisible;

  const alturaGrafico = Math.max(itemsVisibles.length * 30 + 180, 300);

  // ── Estados de carga y error ─────────────────

  if (isLoading) {
    return (
      <Paper p="xl" radius="xl" withBorder>
        <Stack gap="md">
          <Skeleton height={28} width="40%" />
          <Skeleton height={440} radius="md" />
        </Stack>
      </Paper>
    );
  }

  if (isError || !data) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        color="red"
        title="Error al cargar el mapa de calor"
        radius="md"
      >
        No se pudo obtener los datos. Intenta recargar la página.
      </Alert>
    );
  }

  // ── Sin datos o caché inválido ───────────────

  if (
    !data.ods ||
    !Array.isArray(data.ods) ||
    data.ods.length === 0 ||
    data.max_valor === 0
  ) {
    return (
      <Paper p="xl" radius="xl" withBorder>
        <Stack align="center" gap="md" py="xl">
          <ThemeIcon size={64} radius="xl" color="gray" variant="light">
            <IconLeaf size={32} />
          </ThemeIcon>
          <Text fw={600} c="gray.6">
            Sin datos para el mapa de calor
          </Text>
          <Text size="sm" c="dimmed" ta="center" maw={360}>
            No hay proyectos con ODS y provincias asignados. El mapa aparecerá
            cuando se registren proyectos con esta información.
          </Text>
        </Stack>
      </Paper>
    );
  }

  // ── Render principal ─────────────────────────

  return (
    <>
      <Paper p="xl" radius="xl" withBorder>
        <Stack gap="lg">
          {/* Cabecera */}
          <Group
            justify="space-between"
            align="flex-start"
            wrap="wrap"
            gap="sm"
          >
            <div>
              <Group gap="xs" mb={4}>
                <Title order={4}>Mapa de calor ODS × Provincia</Title>
                <Badge variant="light" color="blue">
                  {data.ods?.length || 0} ODS × {data.provincias?.length || 0}{" "}
                  provincias
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                Proyectos por Objetivo de Desarrollo Sostenible y provincia. Haz
                clic en cualquier celda para ver el detalle.
              </Text>
            </div>

            {/* Botón limpiar filtro ODS */}
            {odsSeleccionados && (
              <Tooltip label="Mostrar todos los ODS">
                <ActionIcon
                  variant="light"
                  color="gray"
                  onClick={() => setOdsSeleccionados(null)}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>

          {/* Leyenda rápida de ODS con filtro */}
          <ScrollArea type="hover" scrollbarSize={4}>
            <Group gap={6} wrap="nowrap" pb={4}>
              {(Array.isArray(data.ods) ? data.ods : []).map((odsItem) => {
                const activo =
                  !odsSeleccionados || odsSeleccionados.includes(odsItem.id);

                return (
                  <Tooltip
                    key={odsItem.id}
                    label={`ODS ${odsItem.numero} · ${odsItem.nombre}`}
                    position="bottom"
                    withArrow
                  >
                    <div
                      onClick={() => {
                        if (!odsSeleccionados) {
                          // Activar filtro con este ODS
                          setOdsSeleccionados([odsItem.id]);
                        } else if (odsSeleccionados.includes(odsItem.id)) {
                          // Quitar del filtro
                          const nuevo = odsSeleccionados.filter(
                            (id) => id !== odsItem.id,
                          );
                          setOdsSeleccionados(
                            nuevo.length === 0 ? null : nuevo,
                          );
                        } else {
                          // Agregar al filtro
                          setOdsSeleccionados([
                            ...odsSeleccionados,
                            odsItem.id,
                          ]);
                        }
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: activo
                          ? odsItem.color_hex
                          : isDark
                            ? "#2C2E33"
                            : "#E2E8F0",
                        color: activo
                          ? "white"
                          : isDark
                            ? "#A6A7AB"
                            : "#9CA3AF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: "pointer",
                        flexShrink: 0,
                        transition: "all 200ms ease",
                        border: activo
                          ? "none"
                          : isDark
                            ? "1px solid #373A40"
                            : "1px solid #E2E8F0",
                      }}
                    >
                      {odsItem.numero}
                    </div>
                  </Tooltip>
                );
              })}
              {odsSeleccionados && (
                <Text
                  size="xs"
                  c="dimmed"
                  style={{
                    whiteSpace: "nowrap",
                    alignSelf: "center",
                  }}
                >
                  · {odsSeleccionados.length} de {data.ods?.length || 0} ODS
                  visibles
                </Text>
              )}
            </Group>
          </ScrollArea>

          {/* Gráfica del heatmap */}
          <ReactECharts
            option={option}
            style={{ height: alturaGrafico }}
            opts={{ renderer: "canvas" }}
            onEvents={{
              click: handleClick,
            }}
          />

          {/* Nota informativa */}
          <Text size="xs" c="dimmed" ta="center">
            Haz clic en los números de ODS de arriba para filtrar filas. Clic en
            una celda para ver el detalle.
          </Text>
        </Stack>
      </Paper>

      {/* Drawer de detalle */}
      <DetalleCelda
        ods={celdaDetalle?.ods ?? null}
        provincia={celdaDetalle?.provincia ?? null}
        total={celdaDetalle?.total ?? 0}
        abierto={drawerAbierto}
        onCerrar={cerrarDrawer}
      />
    </>
  );
}
