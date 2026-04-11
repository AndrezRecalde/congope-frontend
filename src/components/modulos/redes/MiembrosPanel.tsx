'use client'

import { useState } from 'react';
import {
  Stack, Group, Text, Badge, ActionIcon,
  Button, Tooltip, Divider, Title,
  TextInput, Select, Paper, Avatar,
  Skeleton,
} from '@mantine/core';
import { useForm, isNotEmpty } from '@mantine/form';
import { modals }   from '@mantine/modals';
import {
  IconPlus, IconTrash, IconBuilding,
} from '@tabler/icons-react';
import { useActores } from '@/queries/actores.queries';
import {
  useAgregarMiembro,
  useEliminarMiembro,
} from '@/queries/redes.queries';
import { usePermisos } from '@/hooks/usePermisos';
import { useConfirm }  from '@/hooks/useConfirm';
import { formatFecha } from '@/utils/formatters';
import type { MiembroRed } from '@/services/axios';
import type { AgregarMiembroValues }
  from '@/types/red.types';

interface MiembrosPanelProps {
  redId:    string;
  miembros: MiembroRed[];
}

// Formulario para agregar un nuevo miembro
function AgregarMiembroForm({
  redId,
  miembrosActuales,
  onCerrar,
}: {
  redId:            string;
  miembrosActuales: MiembroRed[];
  onCerrar:         () => void;
}) {
  const { data: actoresData } = useActores({ per_page: 100 });
  const { mutate: agregar, isPending } =
    useAgregarMiembro(redId);

  // Excluir actores que ya son miembros
  const idsActuales = new Set(
    miembrosActuales.map((m) => m.actor.id)
  );
  const opcionesActores = (actoresData?.data ?? [])
    .filter((a) => !idsActuales.has(a.id))
    .map((a) => ({
      value: a.id,
      label: `${a.nombre} (${a.tipo})`,
    }));

  const form = useForm<AgregarMiembroValues>({
    initialValues: {
      actor_id:      '',
      rol_miembro:   '',
      fecha_ingreso: '',
    },
    validate: {
      actor_id: isNotEmpty('Selecciona un actor'),
    },
  });

  const handleSubmit = (values: AgregarMiembroValues) => {
    agregar(
      {
        actorId:      values.actor_id,
        rolMiembro:   values.rol_miembro || null,
        fechaIngreso: values.fecha_ingreso || null,
      },
      { onSuccess: onCerrar }
    );
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Select
          label="Actor cooperante"
          placeholder="Buscar actor..."
          data={opcionesActores}
          searchable
          required
          {...form.getInputProps('actor_id')}
        />
        <Group grow align="flex-start">
          <TextInput
            label="Rol en la red"
            placeholder="Ej: Asesor Técnico"
            {...form.getInputProps('rol_miembro')}
          />
          <TextInput
            label="Fecha de ingreso"
            type="date"
            {...form.getInputProps('fecha_ingreso')}
          />
        </Group>
        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" color="gray"
            onClick={onCerrar} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" color="congope"
            loading={isPending}>
            Agregar miembro
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function MiembrosPanel({
  redId,
  miembros,
}: MiembrosPanelProps) {
  const { can }       = usePermisos();
  const { confirmar } = useConfirm();
  const { mutate: eliminarMiembro } =
    useEliminarMiembro(redId);

  const puedeGestionar = can('redes.gestionar_miembros');

  const abrirModalAgregar = () => {
    modals.open({
      title: 'Agregar miembro a la red',
      size:  'md',
      children: (
        <AgregarMiembroForm
          redId={redId}
          miembrosActuales={miembros}
          onCerrar={() => modals.closeAll()}
        />
      ),
    });
  };

  const confirmarEliminar = (miembro: MiembroRed) => {
    confirmar({
      titulo:     'Remover miembro',
      mensaje:    `¿Remover a "${miembro.actor.nombre}" de esta red?`,
      textoBoton: 'Remover',
      colorBoton: 'red',
      onConfirmar: () =>
        // NOTA: usamos miembro.actor.id para el DELETE
        // que envía actor_ids: [actorId]
        eliminarMiembro(miembro.actor.id),
    });
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group gap="xs">
          <Title order={5} c="gray.7">
            Miembros de la red
          </Title>
          <Badge variant="light" color="congope" size="sm">
            {miembros.length}
          </Badge>
        </Group>
        {puedeGestionar && (
          <Button
            size="xs"
            variant="light"
            color="congope"
            leftSection={<IconPlus size={13} />}
            onClick={abrirModalAgregar}
          >
            Agregar miembro
          </Button>
        )}
      </Group>

      {miembros.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="md">
          Esta red aún no tiene miembros registrados.
        </Text>
      ) : (
        <Stack gap="xs">
          {miembros.map((miembro) => (
            <Paper
              key={miembro.id}
              p="sm"
              radius="md"
              style={{
                border:
                  '1px solid var(--mantine-color-gray-3)',
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap"
                  style={{ flex: 1, minWidth: 0 }}>
                  <Avatar
                    size={36}
                    radius="md"
                    color="congope"
                    variant="light"
                  >
                    <IconBuilding size={18} />
                  </Avatar>
                  <Stack gap={2} style={{ minWidth: 0 }}>
                    <Text size="sm" fw={500} truncate>
                      {miembro.actor.nombre}
                    </Text>
                    <Group gap="xs">
                      <Badge
                        size="xs"
                        variant="dot"
                        color="blue"
                      >
                        {miembro.actor.tipo}
                      </Badge>
                      {/* NOTA: campo es "pais" no "pais_origen"
                          según el OpenAPI para actores en miembros */}
                      <Text size="xs" c="dimmed">
                        {miembro.actor.pais}
                      </Text>
                    </Group>
                    <Group gap="xs">
                      {miembro.rol_miembro && (
                        <Text size="xs" c="dimmed">
                          Rol: {miembro.rol_miembro}
                        </Text>
                      )}
                      {miembro.fecha_ingreso && (
                        <Text size="xs" c="dimmed">
                          · Desde:{' '}
                          {formatFecha(miembro.fecha_ingreso)}
                        </Text>
                      )}
                    </Group>
                  </Stack>
                </Group>

                {puedeGestionar && (
                  <Tooltip label="Remover miembro">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() =>
                        confirmarEliminar(miembro)
                      }
                    >
                      <IconTrash size={14} />
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
