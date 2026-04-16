'use client'

import {
  useState, useEffect, useCallback,
  useRef,
} from 'react';
import dynamic from 'next/dynamic';
import { PortalHeader }   from
  '@/components/portal/PortalHeader';
import { PortalFiltros }  from
  '@/components/portal/PortalFiltros';
import { PortalEstadisticas } from
  '@/components/portal/PortalEstadisticas';
import { PortalEmblematicoSection } from
  '@/components/portal/PortalEmblematicos';
import { PortalBuenasPracticas } from
  '@/components/portal/PortalBuenasPracticas';
import { ProyectoDrawerPortal } from
  '@/components/portal/ProyectoDrawerPortal';
import { PortalFooter }   from
  '@/components/portal/PortalFooter';
import {
  portalService,
  type CatalogosMapa,
  type ConteosPortal,
  type EstadisticasPortal,
  type ResultadosFiltro,
  type ProvinciaPortal,
} from '@/services/portal.service';

// MapLibre solo en el cliente
const PortalMapa = dynamic(
  () => import('@/components/portal/PortalMapa')
    .then((m) => m.PortalMapa),
  { ssr: false }
);

interface FiltrosPortal {
  provincia_id: string;
  canton_id:    string;
  actor_id:     string;
}

const FILTROS_VACÍOS: FiltrosPortal = {
  provincia_id: '',
  canton_id:    '',
  actor_id:     '',
};

