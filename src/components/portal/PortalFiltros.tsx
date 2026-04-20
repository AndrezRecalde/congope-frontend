"use client";

import { useState, useEffect } from "react";
import {
  TextInput,
  Select,
  Button,
  ActionIcon,
  Collapse,
  Text,
  Divider,
  Group,
  Stack,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconSearch,
  IconX,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";
import type { OpcionesFiltro } from "@/services/portal.service";

// ── Tipos ───────────────────────────────────────

interface FiltrosPortal {
  provincia_id: string;
  canton_id: string;
  actor_id: string;
  search: string;
}

interface FiltrosPortalProps {
  opciones: OpcionesFiltro;
  filtrosAplicados: FiltrosPortal;
  onBuscar: (filtros: FiltrosPortal) => void;
  onLimpiar: () => void;
  hayFiltros: boolean;
  cargando: boolean;
  totalPins: number;
}

// ── Componente ───────────────────────────────────

export function PortalFiltros({
  opciones,
  filtrosAplicados,
  onBuscar,
  onLimpiar,
  hayFiltros,
  cargando,
  totalPins,
}: FiltrosPortalProps) {
  const [abierto, setAbierto] = useState(true);

  // Usamos el hook de formulario de Mantine
  const form = useForm<FiltrosPortal>({
    initialValues: filtrosAplicados,
  });

  // Si los filtros aplicados cambian desde afuera, sincronizamos el form
  useEffect(() => {
    form.setInitialValues(filtrosAplicados);
    form.setValues(filtrosAplicados);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtrosAplicados]);

  // Cantones filtrados por provincia seleccionada en el formulario
  const cantonesFiltrados = form.values.provincia_id
    ? opciones.cantones.filter(
        (c) => c.provincia_id === form.values.provincia_id,
      )
    : opciones.cantones;

  // Detectar si el formulario difiere de lo aplicado
  const tieneCambiosPendientes = form.isDirty();

  // ── Handlers ────────────────────────────────

  const handleCambioProvincia = (valor: string | null) => {
    form.setFieldValue("provincia_id", valor || "");
    form.setFieldValue("canton_id", ""); // resetear cantón
  };

  const handleBuscar = form.onSubmit((values) => {
    onBuscar(values);
  });

  const handleLimpiar = () => {
    form.setValues({
      provincia_id: "",
      canton_id: "",
      actor_id: "",
      search: "",
    });
    onLimpiar();
  };

  // ── Render ───────────────────────────────────

  return (
    <Box
      style={{
        position: "absolute",
        top: 80,
        left: 24,
        zIndex: 20,
        width: 300,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(12px)",
        borderRadius: 16,
        boxShadow: "0 8px 40px rgba(11,31,58,0.25)",
        border: "1px solid rgba(201,168,76,0.3)",
        overflow: "hidden",
        transition: "transform 300ms ease",
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      {/* ── Cabecera del panel ── */}
      <Box
        style={{
          padding: "14px 18px 12px",
          borderBottom: abierto ? "1px solid rgba(11,31,58,0.08)" : "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background:
            "linear-gradient(135deg," +
            "rgba(11,31,58,0.04) 0%," +
            "rgba(201,168,76,0.04) 100%)",
        }}
      >
        <Box>
          <Text
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--portal-navy)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Explorar proyectos
          </Text>

          {/* Estado de resultados */}
          {hayFiltros && !cargando && (
            <Text
              style={{
                fontSize: 11,
                marginTop: 2,
                color: totalPins > 0 ? "var(--portal-blue)" : "#EF4444",
              }}
            >
              {totalPins > 0
                ? `${totalPins} proyecto${totalPins !== 1 ? "s" : ""} en el mapa`
                : "Sin resultados"}
              {filtrosAplicados.search && (
                <Text
                  span
                  style={{
                    color: "var(--portal-slate)",
                    opacity: 0.7,
                  }}
                >
                  {` · "${filtrosAplicados.search}"`}
                </Text>
              )}
            </Text>
          )}

          {/* Indicador de carga */}
          {cargando && (
            <Text
              style={{
                fontSize: 11,
                color: "var(--portal-slate)",
                opacity: 0.6,
                marginTop: 2,
              }}
            >
              Buscando...
            </Text>
          )}
        </Box>

        {/* Toggle colapsar */}
        <ActionIcon
          variant="transparent"
          color="gray"
          onClick={() => setAbierto((v) => !v)}
          title={abierto ? "Colapsar" : "Expandir"}
          style={{ color: "var(--portal-slate)" }}
        >
          {abierto ? (
            <IconChevronUp size={18} />
          ) : (
            <IconChevronDown size={18} />
          )}
        </ActionIcon>
      </Box>

      {/* ── Cuerpo del panel (colapsable) ── */}
      <Collapse in={abierto}>
        <form onSubmit={handleBuscar}>
          <Stack gap={12} p="16px 18px 18px">
            {/* ── Input de búsqueda por texto ── */}
            <TextInput
              label="Buscar proyecto"
              placeholder="Nombre, código o sector..."
              leftSection={<IconSearch size={14} opacity={0.6} />}
              rightSection={
                form.values.search ? (
                  <ActionIcon
                    variant="transparent"
                    color="gray"
                    onClick={() => form.setFieldValue("search", "")}
                    title="Limpiar texto"
                  >
                    <IconX size={14} opacity={0.6} />
                  </ActionIcon>
                ) : null
              }
              {...form.getInputProps("search")}
            />

            {/* ── Separador ── */}
            <Divider color="rgba(11,31,58,0.07)" />

            {/* ── Select Provincia ── */}
            <Select
              label="Provincia"
              placeholder="Todas las provincias"
              data={opciones.provincias.map((p) => ({
                value: p.value,
                label: p.label,
              }))}
              clearable
              searchable
              {...form.getInputProps("provincia_id")}
              value={form.values.provincia_id || null}
              onChange={handleCambioProvincia}
            />

            {/* ── Select Cantón ── */}
            <Select
              label="Cantón"
              placeholder={
                form.values.provincia_id
                  ? "Todos los cantones"
                  : "Primero selecciona una provincia"
              }
              data={cantonesFiltrados.map((c) => ({
                value: c.value,
                label: c.label,
              }))}
              clearable
              searchable
              disabled={!form.values.provincia_id}
              {...form.getInputProps("canton_id")}
              value={form.values.canton_id || null}
            />

            {/* ── Select Actor ── */}
            <Select
              label="Actor Cooperante"
              placeholder="Todos los actores"
              data={opciones.actores.map((a) => ({
                value: a.value,
                label: a.label,
              }))}
              clearable
              searchable
              {...form.getInputProps("actor_id")}
              value={form.values.actor_id || null}
            />

            {/* ── Indicador de cambios pendientes ── */}
            {tieneCambiosPendientes && !cargando && (
              <Text
                style={{
                  fontSize: 11,
                  color: "var(--portal-slate)",
                  opacity: 0.6,
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                Presiona Buscar para aplicar los filtros
              </Text>
            )}

            {/* ── BOTÓN PRINCIPAL: Buscar ── */}
            <Button
              type="submit"
              disabled={cargando}
              loading={cargando}
              leftSection={!cargando && <IconSearch size={16} />}
              style={{
                width: "100%",
                padding: "11px 16px",
                height: "auto",
                background: tieneCambiosPendientes
                  ? "var(--portal-navy)"
                  : "var(--portal-blue)",
                color: "white",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "var(--font-dm-sans)",
                letterSpacing: "0.04em",
                transition: "all 200ms ease",
                boxShadow: tieneCambiosPendientes
                  ? "0 4px 14px rgba(11,31,58,0.3)"
                  : "none",
              }}
            >
              Buscar en el mapa
            </Button>

            {/* Hint Enter */}
            {!cargando && (
              <Text
                style={{
                  fontSize: 10,
                  color: "var(--portal-slate)",
                  opacity: 0.4,
                  textAlign: "center",
                }}
              >
                También puedes presionar Enter en el buscador
              </Text>
            )}

            {/* ── Botón secundario: Limpiar ── */}
            {(hayFiltros || tieneCambiosPendientes) && (
              <Button
                variant="outline"
                color="gray"
                onClick={handleLimpiar}
                disabled={cargando}
                leftSection={<IconX size={14} />}
                style={{
                  border: "1px solid rgba(11,31,58,0.15)",
                  borderRadius: 10,
                  height: "auto",
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--portal-slate)",
                  letterSpacing: "0.02em",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                Limpiar todos los filtros
              </Button>
            )}
          </Stack>
        </form>
      </Collapse>

      {/* ── Leyenda de estados ── */}
      <Box
        style={{
          padding: "10px 18px",
          borderTop: "1px solid rgba(11,31,58,0.07)",
          background: "rgba(11,31,58,0.02)",
        }}
      >
        <Text
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--portal-slate)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Estado del proyecto
        </Text>
        <Group gap="10px">
          {LEYENDA_ESTADOS.map(({ estado, color }) => (
            <Group key={estado} gap={5}>
              <Box
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: color,
                  border: "1.5px solid white",
                  boxShadow: `0 1px 3px ${color}50`,
                  flexShrink: 0,
                }}
              />
              <Text style={{ fontSize: 10, color: "var(--portal-slate)" }}>
                {estado}
              </Text>
            </Group>
          ))}
        </Group>
      </Box>
    </Box>
  );
}

const LEYENDA_ESTADOS = [
  { estado: "En gestión", color: "#F59E0B" },
  { estado: "En ejecución", color: "#3B82F6" },
  { estado: "Finalizado", color: "#10B981" },
  { estado: "Suspendido", color: "#EF4444" },
];
