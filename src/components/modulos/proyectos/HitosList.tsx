'use client'

import { useState }   from 'react';
import {
  Stack, Group, Text, Badge, Checkbox,
  ActionIcon, Button, Tooltip, Paper,
  Skeleton, TextInput, Textarea, Title,
  Progress, Modal
} from '@mantine/core';
import { useForm, isNotEmpty } from '@mantine/form';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { formatFecha } from '@/utils/formatters';
import {
  useHitosProyecto,
  useCrearHito,
  useEliminarHito,
  useCompletarHito,
} from '@/queries/proyectos.queries';
import { useConfirm }  from '@/hooks/useConfirm';
import { usePermisos } from '@/hooks/usePermisos';
import type { HitoFormValues } from '@/types/proyecto.types';
import dayjs from 'dayjs';

interface HitosListProps {
  proyectoId: string;
}

export function HitosList({ proyectoId }: HitosListProps) {
  const { can }     = usePermisos();
  const { confirmar } = useConfirm();

  const { data: hitosData, isLoading } =
    useHitosProyecto(proyectoId);
  const { mutate: crearHito,    isPending: creando }   =
    useCrearHito(proyectoId);
  const { mutate: eliminarHito }  = useEliminarHito(proyectoId);
  const { mutate: completarHito } = useCompletarHito(proyectoId);

  const [optimisticHitos, setOptimisticHitos] = useState(hitosData ?? []);
  const [prevHitosData, setPrevHitosData] = useState(hitosData);

  // Patrón oficial de React para sincronizar estado derivado sin disparar useEffects en cascada
  if (hitosData !== prevHitosData) {
    setPrevHitosData(hitosData);
    setOptimisticHitos(hitosData ?? []);
  }

  const completados = optimisticHitos.filter((h) => h.completado).length;
  const porcentaje  =
    optimisticHitos.length > 0
      ? Math.round((completados / optimisticHitos.length) * 100)
      : 0;

  const form = useForm<HitoFormValues>({
    initialValues: {
      titulo:       '',
      descripcion:  '',
      fecha_limite: '',
    },
    validate: {
      titulo:       isNotEmpty('El título es requerido'),
      fecha_limite: isNotEmpty('La fecha límite es requerida'),
    },
  });

  const [modalAbierto, setModalAbierto] = useState(false);

  const handleCrearHito = (values: HitoFormValues) => {
    crearHito(
      {
        titulo:       values.titulo,
        descripcion:  values.descripcion || undefined,
        fecha_limite: values.fecha_limite,
      },
      {
        onSuccess: () => {
          form.reset();
          setModalAbierto(false);
        },
      }
    );
  };

  const cerrarModal = () => {
    form.reset();
    setModalAbierto(false);
  };

  if (isLoading) {
    return (
      <Stack gap="xs">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={60} radius="md" />
        ))}
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {/* Cabecera con progreso */}
      <Group justify="space-between">
        <Group gap="xs">
          <Title order={5} c="gray.7">
            Hitos del proyecto
          </Title>
          <Badge variant="light" color="congope" size="sm">
            {completados}/{optimisticHitos.length}
          </Badge>
        </Group>
        {can('hitos.crear') && (
          <Button
            size="xs"
            variant="light"
            color="congope"
            leftSection={<IconPlus size={13} />}
            onClick={() => setModalAbierto(true)}
          >
            Agregar hito
          </Button>
        )}
      </Group>

      {optimisticHitos.length > 0 && (
        <Stack gap={4}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">Progreso general</Text>
            <Text size="xs" fw={600}>{porcentaje}%</Text>
          </Group>
          <Progress value={porcentaje} color="congope" size="sm" />
        </Stack>
      )}

      {/* Lista de hitos */}
      {optimisticHitos.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="md">
          No hay hitos registrados para este proyecto.
        </Text>
      ) : (
        optimisticHitos.map((hito) => {
          // NOTA: fecha_limite viene en ISO 8601 completo
          const estaVencido =
            !hito.completado &&
            dayjs(hito.fecha_limite).isBefore(dayjs(), 'day');

          return (
            <Paper
              key={hito.id}
              p="sm"
              radius="md"
              style={{
                border: `1px solid ${
                  hito.completado
                    ? 'var(--mantine-color-green-3)'
                    : estaVencido
                    ? 'var(--mantine-color-red-3)'
                    : 'var(--mantine-color-gray-3)'
                }`,
                background: hito.completado
                  ? 'var(--mantine-color-green-0)'
                  : estaVencido
                  ? 'var(--mantine-color-red-0)'
                  : 'white',
                transition: 'all 200ms ease',
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                  {/* Checkbox para completar */}
                  <Tooltip
                    label={
                      hito.completado
                        ? 'Completado'
                        : can('hitos.completar')
                        ? 'Marcar como completado'
                        : 'Sin permiso'
                    }
                  >
                    <Checkbox
                      checked={hito.completado}
                      onChange={() => {
                        if (
                          !hito.completado &&
                          can('hitos.completar')
                        ) {
                          setOptimisticHitos((prev) =>
                            prev.map((h) =>
                              h.id === hito.id
                                ? { ...h, completado: true, completado_en: new Date().toISOString() }
                                : h
                            )
                          );
                          completarHito(hito.id);
                        }
                      }}
                      color="green"
                      readOnly={
                        hito.completado || !can('hitos.completar')
                      }
                      styles={{ input: { cursor: hito.completado ? 'default' : 'pointer' } }}
                    />
                  </Tooltip>

                  <Stack gap={2} style={{ flex: 1 }}>
                    <Text
                      size="sm"
                      fw={500}
                      td={hito.completado ? 'line-through' : undefined}
                      c={hito.completado ? 'dimmed' : undefined}
                    >
                      {hito.titulo}
                    </Text>
                    {hito.descripcion && (
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {hito.descripcion}
                      </Text>
                    )}
                    <Group gap="xs">
                      <Text
                        size="xs"
                        c={estaVencido ? 'red' : 'dimmed'}
                        fw={estaVencido ? 600 : 400}
                      >
                        Límite:{' '}
                        {formatFecha(hito.fecha_limite)}
                      </Text>
                      {hito.completado && hito.completado_en && (
                        <Text size="xs" c="green.7">
                          · Completado:{' '}
                          {formatFecha(hito.completado_en)}
                        </Text>
                      )}
                      {estaVencido && (
                        <Badge color="red" size="xs" variant="light">
                          Vencido
                        </Badge>
                      )}
                    </Group>
                  </Stack>
                </Group>

                {/* Eliminar hito */}
                {can('hitos.editar') && !hito.completado && (
                  <Tooltip label="Eliminar hito">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() =>
                        confirmar({
                          titulo:     'Eliminar hito',
                          mensaje:    `¿Eliminar el hito "${hito.titulo}"?`,
                          textoBoton: 'Eliminar',
                          colorBoton: 'red',
                          onConfirmar: () =>
                            eliminarHito(hito.id),
                        })
                      }
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </Paper>
          );
        })
      )}

      {/* Modal Declarativo (Reactivo) */}
      <Modal
        opened={modalAbierto}
        onClose={cerrarModal}
        title="Nuevo hito del proyecto"
      >
        <form onSubmit={form.onSubmit(handleCrearHito)}>
          <Stack gap="md">
            <TextInput
              label="Título del hito"
              placeholder="Ej: Entrega de informe Q1"
              required
              {...form.getInputProps('titulo')}
            />
            <Textarea
              label="Descripción"
              placeholder="Descripción detallada del hito..."
              rows={3}
              {...form.getInputProps('descripcion')}
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
                onClick={cerrarModal}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                color="congope"
                loading={creando}
              >
                Crear hito
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
