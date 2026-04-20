'use client'

import type { EstadisticasProvincia } from '@/types/comparador.types';

interface TarjetaComparacionProps {
  provincia: EstadisticasProvincia;
  color:     string;
  index:     number;
}

export function TarjetaComparacion({
  provincia,
  color,
  index,
}: TarjetaComparacionProps) {
  const kpis = [
    {
      etiqueta: 'Total proyectos',
      valor:    provincia.proyectos.total,
      sub:      null,
      icono:    '📁',
    },
    {
      etiqueta: 'En ejecución',
      valor:    provincia.proyectos.en_ejecucion,
      sub:      null,
      icono:    '▶️',
    },
    {
      etiqueta: 'Finalizados',
      valor:    provincia.proyectos.finalizado,
      sub:      null,
      icono:    '✅',
    },
    {
      etiqueta: 'Inversión',
      valor:    provincia.monto_formateado,
      sub:      null,
      icono:    '💰',
    },
    {
      etiqueta: 'Actores',
      valor:    provincia.actores_count,
      sub:      null,
      icono:    '🤝',
    },
    {
      etiqueta: 'Emblemáticos',
      valor:    provincia.emblematicos_count,
      sub:      null,
      icono:    '🏆',
    },
    {
      etiqueta: 'Buenas Prácticas',
      valor:    provincia.practicas_count,
      sub:      null,
      icono:    '💡',
    },
  ];

  return (
    <div style={{
      background:   'white',
      borderRadius: 20,
      overflow:     'hidden',
      boxShadow:    '0 4px 24px rgba(11,31,58,0.08)',
      border:       '1px solid rgba(11,31,58,0.06)',
    }}>
      {/* Header de la tarjeta */}
      <div style={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
        borderBottom: `3px solid ${color}`,
        padding:      '24px 24px 20px',
      }}>
        <div style={{
          display:     'flex',
          alignItems:  'center',
          gap:         10,
          marginBottom:4,
        }}>
          {/* Índice circular */}
          <div style={{
            width:          28,
            height:         28,
            borderRadius:   '50%',
            background:     color,
            color:          'white',
            fontSize:       12,
            fontWeight:     700,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
          }}>
            {index + 1}
          </div>
          <h3 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize:   20,
            fontWeight: 700,
            color:      'var(--portal-navy)',
            margin:     0,
            lineHeight: 1.2,
          }}>
            {provincia.nombre}
          </h3>
        </div>
        <p style={{
          fontSize:   12,
          color:      'var(--portal-slate)',
          margin:     '4px 0 0',
        }}>
          Capital: {provincia.capital}
          {' · '}Código: {provincia.codigo}
        </p>
      </div>

      {/* KPIs */}
      <div style={{ padding: '20px 24px 24px' }}>
        <div style={{
          display:       'flex',
          flexDirection: 'column',
          gap:           12,
        }}>
          {kpis.map((kpi) => (
            <div
              key={kpi.etiqueta}
              style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'center',
                padding:        '8px 0',
                borderBottom:   '1px solid rgba(11,31,58,0.05)',
              }}
            >
              <div style={{
                display:    'flex',
                alignItems: 'center',
                gap:        8,
                fontSize:   13,
                color:      'var(--portal-slate)',
              }}>
                <span style={{ fontSize: 14 }}>
                  {kpi.icono}
                </span>
                {kpi.etiqueta}
              </div>
              <span style={{
                fontSize:   14,
                fontWeight: 700,
                color:      color,
              }}>
                {kpi.valor}
              </span>
            </div>
          ))}
        </div>

        {/* Sector temático top */}
        {provincia.sectores_top.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{
              fontSize:      10,
              fontWeight:    600,
              color:         'var(--portal-slate)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom:  8,
            }}>
              Sectores principales
            </div>
            <div style={{
              display:  'flex',
              flexWrap: 'wrap',
              gap:      6,
            }}>
              {provincia.sectores_top.map((s) => (
                <span
                  key={s.sector}
                  style={{
                    background:   `${color}12`,
                    border:       `1px solid ${color}30`,
                    borderRadius: 100,
                    padding:      '3px 10px',
                    fontSize:     11,
                    fontWeight:   600,
                    color:        color,
                  }}
                >
                  {s.sector} ({s.total})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
