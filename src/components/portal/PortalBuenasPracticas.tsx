'use client'

import type {
  BuenaPracticaPortal,
} from '@/services/portal.service';

interface PortalBuenasPracticasProps {
  total:        number;
  practicas:    BuenaPracticaPortal[];
  hayFiltros:   boolean;
  cargando:     boolean;
}

export function PortalBuenasPracticas({
  total,
  practicas,
  hayFiltros,
  cargando,
}: PortalBuenasPracticasProps) {
  return (
    <section
      id="practicas"
      style={{
        background: 'white',
        padding:    '80px 0',
      }}
    >
      <div style={{
        maxWidth: 1280,
        margin:   '0 auto',
        padding:  '0 24px',
      }}>
        <div style={{ marginBottom: 48 }}>
          <span className="portal-gold-line" />
          <div style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'flex-end',
            flexWrap:       'wrap',
            gap:            16,
          }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize:   36,
                fontWeight: 700,
                color:      'var(--portal-navy)',
                margin:     '0 0 8px',
              }}>
                Buenas Prácticas
              </h2>
              <p style={{
                fontSize: 15,
                color:    'var(--portal-slate)',
                margin:   0,
              }}>
                Experiencias replicables destacadas
                por los GAD Provinciales
              </p>
            </div>

            {!hayFiltros ? (
              <div style={{
                background:   'rgba(11,31,58,0.06)',
                borderRadius: 100,
                padding:      '10px 24px',
                display:      'flex',
                alignItems:   'center',
                gap:          10,
              }}>
                <span style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize:   28,
                  fontWeight: 700,
                  color:      'var(--portal-navy)',
                }}>
                  {total}
                </span>
                <span style={{
                  fontSize:   12,
                  color:      'var(--portal-slate)',
                  lineHeight: 1.3,
                  letterSpacing:'0.04em',
                }}>
                  buenas<br/>prácticas
                </span>
              </div>
            ) : (
              <div style={{
                background:   'rgba(30, 77, 140, 0.08)',
                border:       '1px solid rgba(30,77,140,0.15)',
                borderRadius: 100,
                padding:      '8px 20px',
                fontSize:     13,
                color:        'var(--portal-blue)',
                fontWeight:   600,
              }}>
                {practicas.length} resultado
                {practicas.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Sin filtros — solo invitación */}
        {!hayFiltros && (
          <div style={{
            textAlign:    'center',
            padding:      '40px 24px',
            background:   'rgba(11,31,58,0.03)',
            borderRadius: 20,
            border:       '2px dashed rgba(11,31,58,0.1)',
          }}>
            <div style={{ fontSize:40, marginBottom:12 }}>
              💡
            </div>
            <p style={{
              fontFamily: 'var(--font-playfair)',
              fontSize:   20,
              fontWeight: 600,
              color:      'var(--portal-navy)',
              margin:     '0 0 8px',
            }}>
              {total} buenas prácticas destacadas
            </p>
            <p style={{
              fontSize:   14,
              color:      'var(--portal-slate)',
              margin:     0,
            }}>
              Filtra por provincia o actor para explorar
              las experiencias de cada territorio
            </p>
          </div>
        )}

        {/* Grid de cards con filtros */}
        {hayFiltros && (
          cargando ? (
            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap:                 20,
            }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    height:       220,
                    background:   'rgba(11,31,58,0.05)',
                    borderRadius: 16,
                  }}
                />
              ))}
            </div>
          ) : practicas.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding:   '48px 24px',
              color:     'var(--portal-slate)',
            }}>
              <div style={{ fontSize:40, marginBottom:12 }}>
                🔍
              </div>
              <p style={{ margin: 0, fontSize: 15 }}>
                No hay buenas prácticas destacadas
                en este territorio
              </p>
            </div>
          ) : (
            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap:                 20,
            }}>
              {practicas.map((p) => {
                const calif =
                  parseFloat(p.calificacion_promedio);

                return (
                  <div
                    key={p.id}
                    className="portal-practica-card"
                  >
                    {/* Provincia y calificación */}
                    <div style={{
                      display:        'flex',
                      justifyContent: 'space-between',
                      alignItems:     'center',
                      marginBottom:   12,
                    }}>
                      <span style={{
                        fontSize:    11,
                        fontWeight:  600,
                        color:       'var(--portal-blue)',
                        letterSpacing:'0.04em',
                        textTransform:'uppercase',
                      }}>
                        {p.provincia?.nombre ?? '—'}
                      </span>
                      {/* Estrellas */}
                      <div className="portal-estrellas">
                        {[1,2,3,4,5].map((i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: 12,
                              opacity:  i <= Math.round(calif)
                                ? 1 : 0.25,
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Título */}
                    <h3 style={{
                      fontFamily: 'var(--font-playfair)',
                      fontSize:   17,
                      fontWeight: 700,
                      color:      'var(--portal-navy)',
                      margin:     '0 0 10px',
                      lineHeight: 1.3,
                    }}>
                      {p.titulo}
                    </h3>

                    {/* Descripción truncada */}
                    <p style={{
                      fontSize:              12,
                      color:                 'var(--portal-slate)',
                      lineHeight:            1.6,
                      margin:                '0 0 14px',
                      display:               '-webkit-box',
                      WebkitLineClamp:       3,
                      WebkitBoxOrient:       'vertical',
                      overflow:              'hidden',
                    }}>
                      {p.descripcion_problema}
                    </p>

                    {/* Footer */}
                    <div style={{
                      display:     'flex',
                      alignItems:  'center',
                      gap:         8,
                      paddingTop:  12,
                      borderTop:   '1px solid rgba(11,31,58,0.08)',
                    }}>
                      <span style={{
                        background:   'rgba(11,31,58,0.06)',
                        borderRadius: 100,
                        padding:      '3px 10px',
                        fontSize:     11,
                        color:        'var(--portal-slate)',
                        fontWeight:   600,
                      }}>
                        {p.replicabilidad}
                      </span>
                      <span style={{
                        marginLeft: 'auto',
                        fontSize:   11,
                        color:      'var(--portal-slate)',
                        opacity:    0.6,
                      }}>
                        {p.created_at}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </section>
  );
}
