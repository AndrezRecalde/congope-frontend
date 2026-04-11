"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Tabs,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  NumberInput,
  Button,
  Group,
  SimpleGrid,
  Text,
  Badge,
  ActionIcon,
  Paper,
  Checkbox,
  Divider,
  rem,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm, isNotEmpty } from "@mantine/form";
import { IconX, IconPlus } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useActores } from "@/queries/actores.queries";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import apiClient, { extractData } from "@/services/axios";
import type {
  Proyecto,
  CreateProyectoDto,
  Provincia,
  Ods,
  Canton,
  Parroquia,
} from "@/services/axios";
import type {
  ProyectoFormValues,
  ProvinciaFormItem,
} from "@/types/proyecto.types";
import { getColorOds } from "@/utils/colores-ods";

// ── Opciones de selects ──────────────────────────────

const ESTADOS_PROYECTO = [
  { value: "En gestión", label: "En gestión" },
  { value: "En ejecución", label: "En ejecución" },
  { value: "Finalizado", label: "Finalizado" },
  { value: "Suspendido", label: "Suspendido" },
];

const FLUJOS_DIRECCION = [
  { value: "Norte-Sur", label: "Norte-Sur" },
  { value: "Sur-Sur", label: "Sur-Sur" },
  { value: "Triangular", label: "Triangular" },
  { value: "Interna", label: "Interna" },
  { value: "Descentralizada", label: "Descentralizada" },
];

const MODALIDADES = [
  { value: "Técnica", label: "Técnica" },
  { value: "Financiera No Reembolsable", label: "Financiera No Reembolsable" },
  { value: "Financiera Reembolsable", label: "Financiera Reembolsable" },
  { value: "En Especies", label: "En Especies" },
];

const ROLES_PROVINCIA = [
  { value: "Líder", label: "Líder" },
  { value: "Co-ejecutora", label: "Co-ejecutora" },
  { value: "Beneficiaria", label: "Beneficiaria" },
];

const MONEDAS = [
  { value: "USD", label: "USD — Dólar americano" },
  { value: "EUR", label: "EUR — Euro" },
];

// ── Props del componente ─────────────────────────────

interface ProyectoFormProps {
  proyecto?: Proyecto;
  onSubmit: (datos: CreateProyectoDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProyectoForm({
  proyecto,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProyectoFormProps) {
  const esEdicion = !!proyecto;
  const [tabActiva, setTabActiva] = useState<string | null>("general");

  // Cargar datos para los selects desde la API
  const { data: actoresData } = useActores({ per_page: 100 });
  const { data: provinciasData } = useQuery({
    queryKey: queryKeys.provincias.list,
    queryFn: async () => {
      const res = await apiClient.get("/provincias");
      return extractData<Provincia[]>(res);
    },
    staleTime: Infinity, // catálogo estático
  });
  const { data: odsData } = useQuery({
    queryKey: queryKeys.ods.list,
    queryFn: async () => {
      const res = await apiClient.get("/ods");
      return extractData<Ods[]>(res);
    },
    staleTime: Infinity, // catálogo estático
  });
  const { data: cantonesDataRaw } = useQuery({
    queryKey: queryKeys.cantones.list({ per_page: 1000 }),
    queryFn: async () => {
      const res = await apiClient.get("/cantones", {
        params: { per_page: 1000 },
      });
      return extractData<Canton[]>(res);
    },
    staleTime: Infinity,
  });
  const { data: parroquiasDataRaw } = useQuery({
    queryKey: queryKeys.parroquias.list({ per_page: 1000 }),
    queryFn: async () => {
      const res = await apiClient.get("/parroquias", {
        params: { per_page: 1000 },
      });
      return extractData<Parroquia[]>(res);
    },
    staleTime: Infinity,
  });

  // Transformar para los selects
  const opcionesActores = useMemo(() => {
    return (actoresData?.data ?? []).map((a) => ({
      value: a.id,
      label: `${a.nombre} (${a.tipo})`,
    }));
  }, [actoresData]);

  const opcionesProvincias = useMemo(() => {
    return (provinciasData ?? []).map((p) => ({
      value: p.id,
      label: p.nombre,
    }));
  }, [provinciasData]);

  const odsDisponibles = odsData ?? [];

  // Provincias seleccionadas con su rol y datos
  const [provinciasSeleccionadas, setProvinciasSeleccionadas] = useState<
    ProvinciaFormItem[]
  >(
    proyecto?.provincias?.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      rol: p.rol ?? "Beneficiaria",
      porcentaje_avance: p.porcentaje_avance ?? null,
      beneficiarios_directos: p.beneficiarios_directos ?? null,
      beneficiarios_indirectos: p.beneficiarios_indirectos ?? null,
    })) ?? [],
  );