export default function PortalPage() {
  // Datos estáticos (carga inicial)
  const [catalogos, setCatalogos] =
    useState<CatalogosMapa | null>(null);
  const [conteos, setConteos] =
    useState<ConteosPortal | null>(null);
  const [estadisticas, setEstadisticas] =
    useState<EstadisticasPortal | null>(null);

  // Filtros y resultados
  const [filtros, setFiltros] =
    useState<FiltrosPortal>(FILTROS_VACÍOS);
  const [resultados, setResultados] =
    useState<ResultadosFiltro | null>(null);
  const [cargandoFiltros, setCargandoFiltros] =
    useState(false);

  // Tooltip del mapa
  const [tooltipProv, setTooltipProv] =
    useState<ProvinciaPortal | null>(null);
  const [tooltipPos, setTooltipPos] =
    useState<{ x: number; y: number } | null>(null);

  // Drawer del proyecto
  const [proyectoDrawerId, setProyectoDrawerId] =
    useState<string | null>(null);

  const hayFiltros = !!(
    filtros.provincia_id ||
    filtros.canton_id    ||
    filtros.actor_id
  );

  // ── Carga inicial ──────────────────────────────
  useEffect(() => {
    Promise.all([
      portalService.mapaCatalogos(),
      portalService.conteos(),
      portalService.estadisticas(),
    ]).then(([cat, cnt, est]) => {
      setCatalogos(cat);
      setConteos(cnt);
      setEstadisticas(est);
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reaccionar a cambios de filtros ───────────
  useEffect(() => {
    if (!hayFiltros) {
      setResultados(null);
      return;
    }
    setCargandoFiltros(true);
    const params = {
      provincia_id: filtros.provincia_id || undefined,
      canton_id:    filtros.canton_id    || undefined,
      actor_id:     filtros.actor_id     || undefined,
    };
    portalService.mapaFiltrar(params)
      .then(setResultados)
      .catch(console.error)
      .finally(() => setCargandoFiltros(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros, hayFiltros]);

  // ── Scroll reveal ──────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.scroll-reveal')
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadisticas]);

  const handleHoverProvincia = useCallback(
    (
      datos: ProvinciaPortal | null,
      pos:   { x: number; y: number } | null
    ) => {
      setTooltipProv(datos);
      setTooltipPos(pos);
    }, []
  );

  const limpiarFiltros = () => {
    setFiltros(FILTROS_VACÍOS);
  };

  const totalPins =
    resultados?.resumen?.total_proyectos ?? 0;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* Header flotante */}
      <PortalHeader />

      {/* ─── SECCIÓN HERO — Mapa full screen ─── */}
      <section
        id="mapa"
        className="portal-hero"
        style={{
          background: 'linear-gradient(180deg, ' +
            'var(--portal-navy) 0%, ' +
            'var(--portal-blue) 100%)',
        }}
      >
        {/* Mapa MapLibre */}
        <div style={{
          position: 'absolute',
          inset:    0,
        }}>
          {catalogos && (
            <PortalMapa
              catalogos={catalogos}
              filtros={filtros}
              resultados={resultados}
              hayFiltros={hayFiltros}
              onClickPin={setProyectoDrawerId}
              onHoverProvincia={handleHoverProvincia}
            />
          )}
        </div>

        {/* Panel de filtros flotante */}
        {catalogos && (
          <PortalFiltros
            opciones={catalogos.opciones_filtro}
            filtros={filtros}
            onChange={setFiltros}
            onLimpiar={limpiarFiltros}
            hayFiltros={hayFiltros}
            totalPins={totalPins}
          />
        )}

        {/* Tooltip de hover en provincias */}
        {tooltipProv && tooltipPos && (
          <div
            className="portal-tooltip"
            style={{
              left: tooltipPos.x > window.innerWidth - 240
                ? tooltipPos.x - 220
                : tooltipPos.x + 16,
              top: tooltipPos.y > window.innerHeight - 200
                ? tooltipPos.y - 180
                : tooltipPos.y + 16,
            }}
          >
            <div style={{
              fontFamily: 'var(--font-playfair)',
              fontSize:   16,
              fontWeight: 700,
              marginBottom:8,
              color:      'var(--portal-gold-lt)',
            }}>
              {tooltipProv.nombre}
            </div>
            <div style={{
              display:       'flex',
              flexDirection: 'column',
              gap:           5,
            }}>
              <div style={{
                display:        'flex',
                justifyContent: 'space-between',
                fontSize:       13,
              }}>
                <span style={{
                  color: 'rgba(255,255,255,0.6)',
                }}>
                  Total proyectos
                </span>
                <span style={{
                  fontWeight: 700,
                  color:      'white',
                }}>
                  {tooltipProv.proyectos_count}
                </span>
              </div>
              {tooltipProv.proyectos_count > 0 && (
                <>
                  {tooltipProv.tooltip.en_ejecucion > 0 && (
                    <div style={{
                      display:        'flex',
                      justifyContent: 'space-between',
                      fontSize:       12,
                    }}>
                      <span style={{
                        color: 'rgba(93,162,251,0.8)',
                      }}>
                        En ejecución
                      </span>
                      <span style={{ color: '#60A5FA' }}>
                        {tooltipProv.tooltip.en_ejecucion}
                      </span>
                    </div>
                  )}
                  {tooltipProv.tooltip.en_gestion > 0 && (
                    <div style={{
                      display:        'flex',
                      justifyContent: 'space-between',
                      fontSize:       12,
                    }}>
                      <span style={{
                        color: 'rgba(251,191,36,0.8)',
                      }}>
                        En gestión
                      </span>
                      <span style={{ color: '#FBBF24' }}>
                        {tooltipProv.tooltip.en_gestion}
                      </span>
                    </div>
                  )}
                  {tooltipProv.tooltip.finalizado > 0 && (
                    <div style={{
                      display:        'flex',
                      justifyContent: 'space-between',
                      fontSize:       12,
                    }}>
                      <span style={{
                        color: 'rgba(52,211,153,0.8)',
                      }}>
                        Finalizados
                      </span>
                      <span style={{ color: '#34D399' }}>
                        {tooltipProv.tooltip.finalizado}
                      </span>
                    </div>
                  )}
                  <div style={{
                    borderTop:   '1px solid rgba(201,168,76,0.2)',
                    paddingTop:  6,
                    marginTop:   2,
                    display:     'flex',
                    justifyContent:'space-between',
                    fontSize:    12,
                  }}>
                    <span style={{
                      color: 'rgba(255,255,255,0.5)',
                    }}>
                      Inversión
                    </span>
                    <span style={{
                      color:      'var(--portal-gold-lt)',
                      fontWeight: 700,
                    }}>
                      {tooltipProv.monto_formateado}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Overlay del mapa — indicador de scroll */}
        <div style={{
          position:       'absolute',
          bottom:         32,
          left:           '50%',
          transform:      'translateX(-50%)',
          zIndex:         10,
          textAlign:      'center',
          pointerEvents:  'none',
        }}>
          <div style={{
            fontSize:      12,
            color:         'rgba(255,255,255,0.5)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom:  8,
          }}>
            Desplaza para ver más
          </div>
          <div style={{
            width: 24, height: 24,
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'portalFadeUp 1.5s ease infinite',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </section>

      {/* ─── SECCIÓN ESTADÍSTICAS ─── */}
      {estadisticas && (
        <div className="scroll-reveal">
          <PortalEstadisticas
            estadisticas={estadisticas}
          />
        </div>
      )}

      {/* ─── SECCIÓN EMBLEMÁTICOS ─── */}
      <div className="scroll-reveal">
        <PortalEmblematicoSection
          total={conteos?.total_emblematicos ?? 0}
          emblematicos={
            resultados?.emblematicos ?? []
          }
          hayFiltros={hayFiltros}
          cargando={cargandoFiltros}
        />
      </div>

      {/* ─── SECCIÓN BUENAS PRÁCTICAS ─── */}
      <div className="scroll-reveal">
        <PortalBuenasPracticas
          total={conteos?.total_buenas_practicas ?? 0}
          practicas={
            resultados?.buenas_practicas ?? []
          }
          hayFiltros={hayFiltros}
          cargando={cargandoFiltros}
        />
      </div>

      {/* Footer */}
      <PortalFooter />

      {/* Drawer lateral del proyecto */}
      <ProyectoDrawerPortal
        proyectoId={proyectoDrawerId}
        onCerrar={() => setProyectoDrawerId(null)}
      />
    </div>
  );
}
