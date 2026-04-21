'use client'

import dynamic from 'next/dynamic';
import { SimpleGrid, Paper, Title, Text, Box, Group } from '@mantine/core';
import type { EstadisticasProvincia } from '@/types/comparador.types';
import { COLORES_PROVINCIAS } from '@/types/comparador.types';
import { TarjetaComparacion } from './TarjetaComparacion';

const ReactECharts = dynamic(
  () => import('echarts-for-react'),
  { ssr: false }
);

interface ComparadorResultadosProps {
  resultados: EstadisticasProvincia[];
}

export function ComparadorResultados({
  resultados,
}: ComparadorResultadosProps) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <SimpleGrid cols={{ base: 1, md: resultados.length }} spacing="xl">
        {resultados.map((prov, i) => (
          <TarjetaComparacion
            key={prov.id}
            provincia={prov}
            color={COLORES_PROVINCIAS[i]}
            index={i}
          />
        ))}
      </SimpleGrid>

      <SeccionRadar resultados={resultados} />
      <SeccionFlujos resultados={resultados} />
      <SeccionOds resultados={resultados} />
    </Box>
  );
}

function TituloSeccion({ children }: { children: React.ReactNode }) {
  return (
    <Title order={3} style={{ fontFamily: 'var(--font-playfair)', color: 'var(--portal-navy)' }} mb="xs">
      {children}
    </Title>
  );
}

function SeccionRadar({ resultados }: { resultados: EstadisticasProvincia[] }) {
  const maxProyectos = Math.max(...resultados.map((p) => p.proyectos.total), 1);
  const maxMonto = Math.max(...resultados.map((p) => p.monto_total), 1);
  const maxActores = Math.max(...resultados.map((p) => p.actores_count), 1);
  const maxEmblematicos = Math.max(...resultados.map((p) => p.emblematicos_count), 1);
  const maxPracticas = Math.max(...resultados.map((p) => p.practicas_count), 1);

  const indicadores = [
    { name: 'Proyectos',     max: maxProyectos },
    { name: 'Inversión',     max: maxMonto },
    { name: 'Actores',       max: maxActores },
    { name: 'Emblemáticos',  max: maxEmblematicos || 1},
    { name: 'Buenas Prácticas', max: maxPracticas || 1},
  ];

  const series = resultados.map((prov, i) => ({
    name:  prov.nombre,
    value: [
      prov.proyectos.total,
      prov.monto_total,
      prov.actores_count,
      prov.emblematicos_count,
      prov.practicas_count,
    ],
    lineStyle: { color: COLORES_PROVINCIAS[i], width: 2 },
    areaStyle: { color: COLORES_PROVINCIAS[i], opacity: 0.12 },
    itemStyle: { color: COLORES_PROVINCIAS[i] },
  }));

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger:         'item',
      backgroundColor: 'rgba(11,31,58,0.92)',
      borderColor:     'rgba(201,168,76,0.3)',
      textStyle: {
        color:      'white',
        fontSize:   12,
        fontFamily: 'DM Sans',
      },
    },
    legend: {
      data:      resultados.map((p) => p.nombre),
      textStyle: {
        color:      '#4A5568',
        fontSize:   12,
        fontFamily: 'DM Sans',
      },
      bottom: 0,
    },
    radar: {
      indicator:    indicadores,
      shape:        'polygon',
      splitNumber:  4,
      axisName: {
        color:      '#0B1F3A',
        fontSize:   12,
        fontFamily: 'DM Sans',
        fontWeight: 600,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(11,31,58,0.1)',
        },
      },
      splitArea: {
        areaStyle: {
          color: [
            'rgba(11,31,58,0.02)',
            'rgba(11,31,58,0.04)',
          ],
        },
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(11,31,58,0.15)',
        },
      },
    },
    series: [{
      type:   'radar',
      data:   series,
      symbol: 'circle',
      symbolSize: 6,
    }],
  };

  return (
    <Paper radius="xl" p={{ base: 'md', sm: 'xl' }} shadow="sm" withBorder>
      <TituloSeccion>Perfil comparativo</TituloSeccion>
      <Text size="sm" c="dimmed" mb="xl">
        Cada eje está normalizado al máximo del grupo. Una provincia que ocupa más área tiene mayor actividad en esa dimensión.
      </Text>
      <ReactECharts option={option} style={{ height: 420 }} opts={{ renderer: 'canvas' }} />
    </Paper>
  );
}

