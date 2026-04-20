'use client'

import { useState, useEffect } from 'react';
import { portalService } from '@/services/portal.service';
import type { OpcionesFiltro } from '@/services/portal.service';
import { COLORES_PROVINCIAS } from '@/types/comparador.types';

interface ComparadorSelectorProps {
  onComparar:     (ids: string[]) => void;
  onLimpiar:      () => void;
  cargando:       boolean;
  hayResultados:  boolean;
}

export function ComparadorSelector({
  onComparar,
  onLimpiar,
  cargando,
  hayResultados,
}: ComparadorSelectorProps) {
  const [opciones, setOpciones] = useState<OpcionesFiltro['provincias']>([]);
  const [seleccionadas, setSeleccionadas] = useState<string[]>(['', '']);

  // Cargar lista de provincias del catálogo
  useEffect(() => {
    portalService.mapaCatalogos()
      .then((cat) => setOpciones(cat.opciones_filtro.provincias))
      .catch(console.error);
  }, []);

  const puedeAgregar = seleccionadas.length < 3;
  const puedeQuitar  = seleccionadas.length > 2;

  const agregarSlot = () => {
    if (puedeAgregar) {
      setSeleccionadas([...seleccionadas, '']);
    }
  };

  const quitarSlot = (index: number) => {
    if (!puedeQuitar) return;
    setSeleccionadas(seleccionadas.filter((_, i) => i !== index));
  };

  const cambiarProvincia = (index: number, valor: string) => {
    const nuevas = [...seleccionadas];
    nuevas[index] = valor;
    setSeleccionadas(nuevas);
  };

  const ids = seleccionadas.filter(Boolean);
  // Eliminar duplicados para la validación
  const idsUnicos = [...new Set(ids)];
  const puedeComparar = idsUnicos.length >= 2 && !cargando;

  const handleLimpiar = () => {
    setSeleccionadas(['', '']);
    onLimpiar();
  };

  // Provincias disponibles para cada slot
  // (excluir las ya seleccionadas en otros slots)
  const disponiblesParaSlot = (index: number) => {
    const otrasSel = seleccionadas.filter((_, i) => i !== index && seleccionadas[i] !== '');
    return opciones.filter((p) => !otrasSel.includes(p.value));
  };

  return (
    <div style={{
      background:   'white',
      borderRadius: 20,
      padding:      '32px',
      boxShadow:    '0 4px 24px rgba(11,31,58,0.08)',
      border:       '1px solid rgba(11,31,58,0.08)',
      marginBottom: 32,
    }}>
      <h2 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize:   22,
        fontWeight: 700,
        color:      'var(--portal-navy)',
        margin:     '0 0 24px',
      }}>
        Selecciona las provincias a comparar
      </h2>

      {/* Slots de selección */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap:                 16,
        marginBottom:        24,
      }}>
        {seleccionadas.map((valor, index) => (
          <div key={index} style={{ position: 'relative' }}>
            {/* Indicador de color */}
            <div style={{
              position:     'absolute',
              left:         0,
              top:          0,
              bottom:       0,
              width:        4,
              background:   COLORES_PROVINCIAS[index],
              borderRadius: '4px 0 0 4px',
            }} />

            <div style={{ paddingLeft: 12 }}>
              <label style={{
                fontSize:      11,
                fontWeight:    600,
                color:         'var(--portal-slate)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display:       'block',
                marginBottom:  6,
              }}>
                Provincia {index + 1}
              </label>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <select
                    value={valor}
                    onChange={(e) => cambiarProvincia(index, e.target.value)}
                    style={{
                      width:        '100%',
                      padding:      '10px 32px 10px 12px',
                      border:       `2px solid ${
                        valor ? COLORES_PROVINCIAS[index] : 'rgba(11,31,58,0.15)'
                      }`,
                      borderRadius: 10,
                      fontSize:     13,
                      color:        valor ? 'var(--portal-navy)' : '#9CA3AF',
                      background:   valor ? `${COLORES_PROVINCIAS[index]}08` : 'white',
                      outline:      'none',
                      cursor:       'pointer',
                      fontFamily:   'var(--font-dm-sans)',
                      transition:   'all 200ms ease',
                      appearance:   'none',
                    }}
                  >
                    <option value="">Seleccionar provincia...</option>
                    {disponiblesParaSlot(index).map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <span style={{
                    position:      'absolute',
                    right:         10,
                    top:           '50%',
                    transform:     'translateY(-50%)',
                    fontSize:      10,
                    color:         'var(--portal-slate)',
                    pointerEvents: 'none',
                  }}>
                    ▼
                  </span>
                </div>

                {/* Botón quitar slot */}
                {puedeQuitar && (
                  <button
                    onClick={() => quitarSlot(index)}
                    style={{
                      background:   'none',
                      border:       '1px solid rgba(11,31,58,0.15)',
                      borderRadius: 8,
                      width:        34,
                      height:       34,
                      cursor:       'pointer',
                      color:        '#9CA3AF',
                      fontSize:     16,
                      display:      'flex',
                      alignItems:   'center',
                      justifyContent:'center',
                      flexShrink:   0,
                      transition:   'all 200ms ease',
                    }}
                    title="Quitar"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        gap:            12,
        flexWrap:       'wrap',
      }}>
        {/* Agregar tercera provincia */}
        {puedeAgregar && (
          <button
            onClick={agregarSlot}
            style={{
              background:    'none',
              border:        '1.5px dashed rgba(11,31,58,0.2)',
              borderRadius:  10,
              padding:       '8px 16px',
              fontSize:      12,
              fontWeight:    600,
              color:         'var(--portal-slate)',
              cursor:        'pointer',
              letterSpacing: '0.02em',
              transition:    'all 200ms ease',
              display:       'flex',
              alignItems:    'center',
              gap:           6,
            }}
          >
            + Agregar tercera provincia
          </button>
        )}

        {/* Espaciador */}
        <div style={{ flex: 1 }} />

        {/* Limpiar */}
        {hayResultados && (
          <button
            onClick={handleLimpiar}
            style={{
              background:    'none',
              border:        '1px solid rgba(11,31,58,0.15)',
              borderRadius:  10,
              padding:       '10px 18px',
              fontSize:      13,
              color:         'var(--portal-slate)',
              cursor:        'pointer',
              transition:    'all 200ms ease',
            }}
          >
            × Nueva comparación
          </button>
        )}

        {/* Botón comparar */}
        <button
          onClick={() => onComparar(idsUnicos)}
          disabled={!puedeComparar}
          style={{
            background:    puedeComparar ? 'var(--portal-navy)' : 'rgba(11,31,58,0.3)',
            color:         'white',
            border:        'none',
            borderRadius:  10,
            padding:       '11px 24px',
            fontSize:      13,
            fontWeight:    700,
            fontFamily:    'var(--font-dm-sans)',
            cursor:        puedeComparar ? 'pointer' : 'not-allowed',
            letterSpacing: '0.04em',
            transition:    'all 200ms ease',
            display:       'flex',
            alignItems:    'center',
            gap:           8,
            boxShadow:     puedeComparar ? '0 4px 14px rgba(11,31,58,0.25)' : 'none',
          }}
        >
          {cargando ? (
            <>
              <span style={{
                display:      'inline-block',
                width:        14,
                height:       14,
                border:       '2px solid rgba(255,255,255,0.3)',
                borderTop:    '2px solid white',
                borderRadius: '50%',
                animation:    'spin 0.8s linear infinite',
              }} />
              Comparando...
            </>
          ) : (
            '⚖️ Comparar provincias'
          )}
        </button>
      </div>

      {/* Mensaje de validación */}
      {ids.length > 0 && idsUnicos.length < ids.length && (
        <p style={{
          fontSize:   12,
          color:      '#F59E0B',
          margin:     '12px 0 0',
          padding:    '8px 12px',
          background: '#FFFBEB',
          borderRadius:8,
          border:     '1px solid #FDE68A',
        }}>
          ⚠️ Tienes provincias duplicadas.
          Selecciona provincias distintas para
          compararlas correctamente.
        </p>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
