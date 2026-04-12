'use client'

import { use }       from 'react';
import { useRouter } from 'next/navigation';
import {
  Grid, Paper, Stack, Title, Text, Badge,
  Group, Button, Skeleton, Divider,
  Anchor, Alert, ThemeIcon,
} from '@mantine/core';
import {
  IconArrowLeft, IconEdit, IconTrash,
  IconMapPin, IconVideo, IconCalendar,
  IconUser, IconAlertCircle,
} from '@tabler/icons-react';
import Link    from 'next/link';
import { modals } from '@mantine/modals';
import { PageHeader }       from
  '@/components/ui/PageHeader/PageHeader';
import { ParticipantesPanel } from
  '@/components/modulos/eventos/ParticipantesPanel';
import { CompromisosPanel }  from
  '@/components/modulos/eventos/CompromisosPanel';
import { EventoForm }        from
  '@/components/modulos/eventos/EventoForm';
import {
  useEvento,
  useActualizarEvento,
  useEliminarEvento,
} from '@/queries/eventos.queries';
import { usePermisos } from '@/hooks/usePermisos';
import { useConfirm }  from '@/hooks/useConfirm';
import { formatFecha } from '@/utils/formatters';
import {
  COLOR_TIPO_EVENTO,
} from '@/types/evento.types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EventoDetallePage(
  props: PageProps
) {
  const { id } = use(props.params);
  const router  = useRouter();
  const { can } = usePermisos();
  const { confirmar } = useConfirm();

  const {
    data: evento,
    isLoading,
    isError,
  } = useEvento(id);

  const {
    mutateAsync: actualizarEventoAsync,
    isPending: actualizando,
  } = useActualizarEvento();
  const { mutate: eliminarEvento } =
    useEliminarEvento();

  const abrirModalEditar = () => {
    if (!evento) return;
    modals.open({
      title:    'Editar evento',
      size:     'lg',
      children: (
        <EventoForm
          evento={evento}
          onSubmit={async (datos) => {
            try {
              await actualizarEventoAsync({ id, datos });
              modals.closeAll();
            } catch (e) {}
          }}
          onCancel={() => modals.closeAll()}
          isLoading={actualizando}
        />
      ),
    });
  };

  if (isError) {
    return (
      <>
        <PageHeader
          titulo="Evento no encontrado"
          breadcrumbs={[
            { label: 'Inicio',  href: '/dashboard' },
            { label: 'Eventos', href: '/eventos' },
            { label: 'Detalle' },
          ]}
        />
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          title="No se pudo cargar el evento"
        >
          El evento solicitado no existe.
          <Anchor
            component={Link}
            href="/eventos"
            size="sm"
            display="block"
            mt="xs"
          >
            ← Volver a eventos
          </Anchor>
        </Alert>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <PageHeader
          titulo="Cargando evento..."
          breadcrumbs={[
            { label: 'Inicio',  href: '/dashboard' },
            { label: 'Eventos', href: '/eventos' },
            { label: 'Detalle' },
          ]}
        />
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              {[1, 2].map((i) => (
                <Skeleton
                  key={i} height={160} radius="lg"
                />
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

  if (!evento) return null;

  // NOTA: participantes vienen en el detalle pero NO en
  // el listado. El campo en el detalle se llama
  // "participantes" (no "participantes_count")
  const participantes = (evento as unknown as {
    participantes: Array<{
      id: number;
      nombres: string;
      email: string;
      asistio: boolean;
      confirmado_en: string;
    }>;
  }).participantes ?? [];

  return (
    <>
      <PageHeader
        titulo={evento.titulo}
        breadcrumbs={[
          { label: 'Inicio',  href: '/dashboard' },
          { label: 'Eventos', href: '/eventos' },
          { label: evento.titulo },
        ]}
        acciones={
          <Group gap="sm">
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              leftSection={<IconArrowLeft size={15} />}
              component={Link}
              href="/eventos"
            >
              Volver
            </Button>
            {can('eventos.editar') && (
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
            {can('eventos.eliminar') && (
              <Button
                color="red"
                variant="light"
                size="sm"
                leftSection={<IconTrash size={15} />}
                onClick={() =>
                  confirmar({
                    titulo:     'Eliminar evento',
                    mensaje:    `¿Eliminar "${evento.titulo}"?`,
                    textoBoton: 'Eliminar',
                    colorBoton: 'red',
                    onConfirmar: () =>
                      eliminarEvento(id, {
                        onSuccess: () =>
                          router.push('/eventos'),
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
            <Paper p="lg" radius="lg"
              style={{
                border:
                  '1px solid var(--mantine-color-gray-3)',
              }}>
              <Group justify="space-between" mb="md">
                <Title order={5} c="gray.7">
                  Información del evento
                </Title>
                <Badge
                  size="md"
                  style={{
                    background:
                      COLOR_TIPO_EVENTO[
                        evento.tipo_evento
                      ] + '20',
                    color:
                      COLOR_TIPO_EVENTO[evento.tipo_evento],
                  }}
                >
                  {evento.tipo_evento}
                </Badge>
              </Group>

              <Stack gap="md">
                {/* Fecha */}
                <Group gap="xs">
                  <IconCalendar size={16}
                    color="var(--mantine-color-gray-5)" />
                  <Text size="sm" fw={500}>
                    {evento.fecha_evento}
                  </Text>
                </Group>

                {/* Lugar o virtual */}
                {evento.es_virtual ? (
                  <Group gap="xs">
                    <IconVideo size={16}
                      color="var(--mantine-color-teal-6)" />
                    <Text size="sm">Evento virtual</Text>
                    {evento.url_virtual && (
                      <Anchor
                        href={evento.url_virtual}
                        target="_blank"
                        size="sm"
                      >
                        Unirse a la reunión →
                      </Anchor>
                    )}
                  </Group>
                ) : evento.lugar && (
                  <Group gap="xs">
                    <IconMapPin size={16}
                      color="var(--mantine-color-gray-5)" />
                    <Text size="sm">{evento.lugar}</Text>
                  </Group>
                )}

                {/* Creado por */}
                {evento.creado_por && (
                  <Group gap="xs">
                    <IconUser size={16}
                      color="var(--mantine-color-gray-5)" />
                    <Text size="xs" c="dimmed">
                      Organizado por{' '}
                      {evento.creado_por.name}
                    </Text>
                  </Group>
                )}

                {/* Descripción */}
                {evento.descripcion && (
                  <>
                    <Divider />
                    <Stack gap={4}>
                      <Text size="xs" fw={600} c="dimmed"
                        tt="uppercase"
                        style={{ letterSpacing: '0.05em' }}>
                        Descripción
                      </Text>
                      <Text size="sm" lh={1.7}>
                        {evento.descripcion}
                      </Text>
                    </Stack>
                  </>
                )}
              </Stack>
            </Paper>

            {/* Panel de compromisos */}
            <Paper p="lg" radius="lg"
              style={{
                border:
                  '1px solid var(--mantine-color-gray-3)',
              }}>
              <CompromisosPanel eventoId={id} />
            </Paper>
          </Stack>
        </Grid.Col>

        {/* ── Columna lateral: Participantes ── */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="lg" radius="lg"
            style={{
              border:
                '1px solid var(--mantine-color-gray-3)',
            }}>
            <ParticipantesPanel
              eventoId={id}
              participantes={participantes}
            />
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  );
}
