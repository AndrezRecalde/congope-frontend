'use client'

import { use }         from 'react';
import { useRouter }   from 'next/navigation';
import {
  Grid, Paper, Stack, Title, Text, Badge,
  Group, Button, Skeleton, ThemeIcon,
  Divider, SimpleGrid, Anchor, Alert,
  LoadingOverlay, Box, Image,
} from '@mantine/core';
import {
  IconArrowLeft, IconEdit, IconTrash,
  IconWorld, IconMail, IconPhone,
  IconMapPin, IconTag, IconAlertCircle,
} from '@tabler/icons-react';
import Link from 'next/link';
import { modals } from '@mantine/modals';
import { PageHeader }  from
  '@/components/ui/PageHeader/PageHeader';
import { StatusBadge } from
  '@/components/ui/StatusBadge/StatusBadge';
import { ActorForm }   from
  '@/components/modulos/actores/ActorForm';
import {
  useActor,
  useActualizarActor,
  useEliminarActor,
} from '@/queries/actores.queries';
import { usePermisos } from '@/hooks/usePermisos';
import { useConfirm }  from '@/hooks/useConfirm';
import { formatFecha } from '@/utils/formatters';
import type { ActorCooperacion } from '@/services/axios';

function EditarActorModal({ actor, actorId }: { actor: ActorCooperacion; actorId: string }) {
  const { mutate: actualizarActor, isPending: actualizando } = useActualizarActor();

  return (
    <ActorForm
      actor={actor}
      onSubmit={(datos) =>
        actualizarActor(
          { id: actorId, datos },
          { onSuccess: () => modals.closeAll() }
        )
      }
      onCancel={() => modals.closeAll()}
      isLoading={actualizando}
    />
  );
}

// Componente de campo de información
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
      <Text size="xs" fw={600} c="dimmed" tt="uppercase"
        style={{ letterSpacing: '0.05em' }}>
        {label}
      </Text>
      {icono ? (
        <Group gap="xs">
          {icono}
          <Text size="sm" component="div">{valor}</Text>
        </Group>
      ) : (
        <Text size="sm" component="div">{valor || '—'}</Text>
      )}
    </Stack>
  );
}

