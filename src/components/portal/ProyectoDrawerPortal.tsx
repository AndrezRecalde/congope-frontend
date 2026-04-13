'use client'

import { useState, useEffect } from 'react';
import {
  portalService,
  type DetalleProyectoPortal,
} from '@/services/portal.service';

interface ProyectoDrawerPortalProps {
  proyectoId: string | null;
  onCerrar:   () => void;
}

export function ProyectoDrawerPortal({
  proyectoId,
  onCerrar,
}: ProyectoDrawerPortalProps) {
  const [proyecto, setProyecto] =
    useState<DetalleProyectoPortal | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!proyectoId) return;
    setCargando(true);
    setProyecto(null);
    portalService.detalleProyecto(proyectoId)
      .then(setProyecto)
      .catch(console.error)
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyectoId]);

  const abierto = !!proyectoId;

  return (
    <>
      {/* Overlay */}
      {abierto && (
        <div
          onClick={onCerrar}
          style={{
            position:   'fixed',
            inset:      0,
            background: 'rgba(11, 31, 58, 0.5)',
            zIndex:     200,
            backdropFilter: 'blur(2px)',
            animation:  'portalFadeIn 250ms ease',
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position:   'fixed',
        top:        0,
        right:      0,
        bottom:     0,
        width:      420,
        maxWidth:   '90vw',
        background: 'white',
        zIndex:     201,
        boxShadow:  '-8px 0 48px rgba(11,31,58,0.2)',
        transform:  abierto
          ? 'translateX(0)'
          : 'translateX(100%)',
        transition: 'transform 350ms cubic-bezier(0.32, 0.72, 0, 1)',
        display:    'flex',
        flexDirection: 'column',
        overflowY:  'auto',
      }}>
        {/* Header del drawer */}
        <div className="portal-drawer-header">
          <button
            onClick={onCerrar}
            style={{
              position:   'absolute',
              top:        20,
              right:      20,
              background: 'rgba(255,255,255,0.1)',
              border:     'none',
              borderRadius:8,
              color:      'white',
              width:      32,
              height:     32,
              cursor:     'pointer',
              fontSize:   18,
              display:    'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>

          {cargando ? (
            <>
              <div style={{
                height:       14,
                width:        '60%',
                background:   'rgba(255,255,255,0.2)',
                borderRadius: 4,
                marginBottom: 10,
                marginTop:    4,
              }} />
              <div style={{
                height:       22,
                width:        '80%',
                background:   'rgba(255,255,255,0.2)',
                borderRadius: 6,
              }} />
            </>
          ) : proyecto ? (
            <>
              <div style={{
                fontSize:    11,
                fontWeight:  600,
                color:       'var(--portal-gold)',
                letterSpacing:'0.1em',
                textTransform:'uppercase',
                marginBottom:8,
                marginTop:   4,
              }}>
                {proyecto.codigo}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize:   20,
                fontWeight: 700,
                color:      'white',
                lineHeight: 1.3,
                margin:     '0 40px 8px 0',
              }}>
                {proyecto.nombre}
              </h3>
              <div style={{
                display:    'flex',
                alignItems: 'center',
                gap:        8,
                marginTop:  4,
              }}>
                <span style={{
                  background:   `${getColorEstado(proyecto.estado)}25`,
                  border:       `1px solid ${getColorEstado(proyecto.estado)}60`,
                  borderRadius: 100,
                  padding:      '3px 10px',
                  fontSize:     11,
                  fontWeight:   600,
                  color:        getColorEstado(proyecto.estado),
                }}>
                  {proyecto.estado}
                </span>
                <span style={{
                  fontSize:   13,
                  fontWeight: 700,
                  color:      'var(--portal-gold-lt)',
                }}>
                  {proyecto.monto_formateado}
                </span>
              </div>
            </>
          ) : null}
        </div>

        {/* Cuerpo del drawer */}
        {proyecto && (
          <div style={{
            padding:   '24px',
            flex:      1,
            overflowY: 'auto',
          }}>

            {/* Actor cooperante */}
            {proyecto.actor && (
              <div style={{ marginBottom: 20 }}>
                <div className="portal-gold-line" />
                <div style={{
                  fontSize:    11,
                  fontWeight:  600,
                  color:       'var(--portal-slate)',
                  letterSpacing:'0.06em',
                  textTransform:'uppercase',
                  marginBottom:6,
                }}>
                  Actor cooperante
                </div>
                <div style={{
                  fontSize:   15,
                  fontWeight: 600,
                  color:      'var(--portal-navy)',
                }}>
                  {proyecto.actor.nombre}
                </div>
                <div style={{
                  fontSize: 12,
                  color:    'var(--portal-slate)',
                  marginTop:2,
                }}>
                  {proyecto.actor.tipo} ·{' '}
                  {proyecto.actor.pais_origen}
                </div>
              </div>
            )}

            {/* Fechas */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize:    11,
                fontWeight:  600,
                color:       'var(--portal-slate)',
                letterSpacing:'0.06em',
                textTransform:'uppercase',
                marginBottom:6,
              }}>
                Período de ejecución
              </div>
              <div style={{
                fontSize:   14,
                color:      'var(--portal-navy)',
              }}>
                {proyecto.fecha_inicio ?? '—'}
                {' → '}
                {proyecto.fecha_fin_planificada ?? '—'}
              </div>
            </div>

            {/* ODS */}
            {proyecto.ods.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize:    11,
                  fontWeight:  600,
                  color:       'var(--portal-slate)',
                  letterSpacing:'0.06em',
                  textTransform:'uppercase',
                  marginBottom:8,
                }}>
                  ODS alineados
                </div>
                <div style={{
                  display:  'flex',
                  flexWrap: 'wrap',
                  gap:      6,
                }}>
                  {proyecto.ods.map((o) => (
                    <span
                      key={o.id}
                      style={{
                        background:   o.color_hex,
                        borderRadius: 100,
                        padding:      '4px 10px',
                        fontSize:     11,
                        fontWeight:   700,
                        color:        'white',
                      }}
                    >
                      {o.numero}. {o.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Provincias */}
            {proyecto.provincias.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize:    11,
                  fontWeight:  600,
                  color:       'var(--portal-slate)',
                  letterSpacing:'0.06em',
                  textTransform:'uppercase',
                  marginBottom:8,
                }}>
                  Provincias participantes
                </div>
                {proyecto.provincias.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display:         'flex',
                      justifyContent:  'space-between',
                      alignItems:      'center',
                      padding:         '8px 0',
                      borderBottom:    '1px solid rgba(11,31,58,0.06)',
                    }}
                  >
                    <span style={{
                      fontSize:   13,
                      color:      'var(--portal-navy)',
                    }}>
                      {p.nombre}
                    </span>
                    {p.porcentaje_avance !== null && (
                      <div style={{
                        display:    'flex',
                        alignItems: 'center',
                        gap:        8,
                      }}>
                        <div style={{
                          width:        80,
                          height:       4,
                          background:   'rgba(11,31,58,0.1)',
                          borderRadius: 2,
                          overflow:     'hidden',
                        }}>
                          <div style={{
                            width:        `${p.porcentaje_avance}%`,
                            height:       '100%',
                            background:   'var(--portal-blue)',
                            borderRadius: 2,
                          }} />
                        </div>
                        <span style={{
                          fontSize:   11,
                          fontWeight: 700,
                          color:      'var(--portal-blue)',
                        }}>
                          {p.porcentaje_avance}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Avance de hitos */}
            {proyecto.avance.hitos_total > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize:    11,
                  fontWeight:  600,
                  color:       'var(--portal-slate)',
                  letterSpacing:'0.06em',
                  textTransform:'uppercase',
                  marginBottom:8,
                }}>
                  Avance en hitos
                </div>
                <div style={{
                  display:    'flex',
                  justifyContent:'space-between',
                  marginBottom:6,
                }}>
                  <span style={{
                    fontSize: 12,
                    color:    'var(--portal-slate)',
                  }}>
                    {proyecto.avance.hitos_completados} de{' '}
                    {proyecto.avance.hitos_total} completados
                  </span>
                  {proyecto.avance.porcentaje !== null && (
                    <span style={{
                      fontSize:   12,
                      fontWeight: 700,
                      color:      'var(--portal-blue)',
                    }}>
                      {proyecto.avance.porcentaje}%
                    </span>
                  )}
                </div>
                {proyecto.avance.porcentaje !== null && (
                  <div style={{
                    height:       6,
                    background:   'rgba(11,31,58,0.08)',
                    borderRadius: 3,
                    overflow:     'hidden',
                  }}>
                    <div style={{
                      width:        `${proyecto.avance.porcentaje}%`,
                      height:       '100%',
                      background:   'linear-gradient(90deg, ' +
                        'var(--portal-blue), ' +
                        'var(--portal-gold))',
                      borderRadius: 3,
                      transition:   'width 1s ease',
                    }} />
                  </div>
                )}
              </div>
            )}

            {/* Descripción */}
            {proyecto.descripcion && (
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize:    11,
                  fontWeight:  600,
                  color:       'var(--portal-slate)',
                  letterSpacing:'0.06em',
                  textTransform:'uppercase',
                  marginBottom:6,
                }}>
                  Descripción
                </div>
                <p style={{
                  fontSize:   13,
                  color:      'var(--portal-slate)',
                  lineHeight: 1.6,
                  margin:     0,
                }}>
                  {proyecto.descripcion}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function getColorEstado(estado: string): string {
  const colores: Record<string, string> = {
    'En gestión':   '#F59E0B',
    'En ejecución': '#3B82F6',
    'Finalizado':   '#10B981',
    'Suspendido':   '#EF4444',
  };
  return colores[estado] ?? '#6B7280';
}
