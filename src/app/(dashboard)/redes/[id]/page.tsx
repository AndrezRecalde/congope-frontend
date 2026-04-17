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
  IconAlertCircle,
} from '@tabler/icons-react';
import Link    from 'next/link';
import { modals } from '@mantine/modals';
import { PageHeader }    from
  '@/components/ui/PageHeader/PageHeader';
import { MiembrosPanel } from
  '@/components/modulos/redes/MiembrosPanel';
import { RedForm }       from
  '@/components/modulos/redes/RedForm';
import {
  useRed,
  useActualizarRed,
  useEliminarRed,
} from '@/queries/redes.queries';
import { usePermisos } from '@/hooks/usePermisos';
import { useConfirm }  from '@/hooks/useConfirm';
import { formatFecha } from '@/utils/formatters';
import type { Red } from '@/services/axios';
import {
  COLOR_TIPO_RED,
  COLOR_ROL_CONGOPE,
} from '@/types/red.types';

function CampoInfo({
  label,
  valor,
}: {
  label: string;
  valor: React.ReactNode;
}) {
  return (
    <Stack gap={4}>
      <Text size="xs" fw={600} c="dimmed" tt="uppercase"
        style={{ letterSpacing: '0.05em' }}>
        {label}
      </Text>
      <Text size="sm">{valor || '—'}</Text>
    </Stack>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

function EditarRedModal({ red, id }: { red: Red, id: string }) {
  const { mutate: actualizarRed, isPending: actualizando } = useActualizarRed();

  return (
    <RedForm
      red={red}
      onSubmit={(datos) =>
        actualizarRed(
          { id, datos },
          { onSuccess: () => modals.closeAll() }
        )
      }
      onCancel={() => modals.closeAll()}
      isLoading={actualizando}
    />
  );
}

export default function RedDetallePage(props: PageProps) {
  const { id } = use(props.params);
  const router  = useRouter();
  const { can } = usePermisos();
  const { confirmar } = useConfirm();

  const {
    data: red,
    isLoading,
    isError,
  } = useRed(id);

  const { mutate: eliminarRed } = useEliminarRed();

  const abrirModalEditar = () => {
    if (!red) return;
    modals.open({
      title: 'Editar red de articulación',
      size:  'lg',
      children: <EditarRedModal red={red} id={id} />,
    });
  };

  if (isError) {
    return (
      <>
        <PageHeader
          titulo="Red no encontrada"
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Redes', href: '/redes' },
            { label: 'Detalle' },
          ]}
        />
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          title="No se pudo cargar la red"
        >
          La red solicitada no existe o fue eliminada.
          <Anchor component={Link} href="/redes"
            size="sm" display="block" mt="xs">
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
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Redes', href: '/redes' },
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
            <Skeleton height={220} radius="lg" />
          </Grid.Col>
        </Grid>
      </>
    );
  }

  if (!red) return null;

  return (
    <>
      <PageHeader
        titulo={red.nombre}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Redes', href: '/redes' },
          { label: red.nombre },
        ]}
        acciones={
          <Group gap="sm">
            <Button variant="subtle" color="gray" size="sm"
              leftSection={<IconArrowLeft size={15} />}
              component={Link} href="/redes">
              Volver
            </Button>
            {can('redes.editar') && (
              <Button variant="outline" color="congope"
                size="sm"
                leftSection={<IconEdit size={15} />}
                onClick={abrirModalEditar}>
                Editar
              </Button>
            )}
            {can('redes.eliminar') && (
              <Button color="red" variant="light" size="sm"
                leftSection={<IconTrash size={15} />}
                onClick={() =>
                  confirmar({
                    titulo:     'Eliminar red',
                    mensaje:    `¿Eliminar "${red.nombre}"?`,
                    textoBoton: 'Eliminar',
                    colorBoton: 'red',
                    onConfirmar: () =>
                      eliminarRed(id, {
                        onSuccess: () =>
                          router.push('/redes'),
                      }),
                  })
                }>
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
            <Paper p="lg" radius="lg"
              style={{
                border: '1px solid var(--mantine-color-gray-3)',
              }}>
              <Group justify="space-between" mb="md">
                <Title order={5} c="gray.7">
                  Información general
                </Title>
                <Group gap="xs">
                  <Badge
                    color={COLOR_TIPO_RED[red.tipo]}
                    variant="light"
                  >
                    {red.tipo}
                  </Badge>
                  <Badge
                    color={COLOR_ROL_CONGOPE[red.rol_congope]}
                    variant="light"
                  >
                    {red.rol_congope}
                  </Badge>
                </Group>
              </Group>

              <SimpleGrid
                cols={{ base: 1, sm: 2 }}
                spacing="lg"
              >
                <CampoInfo
                  label="Fecha de adhesión"
                  valor={
                    red.fecha_adhesion
                      ? formatFecha(red.fecha_adhesion)
                      : '—'
                  }
                />
                <CampoInfo
                  label="Fecha de registro"
                  valor={formatFecha(red.created_at)}
                />
              </SimpleGrid>

              {red.objetivo && (
                <>
                  <Divider my="md" />
                  <Stack gap={4}>
                    <Text size="xs" fw={600} c="dimmed"
                      tt="uppercase"
                      style={{ letterSpacing: '0.05em' }}>
                      Objetivo
                    </Text>
                    <Text size="sm" lh={1.7}>
                      {red.objetivo}
                    </Text>
                  </Stack>
                </>
              )}
            </Paper>

            {/* Panel de miembros */}
            <Paper p="lg" radius="lg"
              style={{
                border: '1px solid var(--mantine-color-gray-3)',
              }}>
              <MiembrosPanel
                redId={id}
                miembros={red.miembros}
              />
            </Paper>
          </Stack>
        </Grid.Col>

        {/* ── Columna lateral ── */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">

            {/* Resumen numérico */}
            <Paper p="lg" radius="lg"
              style={{
                border: '1px solid var(--mantine-color-gray-3)',
              }}>
              <Title order={5} c="gray.7" mb="md">
                Resumen
              </Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Total de miembros
                  </Text>
                  <Badge
                    size="lg"
                    variant="light"
                    color="congope"
                  >
                    {red.miembros.length}
                  </Badge>
                </Group>

                {/* Desglose por tipo de actor */}
                {red.miembros.length > 0 && (
                  <>
                    <Divider />
                    <Stack gap="xs">
                      <Text size="xs" fw={600} c="dimmed"
                        tt="uppercase"
                        style={{ letterSpacing: '0.05em' }}>
                        Por tipo de actor
                      </Text>
                      {Object.entries(
                        red.miembros.reduce<
                          Record<string, number>
                        >((acc, m) => {
                          acc[m.actor.tipo] =
                            (acc[m.actor.tipo] ?? 0) + 1;
                          return acc;
                        }, {})
                      ).map(([tipo, count]) => (
                        <Group
                          key={tipo}
                          justify="space-between"
                        >
                          <Text size="xs">{tipo}</Text>
                          <Badge
                            size="xs"
                            variant="outline"
                            color="gray"
                          >
                            {count}
                          </Badge>
                        </Group>
                      ))}
                    </Stack>
                  </>
                )}
              </Stack>
            </Paper>

            {/* Documentos — placeholder */}
            <Paper p="lg" radius="lg"
              style={{
                border:
                  '2px dashed var(--mantine-color-gray-3)',
                background: 'var(--mantine-color-gray-0)',
              }}>
              <Title order={5} c="gray.5" mb="xs">
                Documentos
              </Title>
              <Text size="xs" c="dimmed">
                Los documentos asociados a esta red se
                gestionan desde el módulo de Documentos.
                {red.documentos?.length === 0 &&
                  ' Aún no hay documentos asociados.'}
              </Text>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
}
