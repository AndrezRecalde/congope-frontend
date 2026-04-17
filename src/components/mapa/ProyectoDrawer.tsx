'use client'

import {
  Drawer, Stack, Text, Title, Badge, Group,
  Skeleton, Divider, Progress, Anchor,
} from '@mantine/core';
import {
  IconBuilding, IconCalendar, IconMapPin,
  IconExternalLink, IconCheckbox,
  IconSquare,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useProyectoMapaDetalle }
  from '@/queries/mapa.queries';
import { StatusBadge }  from
  '@/components/ui/StatusBadge/StatusBadge';
import { formatFecha } from '@/utils/formatters';
import { getColorOds }  from '@/utils/colores-ods';

interface ProyectoDrawerProps {
  proyectoId: string | null;
  abierto:    boolean;
  onCerrar:   () => void;
}

export function ProyectoDrawer({
  proyectoId,
  abierto,
  onCerrar,
}: ProyectoDrawerProps) {
  const {
    data: proyecto,
    isLoading,
  } = useProyectoMapaDetalle(proyectoId);

  return (
    <Drawer
      opened={abierto}
      onClose={onCerrar}
      position="right"
      size="md"
      title={
        <Group gap="sm">
          <Text fw={600} size="sm" c="congope.8">
            Detalle del proyecto
          </Text>
          {proyecto && (
            <Badge variant="outline" color="gray" size="xs">
              {proyecto.codigo}
            </Badge>
          )}
        </Group>
      }
      styles={{
        header: {
          borderBottom:
            '1px solid var(--mantine-color-gray-3)',
          paddingBottom: 12,
        },
        body: { padding: 0 },
      }}
    >
      {isLoading ? (
        <Stack gap="md" p="md">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={40} radius="md" />
          ))}
        </Stack>
      ) : !proyecto ? (
        <Stack p="md" align="center">
          <Text size="sm" c="dimmed">
            No se pudo cargar el proyecto.
          </Text>
        </Stack>
      ) : (
        <Stack gap={0}>
          {/* Hero del proyecto */}
          <Stack
            gap="xs"
            p="md"
            style={{
              background: 'var(--mantine-color-gray-0)',
              borderBottom:
                '1px solid var(--mantine-color-gray-3)',
            }}
          >
            <Group justify="space-between" align="flex-start">
              <StatusBadge
                estado={proyecto.estado}
                tipo="proyecto"
              />
              <Anchor
                component={Link}
                href={`/proyectos/${proyecto.id}`}
                size="xs"
                target="_blank"
              >
                <Group gap={4}>
                  Ver completo
                  <IconExternalLink size={12} />
                </Group>
              </Anchor>
            </Group>

            <Title order={4} lh={1.3}>
              {proyecto.nombre}
            </Title>

            {proyecto.actor && (
              <Group gap="xs">
                <IconBuilding
                  size={13}
                  color="var(--mantine-color-gray-5)"
                />
                <Text size="xs" c="dimmed">
                  {proyecto.actor.nombre}
                </Text>
              </Group>
            )}

            <Text size="lg" fw={700} c="congope.8">
              {proyecto.monto_formateado}
            </Text>
          </Stack>

          {/* Cuerpo del drawer con scroll */}
          <Stack gap="md" p="md"
            style={{ overflowY: 'auto',
                     maxHeight: 'calc(100vh - 200px)' }}>

            {/* Fechas */}
            <Stack gap="xs">
              <Text size="xs" fw={600} c="dimmed"
                tt="uppercase"
                style={{ letterSpacing: '0.05em' }}>
                Cronograma
              </Text>
              <Group gap="md">
                <Group gap={4}>
                  <IconCalendar size={13}
                    color="var(--mantine-color-gray-5)" />
                  <Text size="xs">
                    {formatFecha(proyecto.fecha_inicio)}
                    {' — '}
                    {formatFecha(proyecto.fecha_fin_planificada)}
                  </Text>
                </Group>
              </Group>
            </Stack>

            <Divider />

            {/* Provincias con avance */}
            {proyecto.provincias?.length > 0 && (
              <Stack gap="xs">
                <Text size="xs" fw={600} c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: '0.05em' }}>
                  Provincias participantes
                </Text>
                {proyecto.provincias.map((prov) => (
                  <Stack key={prov.id} gap={4}>
                    <Group justify="space-between">
                      <Group gap="xs">
                        <IconMapPin size={12}
                          color="var(--mantine-color-gray-5)"
                        />
                        <Text size="sm" fw={500}>
                          {prov.nombre}
                        </Text>
                        <Badge size="xs" variant="light"
                          color="gray">
                          {prov.rol}
                        </Badge>
                      </Group>
                      {prov.porcentaje_avance !== null && (
                        <Text size="xs" fw={600}>
                          {prov.porcentaje_avance}%
                        </Text>
                      )}
                    </Group>
                    {prov.porcentaje_avance !== null && (
                      <Progress
                        value={prov.porcentaje_avance}
                        size="xs"
                        color="congope"
                      />
                    )}
                  </Stack>
                ))}
              </Stack>
            )}

            <Divider />

            {/* ODS alineados */}
            {proyecto.ods?.length > 0 && (
              <Stack gap="xs">
                <Text size="xs" fw={600} c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: '0.05em' }}>
                  ODS alineados
                </Text>
                <Group gap="xs" wrap="wrap">
                  {proyecto.ods.map((o) => (
                    <Badge
                      key={o.id}
                      size="sm"
                      style={{
                        background: getColorOds(o.numero),
                        color: 'white',
                      }}
                    >
                      {o.numero}. {o.nombre}
                    </Badge>
                  ))}
                </Group>
              </Stack>
            )}

            {/* Hitos recientes */}
            {(proyecto.hitos?.length ?? 0) > 0 && (
              <>
                <Divider />
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="xs" fw={600} c="dimmed"
                      tt="uppercase"
                      style={{ letterSpacing: '0.05em' }}>
                      Hitos
                    </Text>
                    <Text size="xs" c="dimmed">
                      {proyecto.hitos?.filter(
                        h => h.completado).length ?? 0
                      }/{proyecto.hitos?.length ?? 0} completados
                    </Text>
                  </Group>
                  {proyecto.hitos
                    ?.slice(0, 5)
                    .map((hito) => (
                      <Group
                        key={hito.id}
                        gap="xs"
                        align="flex-start"
                      >
                        {hito.completado ? (
                          <IconCheckbox
                            size={15}
                            color="var(--mantine-color-green-6)"
                          />
                        ) : (
                          <IconSquare
                            size={15}
                            color="var(--mantine-color-gray-4)"
                          />
                        )}
                        <Stack gap={2} style={{ flex: 1 }}>
                          <Text
                            size="xs"
                            td={hito.completado
                              ? 'line-through' : undefined}
                            c={hito.completado
                              ? 'dimmed' : undefined}
                          >
                            {hito.titulo}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {formatFecha(hito.fecha_limite)}
                          </Text>
                        </Stack>
                      </Group>
                    ))}
                </Stack>
              </>
            )}
          </Stack>
        </Stack>
      )}
    </Drawer>
  );
}
