'use client'

import { use }       from 'react';
import { useRouter } from 'next/navigation';
import {
  Grid, Paper, Stack, Title, Text, Badge,
  Group, Button, Skeleton, SimpleGrid,
  Divider, Anchor, Alert,
} from '@mantine/core';
import {
  IconArrowLeft, IconEdit, IconTrash,
  IconWorld, IconWorldOff, IconFolderOpen,
  IconMapPin, IconAlertCircle,
} from '@tabler/icons-react';
import Link    from 'next/link';
import { modals } from '@mantine/modals';
import { PageHeader }            from
  '@/components/ui/PageHeader/PageHeader';
import { ReconocimientosPanel }  from
  '@/components/modulos/emblematicos/ReconocimientosPanel';
import { EmblematicoForm }       from
  '@/components/modulos/emblematicos/EmblematicoForm';
import {
  useEmblematico,
  useActualizarEmblematico,
  useEliminarEmblematico,
  usePublicarEmblematico,
} from '@/queries/emblematicos.queries';
import { usePermisos } from '@/hooks/usePermisos';
import { useConfirm }  from '@/hooks/useConfirm';
import { formatFecha } from '@/utils/formatters';

function CampoInfo({
  label,
  valor,
}: {
  label: string;
  valor: React.ReactNode;
}) {
  return (
    <Stack gap={4}>
      <Text
        size="xs"
        fw={600}
        c="dimmed"
        tt="uppercase"
        style={{ letterSpacing: '0.05em' }}
      >
        {label}
      </Text>
      <Text size="sm">{valor || '—'}</Text>
    </Stack>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EmblematicoDetallePage(
  props: PageProps
) {
  const { id } = use(props.params);
  const router  = useRouter();
  const { can } = usePermisos();
  const { confirmar } = useConfirm();

  const {
    data: emblematico,
    isLoading,
    isError,
  } = useEmblematico(id);

  const {
    mutateAsync: actualizarAsync,
  } = useActualizarEmblematico();
  const { mutate: eliminar }  = useEliminarEmblematico();
  const { mutate: publicar }  = usePublicarEmblematico();

  const abrirModalEditar = () => {
    if (!emblematico) return;
    modals.open({
      title:    'Editar proyecto emblemático',
      size:     'lg',
      children: (
        <EmblematicoForm
          emblematico={emblematico}
          onSubmit={async (datos) => {
            await actualizarAsync({ id, datos });
            modals.closeAll();
          }}
          onCancel={() => modals.closeAll()}
        />
      ),
    });
  };

  if (isError) {
    return (
      <>
        <PageHeader
          titulo="Emblemático no encontrado"
          breadcrumbs={[
            { label: 'Inicio',        href: '/dashboard' },
            { label: 'Emblemáticos', href: '/emblematicos' },
            { label: 'Detalle' },
          ]}
        />
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          title="No se pudo cargar el proyecto emblemático"
        >
          El registro solicitado no existe o fue eliminado.
          <Anchor
            component={Link}
            href="/emblematicos"
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
            { label: 'Inicio',        href: '/dashboard' },
            { label: 'Emblemáticos', href: '/emblematicos' },
            { label: 'Detalle' },
          ]}
        />
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              {[1, 2].map((i) => (
                <Skeleton key={i} height={160} radius="lg" />
              ))}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Skeleton height={240} radius="lg" />
          </Grid.Col>
        </Grid>
      </>
    );
  }

  if (!emblematico) return null;

  return (
    <>
      <PageHeader
        titulo={emblematico.titulo}
        breadcrumbs={[
          { label: 'Inicio',        href: '/dashboard' },
          { label: 'Emblemáticos', href: '/emblematicos' },
          { label: emblematico.titulo },
        ]}
        acciones={
          <Group gap="sm">
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              leftSection={<IconArrowLeft size={15} />}
              component={Link}
              href="/emblematicos"
            >
              Volver
            </Button>

            {/* Toggle publicar */}
            {can('emblematicos.publicar') && (
              <Button
                variant={
                  emblematico.es_publico ? 'filled' : 'outline'
                }
                color="green"
                size="sm"
                leftSection={
                  emblematico.es_publico ? (
                    <IconWorld size={15} />
                  ) : (
                    <IconWorldOff size={15} />
                  )
                }
                onClick={() => publicar({ id, es_publico: !emblematico.es_publico })}
              >
                {emblematico.es_publico
                  ? 'Publicado'
                  : 'Publicar'}
              </Button>
            )}

            {can('emblematicos.editar') && (
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

            {can('emblematicos.eliminar') && (
              <Button
                color="red"
                variant="light"
                size="sm"
                leftSection={<IconTrash size={15} />}
                onClick={() =>
                  confirmar({
                    titulo:     'Eliminar emblemático',
                    mensaje:    `¿Eliminar "${emblematico.titulo}"?`,
                    textoBoton: 'Eliminar',
                    colorBoton: 'red',
                    onConfirmar: () =>
                      eliminar(id, {
                        onSuccess: () =>
                          router.push('/emblematicos'),
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
              style={{
                border:
                  '1px solid var(--mantine-color-gray-3)',
              }}
            >
              <Group justify="space-between" mb="md">
                <Title order={5} c="gray.7">
                  Información general
                </Title>
                <Badge
                  color={
                    emblematico.es_publico ? 'green' : 'gray'
                  }
                  variant="light"
                  leftSection={
                    emblematico.es_publico ? (
                      <IconWorld size={12} />
                    ) : (
                      <IconWorldOff size={12} />
                    )
                  }
                >
                  {emblematico.es_publico
                    ? 'Portal público'
                    : 'No publicado'}
                </Badge>
              </Group>

              <SimpleGrid
                cols={{ base: 1, sm: 2 }}
                spacing="lg"
              >
                <Stack gap={4}>
                  <Text
                    size="xs"
                    fw={600}
                    c="dimmed"
                    tt="uppercase"
                    style={{ letterSpacing: '0.05em' }}
                  >
                    Provincia ejecutora
                  </Text>
                  <Group gap="xs">
                    <IconMapPin
                      size={14}
                      color="var(--mantine-color-gray-5)"
                    />
                    <Text size="sm">
                      {emblematico.provincia?.nombre ?? '—'}
                    </Text>
                  </Group>
                </Stack>

                <CampoInfo
                  label="Período de ejecución"
                  valor={emblematico.periodo ?? '—'}
                />

                <Stack gap={4}>
                  <Text
                    size="xs"
                    fw={600}
                    c="dimmed"
                    tt="uppercase"
                    style={{ letterSpacing: '0.05em' }}
                  >
                    Proyecto de cooperación
                  </Text>
                  {emblematico.proyecto ? (
                    <Group gap="xs">
                      <IconFolderOpen
                        size={14}
                        color="var(--mantine-color-gray-5)"
                      />
                      <Anchor
                        component={Link}
                        href={`/proyectos/${emblematico.proyecto.id}`}
                        size="sm"
                      >
                        {emblematico.proyecto.codigo}
                      </Anchor>
                    </Group>
                  ) : (
                    <Text size="sm" c="dimmed">—</Text>
                  )}
                </Stack>

                <CampoInfo
                  label="Fecha de registro"
                  valor={
                    /* NOTA: created_at en ISO 8601 completo */
                    formatFecha(emblematico.created_at)
                  }
                />
              </SimpleGrid>

              <Divider my="md" />

              <Stack gap={4}>
                <Text
                  size="xs"
                  fw={600}
                  c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: '0.05em' }}
                >
                  Descripción del impacto
                </Text>
                <Text
                  size="sm"
                  lh={1.7}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {emblematico.descripcion_impacto}
                </Text>
              </Stack>
            </Paper>

            {/* Panel de reconocimientos */}
            <Paper
              p="lg"
              radius="lg"
              style={{
                border:
                  '1px solid var(--mantine-color-gray-3)',
              }}
            >
              <ReconocimientosPanel
                emblematicoId={id}
                reconocimientos={
                  emblematico.reconocimientos ?? []
                }
              />
            </Paper>
          </Stack>
        </Grid.Col>

        {/* ── Columna lateral ── */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">

            {/* Resumen */}
            <Paper
              p="lg"
              radius="lg"
              style={{
                border:
                  '1px solid var(--mantine-color-gray-3)',
              }}
            >
              <Title order={5} c="gray.7" mb="md">
                Resumen
              </Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Reconocimientos
                  </Text>
                  <Badge
                    size="lg"
                    variant="light"
                    color="yellow"
                  >
                    {emblematico.reconocimientos?.length ?? 0}
                  </Badge>
                </Group>

                {(emblematico.reconocimientos ?? []).length >
                  0 && (
                  <>
                    <Divider />
                    <Stack gap="xs">
                      <Text
                        size="xs"
                        fw={600}
                        c="dimmed"
                        tt="uppercase"
                        style={{ letterSpacing: '0.05em' }}
                      >
                        Por ámbito
                      </Text>
                      {(['Nacional', 'Internacional'] as const)
                        .map((ambito) => {
                          const count = (
                            emblematico.reconocimientos ?? []
                          ).filter(
                            (r) => r.ambito === ambito
                          ).length;
                          if (count === 0) return null;
                          return (
                            <Group
                              key={ambito}
                              justify="space-between"
                            >
                              <Text size="xs">{ambito}</Text>
                              <Badge
                                size="xs"
                                variant="outline"
                                color={
                                  ambito === 'Internacional'
                                    ? 'violet'
                                    : 'blue'
                                }
                              >
                                {count}
                              </Badge>
                            </Group>
                          );
                        })}
                    </Stack>
                  </>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
}
