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
  Divider,
} from "@mantine/core";
import { useForm, isNotEmpty } from "@mantine/form";
import { IconX, IconPlus, IconMapPin } from "@tabler/icons-react";
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
      const res = await apiClient.get("/publico/provincias");
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
      const res = await apiClient.get("/publico/cantones", {
        params: { per_page: 1000 },
      });
      return extractData<Canton[]>(res);
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
      ubicaciones:
        proyecto?.ubicaciones?.map((u) => ({
          canton_id: u.canton_id ?? "",
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

  // Mapa O(1): canton_id → Canton (para lookups en el render)
  const cantonPorId = useMemo(
    () => new Map(cantonesArr.map((c) => [c.id, c])),
    [cantonesArr],
  );
  // Suprimir warning de lint — cantonPorId se usa indirectamente en el JSX via cantonesArr
  void cantonPorId;

  const quitarProvincia = (provinciaId: string) => {
    setProvinciasSeleccionadas((prev) =>
      prev.filter((p) => p.id !== provinciaId),
    );
    // Limpiar ubicaciones cuyo cantón pertenece a esta provincia
    const cantonIdsDeEsta = new Set(
      cantonesArr
        .filter((c) => c.provincia_id === provinciaId)
        .map((c) => c.id),
    );
    form.setFieldValue(
      "ubicaciones",
      form.values.ubicaciones.filter((u) => !cantonIdsDeEsta.has(u.canton_id)),
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
      ubicaciones:
        values.ubicaciones?.length > 0
          ? values.ubicaciones
              .filter((u) => u.canton_id && u.lat !== "" && u.lng !== "")
              .map((u) => ({
                canton_id: u.canton_id,
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

        {/* ── TAB 2: Ubicación Geográfica — Provincia → Cantones → Ubicaciones ── */}
        <Tabs.Panel value="provincias" pt="md">
          <Stack gap="md">
            {/* Selector de provincia */}
            <Select
              label="Añadir provincia participante"
              placeholder="Buscar y seleccionar provincia..."
              data={opcionesProvincias.filter(
                (op) => !provinciasSeleccionadas.find((p) => p.id === op.value),
              )}
              searchable
              clearable
              value={null}
              onChange={(val) => {
                if (val) agregarProvincia(val);
              }}
            />

            {provinciasSeleccionadas.length === 0 && (
              <Text size="sm" c="dimmed" ta="center" py="md">
                Agrega las provincias que participan en el proyecto. Para cada
                provincia podrás seleccionar cantones y añadir ubicaciones
                específicas.
              </Text>
            )}

            {/* ── Tarjeta por provincia ── */}
            {provinciasSeleccionadas.map((prov) => {
              // Cantones disponibles de esta provincia
              const cantonesDeProv = cantonesArr
                .filter((c) => c.provincia_id === prov.id)
                .sort((a, b) => a.nombre.localeCompare(b.nombre));

              // Agrupar ubicaciones por cantón (solo cantones de esta provincia)
              type GrupoCantonItem = {
                canton: (typeof cantonesArr)[0];
                items: { idx: number }[];
              };
              const gruposCanton = new Map<string, GrupoCantonItem>();
              form.values.ubicaciones.forEach((ub, idx) => {
                const canton = cantonesArr.find((c) => c.id === ub.canton_id);
                if (!canton || canton.provincia_id !== prov.id) return;
                if (!gruposCanton.has(canton.id)) {
                  gruposCanton.set(canton.id, { canton, items: [] });
                }
                gruposCanton.get(canton.id)!.items.push({ idx });
              });

              // Cantones disponibles para agregar (los que aún no tienen ubicaciones)
              const cantonesParaAgregar = cantonesDeProv
                .filter((c) => !gruposCanton.has(c.id))
                .map((c) => ({ value: c.id, label: c.nombre }));

              return (
                <Paper
                  key={prov.id}
                  p="md"
                  radius="md"
                  style={{ border: "1px solid var(--mantine-color-gray-3)" }}
                >
                  {/* ── Cabecera de provincia ── */}
                  <Group justify="space-between" mb="sm">
                    <Group gap="sm">
                      <IconMapPin
                        size={16}
                        color="var(--mantine-color-gray-6)"
                      />
                      <Text fw={700} size="md">
                        {prov.nombre}
                      </Text>
                    </Group>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => quitarProvincia(prov.id)}
                      title={`Eliminar provincia ${prov.nombre}`}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Group>

                  {/* Datos de la provincia: rol, avance, beneficiarios */}
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mb="md">
                    <Select
                      label="Rol en el proyecto"
                      size="sm"
                      data={ROLES_PROVINCIA}
                      value={prov.rol}
                      onChange={(val) =>
                        actualizarProvincia(
                          prov.id,
                          "rol",
                          val ?? "Beneficiaria",
                        )
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

                  {/* ── Cantones y Ubicaciones ── */}
                  <Divider
                    my="sm"
                    label={
                      <Text
                        size="xs"
                        fw={600}
                        c="dimmed"
                        tt="uppercase"
                        style={{ letterSpacing: "0.05em" }}
                      >
                        Cantones y Ubicaciones
                      </Text>
                    }
                    labelPosition="left"
                  />

                  {gruposCanton.size === 0 && (
                    <Text size="xs" c="dimmed" ta="center" py="xs">
                      Selecciona un cantón abajo para comenzar a georreferenciar
                      ubicaciones
                    </Text>
                  )}

                  {/* Sub-tarjetas por cantón */}
                  <Stack gap="sm">
                    {Array.from(gruposCanton.values()).map(
                      ({ canton, items }) => (
                        <Paper
                          key={canton.id}
                          p="sm"
                          radius="md"
                          style={{
                            border: "1px solid var(--mantine-color-blue-2)",
                            background: "var(--mantine-color-blue-0)",
                          }}
                        >
                          {/* Cabecera del cantón */}
                          <Group justify="space-between" mb="xs">
                            <Group gap="xs">
                              <IconMapPin
                                size={13}
                                color="var(--mantine-color-blue-7)"
                              />
                              <Text size="sm" fw={600} c="blue.8">
                                {canton.nombre}
                              </Text>
                              <Badge size="xs" variant="light" color="blue">
                                {items.length}
                              </Badge>
                            </Group>
                            <ActionIcon
                              variant="light"
                              color="blue"
                              size="sm"
                              title={`Añadir ubicación en ${canton.nombre}`}
                              onClick={() =>
                                form.insertListItem("ubicaciones", {
                                  canton_id: canton.id,
                                  nombre: "",
                                  lat: "",
                                  lng: "",
                                })
                              }
                            >
                              <IconPlus size={13} />
                            </ActionIcon>
                          </Group>

                          {/* Filas de ubicaciones de este cantón */}
                          <Stack gap="xs">
                            {items.map(({ idx }) => (
                              <Group
                                key={idx}
                                align="flex-end"
                                gap="xs"
                                wrap="nowrap"
                              >
                                <TextInput
                                  placeholder="Nombre / Recinto"
                                  size="xs"
                                  style={{ flex: 2 }}
                                  {...form.getInputProps(
                                    `ubicaciones.${idx}.nombre`,
                                  )}
                                />
                                <NumberInput
                                  placeholder="Latitud"
                                  size="xs"
                                  decimalScale={6}
                                  style={{ flex: 1 }}
                                  {...form.getInputProps(
                                    `ubicaciones.${idx}.lat`,
                                  )}
                                />
                                <NumberInput
                                  placeholder="Longitud"
                                  size="xs"
                                  decimalScale={6}
                                  style={{ flex: 1 }}
                                  {...form.getInputProps(
                                    `ubicaciones.${idx}.lng`,
                                  )}
                                />
                                <ActionIcon
                                  color="red"
                                  variant="subtle"
                                  size="sm"
                                  title="Eliminar ubicación"
                                  onClick={() =>
                                    form.removeListItem("ubicaciones", idx)
                                  }
                                >
                                  <IconX size={13} />
                                </ActionIcon>
                              </Group>
                            ))}
                          </Stack>
                        </Paper>
                      ),
                    )}
                  </Stack>

                  {/* Selector para agregar un nuevo cantón a esta provincia */}
                  {cantonesParaAgregar.length > 0 && (
                    <Select
                      mt="sm"
                      size="sm"
                      placeholder={`+ Añadir cantón de ${prov.nombre}...`}
                      data={cantonesParaAgregar}
                      searchable
                      clearable
                      value={null}
                      leftSection={<IconPlus size={13} />}
                      onChange={(cantonId) => {
                        if (cantonId) {
                          form.insertListItem("ubicaciones", {
                            canton_id: cantonId,
                            nombre: "",
                            lat: "",
                            lng: "",
                          });
                        }
                      }}
                    />
                  )}
                  {cantonesParaAgregar.length === 0 &&
                    cantonesDeProv.length > 0 && (
                      <Text size="xs" c="dimmed" mt="xs">
                        ✓ Todos los cantones de {prov.nombre} ya tienen
                        ubicaciones
                      </Text>
                    )}
                </Paper>
              );
            })}
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
