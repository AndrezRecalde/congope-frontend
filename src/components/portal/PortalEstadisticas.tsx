'use client'

import { useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type {
  EstadisticasPortal,
} from '@/services/portal.service';

interface PortalEstadisticasProps {
  estadisticas: EstadisticasPortal;
}

export function PortalEstadisticas({
  estadisticas,
}: PortalEstadisticasProps) {
  const { kpis, por_ods, por_tipo_actor } = estadisticas;

  // ── KPI Cards ──
  const kpiItems = [
    {
      valor:     kpis.total_proyectos,
      etiqueta:  'Proyectos activos',
      icono:     '🤝',
    },
    {
      valor:     kpis.total_actores,
      etiqueta:  'Actores cooperantes',
      icono:     '🌐',
    },
    {
      valor:     kpis.total_provincias,
      etiqueta:  'Provincias beneficiadas',
      icono:     '📍',
    },
    {
      valor:     kpis.monto_formateado,
      etiqueta:  'Inversión en cooperación',
      icono:     '💰',
    },
  ];

  // ── Chart ODS ──
  const odsOrdenados = [...por_ods]
    .sort((a, b) => b.total_proyectos - a.total_proyectos)
    .slice(0, 10);

  const optionOds = {
    tooltip: {
      trigger:   'axis',
      axisPointer:{ type: 'shadow' },
      backgroundColor:'rgba(11, 31, 58, 0.95)',
      borderColor:    'rgba(201, 168, 76, 0.3)',
      textStyle:      { color: 'white', fontSize: 12,
                        fontFamily: 'DM Sans' },
      formatter:      (params: unknown[]) => {
        const p = (params as Array<{
          name: string; value: number; color: string;
        }>)[0];
        return `${p.name}: <b>${p.value} proyectos</b>`;
      },
    },
    grid: {
      left:'2%', right:'8%', top:'2%',
      bottom:'2%', containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize:   11,
        fontFamily: 'DM Sans',
      },
      splitLine: {
        lineStyle: { color: 'rgba(255,255,255,0.08)' },
      },
    },
    yAxis: {
      type: 'category',
      data: odsOrdenados.map(
        (o) => `ODS ${o.numero} — ${o.nombre}`
      ).reverse(),
      axisLabel: {
        color:      'rgba(255,255,255,0.7)',
        fontSize:   11,
        fontFamily: 'DM Sans',
        formatter:  (v: string) =>
          v.length > 22 ? v.slice(0, 20) + '…' : v,
      },
    },
    series: [{
      type:       'bar',
      barMaxWidth:32,
      data: odsOrdenados.map((o) => ({
        value:     o.total_proyectos,
        itemStyle: {
          color:        o.color_hex,
          borderRadius: [0, 6, 6, 0],
        },
      })).reverse(),
      label: {
        show:       true,
        position:   'right',
        color:      'rgba(255,255,255,0.8)',
        fontSize:   11,
        fontFamily: 'DM Sans',
      },
    }],
  };

  // ── Chart Actores (Donut) ──
  const optionActores = {
    tooltip: {
      trigger: 'item',
      backgroundColor:'rgba(11, 31, 58, 0.95)',
      borderColor:    'rgba(201, 168, 76, 0.3)',
      textStyle: { color: 'white', fontSize: 12,
                   fontFamily: 'DM Sans' },
      formatter: (p: {
        name: string; value: number; percent: number;
        color: string;
      }) =>
        `<span style="color:${p.color}">●</span> ` +
        `${p.name}: <b>${p.value}</b> ` +
        `(${p.percent.toFixed(0)}%)`,
    },
    series: [{
      type:   'pie',
      radius: ['42%', '70%'],
      center: ['50%', '50%'],
      data: por_tipo_actor.map((a, i) => ({
        name:  a.tipo,
        value: a.total,
        itemStyle: {
          color: [
            '#1E4D8C', '#3B82F6', '#60A5FA',
            '#C9A84C', '#0B1F3A', '#93C5FD',
          ][i % 6],
          borderColor: 'rgba(11, 31, 58, 0.8)',
          borderWidth: 2,
        },
      })),
      label: {
        color:      'rgba(255,255,255,0.8)',
        fontSize:   11,
        fontFamily: 'DM Sans',
        formatter:  (p: {
          name: string; value: number;
        }) => `${p.name}\n${p.value}`,
      },
      itemStyle: { borderRadius: 4 },
    }],
  };

  return (
    <section
      id="estadisticas"
      className="portal-stats-section"
    >
      <div style={{ maxWidth: 1280, margin: '0 auto',
        padding: '0 24px' }}>

        {/* Título de sección */}
        <div style={{
          textAlign:   'center',
          marginBottom:56,
        }}>
          <span className="portal-gold-line"
            style={{ margin: '0 auto 12px' }} />
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize:   clamp(28, 40, 48),
            fontWeight: 700,
            color:      'white',
            margin:     '0 0 12px',
          }}>
            Cooperación en números
          </h2>
          <p style={{
            fontSize:   16,
            color:      'rgba(255,255,255,0.6)',
            maxWidth:   500,
            margin:     '0 auto',
          }}>
            Impacto real de la cooperación internacional
            en los Gobiernos Provinciales del Ecuador
          </p>
        </div>

        {/* KPIs */}
        <div style={{
          display:               'grid',
          gridTemplateColumns:   'repeat(auto-fit, minmax(200px, 1fr))',
          gap:                   20,
          marginBottom:          56,
        }}>
          {kpiItems.map((item, i) => (
            <div
              key={i}
              className="portal-stat-pill"
              style={{
                flexDirection: 'column',
                borderRadius:  16,
                padding:       '28px 24px',
                textAlign:     'center',
                animationDelay:`${i * 100}ms`,
              }}
            >
              <div style={{ fontSize: 32, marginBottom:8 }}>
                {item.icono}
              </div>
              <div style={{
                fontFamily: 'var(--font-playfair)',
                fontSize:   typeof item.valor === 'string'
                  ? 20 : 36,
                fontWeight: 700,
                color:      'white',
                lineHeight: 1.1,
                marginBottom:4,
              }}>
                {item.valor}
              </div>
              <div style={{
                fontSize:  12,
                color:     'rgba(255,255,255,0.5)',
                letterSpacing:'0.05em',
                textTransform:'uppercase',
              }}>
                {item.etiqueta}
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: '2fr 1fr',
          gap:                 24,
        }}>
          {/* Chart ODS */}
          <div style={{
            background:   'rgba(255,255,255,0.05)',
            borderRadius: 20,
            padding:      '24px',
            border:       '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{
              fontSize:    13,
              fontWeight:  700,
              color:       'rgba(255,255,255,0.7)',
              letterSpacing:'0.06em',
              textTransform:'uppercase',
              marginBottom:20,
            }}>
              Proyectos por ODS
            </div>
            <ReactECharts
              option={optionOds}
              style={{
                height: Math.max(
                  por_ods.length * 36 + 20, 200
                ),
              }}
              opts={{ renderer: 'canvas' }}
            />
          </div>

          {/* Chart Actores */}
          <div style={{
            background:   'rgba(255,255,255,0.05)',
            borderRadius: 20,
            padding:      '24px',
            border:       '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{
              fontSize:    13,
              fontWeight:  700,
              color:       'rgba(255,255,255,0.7)',
              letterSpacing:'0.06em',
              textTransform:'uppercase',
              marginBottom:20,
            }}>
              Actores cooperantes
            </div>
            <ReactECharts
              option={optionActores}
              style={{ height: 260 }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function clamp(min: number, val: number, max: number) {
  return Math.min(Math.max(val, min), max);
}
