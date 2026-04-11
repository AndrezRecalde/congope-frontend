'use client'

import {
  Stack, Group, Text, Badge, ActionIcon,
  Button, Tooltip, Title, Paper,
} from '@mantine/core';
import {
  IconPlus, IconEdit, IconTrash,
  IconTrophy,
} from '@tabler/icons-react';
import { modals }    from '@mantine/modals';
import { ReconocimientoForm } from './ReconocimientoForm';
import {
  useCrearReconocimiento,
  useActualizarReconocimiento,
  useEliminarReconocimiento,
} from '@/queries/emblematicos.queries';
import { usePermisos } from '@/hooks/usePermisos';
import { useConfirm }  from '@/hooks/useConfirm';
import { formatFecha } from '@/utils/formatters';
import type { Reconocimiento } from '@/services/axios';

interface ReconocimientosPanelProps {
  emblematicoId:    string;
  reconocimientos:  Reconocimiento[];
}

export function ReconocimientosPanel({
  emblematicoId,
  reconocimientos,
}: ReconocimientosPanelProps) {
  const { can }       = usePermisos();
  const { confirmar } = useConfirm();

  const {
    mutateAsync: crearReconocimientoAsync,
  } = useCrearReconocimiento(emblematicoId);

  const {
    mutateAsync: actualizarReconocimientoAsync,
  } = useActualizarReconocimiento(emblematicoId);

  const { mutate: eliminarReconocimiento } =
    useEliminarReconocimiento(emblematicoId);

  const abrirModalCrear = () => {
    modals.open({
      title:    'Agregar reconocimiento',
      size:     'md',
      children: (
        <ReconocimientoForm
          onSubmit={async (datos) => {
            await crearReconocimientoAsync(datos);
            modals.closeAll();
          }}
          onCancel={() => modals.closeAll()}
        />
      ),
    });
  };

  const abrirModalEditar = (rec: Reconocimiento) => {
    modals.open({
      title:    'Editar reconocimiento',
      size:     'md',
      children: (
        <ReconocimientoForm
          reconocimiento={rec}
          onSubmit={async (datos) => {
            await actualizarReconocimientoAsync({
              reconocimientoId: rec.id,
              datos,
            });
            modals.closeAll();
          }}
          onCancel={() => modals.closeAll()}
        />
      ),
    });
  };

  const confirmarEliminar = (rec: Reconocimiento) => {
    confirmar({
      titulo:     'Eliminar reconocimiento',
      mensaje:    `¿Eliminar "${rec.titulo}"?`,
      textoBoton: 'Eliminar',
      colorBoton: 'red',
      onConfirmar: () => eliminarReconocimiento(rec.id),
    });
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group gap="xs">
          <Title order={5} c="gray.7">
            Reconocimientos
          </Title>
          <Badge
            variant="light"
            color="yellow"
            size="sm"
          >
            {reconocimientos.length}
          </Badge>
        </Group>
        {can('reconocimientos.crear') && (
          <Button
            size="xs"
            variant="light"
            color="yellow"
            leftSection={<IconPlus size={13} />}
            onClick={abrirModalCrear}
          >
            Agregar reconocimiento
          </Button>
        )}
      </Group>

      {reconocimientos.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="md">
          Este proyecto no tiene reconocimientos registrados.
        </Text>
      ) : (
        <Stack gap="sm">
          {reconocimientos.map((rec) => (
            <Paper
              key={rec.id}
              p="md"
              radius="md"
              style={{
                border:
                  '1px solid var(--mantine-color-yellow-3)',
                background: '#FFFBEB',
              }}
            >
              <Group
                justify="space-between"
                wrap="nowrap"
                align="flex-start"
              >
                <Group
                  gap="sm"
                  wrap="nowrap"
                  align="flex-start"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <IconTrophy
                    size={18}
                    color="#D97706"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <Stack gap={4} style={{ minWidth: 0 }}>
                    <Text size="sm" fw={600}>
                      {rec.titulo}
                    </Text>
                    <Group gap="xs" wrap="wrap">
                      <Text size="xs" c="dimmed">
                        {rec.organismo_otorgante}
                      </Text>
                      <Badge
                        size="xs"
                        variant="light"
                        color={
                          rec.ambito === 'Internacional'
                            ? 'violet'
                            : 'blue'
                        }
                      >
                        {rec.ambito}
                      </Badge>
                      <Badge
                        size="xs"
                        variant="outline"
                        color="gray"
                      >
                        {rec.anio}
                      </Badge>
                    </Group>
                    {rec.descripcion && (
                      <Text
                        size="xs"
                        c="dimmed"
                        lineClamp={2}
                        lh={1.5}
                      >
                        {rec.descripcion}
                      </Text>
                    )}
                    <Text size="xs" c="dimmed">
                      Registrado:{' '}
                      {formatFecha(rec.created_at)}
                    </Text>
                  </Stack>
                </Group>

                <Group gap={4} wrap="nowrap">
                  {can('reconocimientos.editar') && (
                    <Tooltip label="Editar">
                      <ActionIcon
                        variant="subtle"
                        color="congope"
                        size="sm"
                        onClick={() => abrirModalEditar(rec)}
                      >
                        <IconEdit size={14} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  {can('reconocimientos.eliminar') && (
                    <Tooltip label="Eliminar">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() =>
                          confirmarEliminar(rec)
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
