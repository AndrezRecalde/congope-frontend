'use client'

import { useState, useEffect } from 'react';
import {
  portalService,
  type DetalleProyectoPortal,
} from '@/services/portal.service';

// ── Iconos SVG inline (sin emojis) ───────────────────────
const IcoX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IcoBuilding = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10M9 7h6M9 11h6"/>
  </svg>
);
const IcoCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IcoMap = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
);
const IcoUsers = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcoTarget = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IcoGlobe = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const IcoCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcoInfo = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

// ── Estilos base ──────────────────────────────────────────
const FONT: React.CSSProperties = {
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
};

const LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: 'var(--portal-slate)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: 6,
  display: 'flex',
  alignItems: 'center',
  gap: 5,
};

const SEC: React.CSSProperties = {
  marginBottom: 20,
  paddingBottom: 20,
  borderBottom: '1px solid rgba(11,31,58,0.07)',
};

// ── Props ─────────────────────────────────────────────────
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
    let active = true;
    const cargar = async () => {
      setCargando(true);
      setProyecto(null);
      try {
        const data = await portalService.detalleProyecto(proyectoId);
        if (active) setProyecto(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setCargando(false);
      }
    };
    cargar();
    return () => { active = false; };
  }, [proyectoId]);

  const abierto = !!proyectoId;

  const totalDir  = proyecto?.beneficiarios?.directos  ?? 0;
  const totalInd  = proyecto?.beneficiarios?.indirectos ?? 0;
  const benProv   = proyecto?.beneficiarios_por_provincia ?? [];
  const actores   = proyecto?.actores ?? (proyecto?.actor ? [proyecto.actor] : []);

  return (
    <>
      {/* Overlay */}
      {abierto && (
        <div
          onClick={onCerrar}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(11, 31, 58, 0.5)',
            zIndex: 200,
            backdropFilter: 'blur(2px)',
            animation: 'portalFadeIn 250ms ease',
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        ...FONT,
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: 460, maxWidth: '92vw',
        background: 'white',
        zIndex: 201,
        boxShadow: '-8px 0 48px rgba(11,31,58,0.2)',
        transform: abierto ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 350ms cubic-bezier(0.32, 0.72, 0, 1)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>

        {/* ── Header del drawer ── */}
        <div className="portal-drawer-header" style={{ ...FONT }}>
          <button
            onClick={onCerrar}
            title="Cerrar"
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.12)',
              border: 'none', borderRadius: 8,
              color: 'white', width: 32, height: 32,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <IcoX />
          </button>

          {cargando ? (
            <>
              <div style={{ height: 12, width: '50%', background: 'rgba(255,255,255,0.2)', borderRadius: 4, marginBottom: 10, marginTop: 4 }} />
              <div style={{ height: 22, width: '80%', background: 'rgba(255,255,255,0.2)', borderRadius: 6 }} />
            </>
          ) : proyecto ? (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--portal-gold)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6, marginTop: 4 }}>
                {proyecto.codigo}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', lineHeight: 1.35, margin: '0 44px 10px 0' }}>
                {proyecto.nombre}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  background: `${getColorEstado(proyecto.estado)}22`,
                  border: `1px solid ${getColorEstado(proyecto.estado)}66`,
                  borderRadius: 100, padding: '3px 10px',
                  fontSize: 11, fontWeight: 600, color: getColorEstado(proyecto.estado),
                }}>
                  {proyecto.estado}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--portal-gold-lt)' }}>
                  {proyecto.monto_formateado}
                </span>
                {(totalDir > 0 || totalInd > 0) && (
                  <span style={{
                    background: 'rgba(20,184,166,0.15)',
                    border: '1px solid rgba(20,184,166,0.4)',
                    borderRadius: 100, padding: '3px 10px',
                    fontSize: 11, fontWeight: 600, color: '#5eead4',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <IcoUsers />
                    {(totalDir + totalInd).toLocaleString('es-EC')} beneficiarios
                  </span>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* ── Cuerpo ── */}
        {proyecto && (
          <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto', ...FONT }}>

            {/* Actores cooperantes */}
            {actores.length > 0 && (
              <div style={SEC}>
                <div style={LABEL}><IcoBuilding /> Actor{actores.length > 1 ? 'es' : ''} cooperante{actores.length > 1 ? 's' : ''}</div>
                {actores.map((a, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '6px 0', borderBottom: i < actores.length - 1 ? '1px solid rgba(11,31,58,0.05)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--portal-navy)' }}>{a.nombre}</div>
                      <div style={{ fontSize: 12, color: 'var(--portal-slate)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <IcoGlobe /> {a.tipo} · {a.pais_origen}
                      </div>
                    </div>
                    {a.sitio_web && (
                      <a href={a.sitio_web} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11, color: 'var(--portal-blue)', textDecoration: 'none', marginTop: 2 }}>
                        Ver web ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Período + sector */}
            <div style={SEC}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={LABEL}><IcoCalendar /> Período</div>
                  <div style={{ fontSize: 13, color: 'var(--portal-navy)' }}>
                    {proyecto.fecha_inicio ?? '—'} → {proyecto.fecha_fin_planificada ?? '—'}
                  </div>
                  {proyecto.fecha_fin_real && (
                    <div style={{ fontSize: 11, color: '#10b981', marginTop: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <IcoCheck /> Finalizó: {proyecto.fecha_fin_real}
                    </div>
                  )}
                </div>
                <div>
                  <div style={LABEL}><IcoTarget /> Sector</div>
                  <div style={{ fontSize: 13, color: 'var(--portal-navy)' }}>{proyecto.sector_tematico || '—'}</div>
                  {proyecto.flujo_direccion && (
                    <div style={{ fontSize: 11, color: 'var(--portal-slate)', marginTop: 3 }}>{proyecto.flujo_direccion}</div>
                  )}
                </div>
              </div>
              {proyecto.modalidad_cooperacion?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={LABEL}><IcoInfo /> Modalidad</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {proyecto.modalidad_cooperacion.map((m) => (
                      <span key={m} style={{
                        background: 'rgba(11,31,58,0.06)', borderRadius: 100,
                        padding: '3px 10px', fontSize: 11, fontWeight: 500,
                        color: 'var(--portal-navy)',
                      }}>{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avance de hitos */}
            {proyecto.avance.hitos_total > 0 && (
              <div style={SEC}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={LABEL}><IcoCheck /> Avance en hitos</div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--portal-blue)' }}>
                    {proyecto.avance.hitos_completados}/{proyecto.avance.hitos_total}
                    {proyecto.avance.porcentaje !== null && ` · ${proyecto.avance.porcentaje}%`}
                  </span>
                </div>
                {proyecto.avance.porcentaje !== null && (
                  <div style={{ height: 6, background: 'rgba(11,31,58,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${proyecto.avance.porcentaje}%`, height: '100%',
                      background: 'linear-gradient(90deg, var(--portal-blue), var(--portal-gold))',
                      borderRadius: 3, transition: 'width 1s ease',
                    }} />
                  </div>
                )}
              </div>
            )}

            {/* ── Beneficiarios por Provincia ── */}
            {benProv.length > 0 && (
              <div style={SEC}>
                <div style={{ ...LABEL, marginBottom: 12 }}>
                  <IcoUsers /> Beneficiarios por provincia
                  {(totalDir > 0 || totalInd > 0) && (
                    <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#14b8a6' }}>
                      {totalDir > 0 && `${totalDir.toLocaleString('es-EC')} dir.`}
                      {totalInd > 0 && ` · ${totalInd.toLocaleString('es-EC')} ind.`}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {benProv.map((g) => (
                    <div key={g.provincia_id} style={{
                      border: '1px solid rgba(20,184,166,0.25)',
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}>
                      {/* Cabecera provincia */}
                      <div style={{
                        background: 'rgba(20,184,166,0.08)',
                        padding: '8px 12px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#0f766e' }}>
                          <IcoMap /> {g.provincia_nombre}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {g.total_directos > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'white', background: '#14b8a6', borderRadius: 100, padding: '2px 8px' }}>
                              {g.total_directos.toLocaleString('es-EC')} dir.
                            </span>
                          )}
                          {g.total_indirectos > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 600, color: '#3b82f6', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 100, padding: '2px 8px' }}>
                              {g.total_indirectos.toLocaleString('es-EC')} ind.
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Filas de categorías */}
                      <div style={{ padding: '4px 0' }}>
                        {g.categorias.map((c, i) => (
                          <div key={i} style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 80px 80px',
                            gap: 6,
                            padding: '5px 12px',
                            borderBottom: i < g.categorias.length - 1 ? '1px solid rgba(11,31,58,0.05)' : 'none',
                            alignItems: 'center',
                          }}>
                            <div>
                              <div style={{ fontSize: 12, color: 'var(--portal-navy)', fontWeight: 500 }}>{c.categoria_nombre ?? '—'}</div>
                              {c.categoria_grupo && (
                                <div style={{ fontSize: 10, color: 'var(--portal-slate)' }}>{c.categoria_grupo}</div>
                              )}
                            </div>
                            <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#0f766e' }}>
                              {c.cantidad_directos != null ? c.cantidad_directos.toLocaleString('es-EC') : '—'}
                            </div>
                            <div style={{ textAlign: 'right', fontSize: 12, color: '#3b82f6' }}>
                              {c.cantidad_indirectos != null ? c.cantidad_indirectos.toLocaleString('es-EC') : '—'}
                            </div>
                          </div>
                        ))}
                        {/* Footer de totales de la provincia */}
                        <div style={{
                          display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 6,
                          padding: '6px 12px', background: 'rgba(11,31,58,0.03)',
                          borderTop: '1px solid rgba(20,184,166,0.15)',
                        }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--portal-slate)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Total</div>
                          <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#0f766e' }}>
                            {g.total_directos > 0 ? g.total_directos.toLocaleString('es-EC') : '—'}
                          </div>
                          <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>
                            {g.total_indirectos > 0 ? g.total_indirectos.toLocaleString('es-EC') : '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Leyenda columnas */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 6, padding: '0 12px' }}>
                    <div />
                    <div style={{ textAlign: 'right', fontSize: 10, color: '#14b8a6', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Directos</div>
                    <div style={{ textAlign: 'right', fontSize: 10, color: '#3b82f6', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Indirectos</div>
                  </div>
                </div>
              </div>
            )}

            {/* Provincias participantes */}
            {proyecto.provincias.length > 0 && (
              <div style={SEC}>
                <div style={LABEL}><IcoMap /> Provincias participantes</div>
                {proyecto.provincias.map((p) => (
                  <div key={p.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '7px 0', borderBottom: '1px solid rgba(11,31,58,0.05)',
                  }}>
                    <div>
                      <span style={{ fontSize: 13, color: 'var(--portal-navy)' }}>{p.nombre}</span>
                      <span style={{
                        marginLeft: 8, fontSize: 10, fontWeight: 600,
                        color: 'var(--portal-slate)', background: 'rgba(11,31,58,0.06)',
                        borderRadius: 100, padding: '2px 8px',
                      }}>{p.rol}</span>
                    </div>
                    {p.porcentaje_avance !== null && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 72, height: 4, background: 'rgba(11,31,58,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${p.porcentaje_avance}%`, height: '100%', background: 'var(--portal-blue)', borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--portal-blue)', minWidth: 28 }}>
                          {p.porcentaje_avance}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ODS */}
            {proyecto.ods.length > 0 && (
              <div style={SEC}>
                <div style={LABEL}><IcoTarget /> ODS alineados</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {proyecto.ods.map((o) => (
                    <span key={o.id} style={{
                      background: o.color_hex, borderRadius: 100,
                      padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'white',
                    }}>
                      {o.numero}. {o.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Descripción */}
            {proyecto.descripcion && (
              <div style={{ marginBottom: 20 }}>
                <div style={LABEL}><IcoInfo /> Descripción</div>
                <p style={{ fontSize: 13, color: 'var(--portal-slate)', lineHeight: 1.65, margin: 0 }}>
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
  const c: Record<string, string> = {
    'En gestión':   '#F59E0B',
    'En ejecución': '#3B82F6',
    'Finalizado':   '#10B981',
    'Suspendido':   '#EF4444',
  };
  return c[estado] ?? '#6B7280';
}
