'use client'

import {
  Stack, Group, Text, Badge, ActionIcon,
  Button, Tooltip, Title, Paper,
  TextInput, Textarea, Select,
  Skeleton,
} from '@mantine/core';
import { useForm, isNotEmpty } from '@mantine/form';
import { modals }     from '@mantine/modals';
import {
  IconPlus, IconCheck, IconX,
} from '@tabler/icons-react';
import { useQuery }   from '@tanstack/react-query';
import { queryKeys }  from '@/lib/query-client';
import apiClient      from '@/services/axios';
import {
  useCompromisosEvento,
  useCrearCompromiso,
  useResolverCompromiso,
} from '@/queries/eventos.queries';
import { usePermisos } from '@/hooks/usePermisos';
import { formatFecha } from '@/utils/formatters';
import type { UsuarioAdmin } from '@/services/axios';
import type {
  CompromisoFormValues,
} from '@/types/evento.types';

interface CompromisosPanelProps {
  eventoId: string;
}

// Formulario de nuevo compromiso
function NuevoCompromisoForm({
  eventoId,
  onCerrar,
}: {
  eventoId: string;
  onCerrar: () => void;
}) {
  // Cargar usuarios para el select de responsable
  const { data: usuariosData } = useQuery({
    queryKey: queryKeys.usuarios.list({}),
    queryFn:  async () => {
      const res = await apiClient.get('/usuarios', {
        params: { per_page: 100 },
      });
      return (res.data as {
        data: UsuarioAdmin[];
      }).data;
    },
  });

  const { mutate: crearCompromiso, isPending } =
    useCrearCompromiso(eventoId);

  const opcionesUsuarios = (usuariosData ?? []).map(
    (u) => ({
      value: String(u.id), // Select trabaja con strings
      label: u.name,
    })
  );

  const form = useForm<CompromisoFormValues>({
    initialValues: {
      descripcion:    '',
      responsable_id: '',
      fecha_limite:   '',
    },
    validate: {
      descripcion: isNotEmpty(
        'La descripción es requerida'
      ),
      responsable_id: (v) =>
        !v ? 'Selecciona el responsable' : null,
      fecha_limite: isNotEmpty(
        'La fecha límite es requerida'
      ),
    },
  });

  const handleSubmit = (values: CompromisoFormValues) => {
    crearCompromiso(
      {
        descripcion:    values.descripcion,
        // responsable_id es INTEGER según el OpenAPI
        responsable_id: Number(values.responsable_id),
        fecha_limite:   values.fecha_limite,
      },
      { onSuccess: onCerrar }
    );
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Textarea
          label="Descripción del compromiso"
          placeholder="¿Qué acción debe realizarse?"
          required
          autosize
          minRows={3}
          {...form.getInputProps('descripcion')}
        />
        <Select
          label="Responsable"
          placeholder="Seleccionar usuario responsable"
          data={opcionesUsuarios}
          required
          searchable
          {...form.getInputProps('responsable_id')}
        />
        <TextInput
          label="Fecha límite"
          type="date"
          required
          {...form.getInputProps('fecha_limite')}
        />
        <Group justify="flex-end" gap="sm">
          <Button
            variant="subtle"
            color="gray"
            onClick={onCerrar}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            color="congope"
            loading={isPending}
          >
            Crear compromiso
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function CompromisosPanel({
  eventoId,
}: CompromisosPanelProps) {
  const { can } = usePermisos();
  const puedeCrear   = can('compromisos.crear');
  const puedeResolver = can('compromisos.resolver');

  const {
    data: compromisos = [],
    isLoading,
  } = useCompromisosEvento(eventoId);

  const { mutate: resolver } =
    useResolverCompromiso(eventoId);

  const abrirModalNuevo = () => {
    modals.open({
      title:    'Nuevo compromiso del evento',
      size:     'md',
      children: (
        <NuevoCompromisoForm
          eventoId={eventoId}
          onCerrar={() => modals.closeAll()}
        />
      ),
    });
  };

  const pendientes  = compromisos.filter(
    (c) => !c.resuelto
  ).length;
  const vencidos    = compromisos.filter(
    (c) => c.vencido && !c.resuelto
  ).length;

  if (isLoading) {
    return (
      <Stack gap="xs">
        {[1, 2].map((i) => (
          <Skeleton key={i} height={70} radius="md" />
        ))}
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group gap="xs">
          <Title order={5}>
            Compromisos
          </Title>
          {pendientes > 0 && (
            <Badge
              variant="light"
              color={vencidos > 0 ? 'red' : 'orange'}
              size="sm"
            >
              {pendientes} pendiente
              {pendientes !== 1 ? 's' : ''}
            </Badge>
          )}
        </Group>
        {puedeCrear && (
          <Button
            size="xs"
            variant="light"
            color="congope"
            leftSection={<IconPlus size={13} />}
            onClick={abrirModalNuevo}
          >
            Nuevo compromiso
          </Button>
        )}
      </Group>

      {compromisos.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="sm">
          Sin compromisos registrados para este evento.
        </Text>
      ) : (
        <Stack gap="xs">
          {compromisos.map((comp) => (
            <Paper
              key={comp.id}
              p="md"
              radius="md"
              style={{
                border: `1px solid ${
                  comp.resuelto
                    ? 'var(--mantine-color-green-light-color)'
                    : comp.vencido
                    ? 'var(--mantine-color-red-light-color)'
                    : 'var(--mantine-color-default-border)'
                }`,
                backgroundColor: comp.resuelto
                  ? 'var(--mantine-color-green-light)'
                  : comp.vencido
                  ? 'var(--mantine-color-red-light)'
                  : 'var(--mantine-color-body)',
              }}
            >
              <Group
                justify="space-between"
                align="flex-start"
                wrap="nowrap"
              >
                <Stack gap={4} style={{ flex: 1 }}>
                  <Text
                    size="sm"
                    fw={500}
                    td={comp.resuelto
                      ? 'line-through' : undefined}
                    c={comp.resuelto ? 'dimmed' : undefined}
                  >
                    {comp.descripcion}
                  </Text>

                  <Group gap="xs" wrap="wrap">
                    {comp.responsable && (
                      <Text size="xs" c="dimmed">
                        Resp.: {comp.responsable.name}
                      </Text>
                    )}
                    <Text
                      size="xs"
                      c={
                        comp.vencido && !comp.resuelto
                          ? 'var(--mantine-color-red-light-color)'
                          : 'dimmed'
                      }
                      fw={
                        comp.vencido && !comp.resuelto
                          ? 600 : 400
                      }
                    >
                      Límite:{' '}
                      {formatFecha(comp.fecha_limite)}
                    </Text>
                    {!comp.resuelto && (
                      comp.vencido ? (
                        <Badge
                          size="xs"
                          color="red"
                          variant="light"
                        >
                          Vencido
                        </Badge>
                      ) : (
                        <Text size="xs" c="dimmed">
                          {comp.dias_restantes} día
                          {comp.dias_restantes !== 1
                            ? 's' : ''} restantes
                        </Text>
                      )
                    )}
                    {comp.resuelto && (
                      <Badge
                        size="xs"
                        color="green"
                        variant="light"
                      >
                        Resuelto
                      </Badge>
                    )}
                  </Group>
                </Stack>

                {/* Botón resolver / reabrir */}
                {puedeResolver && (
                  <Tooltip label={comp.resuelto ? "Marcar como pendiente" : "Marcar como resuelto"}>
                    <ActionIcon
                      variant="light"
                      color={comp.resuelto ? "orange" : "green"}
                      size="sm"
                      onClick={() =>
                        resolver({ compromisoId: comp.id, resuelto: !comp.resuelto })
                      }
                    >
                      {comp.resuelto ? <IconX size={14} /> : <IconCheck size={14} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