  const form = useForm<ProyectoFormValues>({
    initialValues: {
      nombre: proyecto?.nombre ?? "",
      actor_id: proyecto?.actor?.id ?? "",
      estado: proyecto?.estado ?? "En gestión",
      codigo: proyecto?.codigo ?? "",
      descripcion: proyecto?.descripcion ?? "",
      // monto_total viene como string del API → convertir a number
      monto_total: proyecto?.monto_total
        ? parseFloat(proyecto.monto_total)
        : "",
      moneda: proyecto?.moneda ?? "USD",
      sector_tematico: proyecto?.sector_tematico ?? "",
      flujo_direccion: proyecto?.flujo_direccion ?? "",
      modalidad_cooperacion: proyecto?.modalidad_cooperacion ?? [],
      fecha_inicio: proyecto?.fecha_inicio ?? "",
      fecha_fin_planificada: proyecto?.fecha_fin_planificada ?? "",
      fecha_fin_real: proyecto?.fecha_fin_real ?? "",
      provincias: [],
      ods_ids: proyecto?.ods?.map((o) => o.id) ?? [],
      canton_ids: proyecto?.cantones?.map((c) => c.id) ?? [],
      parroquia_ids: proyecto?.parroquias?.map((p) => p.id) ?? [],
      ubicaciones:
        proyecto?.ubicaciones?.map((u) => ({
          nombre: u.nombre ?? "",
          lat: u.coordenadas?.lat ?? "",
          lng: u.coordenadas?.lng ?? "",
        })) ?? [],
    },
    validate: {
      nombre: isNotEmpty("El nombre es requerido"),
      actor_id: isNotEmpty("Selecciona el actor cooperante"),
      estado: isNotEmpty("Selecciona el estado"),
      monto_total: (v) =>
        v === "" || v === undefined
          ? "El monto total es requerido"
          : Number(v) < 0
            ? "El monto no puede ser negativo"
            : null,
      moneda: isNotEmpty("La moneda es requerida"),
      sector_tematico: isNotEmpty("El sector temático es requerido"),
      fecha_inicio: isNotEmpty("La fecha de inicio es requerida"),
      fecha_fin_planificada: (value, values) => {
        if (!value) return "La fecha de fin planificada es requerida";
        if (values.fecha_inicio && value < values.fecha_inicio)
          return "Debe ser posterior a la fecha de inicio";
        return null;
      },
    },
  });

  // Añadir una provincia a la selección
  const agregarProvincia = (provinciaId: string) => {
    const provincia = (provinciasData ?? []).find((p) => p.id === provinciaId);
    if (!provincia) return;
    if (provinciasSeleccionadas.find((p) => p.id === provinciaId)) return;

    setProvinciasSeleccionadas((prev) => [
      ...prev,
      {
        id: provincia.id,
        nombre: provincia.nombre,
        rol: "Beneficiaria",
        porcentaje_avance: null,
        beneficiarios_directos: null,
        beneficiarios_indirectos: null,
      },
    ]);
  };

  const cantonesArr = cantonesDataRaw ?? [];
  const parroquiasArr = parroquiasDataRaw ?? [];

