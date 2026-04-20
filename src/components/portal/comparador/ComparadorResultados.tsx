'use client'

import dynamic from 'next/dynamic';
import type { EstadisticasProvincia } from '@/types/comparador.types';
import { COLORES_PROVINCIAS } from '@/types/comparador.types';
import { TarjetaComparacion } from './TarjetaComparacion';

// ECharts con SSR desactivado
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── Tarjetas KPI lado a lado ── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: `repeat(${resultados.length}, 1fr)`,
        gap: 20,
      }}>
        {resultados.map((prov, i) => (
          <TarjetaComparacion
            key={prov.id}
            provincia={prov}
            color={COLORES_PROVINCIAS[i]}
            index={i}
          />
        ))}
      </div>

      {/* ── Gráfica Radar — Perfil comparativo ── */}
      <SeccionRadar resultados={resultados} />

      {/* ── Distribución por flujo ── */}
      <SeccionFlujos resultados={resultados} />

      {/* ── ODS más activos ── */}
      <SeccionOds resultados={resultados} />

    </div>
  );
}

// ── Radar chart ──────────────────────────────────

function SeccionRadar({
  resultados,
}: {
  resultados: EstadisticasProvincia[];
}) {
  // Normalizar cada dimensión al máximo del grupo
  // para que el radar sea comparable
  const maxProyectos = Math.max(
    ...resultados.map((p) => p.proyectos.total), 1
  );
  const maxMonto = Math.max(
    ...resultados.map((p) => p.monto_total), 1
  );
  const maxActores = Math.max(
    ...resultados.map((p) => p.actores_count), 1
  );
  const maxEmblematicos = Math.max(
    ...resultados.map((p) => p.emblematicos_count), 1
  );
  const maxPracticas = Math.max(
    ...resultados.map((p) => p.practicas_count), 1
  );

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
    <div style={{
      background:   'white',
      borderRadius: 20,
      padding:      '32px',
      boxShadow:    '0 4px 24px rgba(11,31,58,0.06)',
      border:       '1px solid rgba(11,31,58,0.06)',
    }}>
      <TituloSeccion>
        Perfil comparativo
      </TituloSeccion>
      <p style={{
        fontSize:     13,
        color:        'var(--portal-slate)',
        margin:       '0 0 24px',
      }}>
        Cada eje está normalizado al máximo del grupo.
        Una provincia que ocupa más área tiene
        mayor actividad en esa dimensión.
      </p>
      <ReactECharts
        option={option}
        style={{ height: 420 }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}

// ── Distribución por flujo ───────────────────────

function SeccionFlujos({
  resultados,
}: {
  resultados: EstadisticasProvincia[];
}) {
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
    <div style={{
      background:   'white',
      borderRadius: 20,
      padding:      '32px',
      boxShadow:    '0 4px 24px rgba(11,31,58,0.06)',
      border:       '1px solid rgba(11,31,58,0.06)',
    }}>
      <TituloSeccion>
        Flujos de cooperación
      </TituloSeccion>
      <ReactECharts
        option={option}
        style={{ height: 300 }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}

// ── ODS más activos ──────────────────────────────

function SeccionOds({
  resultados,
}: {
  resultados: EstadisticasProvincia[];
}) {
  return (
    <div style={{
      background:   'white',
      borderRadius: 20,
      padding:      '32px',
      boxShadow:    '0 4px 24px rgba(11,31,58,0.06)',
      border:       '1px solid rgba(11,31,58,0.06)',
    }}>
      <TituloSeccion>
        ODS más activos por provincia
      </TituloSeccion>
      <div style={{
        display:             'grid',
        gridTemplateColumns: `repeat(${resultados.length}, 1fr)`,
        gap: 20,
        marginTop: 20,
      }}>
        {resultados.map((prov, i) => (
          <div key={prov.id}>
            <div style={{
              fontSize:    12,
              fontWeight:  700,
              color:       COLORES_PROVINCIAS[i],
              letterSpacing:'0.04em',
              textTransform:'uppercase',
              marginBottom: 12,
              paddingBottom:8,
              borderBottom: `2px solid ${COLORES_PROVINCIAS[i]}30`,
            }}>
              {prov.nombre}
            </div>
            {prov.ods_top.length === 0 ? (
              <p style={{
                fontSize: 12,
                color:    '#9CA3AF',
                margin:   0,
              }}>
                Sin proyectos registrados
              </p>
            ) : (
              <div style={{
                display:       'flex',
                flexDirection: 'column',
                gap:           8,
              }}>
                {prov.ods_top.map((ods) => (
                  <div
                    key={ods.id}
                    style={{
                      display:    'flex',
                      alignItems: 'center',
                      gap:        10,
                    }}
                  >
                    <div style={{
                      width:        28,
                      height:       28,
                      borderRadius: 6,
                      background:   ods.color_hex,
                      display:      'flex',
                      alignItems:   'center',
                      justifyContent:'center',
                      fontSize:     11,
                      fontWeight:   700,
                      color:        'white',
                      flexShrink:   0,
                    }}>
                      {ods.numero}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize:   12,
                        fontWeight: 600,
                        color:      'var(--portal-navy)',
                        lineHeight: 1.2,
                      }}>
                        {ods.nombre}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color:    '#9CA3AF',
                        marginTop:1,
                      }}>
                        {ods.total_proyectos} proyecto{ods.total_proyectos !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helper de título de sección ──────────────────

function TituloSeccion({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h3 style={{
      fontFamily: 'var(--font-playfair)',
      fontSize:   20,
      fontWeight: 700,
      color:      'var(--portal-navy)',
      margin:     '0 0 8px',
    }}>
      {children}
    </h3>
  );
}
