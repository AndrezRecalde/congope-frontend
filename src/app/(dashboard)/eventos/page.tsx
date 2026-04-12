'use client'

import { useState, useEffect }    from 'react';
import { useRouter }   from 'next/navigation';
import dynamic         from 'next/dynamic';
import Link from 'next/link';
import {
  Button, SegmentedControl, Group,
  TextInput, Select, Paper, Skeleton,
  Stack, Badge, Text, ActionIcon, Tooltip, Anchor
} from '@mantine/core';
import { modals }      from '@mantine/modals';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconPlus, IconCalendar, IconList,
  IconCalendarEvent, IconEye, IconEdit, IconMapPin, IconVideo, IconUsers
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { PageHeader }  from
  '@/components/ui/PageHeader/PageHeader';
import { EmptyState }  from
  '@/components/ui/EmptyState/EmptyState';
import { EventoForm }  from
  '@/components/modulos/eventos/EventoForm';
import {
  useEventos,
  useCrearEvento,
  useActualizarEvento,
} from '@/queries/eventos.queries';
import { usePermisos } from '@/hooks/usePermisos';
import { COLOR_TIPO_EVENTO } from '@/types/evento.types';
import type { EventoFiltros } from '@/types/evento.types';
import type { Evento } from '@/services/axios';

// FullCalendar solo en el cliente (usa DOM)
const EventosCalendario = dynamic(
  () => import(
    '@/components/modulos/eventos/EventosCalendario'
  ).then((m) => m.EventosCalendario),
  {
    ssr: false,
    loading: () => (
      <Skeleton height={500} radius="lg" />
    ),
  }
);

const TIPOS_EVENTO_OPCIONES = [
  { value: '',                 label: 'Todos los tipos' },
  { value: 'Misión técnica',   label: 'Misión técnica' },
  { value: 'Reunión bilateral',label: 'Reunión bilateral' },
  { value: 'Conferencia',      label: 'Conferencia' },
  { value: 'Visita de campo',  label: 'Visita de campo' },
  { value: 'Virtual',          label: 'Virtual' },
  { value: 'Otro',             label: 'Otro' },
];

const FILTROS_INICIALES: EventoFiltros = {
  search:     '',
  tipo_evento:'',
  page:       1,
};

export default function EventosPage() {
  const router   = useRouter();
  const [vista, setVista] =
    useState<'calendario' | 'lista'>('calendario');
  const [filtros, setFiltros] =
    useState<EventoFiltros>(FILTROS_INICIALES);
  const [fechaInicial, setFechaInicial] =
    useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] =
    useDebouncedValue(searchInput, 400);

  useEffect(() => {
    if (debouncedSearch !== filtros.search) {
      setFiltros((prev) => ({
        ...prev,
        search: debouncedSearch,
        page: 1,
      }));
    }
  }, [debouncedSearch]);

  const { can } = usePermisos();
  const puedeCrear = can('eventos.crear');

  // Para el calendario cargar más eventos (sin paginar)
  const { data, isLoading } = useEventos({
    search:      filtros.search,
    tipo_evento: filtros.tipo_evento,
    per_page:    100, // suficiente para el calendario
    page:        1,
  });

  const {
    mutateAsync: crearEventoAsync,
    isPending: creando,
  } = useCrearEvento();

  const {
    mutateAsync: actualizarEventoAsync,
  } = useActualizarEvento();

  const eventos = data?.data ?? [];

  const abrirModalCrear = (fecha?: string) => {
    setFechaInicial(fecha ?? null);
    modals.open({
      title: 'Nuevo evento',
      size:  'lg',
      children: (
        <EventoForm
          onSubmit={async (datos) => {
            try {
              const evento = await crearEventoAsync(datos);
              modals.closeAll();
              router.push(`/eventos/${evento.id}`);
            } catch (e) {
              // error managed by mutation globally
            }
          }}
          onCancel={() => modals.closeAll()}
          isLoading={creando}
        />
      ),
    });
  };

  return (
    <>
      <PageHeader
        titulo="Agenda y Eventos"
        descripcion="Gestión de eventos, reuniones y compromisos del CONGOPE"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Eventos' },
        ]}
        acciones={
          <Group gap="sm">
            <SegmentedControl
              value={vista}
              onChange={(v) =>
                setVista(v as 'calendario' | 'lista')
              }
              size="sm"
              data={[
                {
                  value: 'calendario',
                  label: (
                    <Group gap={6}>
                      <IconCalendar size={14} />
                      Calendario
                    </Group>
                  ),
                },
                {
                  value: 'lista',
                  label: (
                    <Group gap={6}>
                      <IconList size={14} />
                      Lista
                    </Group>
                  ),
                },
              ]}
            />
            {puedeCrear && (
              <Button
                color="congope"
                leftSection={<IconPlus size={16} />}
                onClick={() => abrirModalCrear()}
              >
                Nuevo evento
              </Button>
            )}
          </Group>
        }
      />

      {/* Filtros */}
      <Paper
        p="md"
        mb="md"
        radius="md"
        style={{
          border: '1px solid var(--mantine-color-gray-3)',
          background: 'var(--mantine-color-gray-0)',
        }}
      >
        <Group gap="sm" wrap="wrap">
          <TextInput
            placeholder="Buscar evento..."
            value={searchInput}
            onChange={(e) =>
              setSearchInput(e.currentTarget.value)
            }
            style={{ flex: 1, minWidth: 200 }}
            size="sm"
          />
          <Select
            placeholder="Tipo de evento"
            data={TIPOS_EVENTO_OPCIONES}
            value={filtros.tipo_evento ?? ''}
            onChange={(val) =>
              setFiltros((prev) => ({
                ...prev,
                tipo_evento: (val ?? '') as
                  EventoFiltros['tipo_evento'],
              }))
            }
            w={180}
            size="sm"
          />
        </Group>
      </Paper>

      {/* Vista calendario o lista */}
      {isLoading ? (
        <Skeleton height={500} radius="lg" />
      ) : eventos.length === 0 ? (
        <EmptyState
          icono={<IconCalendarEvent size={36} />}
          titulo="Sin eventos registrados"
          descripcion="No hay eventos que coincidan con los filtros."
          accion={
            puedeCrear ? (
              <Button
                color="congope"
                leftSection={<IconPlus size={16} />}
                onClick={() => abrirModalCrear()}
              >
                Crear primer evento
              </Button>
            ) : undefined
          }
        />
      ) : vista === 'calendario' ? (
        <EventosCalendario
          eventos={eventos}
          onClickEvento={(id) =>
            router.push(`/eventos/${id}`)
          }
          onCrearEnFecha={
            puedeCrear ? abrirModalCrear : undefined
          }
        />
      ) : (
        <EventosListaView
          eventos={eventos}
          onVerDetalle={(id) =>
            router.push(`/eventos/${id}`)
          }
          onEditar={(evento) => {
            modals.open({
              title: 'Editar evento',
              size:  'lg',
              children: (
                <EventoForm
                  evento={evento}
                  onSubmit={async (datos) => {
                    try {
                      await actualizarEventoAsync({ id: evento.id, datos });
                      modals.closeAll();
                    } catch (e) {}
                  }}
                  onCancel={() => modals.closeAll()}
                />
              ),
            });
          }}
        />
      )}
    </>
  );
}