function SeccionFlujos({ resultados }: { resultados: EstadisticasProvincia[] }) {
  const flujos = [
    'Norte-Sur', 'Sur-Sur', 'Triangular',
    'Interna', 'Descentralizada',
  ] as const;

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(11,31,58,0.92)',
      borderColor:     'rgba(201,168,76,0.3)',
      textStyle: {
        color: 'white', fontSize: 12,
        fontFamily: 'DM Sans',
      },
    },
    legend: {
      data:      resultados.map((p) => p.nombre),
      textStyle: {
        color: '#4A5568', fontSize: 12,
        fontFamily: 'DM Sans',
      },
      bottom: 0,
    },
    grid: {
      left: '3%', right: '4%',
      top: '4%', bottom: '14%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: flujos,
      axisLabel: {
        color: '#4A5568', fontSize: 11,
        fontFamily: 'DM Sans',
      },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        color: '#9CA3AF', fontSize: 11,
        fontFamily: 'DM Sans',
      },
      splitLine: {
        lineStyle: { color: 'rgba(11,31,58,0.08)' },
      },
    },
    series: resultados.map((prov, i) => ({
      name:     prov.nombre,
      type:     'bar',
      barGap:   '10%',
      data:     flujos.map((f) => prov.flujos[f]),
      itemStyle: {
        color:        COLORES_PROVINCIAS[i],
        borderRadius: [4, 4, 0, 0],
      },
    })),
  };

  return (
    <Paper radius="xl" p={{ base: 'md', sm: 'xl' }} shadow="sm" withBorder>
      <TituloSeccion>Flujos de cooperación</TituloSeccion>
      <ReactECharts option={option} style={{ height: 300 }} opts={{ renderer: 'canvas' }} />
    </Paper>
  );
}

function SeccionOds({ resultados }: { resultados: EstadisticasProvincia[] }) {
  return (
    <Paper radius="xl" p={{ base: 'md', sm: 'xl' }} shadow="sm" withBorder>
      <TituloSeccion>ODS más activos por provincia</TituloSeccion>
      <SimpleGrid cols={{ base: 1, md: resultados.length }} spacing="xl" mt="xl">
        {resultados.map((prov, i) => (
          <Box key={prov.id}>
            <Box
              style={{
                borderBottom: `2px solid ${COLORES_PROVINCIAS[i]}30`,
              }}
              pb="xs"
              mb="md"
            >
              <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.04em', color: COLORES_PROVINCIAS[i] }}>
                {prov.nombre}
              </Text>
            </Box>

            {prov.ods_top.length === 0 ? (
              <Text size="xs" c="dimmed">Sin proyectos registrados</Text>
            ) : (
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {prov.ods_top.map((ods) => (
                  <Group key={ods.id} gap="sm" wrap="nowrap">
                    <Box
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: ods.color_hex,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: 11,
                        flexShrink: 0,
                      }}
                    >
                      {ods.numero}
                    </Box>
                    <Box flex={1}>
                      <Text size="xs" fw={600} style={{ color: 'var(--portal-navy)', lineHeight: 1.2 }}>
                        {ods.nombre}
                      </Text>
                      <Text style={{ fontSize: 11 }} c="dimmed" mt={1}>
                        {ods.total_proyectos} proyecto{ods.total_proyectos !== 1 ? 's' : ''}
                      </Text>
                    </Box>
                  </Group>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </SimpleGrid>
    </Paper>
  );
}
