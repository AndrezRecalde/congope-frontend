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
  Divider,
  Anchor,
  Alert,
  ThemeIcon,
  SimpleGrid,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconStar,
  IconStarFilled,
  IconMapPin,
  IconFolderOpen,
  IconAlertCircle,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { EstrellaRating } from "@/components/modulos/practicas/EstrellaRating";
import { ValoracionModal } from "@/components/modulos/practicas/ValoracionModal";
import { PracticaForm } from "@/components/modulos/practicas/PracticaForm";
import {
  usePractica,
  useActualizarPractica,
  useEliminarPractica,
  useDestacarPractica,
} from "@/queries/practicas.queries";
import { practicasService } from "@/services/practicas.service";
import { usePermisos } from "@/hooks/usePermisos";
import { useConfirm } from "@/hooks/useConfirm";
import { formatFecha } from "@/utils/formatters";
import { COLOR_REPLICABILIDAD } from "@/types/practica.types";

function CampoTexto({
  titulo,
  contenido,
}: {
  titulo: string;
  contenido: string;
}) {
  return (
    <Stack gap="xs">
      <Text
        size="xs"
        fw={600}
        c="dimmed"
        tt="uppercase"
        style={{ letterSpacing: "0.05em" }}
      >
        {titulo}
      </Text>
      <Text size="sm" lh={1.7} style={{ whiteSpace: "pre-wrap" }}>
        {contenido}
      </Text>
    </Stack>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PracticaDetallePage(props: PageProps) {
  const { id } = use(props.params);
  const router = useRouter();
  const { can } = usePermisos();
  const { confirmar } = useConfirm();

  const { data: practica, isLoading, isError } = usePractica(id);

  const { mutateAsync: actualizarPracticaAsync } = useActualizarPractica();
  const { mutate: eliminarPractica } = useEliminarPractica();
  const { mutate: destacar } = useDestacarPractica();

  const calificacion = practica
    ? parseFloat(practica.calificacion_promedio ?? "0")
    : 0;

  const isDestacada =
    practica?.es_destacada === true ||
    String(practica?.es_destacada) === "1" ||
    String(practica?.es_destacada).toLowerCase() === "true";

  const abrirModalEditar = () => {
    if (!practica) return;
    modals.open({
      title: "Editar buena práctica",
      size: "xl",
      children: (
        <PracticaForm
          practica={practica}
          onSubmit={async (datos) => {
            await actualizarPracticaAsync({ id, datos });
            modals.closeAll();
          }}
          onCancel={() => modals.closeAll()}
        />
      ),
    });
  };

  const abrirModalValorar = () => {
    if (!practica) return;
    modals.open({
      title: `Valorar: ${practica.titulo}`,
      size: "md",
      children: (
        <ValoracionModal
          practica={practica}
          onCerrar={() => modals.closeAll()}
        />
      ),
    });
  };

  if (isError) {
    return (
      <>
        <PageHeader
          titulo="Práctica no encontrada"
          breadcrumbs={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Buenas Prácticas", href: "/buenas-practicas" },
            { label: "Detalle" },
          ]}
        />
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          title="No se pudo cargar la buena práctica"
        >
          La práctica solicitada no existe o fue eliminada.
          <Anchor
            component={Link}
            href="/buenas-practicas"
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
          titulo="Cargando..."
          breadcrumbs={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Buenas Prácticas", href: "/buenas-practicas" },
            { label: "Detalle" },
          ]}
        />
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={140} radius="lg" />
              ))}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Skeleton height={250} radius="lg" />
          </Grid.Col>
        </Grid>
      </>
    );
  }

  if (!practica) return null;

  return (
    <>
      <PageHeader
        titulo={practica.titulo}
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Buenas Prácticas", href: "/buenas-practicas" },
          { label: practica.titulo },
        ]}
        acciones={
          <Group gap="sm">
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              leftSection={<IconArrowLeft size={15} />}
              component={Link}
              href="/buenas-practicas"
            >
              Volver
            </Button>

            {/* Toggle destacar */}
            {can("practicas.destacar") && (
              <Button
                variant={isDestacada ? "filled" : "outline"}
                color="yellow"
                size="sm"
                leftSection={
                  isDestacada ? (
                    <IconStarFilled size={15} />
                  ) : (
                    <IconStar size={15} />
                  )
                }
                onClick={() => destacar({ id, es_destacada: !isDestacada })}
              >
                {isDestacada ? "Destacada" : "Destacar"}
              </Button>
            )}

            {can("practicas.valorar") && (
              <Button
                variant="light"
                color="teal"
                size="sm"
                leftSection={<IconStar size={15} />}
                onClick={abrirModalValorar}
              >
                {practica.mi_valoracion
                  ? `Mi valoración: ${practica.mi_valoracion.puntuacion}★`
                  : "Valorar"}
              </Button>
            )}

            {can("practicas.editar") && (
              <Button
                variant="outline"
                color="congope"
                size="sm"
                leftSection={<IconEdit size={15} />}
                onClick={abrirModalEditar}
              >
                Editar
              </Button>
            )}

            {can("practicas.eliminar") && (
              <Button
                color="red"
                variant="light"
                size="sm"
                leftSection={<IconTrash size={15} />}
                onClick={() =>
                  confirmar({
                    titulo: "Eliminar práctica",
                    mensaje: `¿Eliminar "${practica.titulo}"?`,
                    textoBoton: "Eliminar",
                    colorBoton: "red",
                    onConfirmar: () =>
                      eliminarPractica(id, {
                        onSuccess: () => router.push("/buenas-practicas"),
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
            {/* Descripción del problema */}
            <Paper
              p="lg"
              radius="lg"
              style={{ border: "1px solid var(--mantine-color-gray-3)" }}
            >
              <CampoTexto
                titulo="Descripción del problema"
                contenido={practica.descripcion_problema}
              />
            </Paper>

            {/* Metodología */}
            <Paper
              p="lg"
              radius="lg"
              style={{ border: "1px solid var(--mantine-color-gray-3)" }}
            >
              <CampoTexto
                titulo="Metodología aplicada"
                contenido={practica.metodologia}
              />
            </Paper>

            {/* Resultados */}
            <Paper
              p="lg"
              radius="lg"
              style={{ border: "1px solid var(--mantine-color-gray-3)" }}
            >
              <CampoTexto
                titulo="Resultados obtenidos"
                contenido={practica.resultados}
              />
            </Paper>
          </Stack>
        </Grid.Col>

        {/* ── Columna lateral ── */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            {/* Info rápida */}
            <Paper
              p="lg"
              radius="lg"
              style={{ border: "1px solid var(--mantine-color-gray-3)" }}
            >
              <Title order={5} c="gray.7" mb="md">
                Información
              </Title>
              <Stack gap="md">
                <Stack gap={4}>
                  <Text
                    size="xs"
                    fw={600}
                    c="dimmed"
                    tt="uppercase"
                    style={{ letterSpacing: "0.05em" }}
                  >
                    Replicabilidad
                  </Text>
                  <Badge
                    color={COLOR_REPLICABILIDAD[practica.replicabilidad]}
                    variant="light"
                  >
                    {practica.replicabilidad}
                  </Badge>
                </Stack>

                {practica.provincia && (
                  <Stack gap={4}>
                    <Text
                      size="xs"
                      fw={600}
                      c="dimmed"
                      tt="uppercase"
                      style={{ letterSpacing: "0.05em" }}
                    >
                      Provincia
                    </Text>
                    <Group gap="xs">
                      <IconMapPin
                        size={14}
                        color="var(--mantine-color-gray-5)"
                      />
                      <Text size="sm">{practica.provincia.nombre}</Text>
                    </Group>
                  </Stack>
                )}

                {/* Campo proyecto — solo en detalle */}
                {practica.proyecto && (
                  <Stack gap={4}>
                    <Text
                      size="xs"
                      fw={600}
                      c="dimmed"
                      tt="uppercase"
                      style={{ letterSpacing: "0.05em" }}
                    >
                      Proyecto relacionado
                    </Text>
                    <Group gap="xs">
                      <IconFolderOpen
                        size={14}
                        color="var(--mantine-color-gray-5)"
                      />
                      <Anchor
                        component={Link}
                        href={`/proyectos/${practica.proyecto.id}`}
                        size="sm"
                      >
                        {practica.proyecto.codigo}
                      </Anchor>
                    </Group>
                  </Stack>
                )}

                <Stack gap={4}>
                  <Text
                    size="xs"
                    fw={600}
                    c="dimmed"
                    tt="uppercase"
                    style={{ letterSpacing: "0.05em" }}
                  >
                    Registrado por
                  </Text>
                  <Group gap="xs">
                    <IconUser size={14} color="var(--mantine-color-gray-5)" />
                    <Text size="sm">
                      {practica.registrado_por?.name ?? "—"}
                    </Text>
                  </Group>
                </Stack>

                <Stack gap={4}>
                  <Text
                    size="xs"
                    fw={600}
                    c="dimmed"
                    tt="uppercase"
                    style={{ letterSpacing: "0.05em" }}
                  >
                    Fecha de registro
                  </Text>
                  <Text size="sm">{formatFecha(practica.created_at)}</Text>
                </Stack>
              </Stack>
            </Paper>

            {/* Calificación */}
            <Paper
              p="lg"
              radius="lg"
              style={{ border: "1px solid var(--mantine-color-gray-3)" }}
            >
              <Title order={5} c="gray.7" mb="md">
                Calificación comunitaria
              </Title>
              <Stack gap="sm">
                <Group gap="md">
                  <EstrellaRating valor={calificacion} readonly size={22} />
                  {calificacion > 0 ? (
                    <Text size="xl" fw={700}>
                      {calificacion.toFixed(1)}
                      <Text span size="sm" c="dimmed" fw={400}>
                        {" "}
                        / 5
                      </Text>
                    </Text>
                  ) : (
                    <Text size="sm" c="dimmed">
                      Sin valoraciones aún
                    </Text>
                  )}
                </Group>

                {/* Mi valoración previa */}
                {practica.mi_valoracion && (
                  <Stack gap={4}>
                    <Text size="xs" fw={600} c="teal.7">
                      Tu valoración: {practica.mi_valoracion.puntuacion}★
                    </Text>
                    {practica.mi_valoracion.comentario && (
                      <Text size="xs" c="dimmed" fs="italic">
                        {practica.mi_valoracion.comentario}
                      </Text>
                    )}
                  </Stack>
                )}

                {can("practicas.valorar") && (
                  <Button
                    variant="light"
                    color="teal"
                    size="sm"
                    fullWidth
                    onClick={abrirModalValorar}
                  >
                    {practica.mi_valoracion
                      ? "Actualizar mi valoración"
                      : "Valorar esta práctica"}
                  </Button>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
}