  // OPTIMIZACIÓN DE RENDIMIENTO EXTREMO: 
  // 1. Pre-calcular el sort y los diccionarios O(1) una sola vez (evita iterar millones de veces al tipear).
  const todosCantonesMapeados = useMemo(() => {
    const diccProvincias = new Map((provinciasData ?? []).map(p => [p.id, p.nombre]));
    return cantonesArr
      .map((c) => {
        const provNombre = diccProvincias.get(c.provincia_id) ?? "";
        const prefix = provNombre ? `[${provNombre}]: ` : "";
        return { ...c, provNombre, mappedValue: { value: c.id, label: `${prefix}${c.nombre}` } };
      })
      .sort((a, b) => {
        const provCompare = a.provNombre.localeCompare(b.provNombre);
        if (provCompare !== 0) return provCompare;
        return a.nombre.localeCompare(b.nombre);
      });
  }, [cantonesArr, provinciasData]);

  const todasParroquiasMapeadas = useMemo(() => {
    const diccCantones = new Map(cantonesArr.map(c => [c.id, c.nombre]));
    return parroquiasArr
      .map((p) => {
        const cantonNombre = diccCantones.get(p.canton_id) ?? "";
        const prefix = cantonNombre ? `[${cantonNombre}]: ` : "";
        return { ...p, cantonNombre, mappedValue: { value: p.id, label: `${prefix}${p.nombre}` } };
      })
      .sort((a, b) => {
        const cantCompare = a.cantonNombre.localeCompare(b.cantonNombre);
        if (cantCompare !== 0) return cantCompare;
        return a.nombre.localeCompare(b.nombre);
      });
  }, [parroquiasArr, cantonesArr]);

  // Usamos strings de dependencias (join) para garantizar validación por valor (evita referencias inestables del useForm)
  const provIdsJoin = provinciasSeleccionadas.map(p => p.id).join(',');
  const cantonIdsJoin = form.values.canton_ids.join(',');

  const opcionesCantones = useMemo(() => {
    const provIds = provIdsJoin ? provIdsJoin.split(',') : [];
    return todosCantonesMapeados
      .filter((c) => {
        if (!c.provincia_id || provIds.length === 0) return true;
        return provIds.includes(c.provincia_id);
      })
      .map(c => c.mappedValue);
  }, [todosCantonesMapeados, provIdsJoin]);

  const opcionesParroquias = useMemo(() => {
    const cantIds = cantonIdsJoin ? cantonIdsJoin.split(',') : [];
    return todasParroquiasMapeadas
      .filter((p) => {
        if (!p.canton_id || cantIds.length === 0) return true;
        return cantIds.includes(p.canton_id);
      })
      .map(p => p.mappedValue);
  }, [todasParroquiasMapeadas, cantonIdsJoin]);

  const quitarProvincia = (provinciaId: string) => {
    setProvinciasSeleccionadas((prev) =>
      prev.filter((p) => p.id !== provinciaId),
    );
  };

  const actualizarProvincia = (
    provinciaId: string,
    campo: keyof ProvinciaFormItem,
    valor: unknown,
  ) => {
    setProvinciasSeleccionadas((prev) =>
      prev.map((p) => (p.id === provinciaId ? { ...p, [campo]: valor } : p)),
    );
  };

  // Toggle de ODS
  const toggleOds = (odsId: number) => {
    const actuales = form.values.ods_ids;
    if (actuales.includes(odsId)) {
      form.setFieldValue(
        "ods_ids",
        actuales.filter((id) => id !== odsId),
      );
    } else {
      form.setFieldValue("ods_ids", [...actuales, odsId]);
    }
  };

