'use client'

import ReactECharts from 'echarts-for-react';
import { Paper, Title, Skeleton, Text }
  from '@mantine/core';
import { useGraficaAnual } from
  '@/queries/dashboard.queries';

export function GraficaAnual() {
  const { data = [], isLoading } = useGraficaAnual();

  if (isLoading) {
    return (
      <Paper p="lg" radius="lg"
        style={{
          border: '1px solid var(--mantine-color-default-border)',
        }}>
        <Skeleton height={16} width={200} mb="md" />
        <Skeleton height={240} radius="md" />
      </Paper>
    );
  }

  if (data.length === 0) {
    return (
      <Paper p="lg" radius="lg"
        style={{
          border: '1px solid var(--mantine-color-default-border)',
        }}>
        <Title order={5} mb="md">
          Proyectos por año
        </Title>
        <Text size="sm" c="dimmed" ta="center" py="xl">
          Sin datos disponibles
        </Text>
      </Paper>
    );
  }

  const anios  = data.map((d) => d.anio);
  const totales = data.map((d) => d.total);
  // monto viene como string → convertir a millones
  const montos = data.map(
    (d) => parseFloat(d.monto) / 1_000_000
  );

  const option = {
    tooltip: {
      trigger:   'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: unknown[]) => {
        const p = params as Array<{
          name: string;
          seriesName: string;
          value: number;
          color: string;
        }>;
        let html = `<b>${p[0].name}</b><br/>`;
        p.forEach((item) => {
          html += `<span style="color:${item.color}">●</span> `;
          if (item.seriesName === 'Proyectos') {
            html += `${item.seriesName}: <b>${item.value}</b><br/>`;
          } else {
            html += `${item.seriesName}: <b>$${item.value.toFixed(1)}M USD</b><br/>`;
          }
        });
        return html;
      },
    },
    legend: {
      data: ['Proyectos', 'Monto (M USD)'],
      bottom: 0,
      textStyle: {
        fontSize:   12,
        fontFamily: 'var(--font-inter), Inter, sans-serif',
      },
    },
    grid: {
      left:         '3%',
      right:        '4%',
      bottom:       '12%',
      top:          '5%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: anios,
      axisLabel: {
        fontFamily: 'var(--font-inter), Inter, sans-serif',
        fontSize:   12,
        color:      '#6B7280',
      },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Proyectos',
        nameTextStyle: {
          color:      '#6B7280',
          fontSize:   11,
          fontFamily: 'var(--font-inter), Inter, sans-serif',
        },
        axisLabel: {
          color:      '#6B7280',
          fontSize:   11,
          fontFamily: 'var(--font-inter), Inter, sans-serif',
        },
        splitLine: {
          lineStyle: { color: '#E5E7EB' },
        },
      },
      {
        type: 'value',
        name: 'Monto (M USD)',
        nameTextStyle: {
          color:      '#6B7280',
          fontSize:   11,
          fontFamily: 'var(--font-inter), Inter, sans-serif',
        },
        axisLabel: {
          color:      '#6B7280',
          fontSize:   11,
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          formatter:  (v: number) => `$${v.toFixed(0)}M`,
        },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name:      'Proyectos',
        type:      'bar',
        data:      totales,
        barWidth:  '35%',
        itemStyle: {
          color:        '#1A3A5C',
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: { color: '#2E6DA4' },
        },
        label: {
          show:      true,
          position:  'top',
          fontSize:  11,
          color:     '#374151',
          fontFamily:
            'var(--font-inter), Inter, sans-serif',
        },
      },
      {
        name:      'Monto (M USD)',
        type:      'bar',
        yAxisIndex: 1,
        data:      montos,
        barWidth:  '35%',
        itemStyle: {
          color:        '#E8A020',
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: { color: '#D97706' },
        },
        label: {
          show:      true,
          position:  'top',
          fontSize:  11,
          color:     '#374151',
          formatter: (p: { value: number }) =>
            `$${p.value.toFixed(1)}M`,
          fontFamily:
            'var(--font-inter), Inter, sans-serif',
        },
      },
    ],
  };

  return (
    <Paper
      p="lg"
      radius="lg"
      style={{
        border: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <Title order={5} mb="md">
        Proyectos y financiamiento por año
      </Title>
      <ReactECharts
        option={option}
        style={{ height: 280 }}
        opts={{ renderer: 'canvas' }}
      />
    </Paper>
  );
}
