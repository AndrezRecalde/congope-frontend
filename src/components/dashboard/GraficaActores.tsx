'use client'

import ReactECharts from 'echarts-for-react';
import { Paper, Title, Skeleton, Group, Stack,
  Text, Badge }
  from '@mantine/core';
import { useDashboard } from
  '@/queries/dashboard.queries';

// Colores para cada tipo de actor
const COLORES_TIPO: Record<string, string> = {
  Multilateral: '#1A3A5C',
  Bilateral:    '#2E6DA4',
  ONG:          '#3B82F6',
  Embajada:     '#60A5FA',
  Privado:      '#93C5FD',
  Academia:     '#BFDBFE',
};

export function GraficaActores() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <Paper p="lg" radius="lg"
        style={{
          border: '1px solid var(--mantine-color-gray-3)',
        }}>
        <Skeleton height={16} width={200} mb="md" />
        <Skeleton height={220} radius="md" />
      </Paper>
    );
  }

  const porTipo = data?.kpis?.actores?.por_tipo ?? {};
  const items   = Object.entries(porTipo);

  if (items.length === 0) {
    return (
      <Paper p="lg" radius="lg"
        style={{
          border: '1px solid var(--mantine-color-gray-3)',
        }}>
        <Title order={5} c="gray.7" mb="md">
          Actores por tipo
        </Title>
        <Text size="sm" c="dimmed" ta="center" py="xl">
          Sin datos disponibles
        </Text>
      </Paper>
    );
  }

  const seriesData = items.map(([tipo, total]) => ({
    name:  tipo,
    value: total as number,
    itemStyle: {
      color: COLORES_TIPO[tipo] ?? '#9CA3AF',
    },
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (p: {
        name: string;
        value: number;
        percent: number;
        color: string;
      }) =>
        `<span style="color:${p.color}">●</span> `
        + `${p.name}: <b>${p.value}</b> `
        + `(${p.percent.toFixed(0)}%)`,
    },
    series: [
      {
        type:      'pie',
        radius:    ['40%', '72%'],
        center:    ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor:  '#FFFFFF',
          borderWidth:  2,
        },
        label: {
          show:       true,
          position:   'outside',
          fontSize:   11,
          fontFamily:
            'var(--font-inter), Inter, sans-serif',
          color:      '#374151',
          formatter:  (p: {
            name: string; value: number
          }) => `${p.name}\n${p.value}`,
        },
        labelLine: {
          length:  10,
          length2: 10,
        },
        data: seriesData,
      },
    ],
  };

  return (
    <Paper
      p="lg"
      radius="lg"
      style={{
        border: '1px solid var(--mantine-color-gray-3)',
      }}
    >
      <Title order={5} c="gray.7" mb="md">
        Actores por tipo
      </Title>
      <ReactECharts
        option={option}
        style={{ height: 240 }}
        opts={{ renderer: 'canvas' }}
      />
    </Paper>
  );
}
