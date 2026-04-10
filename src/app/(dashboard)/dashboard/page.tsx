import type { Metadata } from 'next';
import {
  SimpleGrid, Paper, Group, Text,
  Title, ThemeIcon, Stack, Badge,
} from '@mantine/core';
import {
  IconFolderOpen,
  IconBuildingBank,
  IconStar,
  IconNetwork,
  IconTrendingUp,
} from '@tabler/icons-react';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';

export const metadata: Metadata = {
  title: 'Dashboard',
};

// Datos placeholder — se reemplazarán con datos reales
// en el Agente FE-Dashboard
const KPI_PLACEHOLDER = [
  {
    label:  'Proyectos activos',
    valor:  '—',
    sub:    'En ejecución',
    icon:   <IconFolderOpen size={22} />,
    color:  'blue',
  },
  {
    label:  'Actores cooperantes',
    valor:  '—',
    sub:    'Registrados',
    icon:   <IconBuildingBank size={22} />,
    color:  'teal',
  },
  {
    label:  'Buenas prácticas',
    valor:  '—',
    sub:    'Documentadas',
    icon:   <IconStar size={22} />,
    color:  'orange',
  },
  {
    label:  'Redes activas',
    valor:  '—',
    sub:    'Con CONGOPE',
    icon:   <IconNetwork size={22} />,
    color:  'violet',
  },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        titulo="Dashboard Ejecutivo"
        descripcion="Indicadores de cooperación internacional
          y nacional de los 23 GAD Provinciales del Ecuador"
        acciones={
          <Badge
            color="green"
            variant="light"
            leftSection={<IconTrendingUp size={12} />}
          >
            Sistema activo
          </Badge>
        }
      />

      {/* Tarjetas KPI */}
      <SimpleGrid
        cols={{ base: 1, sm: 2, lg: 4 }}
        spacing="md"
        mb="xl"
      >
        {KPI_PLACEHOLDER.map((kpi) => (
          <Paper
            key={kpi.label}
            p="lg"
            radius="lg"
            style={{
              border: '1px solid var(--mantine-color-gray-3)',
            }}
          >
            <Group justify="space-between" mb="xs">
              <ThemeIcon
                size={44}
                radius="md"
                color={kpi.color}
                variant="light"
              >
                {kpi.icon}
              </ThemeIcon>
            </Group>

            <Title order={2} fw={700} mb={2}>
              {kpi.valor}
            </Title>

            <Stack gap={2}>
              <Text size="sm" fw={500} c="gray.7">
                {kpi.label}
              </Text>
              <Text size="xs" c="dimmed">
                {kpi.sub}
              </Text>
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Área de gráficas — placeholder */}
      <Paper
        p="xl"
        radius="lg"
        ta="center"
        style={{
          border: '2px dashed var(--mantine-color-gray-3)',
          background: 'var(--mantine-color-gray-0)',
        }}
      >
        <Text c="dimmed" size="sm">
          Las gráficas y KPIs dinámicos se implementarán
          en el Agente FE-Dashboard con datos reales de la API.
        </Text>
      </Paper>
    </>
  );
}
