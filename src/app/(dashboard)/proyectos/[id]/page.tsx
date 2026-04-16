"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import {
  Grid,
  Paper,
  Stack,
  Title,
  Text,
  Badge,
  Group,
  Button,
  Skeleton,
  SimpleGrid,
  Progress,
  Divider,
  Anchor,
  Alert,
  ThemeIcon,
  Table,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconBuilding,
  IconMapPin,
  IconCalendar,
  IconAlertCircle,
  IconRefresh,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { modals } from "@mantine/modals";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { HitosList } from "@/components/modulos/proyectos/HitosList";
import {
  useProyecto,
  useEliminarProyecto,
  useCambiarEstadoProyecto,
} from "@/queries/proyectos.queries";
import { usePermisos } from "@/hooks/usePermisos";
import { useConfirm } from "@/hooks/useConfirm";
import { formatFecha } from "@/utils/formatters";
import { getColorOds } from "@/utils/colores-ods";
import type { EstadoProyecto } from "@/types/proyecto.types";

function CampoInfo({
  label,
  valor,
  icono,
}: {
  label: string;
  valor: React.ReactNode;
  icono?: React.ReactNode;
}) {
  return (
    <Stack gap={4}>
      <Text
        size="xs"
        fw={600}
        c="dimmed"
        tt="uppercase"
        style={{ letterSpacing: "0.05em" }}
        component="span"
      >
        {label}
      </Text>
      {icono ? (
        <Group gap="xs">
          {icono}
          <Text size="sm" component="span">{valor}</Text>
        </Group>
      ) : (
        <Text size="sm" component="div">{valor || "—"}</Text>
      )}
    </Stack>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProyectoDetallePage(props: PageProps) {
  const { id } = use(props.params);
  const router = useRouter();
  const { can } = usePermisos();
  const { confirmar } = useConfirm();

  const { data: proyecto, isLoading, isError } = useProyecto(id);
  const { mutate: eliminarProyecto } = useEliminarProyecto();
  const { mutate: cambiarEstado } = useCambiarEstadoProyecto();

  const abrirModalCambioEstado = () => {
    if (!proyecto) return;
    const ESTADOS: EstadoProyecto[] = [
      "En gestión",
      "En ejecución",
      "Finalizado",
      "Suspendido",
    ];
    modals.open({
      title: "Cambiar estado",
      size: "sm",
      children: (
        <Group gap="xs" wrap="wrap">
          {ESTADOS.filter((e) => e !== proyecto.estado).map((e) => (
            <Button
              key={e}
              variant="light"
              size="sm"
              onClick={() => {
                cambiarEstado({ id, estado: e });
                modals.closeAll();
              }}
            >
              → {e}
            </Button>
          ))}
        </Group>
      ),
    });
  };

  if (isError) {
    return (
      <>
        <PageHeader
          titulo="Proyecto no encontrado"
          breadcrumbs={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Proyectos", href: "/proyectos" },
            { label: "Detalle" },
          ]}
        />
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          title="No se pudo cargar el proyecto"
        >
          El proyecto solicitado no existe.
          <Anchor
            component={Link}
            href="/proyectos"
            size="sm"
            display="block"
            mt="xs"
          >
            ← Volver al listado
          </Anchor>
        </Alert>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <PageHeader
          titulo="Cargando proyecto..."
          breadcrumbs={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Proyectos", href: "/proyectos" },
            { label: "Detalle" },
          ]}
        />
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={120} radius="lg" />
              ))}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Skeleton height={300} radius="lg" />
          </Grid.Col>
        </Grid>
      </>
    );
  }

  if (!proyecto) return null;

  // Calcular totales de beneficiarios desde la nueva estructura
  const beneficiarios = proyecto.beneficiarios ?? [];
  const totalBenefDirectos = beneficiarios.reduce(
    (sum, b) => sum + (b.cantidad_directos ?? 0),
    0,
  );
  const totalBenefIndirectos = beneficiarios.reduce(
    (sum, b) => sum + (b.cantidad_indirectos ?? 0),
    0,
  );

  // Agrupar beneficiarios por provincia para la vista de detalle
  const beneficiariosPorProvincia = proyecto.provincias.map((prov) => ({
    provincia: prov,
    items: beneficiarios.filter((b) => b.provincia_id === prov.id),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <PageHeader
        titulo={proyecto.nombre}
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Proyectos", href: "/proyectos" },
          { label: proyecto.codigo },
        ]}
        acciones={
          <Group gap="sm">
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              leftSection={<IconArrowLeft size={15} />}
              component={Link}
              href="/proyectos"
            >
              Volver
            </Button>
            {can("proyectos.cambiar_estado") && (
              <Button
                variant="outline"
                color="blue"
                size="sm"
                leftSection={<IconRefresh size={15} />}
                onClick={abrirModalCambioEstado}
              >
                Cambiar estado
              </Button>
            )}
            {can("proyectos.editar") && (
              <Button
                variant="outline"
                color="congope"
                size="sm"
                leftSection={<IconEdit size={15} />}
                component={Link}
                href={`/proyectos/${id}/editar`}
              >
                Editar
              </Button>
            )}
            {can("proyectos.eliminar") && (
              <Button
                color="red"
                variant="light"
                size="sm"
                leftSection={<IconTrash size={15} />}
                onClick={() =>
                  confirmar({
                    titulo: "Eliminar proyecto",
                    mensaje: `¿Eliminar "${proyecto.nombre}"?`,
                    textoBoton: "Eliminar",
                    colorBoton: "red",
                    onConfirmar: () =>
                      eliminarProyecto(id, {
                        onSuccess: () => router.push("/proyectos"),
                      }),
                  })
                }
              >
                Eliminar
              </Button>
            )}
          </Group>
        }
      />

      <Grid gutter="md">
        {/* ── Columna principal ── */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            {/* Información general */}
            <Paper
              p="lg"
              radius="lg"
              style={{ border: "1px solid var(--mantine-color-gray-3)" }}
            >
              <Group justify="space-between" mb="md">
                <Title order={5} c="gray.7">
                  Información general
                </Title>
                <Group gap="xs">
                  <StatusBadge estado={proyecto.estado} tipo="proyecto" />
                  <Badge variant="outline" color="gray" size="sm">
                    {proyecto.codigo}
                  </Badge>
                </Group>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <CampoInfo
                  label="Actores cooperantes"
                  valor={
                    proyecto.actores && proyecto.actores.length > 0 ? (
                      <Group gap="xs" wrap="wrap">
                        {proyecto.actores.map((a) => (
                          <Group key={a.id} gap={4}>
                            <IconBuilding
                              size={13}
                              color="var(--mantine-color-gray-5)"
                            />
                            <Text size="sm" component="span">{a.nombre}</Text>
                          </Group>
                        ))}
                      </Group>
                    ) : (
                      "—"
                    )
                  }
                />
                <CampoInfo
                  label="Sector temático"
                  valor={proyecto.sector_tematico}
                />
                <CampoInfo
                  label="Flujo de cooperación"
                  valor={proyecto.flujo_direccion}
                />
                <CampoInfo label="Moneda" valor={proyecto.moneda} />
              </SimpleGrid>

              {proyecto.descripcion && (
                <>
                  <Divider my="md" />
                  <CampoInfo label="Descripción" valor={proyecto.descripcion} />
                </>
              )}

              {proyecto.modalidad_cooperacion.length > 0 && (
                <>
                  <Divider my="md" />
                  <Stack gap={6}>
                    <Text
                      size="xs"
                      fw={600}
                      c="dimmed"
                      tt="uppercase"
                      style={{ letterSpacing: "0.05em" }}
                    >
                      Modalidad de cooperación
                    </Text>
                    <Group gap="xs">
                      {proyecto.modalidad_cooperacion.map((m) => (
                        <Badge key={m} variant="light" color="blue">
                          {m}
                        </Badge>
                      ))}
                    </Group>
                  </Stack>
                </>
              )}
            </Paper>

            {/* Fechas y financiamiento */}
            <Paper
              p="lg"
              radius="lg"
              style={{ border: "1px solid var(--mantine-color-gray-3)" }}
            >
              <Title order={5} c="gray.7" mb="md">
                Cronograma y financiamiento
              </Title>
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                <CampoInfo
                  label="Inicio"
                  valor={formatFecha(proyecto.fecha_inicio)}
                  icono={
                    <IconCalendar
                      size={14}
                      color="var(--mantine-color-gray-5)"
                    />
                  }
                />
                <CampoInfo
                  label="Fin planificado"
                  valor={formatFecha(proyecto.fecha_fin_planificada)}
                  icono={
                    <IconCalendar
                      size={14}
                      color="var(--mantine-color-gray-5)"
                    />
                  }
                />
                <CampoInfo
                  label="Fin real"
                  valor={
                    proyecto.fecha_fin_real
                      ? formatFecha(proyecto.fecha_fin_real)
                      : "—"
                  }
                  icono={
                    <IconCalendar
                      size={14}
                      color="var(--mantine-color-gray-5)"
                    />
                  }
                />
              </SimpleGrid>

              <Divider my="md" />

              <Group gap="xl">
                <Stack gap={4}>
                  <Text
                    size="xs"
                    fw={600}
                    c="dimmed"
                    tt="uppercase"
                    style={{ letterSpacing: "0.05em" }}
                  >
                    Monto total
                  </Text>
                  <Text size="xl" fw={700} c="congope.8">
                    {/* Usar el campo formateado del backend */}
                    {proyecto.monto_formateado}
                  </Text>
                </Stack>
                {totalBenefDirectos > 0 && (
                  <Stack gap={4}>
                    <Text
                      size="xs"
                      fw={600}
                      c="dimmed"
                      tt="uppercase"
                      style={{ letterSpacing: "0.05em" }}
                    >
                      Beneficiarios directos
                    </Text>
                    <Text size="xl" fw={700} c="teal.7">
                      {totalBenefDirectos.toLocaleString("es-EC")}
                    </Text>
                  </Stack>
                )}
                {totalBenefIndirectos > 0 && (
                  <Stack gap={4}>
                    <Text
                      size="xs"
                      fw={600}
                      c="dimmed"
                      tt="uppercase"
                      style={{ letterSpacing: "0.05em" }}
                    >
                      Beneficiarios indirectos
                    </Text>
                    <Text size="xl" fw={700} c="blue.6">
                      {totalBenefIndirectos.toLocaleString("es-EC")}
                    </Text>
                  </Stack>
                )}
              </Group>
            </Paper>

            {/* Provincias */}
            {proyecto.provincias.length > 0 && (
              <Paper
                p="lg"
                radius="lg"
                style={{ border: "1px solid var(--mantine-color-gray-3)" }}
              >
                <Title order={5} c="gray.7" mb="md">
                  Ubicación Geográfica
                </Title>
                <Stack gap="sm">
                  {proyecto.provincias.map((prov) => (
                    <Group key={prov.id} justify="space-between">
                      <Group gap="sm">
                        <IconMapPin
                          size={14}
                          color="var(--mantine-color-gray-5)"
                        />
                        <Text size="sm" fw={500}>
                          {prov.nombre}
                        </Text>
                        <Badge size="xs" variant="light" color="gray">
                          {prov.rol}
                        </Badge>
                      </Group>
                      {prov.porcentaje_avance !== null && (
                        <Group gap="sm" w={160}>
                          <Progress
                            value={prov.porcentaje_avance}
                            size="sm"
                            color="congope"
                            style={{ flex: 1 }}
                          />
                          <Text size="xs" fw={600} w={32}>
                            {prov.porcentaje_avance}%
                          </Text>
                        </Group>
                      )}
                    </Group>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Ubicaciones por Cantón */}
            {(proyecto.ubicaciones_por_canton ?? []).length > 0 && (
              <Paper
                p="lg"
                radius="lg"
                style={{ border: "1px solid var(--mantine-color-gray-3)" }}
              >
                <Title order={5} c="gray.7" mb="md">
                  Ubicaciones por Cantón
                </Title>
                <Stack gap="md">
                  {(proyecto.ubicaciones_por_canton ?? []).map((grupo) => (
                    <Paper
                      key={grupo.canton_id}
                      p="sm"
                      radius="md"
                      style={{
                        border: "1px solid var(--mantine-color-blue-2)",
                        background: "var(--mantine-color-blue-0)",
                      }}
                    >
                      <Group gap="xs" mb="xs">
                        <ThemeIcon color="blue" variant="light" size="sm">
                          <IconMapPin size={12} />
                        </ThemeIcon>
                        <Text size="sm" fw={700} c="blue.8">
                          {grupo.canton_nombre}
                        </Text>
                        <Badge size="xs" variant="light" color="blue">
                          {grupo.ubicaciones.length}
                        </Badge>
                      </Group>
                      <Stack gap={4} pl="xl">
                        {grupo.ubicaciones.map((ub) => (
                          <Group
                            key={ub.id}
                            justify="space-between"
                            wrap="nowrap"
                          >
                            <Text size="sm">
                              {ub.nombre || "Ubicación sin nombre"}
                            </Text>
                            {ub.coordenadas?.lat && (
                              <Badge variant="dot" size="sm" color="gray">
                                {ub.coordenadas.lat.toFixed(4)},{" "}
                                {ub.coordenadas.lng.toFixed(4)}
                              </Badge>
                            )}
                          </Group>
                        ))}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Beneficiarios por Provincia */}
            {beneficiariosPorProvincia.length > 0 && (
              <Paper
                p="lg"
                radius="lg"
                style={{ border: "1px solid var(--mantine-color-gray-3)" }}
              >
                <Group gap="sm" mb="md">
                  <ThemeIcon color="teal" variant="light" size="md">
                    <IconUsers size={14} />
                  </ThemeIcon>
                  <Title order={5} c="gray.7">
                    Beneficiarios
                  </Title>
                  <Badge variant="light" color="teal" size="sm">
                    {totalBenefDirectos.toLocaleString("es-EC")} directos
                    {totalBenefIndirectos > 0 && ` · ${totalBenefIndirectos.toLocaleString("es-EC")} indirectos`}
                  </Badge>
                </Group>

                <Stack gap="md">
                  {beneficiariosPorProvincia.map(({ provincia, items }) => {
                    const totalDir = items.reduce((s, b) => s + (b.cantidad_directos ?? 0), 0);
                    const totalInd = items.reduce((s, b) => s + (b.cantidad_indirectos ?? 0), 0);
                    return (
                      <Paper
                        key={provincia.id}
                        p="sm"
                        radius="md"
                        style={{
                          border: "1px solid var(--mantine-color-teal-2)",
                          background: "var(--mantine-color-teal-0)",
                        }}
                      >
                        {/* Cabecera de provincia */}
                        <Group justify="space-between" mb="sm">
                          <Group gap="sm">
                            <IconMapPin size={14} color="var(--mantine-color-teal-6)" />
                            <Text size="sm" fw={700} c="teal.8">{provincia.nombre}</Text>
                          </Group>
                          <Group gap="sm">
                            {totalDir > 0 && (
                              <Badge size="sm" variant="filled" color="teal">
                                {totalDir.toLocaleString("es-EC")} dir.
                              </Badge>
                            )}
                            {totalInd > 0 && (
                              <Badge size="sm" variant="light" color="blue">
                                {totalInd.toLocaleString("es-EC")} ind.
                              </Badge>
                            )}
                          </Group>
                        </Group>

                        {/* Tabla de categorías */}
                        <Table
                          withColumnBorders
                          withTableBorder
                          fz="xs"
                          style={{ background: "white", borderRadius: 6, overflow: "hidden" }}
                        >
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Categoría</Table.Th>
                              <Table.Th style={{ width: 110, textAlign: "right" }}>Directos</Table.Th>
                              <Table.Th style={{ width: 110, textAlign: "right" }}>Indirectos</Table.Th>
                              <Table.Th>Observaciones</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {items.map((b, i) => (
                              <Table.Tr key={i}>
                                <Table.Td>
                                  <Stack gap={1}>
                                    <Text size="xs" fw={500}>{b.categoria_nombre ?? "—"}</Text>
                                    {b.categoria_grupo && (
                                      <Text size="xs" c="dimmed">{b.categoria_grupo}</Text>
                                    )}
                                  </Stack>
                                </Table.Td>
                                <Table.Td style={{ textAlign: "right", fontWeight: 600 }}>
                                  {b.cantidad_directos != null
                                    ? b.cantidad_directos.toLocaleString("es-EC")
                                    : "—"}
                                </Table.Td>
                                <Table.Td style={{ textAlign: "right" }}>
                                  {b.cantidad_indirectos != null
                                    ? b.cantidad_indirectos.toLocaleString("es-EC")
                                    : "—"}
                                </Table.Td>
                                <Table.Td>
                                  <Text size="xs" c="dimmed">{b.observaciones ?? "—"}</Text>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </Paper>
                    );
                  })}
                </Stack>
              </Paper>
            )}

            {/* Hitos del proyecto */}
            <Paper
              p="lg"
              radius="lg"
              style={{ border: "1px solid var(--mantine-color-gray-3)" }}
            >
              <HitosList proyectoId={id} />
            </Paper>
          </Stack>
        </Grid.Col>

        {/* ── Columna lateral ── */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            {/* ODS */}
            {proyecto.ods.length > 0 && (
              <Paper
                p="lg"
                radius="lg"
                style={{ border: "1px solid var(--mantine-color-gray-3)" }}
              >
                <Title order={5} c="gray.7" mb="md">
                  ODS alineados
                </Title>
                <Stack gap="sm">
                  {proyecto.ods.map((ods) => (
                    <Group key={ods.id} gap="sm">
                      <Badge
                        size="md"
                        circle
                        style={{
                          background: getColorOds(ods.numero),
                          color: "white",
                          minWidth: 28,
                        }}
                      >
                        {ods.numero}
                      </Badge>
                      <Text size="sm">{ods.nombre}</Text>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Metadata */}
            <Paper
              p="lg"
              radius="lg"
              style={{ border: "1px solid var(--mantine-color-gray-3)" }}
            >
              <Title order={5} c="gray.7" mb="md">
                Información del registro
              </Title>
              <Stack gap="md">
                <CampoInfo
                  label="Registrado"
                  valor={formatFecha(proyecto.created_at)}
                />
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
}