  const handleSubmit = (values: ProyectoFormValues) => {
    const dto: CreateProyectoDto = {
      nombre: values.nombre,
      actor_id: values.actor_id,
      estado: values.estado,
      monto_total: Number(values.monto_total),
      moneda: values.moneda,
      sector_tematico: values.sector_tematico,
      fecha_inicio: values.fecha_inicio,
      fecha_fin_planificada: values.fecha_fin_planificada,
      // Opcionales
      codigo: values.codigo || undefined,
      descripcion: values.descripcion || undefined,
      flujo_direccion: (values.flujo_direccion ||
        null) as CreateProyectoDto["flujo_direccion"],
      modalidad_cooperacion:
        values.modalidad_cooperacion.length > 0
          ? (values.modalidad_cooperacion as CreateProyectoDto["modalidad_cooperacion"])
          : undefined,
      fecha_fin_real: values.fecha_fin_real || undefined,
      // Provincias con sus datos de pivot
      provincias:
        provinciasSeleccionadas.length > 0
          ? provinciasSeleccionadas.map((p) => ({
              id: p.id,
              rol: p.rol,
              porcentaje_avance: p.porcentaje_avance ?? undefined,
              beneficiarios_directos: p.beneficiarios_directos ?? undefined,
              beneficiarios_indirectos: p.beneficiarios_indirectos ?? undefined,
            }))
          : undefined,
      canton_ids: values.canton_ids?.length > 0 ? values.canton_ids : undefined,
      parroquia_ids:
        values.parroquia_ids?.length > 0 ? values.parroquia_ids : undefined,
      ubicaciones:
        values.ubicaciones?.length > 0
          ? values.ubicaciones
              .filter((u) => u.lat !== "" && u.lng !== "")
              .map((u) => ({
                nombre: u.nombre || undefined,
                lat: Number(u.lat),
                lng: Number(u.lng),
              }))
          : undefined,
      ods_ids: values.ods_ids.length > 0 ? values.ods_ids : undefined,
    };
    onSubmit(dto);
  };

