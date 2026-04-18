'use client'

import { useState }   from 'react';
import {
  Stack, Group, Text, Badge, ActionIcon,
  Button, Tooltip, Title, Paper,
  Avatar, Checkbox, MultiSelect,
} from '@mantine/core';
import { modals }     from '@mantine/modals';
import { IconPlus, IconTrash, IconUser }
  from '@tabler/icons-react';
import { useQuery }   from '@tanstack/react-query';
import { queryKeys }  from '@/lib/query-client';
import apiClient      from '@/services/axios';
import {
  useAgregarParticipantes,
  useEliminarParticipante,
  useMarcarAsistencia,
} from '@/queries/eventos.queries';
import { usePermisos } from '@/hooks/usePermisos';
import { useConfirm }  from '@/hooks/useConfirm';
import type {
  ParticipanteEvento,
} from '@/types/evento.types';
import type { UsuarioAdmin } from '@/services/axios';

interface ParticipantesPanelProps {
  eventoId:      string;
  participantes: ParticipanteEvento[];
}

// Formulario interno para agregar participantes
function AgregarParticipantesForm({
  eventoId,
  participantesActuales,
  onCerrar,
}: {
  eventoId:              string;
  participantesActuales: ParticipanteEvento[];
  onCerrar:              () => void;
}) {
  const [seleccionados, setSeleccionados] =
    useState<string[]>([]);

  // Cargar usuarios del sistema
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

  const { mutate: agregar, isPending } =
    useAgregarParticipantes(eventoId);

  // IDs actuales para excluirlos del select
  const idsActuales = new Set(
    participantesActuales.map((p) => String(p.id))
  );

  const opciones = (usuariosData ?? [])
    .filter((u) => !idsActuales.has(String(u.id)))
    .map((u) => ({
      value: String(u.id), // MultiSelect trabaja con strings
      label: `${u.name} (${u.roles[0]?.name ?? ''})`,
    }));

  const handleAgregar = () => {
    if (seleccionados.length === 0) return;
    // Convertir strings a números (user_ids son INTEGER)
    const userIds = seleccionados.map(Number);
    agregar(userIds, { onSuccess: onCerrar });
  };

  return (
    <Stack gap="md">
      <MultiSelect
        label="Seleccionar usuarios"
        placeholder="Buscar usuarios del sistema..."
        data={opciones}
        value={seleccionados}
        onChange={setSeleccionados}
        searchable
        clearable
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
          color="congope"
          loading={isPending}
          disabled={seleccionados.length === 0}
          onClick={handleAgregar}
        >
          Agregar {seleccionados.length > 0
            ? `(${seleccionados.length})`
            : ''}
        </Button>
      </Group>
    </Stack>
  );
}

export function ParticipantesPanel({
  eventoId,
  participantes,
}: ParticipantesPanelProps) {
  const { can }       = usePermisos();
  const { confirmar } = useConfirm();
  const puedeGestionar = can('eventos.gestionar_participantes');

  const { mutate: eliminar } =
    useEliminarParticipante(eventoId);
  const { mutate: marcarAsistencia } =
    useMarcarAsistencia(eventoId);

  const abrirModalAgregar = () => {
    modals.open({
      title:    'Agregar participantes',
      size:     'md',
      children: (
        <AgregarParticipantesForm
          eventoId={eventoId}
          participantesActuales={participantes}
          onCerrar={() => modals.closeAll()}
        />
      ),
    });
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group gap="xs">
          <Title order={5}>
            Participantes
          </Title>
          <Badge variant="light" color="congope" size="sm">
            {participantes.length}
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
            Agregar
          </Button>
        )}
      </Group>

      {participantes.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="sm">
          Sin participantes registrados.
        </Text>
      ) : (
        <Stack gap="xs">
          {participantes.map((p) => (
            <Paper
              key={p.id}
              p="sm"
              radius="md"
              style={{
                border:
                  '1px solid var(--mantine-color-default-border)',
              }}
            >
              <Group
                justify="space-between"
                wrap="nowrap"
              >
                <Group gap="sm" wrap="nowrap">
                  <Avatar
                    size={34}
                    radius="xl"
                    color={p.asistio ? 'teal' : 'gray'}
                    variant="light"
                  >
                    <IconUser size={16} />
                  </Avatar>
                  <Stack gap={2}>
                    {/*
                      NOTA: campo "nombres" (plural)
                      según el OpenAPI, NO "name"
                    */}
                    <Text size="sm" fw={500}>
                      {p.nombres}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {p.email}
                    </Text>
                  </Stack>
                </Group>

                <Group gap="sm" wrap="nowrap">
                  {/* Checkbox de asistencia */}
                  {puedeGestionar && (
                    <Tooltip
                      label={
                        p.asistio
                          ? 'Asistió — clic para desmarcar'
                          : 'Marcar asistencia'
                      }
                    >
                      <Checkbox
                        checked={p.asistio}
                        onChange={(e) =>
                          marcarAsistencia({
                            userId: p.id,
                            asistio: e.currentTarget.checked,
                          })
                        }
                        color="teal"
                        label={
                          <Text size="xs" c="dimmed">
                            {p.asistio ? 'Asistió' : 'Sin confirmar'}
                          </Text>
                        }
                      />
                    </Tooltip>
                  )}
                  {!puedeGestionar && (
                    <Badge
                      size="xs"
                      variant="light"
                      color={p.asistio ? 'teal' : 'gray'}
                    >
                      {p.asistio ? 'Asistió' : 'Invitado'}
                    </Badge>
                  )}

                  {/* Eliminar participante */}
                  {puedeGestionar && (
                    <Tooltip label="Remover del evento">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() =>
                          confirmar({
                            titulo:     'Remover participante',
                            mensaje:    `¿Remover a "${p.nombres}" del evento?`,
                            textoBoton: 'Remover',
                            colorBoton: 'red',
                            onConfirmar: () =>
                              eliminar(p.id),
                          })
                        }
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
