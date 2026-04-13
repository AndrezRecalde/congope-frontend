'use client'

import { useState } from 'react';
import type {
  OpcionesFiltro,
} from '@/services/portal.service';

interface FiltrosPortal {
  provincia_id: string;
  canton_id:    string;
  actor_id:     string;
}

interface PortalFiltrosProps {
  opciones:  OpcionesFiltro;
  filtros:   FiltrosPortal;
  onChange:  (f: FiltrosPortal) => void;
  onLimpiar: () => void;
  hayFiltros:boolean;
  totalPins: number;
}

export function PortalFiltros({
  opciones,
  filtros,
  onChange,
  onLimpiar,
  hayFiltros,
  totalPins,
}: PortalFiltrosProps) {
  const [abierto, setAbierto] = useState(true);

  // Cantones filtrados por provincia seleccionada
  const cantonesFiltrados = filtros.provincia_id
    ? opciones.cantones.filter(
        (c) => c.provincia_id === filtros.provincia_id
      )
    : opciones.cantones;

  const selectStyle = {
    width:           '100%',
    padding:         '10px 14px',
    border:          '1px solid rgba(11, 31, 58, 0.15)',
    borderRadius:    10,
    fontSize:        13,
    color:           '#0B1F3A',
    background:      'white',
    appearance:      'none' as const,
    WebkitAppearance:'none' as const,
    outline:         'none',
    cursor:          'pointer',
    fontFamily:      'var(--font-dm-sans)',
    transition:      'border-color 200ms ease',
  };

  return (
    <div className="portal-filtros">
      {/* Cabecera del panel */}
      <div style={{
        padding:         '16px 20px 14px',
        borderBottom:    abierto
          ? '1px solid rgba(11, 31, 58, 0.08)'
          : 'none',
        display:         'flex',
        justifyContent:  'space-between',
        alignItems:      'center',
        background:      'linear-gradient(135deg, ' +
          'rgba(11, 31, 58, 0.04) 0%, ' +
          'rgba(201, 168, 76, 0.04) 100%)',
      }}>
        <div>
          <div style={{
            fontSize:    13,
            fontWeight:  700,
            color:       'var(--portal-navy)',
            letterSpacing:'0.04em',
            textTransform:'uppercase',
          }}>
            Explorar proyectos
          </div>
          {hayFiltros && totalPins > 0 && (
            <div style={{
              fontSize:   11,
              color:      'var(--portal-blue)',
              marginTop:  2,
            }}>
              {totalPins} proyecto
              {totalPins !== 1 ? 's' : ''} en el mapa
            </div>
          )}
        </div>
        <button
          onClick={() => setAbierto((v) => !v)}
          style={{
            background:  'none',
            border:      'none',
            cursor:      'pointer',
            padding:     '4px 8px',
            borderRadius:8,
            color:       'var(--portal-slate)',
            fontSize:    12,
          }}
        >
          {abierto ? '▲' : '▼'}
        </button>
      </div>

      {/* Filtros */}
      {abierto && (
        <div style={{ padding: '16px 20px 20px' }}>
          <div style={{
            display:       'flex',
            flexDirection: 'column',
            gap:           10,
          }}>
            {/* Select Provincia */}
            <div>
              <label style={{
                fontSize:    11,
                fontWeight:  600,
                color:       'var(--portal-slate)',
                letterSpacing:'0.06em',
                textTransform:'uppercase',
                display:     'block',
                marginBottom:5,
              }}>
                Provincia
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  style={selectStyle}
                  value={filtros.provincia_id}
                  onChange={(e) =>
                    onChange({
                      ...filtros,
                      provincia_id: e.target.value,
                      canton_id:    '', // reset cantón
                    })
                  }
                >
                  <option value="">
                    Todas las provincias
                  </option>
                  {opciones.provincias.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <span style={{
                  position:  'absolute',
                  right:     12,
                  top:       '50%',
                  transform: 'translateY(-50%)',
                  fontSize:  10,
                  color:     'var(--portal-slate)',
                  pointerEvents: 'none',
                }}>▼</span>
              </div>
            </div>

            {/* Select Cantón */}
            <div>
              <label style={{
                fontSize:    11,
                fontWeight:  600,
                color:       'var(--portal-slate)',
                letterSpacing:'0.06em',
                textTransform:'uppercase',
                display:     'block',
                marginBottom:5,
              }}>
                Cantón
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  style={{
                    ...selectStyle,
                    opacity: !filtros.provincia_id
                      ? 0.5 : 1,
                  }}
                  value={filtros.canton_id}
                  disabled={!filtros.provincia_id}
                  onChange={(e) =>
                    onChange({
                      ...filtros,
                      canton_id: e.target.value,
                    })
                  }
                >
                  <option value="">
                    {filtros.provincia_id
                      ? 'Todos los cantones'
                      : 'Selecciona una provincia'}
                  </option>
                  {cantonesFiltrados.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <span style={{
                  position:  'absolute',
                  right:     12,
                  top:       '50%',
                  transform: 'translateY(-50%)',
                  fontSize:  10,
                  color:     'var(--portal-slate)',
                  pointerEvents: 'none',
                }}>▼</span>
              </div>
            </div>

            {/* Select Actor */}
            <div>
              <label style={{
                fontSize:    11,
                fontWeight:  600,
                color:       'var(--portal-slate)',
                letterSpacing:'0.06em',
                textTransform:'uppercase',
                display:     'block',
                marginBottom:5,
              }}>
                Actor Cooperante
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  style={selectStyle}
                  value={filtros.actor_id}
                  onChange={(e) =>
                    onChange({
                      ...filtros,
                      actor_id: e.target.value,
                    })
                  }
                >
                  <option value="">
                    Todos los actores
                  </option>
                  {opciones.actores.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
                <span style={{
                  position:  'absolute',
                  right:     12,
                  top:       '50%',
                  transform: 'translateY(-50%)',
                  fontSize:  10,
                  color:     'var(--portal-slate)',
                  pointerEvents: 'none',
                }}>▼</span>
              </div>
            </div>

            {/* Botón limpiar */}
            {hayFiltros && (
              <button
                onClick={onLimpiar}
                style={{
                  background:  'none',
                  border:      '1px solid rgba(11,31,58,0.2)',
                  borderRadius:10,
                  padding:     '9px 14px',
                  fontSize:    12,
                  fontWeight:  600,
                  color:       'var(--portal-slate)',
                  cursor:      'pointer',
                  letterSpacing:'0.04em',
                  transition:  'all 200ms ease',
                  marginTop:   4,
                }}
              >
                × Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Leyenda compacta */}
      <div style={{
        padding:      '12px 20px',
        borderTop:    '1px solid rgba(11, 31, 58, 0.08)',
        background:   'rgba(11, 31, 58, 0.02)',
      }}>
        <div style={{
          fontSize:    10,
          fontWeight:  600,
          color:       'var(--portal-slate)',
          letterSpacing:'0.06em',
          textTransform:'uppercase',
          marginBottom: 8,
        }}>
          Estado del proyecto
        </div>
        <div style={{
          display:   'flex',
          flexWrap:  'wrap',
          gap:       '6px 12px',
        }}>
          {Object.entries(COLOR_PIN).map(
            ([estado, color]) => (
              <div key={estado} style={{
                display:    'flex',
                alignItems: 'center',
                gap:        5,
                fontSize:   10,
                color:      'var(--portal-slate)',
              }}>
                <div style={{
                  width:        8,
                  height:       8,
                  borderRadius: '50%',
                  background:   color,
                  border:       '1.5px solid white',
                  boxShadow:    `0 1px 3px ${color}50`,
                  flexShrink:   0,
                }} />
                {estado}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

const COLOR_PIN: Record<string, string> = {
  'En gestión':   '#F59E0B',
  'En ejecución': '#3B82F6',
  'Finalizado':   '#10B981',
  'Suspendido':   '#EF4444',
};
