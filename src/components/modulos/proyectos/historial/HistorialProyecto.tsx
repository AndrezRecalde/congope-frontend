"use client";

import { useState } from "react";
import {
  Stack,
  Text,
  Badge,
  Group,
  Avatar,
  Skeleton,
  Paper,
  Pagination,
  Center,
  ThemeIcon,
  Collapse,
  ActionIcon,
  Tooltip,
  Divider,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconWorld,
  IconRefresh,
  IconChevronDown,
  IconChevronUp,
  IconUser,
  IconFlag,
  IconTrophy,
  IconFolder,
  IconFile,
  IconLeaf,
  IconMapPin,
  IconHistory,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { DiferenciasCambio } from "./DiferenciasCambio";
import { useHistorialProyecto } from "@/queries/proyectos.queries";
import { COLOR_ACCION_HISTORIAL } from "@/types/historial.types";
import type { RegistroHistorial } from "@/types/historial.types";

// Registrar los plugins de dayjs
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.locale("es");

// Ícono según la entidad del registro
function IconoEntidad({ entidad }: { entidad: string }) {
  const iconos: Record<string, React.ComponentType<{ size?: number }>> = {
    Proyecto: IconFolder,
    Hito: IconFlag,
    Emblemático: IconTrophy,
    Documento: IconFile,
    ODS: IconLeaf,
    Provincia: IconMapPin,
  };

  const Icono = iconos[entidad] ?? IconFolder;
  return <Icono size={14} />;
}

// Ícono según la acción
function IconoAccion({ accion }: { accion: string }) {
  const iconos: Record<string, React.ComponentType<{ size?: number }>> = {
    crear: IconPlus,
    editar: IconEdit,
    eliminar: IconTrash,
    publicar: IconWorld,
    restaurar: IconRefresh,
  };

  const Icono = iconos[accion] ?? IconEdit;
  return <Icono size={12} />;
}

// Tarjeta individual de un registro de historial
function RegistroCard({ registro }: { registro: RegistroHistorial }) {
  const [expandido, setExpandido] = useState(false);
  const color = COLOR_ACCION_HISTORIAL[registro.accion] ?? "gray";

  // Parsear la fecha con el formato específico del endpoint de auditoría
  const fecha = dayjs(registro.created_at, "YYYY-MM-DD HH:mm:ss");
  const fechaRelativa = fecha.isValid() ? fecha.fromNow() : registro.created_at;
  const fechaCompleta = fecha.isValid()
    ? fecha.format("DD/MM/YYYY [a las] HH:mm")
    : registro.created_at;

  // Tiene detalles para expandir
  const tieneDetalles =
    !!registro.valores_anteriores || !!registro.valores_nuevos;

  return (
    <Paper
      p="md"
      radius="md"
      style={{
        border: `1px solid light-dark(var(--mantine-color-${color}-2), var(--mantine-color-${color}-9))`,
        background: `var(--mantine-color-${color}-light)`,
        transition: "box-shadow 200ms ease",
      }}
    >
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        {/* Lado izquierdo: ícono + info */}
        <Group gap="sm" wrap="nowrap" align="flex-start" style={{ flex: 1 }}>
          {/* Indicador de acción */}
          <ThemeIcon
            size={36}
            radius="md"
            color={color}
            variant="light"
            style={{ flexShrink: 0, marginTop: 2 }}
          >
            <IconoAccion accion={registro.accion} />
          </ThemeIcon>

          <Stack gap={4} style={{ flex: 1 }}>
            {/* Línea principal */}
            <Group gap="xs" wrap="wrap">
              <Badge
                size="xs"
                color={color}
                variant="filled"
                leftSection={<IconoAccion accion={registro.accion} />}
              >
                {registro.accion}
              </Badge>
              <Badge
                size="xs"
                color="gray"
                variant="light"
                leftSection={<IconoEntidad entidad={registro.entidad} />}
              >
                {registro.entidad}
              </Badge>
            </Group>

            {/* Quién hizo el cambio */}
            {registro.usuario && (
              <Group gap="xs">
                <Avatar size={18} radius="xl" color="congope" variant="light">
                  <IconUser size={10} />
                </Avatar>
                <Text size="xs" c="dimmed">
                  {registro.usuario.name}
                </Text>
              </Group>
            )}

            {/* Detalles expandibles */}
            <Collapse in={expandido && tieneDetalles}>
              <div style={{ marginTop: 8 }}>
                <Divider mb="sm" />
                <DiferenciasCambio
                  accion={registro.accion}
                  valoresAnteriores={registro.valores_anteriores}
                  valoresNuevos={registro.valores_nuevos}
                />
              </div>
            </Collapse>
          </Stack>
        </Group>

        {/* Lado derecho: fecha + botón expandir */}
        <Stack gap={4} align="flex-end" style={{ flexShrink: 0 }}>
          <Tooltip label={fechaCompleta} position="left">
            <Text size="xs" c="dimmed" style={{ cursor: "default" }}>
              {fechaRelativa}
            </Text>
          </Tooltip>

          {tieneDetalles && (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => setExpandido((v) => !v)}
            >
              {expandido ? (
                <IconChevronUp size={13} />
              ) : (
                <IconChevronDown size={13} />
              )}
            </ActionIcon>
          )}
        </Stack>
      </Group>
    </Paper>
  );
}

// ── Componente principal ────────────────────────

interface HistorialProyectoProps {
  proyectoId: string;
}

export function HistorialProyecto({ proyectoId }: HistorialProyectoProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useHistorialProyecto(proyectoId, page);

  const registros = data?.data ?? [];
  const meta = data?.meta;

  // ── Estado de carga ──
  if (isLoading) {
    return (
      <Stack gap="sm">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} height={72} radius="md" />
        ))}
      </Stack>
    );
  }

  // ── Estado de error ──
  if (isError) {
    return (
      <Center py="xl">
        <Stack align="center" gap="sm">
          <ThemeIcon size={48} radius="xl" color="red" variant="light">
            <IconHistory size={24} />
          </ThemeIcon>
          <Text size="sm" c="dimmed" ta="center">
            No se pudo cargar el historial.
            <br />
            Intenta recargar la página.
          </Text>
        </Stack>
      </Center>
    );
  }

  // ── Sin registros ──
  if (registros.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="sm">
          <ThemeIcon size={56} radius="xl" color="gray" variant="light">
            <IconHistory size={28} />
          </ThemeIcon>
          <Text fw={600} c="dimmed">
            Sin registros en el historial
          </Text>
          <Text size="sm" c="dimmed" ta="center" maw={320}>
            Los cambios que se realicen en este proyecto quedarán registrados
            aquí.
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="md">
      {/* Contador total */}
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {meta?.total ?? registros.length} cambio
          {(meta?.total ?? registros.length) !== 1 ? "s" : ""} registrados
        </Text>
        <Text size="xs" c="dimmed">
          Más reciente primero
        </Text>
      </Group>

      {/* Lista de registros */}
      <Stack gap="sm">
        {registros.map((registro) => (
          <RegistroCard key={registro.id} registro={registro} />
        ))}
      </Stack>

      {/* Paginación */}
      {meta && meta.last_page > 1 && (
        <Center pt="sm">
          <Pagination
            total={meta.last_page}
            value={page}
            onChange={setPage}
            size="sm"
            color="congope"
          />
        </Center>
      )}
    </Stack>
  );
}