  const handleErrors = (errors: typeof form.errors) => {
    // Si hay errores en campos de la pestaña general, saltar ahí
    if (
      errors.nombre ||
      errors.actor_id ||
      errors.estado ||
      errors.monto_total ||
      errors.moneda ||
      errors.sector_tematico ||
      errors.fecha_inicio ||
      errors.fecha_fin_planificada
    ) {
      setTabActiva("general");
    }
    // NOTA: Agregar más condicionales si se añaden validaciones a otras pestañas
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit, handleErrors)} noValidate>
      <Tabs value={tabActiva} onChange={setTabActiva} mb="md">
        <Tabs.List>
          <Tabs.Tab value="general">Datos generales</Tabs.Tab>
          <Tabs.Tab value="provincias">Ubicación Geográfica</Tabs.Tab>
          <Tabs.Tab value="ods">ODS ({form.values.ods_ids.length})</Tabs.Tab>
        </Tabs.List>

        {/* ── TAB 1: Datos generales ── */}
        <Tabs.Panel value="general" pt="md">
          <Stack gap="md">
            <TextInput
              label="Nombre del proyecto"
              placeholder="Nombre completo del proyecto"
              required
              {...form.getInputProps("nombre")}
            />

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label="Código"
                placeholder="PRJ-2025-001 (auto-generado si se deja vacío)"
                {...form.getInputProps("codigo")}
              />
              <Select
                label="Estado"
                data={ESTADOS_PROYECTO}
                required
                {...form.getInputProps("estado")}
              />
            </SimpleGrid>

            <Select
              label="Actor cooperante"
              placeholder="Seleccionar organización"
              data={opcionesActores}
              required
              searchable
              {...form.getInputProps("actor_id")}
            />

            <Textarea
              label="Descripción"
              placeholder="Descripción general del proyecto..."
              rows={3}
              {...form.getInputProps("descripcion")}
            />

            <Divider
              label={
                <Text
                  size="xs"
                  fw={600}
                  c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: "0.05em" }}
                >
                  Información financiera
                </Text>
              }
              labelPosition="left"
            />

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <NumberInput
                label="Monto total"
                placeholder="0.00"
                required
                min={0}
                decimalScale={2}
                thousandSeparator=","
                leftSection={
                  <Text size="sm" c="dimmed">
                    $
                  </Text>
                }
                {...form.getInputProps("monto_total")}
              />
              <Select
                label="Moneda"
                data={MONEDAS}
                required
                {...form.getInputProps("moneda")}
              />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Select
                label="Flujo de cooperación"
                placeholder="Seleccionar flujo"
                data={FLUJOS_DIRECCION}
                clearable
                {...form.getInputProps("flujo_direccion")}
              />
              <TextInput
                label="Sector temático"
                placeholder="Ej: Saneamiento Ambiental"
                required
                {...form.getInputProps("sector_tematico")}
              />
            </SimpleGrid>

            <MultiSelect
              label="Modalidad de cooperación"
              data={MODALIDADES}
              placeholder="Seleccionar modalidades"
              {...form.getInputProps("modalidad_cooperacion")}
            />

            <Divider
              label={
                <Text
                  size="xs"
                  fw={600}
                  c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: "0.05em" }}
                >
                  Fechas
                </Text>
              }
              labelPosition="left"
            />

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <TextInput
                label="Fecha de inicio"
                type="date"
                required
                {...form.getInputProps("fecha_inicio")}
              />
              <TextInput
                label="Fecha fin planificada"
                type="date"
                required
                {...form.getInputProps("fecha_fin_planificada")}
              />
              <TextInput
                label="Fecha fin real"
                type="date"
                description="Solo si el proyecto ya finalizó"
                {...form.getInputProps("fecha_fin_real")}
              />
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>

        {/* ── TAB 2: Provincias ── */}
        <Tabs.Panel value="provincias" pt="md">
          <Stack gap="md">
            <Select
              label="Agregar provincia"
              placeholder="Buscar y seleccionar provincia"
              data={opcionesProvincias.filter(
                (op) => !provinciasSeleccionadas.find((p) => p.id === op.value),
              )}
              searchable
              clearable
              onChange={(val) => {
                if (val) agregarProvincia(val);
              }}
              value={null}
            />

            {provinciasSeleccionadas.length === 0 && (
              <Text size="sm" c="dimmed" ta="center" py="md">
                Agrega las provincias que participan en el proyecto
              </Text>
            )}

            {provinciasSeleccionadas.map((prov) => (
              <Paper
                key={prov.id}
                p="md"
                radius="md"
                style={{
                  border: "1px solid var(--mantine-color-gray-3)",
                }}
              >
                <Group justify="space-between" mb="sm">
                  <Text fw={600} size="md">
                    {prov.nombre}
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => quitarProvincia(prov.id)}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                  <Select
                    label="Rol en el proyecto"
                    size="sm"
                    data={ROLES_PROVINCIA}
                    value={prov.rol}
                    onChange={(val) =>
                      actualizarProvincia(prov.id, "rol", val ?? "Beneficiaria")
                    }
                  />
                  <NumberInput
                    label="% Avance"
                    size="sm"
                    min={0}
                    max={100}
                    suffix="%"
                    value={prov.porcentaje_avance ?? ""}
                    onChange={(val) =>
                      actualizarProvincia(
                        prov.id,
                        "porcentaje_avance",
                        val === "" ? null : Number(val),
                      )
                    }
                  />
                  <NumberInput
                    label="Beneficiarios directos"
                    size="sm"
                    min={0}
                    thousandSeparator=","
                    value={prov.beneficiarios_directos ?? ""}
                    onChange={(val) =>
                      actualizarProvincia(
                        prov.id,
                        "beneficiarios_directos",
                        val === "" ? null : Number(val),
                      )
                    }
                  />
                  <NumberInput
                    label="Beneficiarios indirectos"
                    size="sm"
                    min={0}
                    thousandSeparator=","
                    value={prov.beneficiarios_indirectos ?? ""}
                    onChange={(val) =>
                      actualizarProvincia(
                        prov.id,
                        "beneficiarios_indirectos",
                        val === "" ? null : Number(val),
                      )
                    }
                  />
                </SimpleGrid>
              </Paper>
            ))}

            <Divider
              my="md"
              label={
                <Text
                  size="xs"
                  fw={600}
                  c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: "0.05em" }}
                >
                  Cantones y Parroquias
                </Text>
              }
              labelPosition="left"
            />
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <MultiSelect
                label="Cantones"
                placeholder="Selecciona cantones..."
                data={opcionesCantones}
                searchable
                clearable
                {...form.getInputProps("canton_ids")}
              />
              <MultiSelect
                label="Parroquias"
                placeholder="Selecciona parroquias..."
                data={opcionesParroquias}
                searchable
                clearable
                {...form.getInputProps("parroquia_ids")}
              />
            </SimpleGrid>

            <Divider
              my="md"
              label={
                <Text
                  size="xs"
                  fw={600}
                  c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: "0.05em" }}
                >
                  Ubicaciones Específicas / Georreferenciación
                </Text>
              }
              labelPosition="left"
            />
            <Stack gap="xs">
              {form.values.ubicaciones.map((ub, idx) => (
                <Group key={idx} align="flex-end" mb="xs" wrap="nowrap">
                  <TextInput
                    label="Nombre / Recinto"
                    placeholder="Ej: Comunidad X"
                    style={{ flex: 2 }}
                    withAsterisk={false}
                    {...form.getInputProps(`ubicaciones.${idx}.nombre`)}
                  />
                  <NumberInput
                    label="Latitud"
                    placeholder="-1.234567"
                    decimalScale={6}
                    style={{ flex: 1 }}
                    withAsterisk={false}
                    {...form.getInputProps(`ubicaciones.${idx}.lat`)}
                  />
                  <NumberInput
                    label="Longitud"
                    placeholder="-78.123456"
                    decimalScale={6}
                    style={{ flex: 1 }}
                    withAsterisk={false}
                    {...form.getInputProps(`ubicaciones.${idx}.lng`)}
                  />
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    size="lg"
                    mb={4}
                    onClick={() => form.removeListItem("ubicaciones", idx)}
                  >
                    <IconX size={18} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
            <Group justify="flex-start" mt="xs">
              <Button
                variant="outline"
                color="congope"
                size="xs"
                leftSection={<IconPlus size={14} />}
                onClick={() =>
                  form.insertListItem("ubicaciones", {
                    nombre: "",
                    lat: "",
                    lng: "",
                  })
                }
              >
                Añadir Ubicación
              </Button>
            </Group>
          </Stack>
        </Tabs.Panel>

        {/* ── TAB 3: ODS ── */}
        <Tabs.Panel value="ods" pt="md">
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Selecciona los Objetivos de Desarrollo Sostenible alineados con
              este proyecto.
            </Text>
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
              {odsDisponibles.map((ods) => {
                const seleccionado = form.values.ods_ids.includes(ods.id);
                return (
                  <Paper
                    key={ods.id}
                    p="sm"
                    radius="md"
                    onClick={() => toggleOds(ods.id)}
                    style={{
                      cursor: "pointer",
                      border: seleccionado
                        ? `2px solid ${getColorOds(ods.numero)}`
                        : "2px solid var(--mantine-color-gray-3)",
                      background: seleccionado
                        ? `${getColorOds(ods.numero)}15`
                        : "white",
                      transition: "all 150ms ease",
                    }}
                  >
                    <Group gap="xs">
                      <Badge
                        size="sm"
                        circle
                        style={{
                          background: getColorOds(ods.numero),
                          color: "white",
                          minWidth: 24,
                          flexShrink: 0,
                        }}
                      >
                        {ods.numero}
                      </Badge>
                      <Text size="xs" fw={seleccionado ? 600 : 400} lh={1.3}>
                        {ods.nombre}
                      </Text>
                    </Group>
                  </Paper>
                );
              })}
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Botones de acción */}
      <Group
        justify="space-between"
        pt="md"
        style={{
          borderTop: "1px solid var(--mantine-color-gray-3)",
        }}
      >
        <Group gap="sm">
          {tabActiva !== "general" && (
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() =>
                setTabActiva(
                  tabActiva === "provincias" ? "general" : "provincias",
                )
              }
            >
              ← Anterior
            </Button>
          )}
          {tabActiva !== "ods" && (
            <Button
              variant="outline"
              color="congope"
              size="sm"
              onClick={() =>
                setTabActiva(tabActiva === "general" ? "provincias" : "ods")
              }
            >
              Siguiente →
            </Button>
          )}
        </Group>
        <Group gap="sm">
          <Button
            variant="subtle"
            color="gray"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" color="congope" loading={isLoading}>
            {esEdicion ? "Guardar cambios" : "Crear proyecto"}
          </Button>
        </Group>
      </Group>
    </form>
  );
}