// Vista de lista como componente separado
// para mantener el código organizado
function EventosListaView({
  eventos,
  onVerDetalle,
  onEditar,
}: {
  eventos:      Evento[];
  onVerDetalle: (id: string) => void;
  onEditar:     (e: Evento) => void;
}) {
  return (
    <DataTable
      records={eventos}
      striped
      highlightOnHover
      withTableBorder
      withColumnBorders={false}
      borderRadius="md"
      minHeight={300}
      noRecordsText="Sin eventos"
      styles={{
        header: {
          backgroundColor:
            'var(--mantine-color-gray-1)',
        },
      }}
      columns={[
        {
          accessor: 'tipo_evento',
          title:    'Tipo',
          width:    160,
          render:   (e: Evento) => (
            <Badge
              size="sm"
              variant="light"
              style={{
                background:
                  COLOR_TIPO_EVENTO[e.tipo_evento] + '20',
                color: COLOR_TIPO_EVENTO[e.tipo_evento],
                border: `1px solid ${
                  COLOR_TIPO_EVENTO[e.tipo_evento]
                }40`,
              }}
            >
              {e.tipo_evento}
            </Badge>
          ),
        },
        {
          accessor: 'titulo',
          title:    'Evento',
          render:   (e: Evento) => (
            <Stack gap={2}>
              <Anchor
                component={Link}
                href={`/eventos/${e.id}`}
                size="sm"
                fw={500}
                c="congope.8"
                style={{ textDecoration: 'none' }}
              >
                {e.titulo}
              </Anchor>
              {e.lugar ? (
                <Group gap={4}>
                  <IconMapPin size={11}
                    color="var(--mantine-color-gray-5)" />
                  <Text size="xs" c="dimmed">
                    {e.lugar}
                  </Text>
                </Group>
              ) : e.es_virtual ? (
                <Group gap={4}>
                  <IconVideo size={11}
                    color="var(--mantine-color-gray-5)" />
                  <Text size="xs" c="dimmed">Virtual</Text>
                </Group>
              ) : null}
            </Stack>
          ),
        },
        {
          accessor: 'fecha_evento',
          title:    'Fecha',
          width:    120,
          render:   (e: Evento) => (
            <Text size="sm" fw={500}>
              {e.fecha_evento}
            </Text>
          ),
        },
        {
          accessor: 'participantes_count',
          title:    'Participantes',
          width:    120,
          textAlign:'center',
          render:   (e: Evento) => (
            <Group gap={4} justify="center">
              <IconUsers size={13}
                color="var(--mantine-color-gray-5)" />
              <Text size="sm">{e.participantes_count}</Text>
            </Group>
          ),
        },
        {
          accessor:  'acciones',
          title:     '',
          width:     80,
          textAlign: 'right',
          render:    (e: Evento) => (
            <Group gap={4} justify="flex-end">
              <Tooltip label="Ver detalle">
                <ActionIcon
                  component={Link}
                  href={`/eventos/${e.id}`}
                  variant="subtle"
                  color="gray"
                  size="sm"
                >
                  <IconEye size={15} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Editar">
                <ActionIcon
                  variant="subtle"
                  color="congope"
                  size="sm"
                  onClick={() => onEditar(e)}
                >
                  <IconEdit size={15} />
                </ActionIcon>
              </Tooltip>
            </Group>
          ),
        },
      ]}
    />
  );
}
