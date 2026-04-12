'use client'

import { Paper, Title, Text, Progress, Group, Anchor, Badge, Tooltip, Stack } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import Link from 'next/link';
import { useDashboard } from '@/queries/dashboard.queries';
import { IconAlertCircle } from '@tabler/icons-react';

export function ProyectosDestacados() {
  const { data, isLoading } = useDashboard();
  const proyectos = data?.kpis?.proyectos_destacados ?? [];

  if (!isLoading && proyectos.length === 0) {
    return (
      <Paper p="xl" radius="lg" style={{ border: '2px dashed var(--mantine-color-gray-3)', background: 'var(--mantine-color-gray-0)', minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Group gap="xs" c="dimmed">
          <IconAlertCircle size={20} />
          <Text size="sm" ta="center">Todavía no hay proyectos destacados para mostrar.</Text>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper p="md" radius="lg" style={{ border: '1px solid var(--mantine-color-gray-3)', overflow: 'hidden' }}>
      <Title order={5} c="gray.7" mb="md" px="xs">Top Proyectos Destacados</Title>
      
      <DataTable
        withTableBorder={false}
        withColumnBorders={false}
        highlightOnHover
        fetching={isLoading}
        records={proyectos}
        minHeight={150}
        styles={{
          header: { background: 'var(--mantine-color-gray-0)' },
        }}
        columns={[
          {
            accessor: 'nombre',
            title: 'Proyecto',
            width: '40%',
            render: (p) => (
              <Anchor component={Link} href={`/proyectos/${p.id}`} fw={500} c="blue.8" size="sm">
                {p.nombre}
              </Anchor>
            ),
          },
          {
            accessor: 'actor',
            title: 'Actor Cooperante',
            render: (p) => <Badge color="teal" variant="light" size="sm">{p.actor}</Badge>,
          },
          {
            accessor: 'avance',
            title: 'Progreso',
            render: (p) => {
              const provincias = p.provincias || [];
              const provinciasConAvance = provincias.filter((prov) => prov.porcentaje_avance !== null && prov.porcentaje_avance !== undefined);
              let avancePromedio: number | undefined = undefined;
              if (provinciasConAvance.length > 0) {
                const suma = provinciasConAvance.reduce((acc, prov) => acc + (prov.porcentaje_avance || 0), 0);
                avancePromedio = Math.round(suma / provinciasConAvance.length);
              }

              if (avancePromedio === undefined) {
                return (
                  <Group gap="xs" align="center" wrap="nowrap">
                    <Progress value={p.avance || 0} size="sm" color="blue" style={{ flex: 1, minWidth: 60 }} />
                    <Text size="xs" c="dimmed" fw={600} miw={36}>{p.avance || 0}%</Text>
                  </Group>
                );
              }

              return (
                <Tooltip
                  color="dark"
                  disabled={provinciasConAvance.length <= 1}
                  label={
                    <Stack gap={4} py={2}>
                      <Text size="xs" fw={700} c="dimmed" mb={2}>Desglose por provincia:</Text>
                      {provinciasConAvance.map((prov, i) => (
                        <Group key={i} justify="space-between" miw={180} wrap="nowrap">
                          <Text size="xs">{prov.nombre}</Text>
                          <Group gap={6} style={{ flex: 1 }} justify="flex-end">
                            <Progress value={prov.porcentaje_avance!} size="sm" color="congope" style={{ flex: 1, minWidth: 60 }} />
                            <Text size="xs" fw={500} w={28} ta="right">{prov.porcentaje_avance}%</Text>
                          </Group>
                        </Group>
                      ))}
                    </Stack>
                  }
                >
                  <Group gap={4} align="center" wrap="nowrap" style={{ cursor: provinciasConAvance.length > 1 ? 'help' : 'default' }}>
                    <Progress value={avancePromedio} size="sm" color={avancePromedio === 100 ? "green" : "blue"} style={{ flex: 1, minWidth: 60 }} />
                    <Text size="xs" c="dimmed" fw={600} miw={36}>{avancePromedio}%</Text>
                  </Group>
                </Tooltip>
              );
            },
          },
          {
            accessor: 'inversion',
            title: 'Presupuesto',
            textAlign: 'right',
            render: (p) => (
              <Text size="sm" fw={600}>
                ${parseFloat(p.inversion || '0').toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </Text>
            ),
          },
        ]}
      />
    </Paper>
  );
}
