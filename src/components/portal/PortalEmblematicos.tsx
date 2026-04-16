"use client";

import Link from "next/link";
import type { EmblematicoPortal } from "@/services/portal.service";
import { IconTrophyFilled } from "@tabler/icons-react";

interface PortalEmblematicosSectionProps {
  total: number;
  emblematicos: EmblematicoPortal[];
  hayFiltros: boolean;
  cargando: boolean;
}

export function PortalEmblematicoSection({
  total,
  emblematicos,
  hayFiltros,
  cargando,
}: PortalEmblematicosSectionProps) {
  return (
    <section
      id="emblematicos"
      style={{
        background: "var(--portal-cream)",
        padding: "80px 0",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Cabecera de sección */}
        <div style={{ marginBottom: 48 }}>
          <span className="portal-gold-line" />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: 36,
                  fontWeight: 700,
                  color: "var(--portal-navy)",
                  margin: "0 0 8px",
                }}
              >
                Proyectos Emblemáticos
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--portal-slate)",
                  margin: 0,
                }}
              >
                Iniciativas de alto impacto y reconocimiento internacional
              </p>
            </div>

            {/* Contador o badge de resultado */}
            {!hayFiltros ? (
              <div
                style={{
                  background: "var(--portal-navy)",
                  borderRadius: 100,
                  padding: "10px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: 28,
                    fontWeight: 700,
                    color: "var(--portal-gold)",
                  }}
                >
                  {total}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.3,
                    letterSpacing: "0.04em",
                  }}
                >
                  proyectos
                  <br />
                  emblemáticos
                </span>
              </div>
            ) : (
              <div
                style={{
                  background: "rgba(30, 77, 140, 0.1)",
                  border: "1px solid rgba(30,77,140,0.2)",
                  borderRadius: 100,
                  padding: "8px 20px",
                  fontSize: 13,
                  color: "var(--portal-blue)",
                  fontWeight: 600,
                }}
              >
                {emblematicos.length} resultado
                {emblematicos.length !== 1 ? "s" : ""} con los filtros aplicados
              </div>
            )}
          </div>
        </div>

        {/* Estado sin filtros — mensaje invitación */}
        {!hayFiltros && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 24px",
              background: "white",
              borderRadius: 20,
              border: "2px dashed rgba(201,168,76,0.3)",
            }}
          >
            <div
              style={{
                fontSize: 40,
                marginBottom: 12,
              }}
            >
              <IconTrophyFilled size={40} color="var(--portal-gold)" />
            </div>
            <p
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: 20,
                fontWeight: 600,
                color: "var(--portal-navy)",
                margin: "0 0 8px",
              }}
            >
              {total} proyectos emblemáticos públicos
            </p>
            <p
              style={{
                fontSize: 14,
                color: "var(--portal-slate)",
                margin: 0,
              }}
            >
              Aplica un filtro en el mapa para ver los proyectos emblemáticos de
              cada territorio
            </p>
          </div>
        )}

        {/* Cards de emblemáticos (con filtros activos) */}
        {hayFiltros &&
          (cargando ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 24,
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 280,
                    background: "rgba(11,31,58,0.06)",
                    borderRadius: 20,
                    animation: "portalFadeIn 1s ease infinite alternate",
                  }}
                />
              ))}
            </div>
          ) : emblematicos.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 24px",
                color: "var(--portal-slate)",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p style={{ margin: 0, fontSize: 15 }}>
                No hay proyectos emblemáticos en este territorio
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 24,
              }}
            >
              {emblematicos.map((e) => (
                <Link
                  key={e.id}
                  href={`/emblematicos/${e.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div className="portal-emblematico-card">
                    {/* Header de la card */}
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, " +
                          "var(--portal-navy) 0%, " +
                          "var(--portal-blue) 100%)",
                        padding: "24px 24px 20px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Ornamento decorativo */}
                      <div
                        style={{
                          position: "absolute",
                          top: -20,
                          right: -20,
                          width: 100,
                          height: 100,
                          borderRadius: "50%",
                          background: "rgba(201,168,76,0.08)",
                        }}
                      />
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--portal-gold)",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          marginBottom: 8,
                        }}
                      >
                        {e.provincia?.nombre}
                        {e.periodo && ` · ${e.periodo}`}
                      </div>
                      <h3
                        style={{
                          fontFamily: "var(--font-playfair)",
                          fontSize: 18,
                          fontWeight: 700,
                          color: "white",
                          margin: "0 0 12px",
                          lineHeight: 1.3,
                        }}
                      >
                        {e.titulo}
                      </h3>
                      {/* Reconocimientos */}
                      {e.reconocimientos.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 5,
                          }}
                        >
                          {e.reconocimientos.slice(0, 2).map((r) => (
                            <span
                              key={r.id}
                              style={{
                                background: "rgba(201,168,76,0.2)",
                                border: "1px solid rgba(201,168,76,0.4)",
                                borderRadius: 100,
                                padding: "3px 10px",
                                fontSize: 10,
                                fontWeight: 600,
                                color: "var(--portal-gold-lt)",
                              }}
                            >
                              🏆 {r.organismo_otorgante} {r.anio}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Body de la card */}
                    <div style={{ padding: "20px 24px 24px" }}>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--portal-slate)",
                          lineHeight: 1.6,
                          margin: "0 0 16px",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {e.descripcion_impacto}
                      </p>

                      {e.proyecto && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            paddingTop: 12,
                            borderTop: "1px solid rgba(11,31,58,0.08)",
                          }}
                        >
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: getColorEstadoPortal(
                                e.proyecto.estado,
                              ),
                            }}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--portal-slate)",
                            }}
                          >
                            {e.proyecto.estado}
                          </span>
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--portal-navy)",
                            }}
                          >
                            {e.proyecto.monto_formateado}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ))}
      </div>
    </section>
  );
}

function getColorEstadoPortal(estado: string): string {
  const c: Record<string, string> = {
    "En gestión": "#F59E0B",
    "En ejecución": "#3B82F6",
    Finalizado: "#10B981",
    Suspendido: "#EF4444",
  };
  return c[estado] ?? "#6B7280";
}
