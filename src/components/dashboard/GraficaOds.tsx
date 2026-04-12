'use client'

import ReactECharts from 'echarts-for-react';
import { Paper, Title, Skeleton, Text }
  from '@mantine/core';
import { useGraficaOds } from
  '@/queries/dashboard.queries';

export function GraficaOds() {
  const { data = [], isLoading } = useGraficaOds();

  if (isLoading) {
    return (
      <Paper p="lg" radius="lg"
        style={{
          border: '1px solid var(--mantine-color-gray-3)',
        }}>
        <Skeleton height={16} width={200} mb="md" />
        <Skeleton height={320} radius="md" />
      </Paper>
    );
  }

  if (data.length === 0) {
    return (
      <Paper p="lg" radius="lg"
        style={{
          border: '1px solid var(--mantine-color-gray-3)',
        }}>
        <Title order={5} c="gray.7" mb="md">
          Distribución por ODS
        </Title>
        <Text size="sm" c="dimmed" ta="center" py="xl">
          Sin datos disponibles
        </Text>
      </Paper>
    );
  }

  // Ordenar por total_proyectos descendente
  const sorted = [...data].sort(
    (a, b) => b.total_proyectos - a.total_proyectos
  );

  // Para barras horizontales el eje Y tiene las
  // categorías y el eje X los valores.
  // ECharts requiere que el array de categorías
  // esté en orden inverso para que el mayor
  // quede arriba visualmente.
  const labels  = sorted.map(
    (d) => `ODS ${d.numero} — ${d.nombre}`
  ).reverse();
  const valores = sorted.map(
    (d) => d.total_proyectos
  ).reverse();
  const colores = sorted.map(
    (d) => d.color_hex
  ).reverse();

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: unknown[]) => {
        const p = (params as Array<{
          name: string;
          value: number;
          color: string;
        }>)[0];
        return `<span style="color:${p.color}">●</span> `
          + `${p.name}: <b>${p.value} proyecto${
              p.value !== 1 ? 's' : ''
            }</b>`;
      },
    },
    grid: {
      left:         '2%',
      right:        '8%',
      top:          '2%',
      bottom:       '2%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        fontSize:   13,
        color:      '#6B7280',
        fontFamily: 'var(--font-inter), Inter, sans-serif',
      },
      splitLine: {
        lineStyle: { color: '#E5E7EB' },
      },
    },
    yAxis: {
      type:      'category',
      data:      labels,
      axisLabel: {
        fontSize:   13,
        fontWeight: 500,
        color:      '#374151',
        fontFamily: 'var(--font-inter), Inter, sans-serif',
        // Truncar etiquetas muy largas (Aumentado para mayor legibilidad)
        formatter:  (v: string) =>
          v.length > 35 ? v.slice(0, 33) + '…' : v,
      },
    },
    series: [
      {
        type:     'bar',
        data:     valores.map((v, i) => ({
          value:     v,
          itemStyle: {
            color:        colores[i],
            borderRadius: [0, 4, 4, 0],
          },
        })),
        barMaxWidth: 36,
        label: {
          show:      true,
          position:  'right',
          fontSize:  13,
          fontWeight: 'bold',
          color:     '#374151',
          fontFamily:
            'var(--font-inter), Inter, sans-serif',
        },
      },
    ],
  };

  // Altura dinámica según cantidad de ODS con datos
  const alturaChart = Math.max(
    data.length * 36 + 40, 200
  );

  return (
    <Paper
      p="lg"
      radius="lg"
      style={{
        border: '1px solid var(--mantine-color-gray-3)',
      }}
    >
      <Title order={5} c="gray.7" mb="md">
        Proyectos por ODS
      </Title>
      <ReactECharts
        option={option}
        style={{ height: alturaChart }}
        opts={{ renderer: 'canvas' }}
      />
    </Paper>
  );
}