// Skeleton mientras carga
function ActorDetalleSkeleton() {
  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Paper p="lg" radius="lg"
          style={{ border: '1px solid var(--mantine-color-gray-3)' }}>
          <Stack gap="md">
            {[1,2,3,4].map((i) => (
              <Skeleton key={i} height={40} radius="md" />
            ))}
          </Stack>
        </Paper>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Paper p="lg" radius="lg"
          style={{ border: '1px solid var(--mantine-color-gray-3)' }}>
          <Stack gap="md">
            {[1,2,3].map((i) => (
              <Skeleton key={i} height={30} radius="md" />
            ))}
          </Stack>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ActorDetallePage(props: PageProps) {
  // Next.js 16: params es async
  const { id } = use(props.params);
  const router  = useRouter();

  const { can }  = usePermisos();
  const { confirmar } = useConfirm();

  const {
    data: actor,
    isLoading,
    isFetching,
    isError,
  } = useActor(id);

  const { mutate: eliminarActor } = useEliminarActor();

  const abrirModalEditar = () => {
    if (!actor) return;
    modals.open({
      title:    'Editar actor de cooperación',
      size:     'lg',
      children: <EditarActorModal actor={actor} actorId={id} />,
    });
  };

  const confirmarEliminar = () => {
    if (!actor) return;
    confirmar({
      titulo:     'Eliminar actor',
      mensaje:    `¿Estás seguro de eliminar "${actor.nombre}"?`,
      textoBoton: 'Eliminar actor',
      colorBoton: 'red',
      onConfirmar: () =>
        eliminarActor(id, {
          onSuccess: () => router.push('/actores'),
        }),
    });
  };

  // Error al cargar (el OpenAPI documenta 500 para este endpoint)
  if (isError) {
    return (
      <>
        <PageHeader
          titulo="Actor no encontrado"
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Actores', href: '/actores' },
            { label: 'Detalle' },
          ]}
        />
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          title="No se pudo cargar el actor"
          radius="md"
        >
          El actor solicitado no existe o hubo un error al
          cargarlo. Vuelve al listado e intenta de nuevo.
          <br />
          <Anchor
            component={Link}
            href="/actores"
            size="sm"
            mt="xs"
            display="block"
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
          titulo="Cargando actor..."
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Actores', href: '/actores' },
            { label: 'Detalle' },
          ]}
        />
        <ActorDetalleSkeleton />
      </>
    );
  }

  if (!actor) return null;

  return (
    <Box pos="relative" style={{ minHeight: 400 }}>
      <LoadingOverlay
        visible={isFetching}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      
      <PageHeader
        titulo={actor.nombre}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Actores', href: '/actores' },
          { label: actor.nombre },
        ]}
        acciones={
          <Group gap="sm">
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={15} />}
              component={Link}
              href="/actores"
              size="sm"
            >
              Volver
            </Button>
            {can('actores.editar') && (
              <Button
                variant="outline"
                color="congope"
                leftSection={<IconEdit size={15} />}
                onClick={abrirModalEditar}
                size="sm"
              >
                Editar
              </Button>
            )}
            {can('actores.eliminar') && (
              <Button
                color="red"
                variant="light"
                leftSection={<IconTrash size={15} />}
                onClick={confirmarEliminar}
                size="sm"
              >
                Eliminar
              </Button>
            )}
          </Group>
        }
      />

      <Grid gutter="md">
        {/* Columna principal */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">

            {/* Información general */}
            <Paper
              p="lg"
              radius="lg"
              style={{
                border: '1px solid var(--mantine-color-gray-3)',
              }}
            >
              <Group align="center" justify="space-between" mb="md">
                <Title order={5} c="gray.7">
                  Información general
                </Title>
                {actor.logo && (
                  <Box style={{ border: '1px solid var(--mantine-color-gray-2)', borderRadius: '8px', padding: '4px', backgroundColor: '#fff' }}>
                    <Image
                      src={actor.logo}
                      alt={`Logo de ${actor.nombre}`}
                      h={60}
                      w="auto"
                      fit="contain"
                      radius="md"
                    />
                  </Box>
                )}
              </Group>

              <SimpleGrid
                cols={{ base: 1, sm: 2 }}
                spacing="lg"
              >
                {actor.identificador_institucional && (
                  <CampoInfo
                    label="Identificador"
                    valor={actor.identificador_institucional}
                  />
                )}
                <CampoInfo
                  label="Tipo de actor"
                  valor={
                    <Badge variant="light" color="blue">
                      {actor.tipo}
                    </Badge>
                  }
                />
                <CampoInfo
                  label="Estado"
                  valor={
                    <StatusBadge
                      estado={actor.estado}
                      tipo="actor"
                    />
                  }
                />
                <CampoInfo
                  label="País de origen"
                  valor={actor.pais_origen}
                  icono={
                    <IconMapPin size={14}
                      color="var(--mantine-color-gray-5)" />
                  }
                />
                <CampoInfo
                  label="Registrado"
                  valor={formatFecha(actor.created_at)}
                />
              </SimpleGrid>

              {actor.notas && (
                <>
                  <Divider my="md" />
                  <CampoInfo
                    label="Notas"
                    valor={actor.notas}
                  />
                </>
              )}
            </Paper>

            {/* Áreas temáticas */}
            {actor.areas_tematicas.length > 0 && (
              <Paper
                p="lg"
                radius="lg"
                style={{
                  border: '1px solid var(--mantine-color-gray-3)',
                }}
              >
                <Group gap="xs" mb="md">
                  <ThemeIcon
                    size="sm"
                    variant="light"
                    color="congope"
                  >
                    <IconTag size={12} />
                  </ThemeIcon>
                  <Title order={5} c="gray.7">
                    Áreas temáticas
                  </Title>
                </Group>
                <Group gap="xs" wrap="wrap">
                  {actor.areas_tematicas.map((area) => (
                    <Badge
                      key={area}
                      variant="light"
                      color="congope"
                      size="md"
                    >
                      {area}
                    </Badge>
                  ))}
                </Group>
              </Paper>
            )}
          </Stack>
        </Grid.Col>

        {/* Columna lateral */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper
            p="lg"
            radius="lg"
            style={{
              border: '1px solid var(--mantine-color-gray-3)',
            }}
          >
            <Title order={5} mb="md" c="gray.7">
              Información de contacto
            </Title>

            <Stack gap="md">
              <CampoInfo
                label="Nombre del contacto"
                valor={actor.contacto_nombre}
              />

              {actor.contacto_email && (
                <Stack gap={4}>
                  <Text size="xs" fw={600} c="dimmed"
                    tt="uppercase"
                    style={{ letterSpacing: '0.05em' }}>
                    Email
                  </Text>
                  <Group gap="xs">
                    <IconMail size={14}
                      color="var(--mantine-color-gray-5)" />
                    <Anchor
                      href={`mailto:${actor.contacto_email}`}
                      size="sm"
                    >
                      {actor.contacto_email}
                    </Anchor>
                  </Group>
                </Stack>
              )}

              {actor.contacto_telefono && (
                <Stack gap={4}>
                  <Text size="xs" fw={600} c="dimmed"
                    tt="uppercase"
                    style={{ letterSpacing: '0.05em' }}>
                    Teléfono
                  </Text>
                  <Group gap="xs">
                    <IconPhone size={14}
                      color="var(--mantine-color-gray-5)" />
                    <Text size="sm">
                      {actor.contacto_telefono}
                    </Text>
                  </Group>
                </Stack>
              )}

              {actor.sitio_web && (
                <Stack gap={4}>
                  <Text size="xs" fw={600} c="dimmed"
                    tt="uppercase"
                    style={{ letterSpacing: '0.05em' }}>
                    Sitio web
                  </Text>
                  <Group gap="xs">
                    <IconWorld size={14}
                      color="var(--mantine-color-gray-5)" />
                    <Anchor
                      href={actor.sitio_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                    >
                      {actor.sitio_web.replace(
                        /^https?:\/\//,
                        ''
                      )}
                    </Anchor>
                  </Group>
                </Stack>
              )}

              {!actor.contacto_nombre &&
               !actor.contacto_email &&
               !actor.contacto_telefono &&
               !actor.sitio_web && (
                <Text size="sm" c="dimmed" fs="italic">
                  No hay información de contacto registrada.
                </Text>
              )}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
