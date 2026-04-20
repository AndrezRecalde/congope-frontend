'use client'

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { PortalFooter } from '@/components/portal/PortalFooter';
import { ComparadorSelector } from '@/components/portal/comparador/ComparadorSelector';
import { ComparadorResultados } from '@/components/portal/comparador/ComparadorResultados';
import { portalService } from '@/services/portal.service';
import type { EstadisticasProvincia } from '@/types/comparador.types';

export default function ComparadorPage() {
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [resultados, setResultados] = useState<EstadisticasProvincia[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComparar = useCallback(
    async (ids: string[]) => {
      if (ids.length < 2) return;
      setCargando(true);
      setError(null);

      try {
        const data = await portalService.compararProvincias(ids);
        setResultados(data);
        setSeleccionadas(ids);
      } catch (err) {
        setError(
          'No se pudo cargar la comparación. ' +
          'Intenta nuevamente.'
        );
        console.error(err);
      } finally {
        setCargando(false);
      }
    },
    []
  );

  const handleLimpiar = () => {
    setSeleccionadas([]);
    setResultados([]);
    setError(null);
  };

  return (
    <div style={{
      fontFamily:  'var(--font-dm-sans)',
      minHeight:   '100vh',
      background:  'var(--portal-cream)',
    }}>
      <PortalHeader />

      {/* Hero del comparador */}
      <div style={{
        background: 'linear-gradient(135deg,' +
          'var(--portal-navy) 0%,' +
          'var(--portal-blue) 100%)',
        paddingTop:  100,
        paddingBottom:48,
        marginBottom: 0,
      }}>
        <div style={{
          maxWidth: 1280,
          margin:   '0 auto',
          padding:  '0 24px',
        }}>
          {/* Breadcrumb */}
          <div style={{
            fontSize:    12,
            color:       'rgba(255,255,255,0.5)',
            marginBottom:16,
            display:     'flex',
            alignItems:  'center',
            gap:         8,
          }}>
            <Link href="/" style={{
              color:          'rgba(255,255,255,0.5)',
              textDecoration: 'none',
            }}>
              Portal
            </Link>
            <span>›</span>
            <span style={{ color: 'white' }}>
              Comparador de provincias
            </span>
          </div>

          {/* Título */}
          <span style={{
            display:    'block',
            width:      48,
            height:     3,
            background: 'var(--portal-gold)',
            borderRadius:2,
            marginBottom:12,
          }} />
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize:   40,
            fontWeight: 700,
            color:      'white',
            margin:     '0 0 12px',
            lineHeight: 1.2,
          }}>
            Comparador de Provincias
          </h1>
          <p style={{
            fontSize:   16,
            color:      'rgba(255,255,255,0.65)',
            margin:     0,
            maxWidth:   560,
          }}>
            Selecciona 2 o 3 provincias del Ecuador
            para comparar su actividad de cooperación
            internacional lado a lado.
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{
        maxWidth: 1280,
        margin:   '0 auto',
        padding:  '48px 24px 80px',
      }}>

        {/* Selector de provincias */}
        <ComparadorSelector
          onComparar={handleComparar}
          onLimpiar={handleLimpiar}
          cargando={cargando}
          hayResultados={resultados.length > 0}
        />

        {/* Error */}
        {error && (
          <div style={{
            marginTop:   24,
            padding:     '16px 20px',
            background:  '#FEF2F2',
            border:      '1px solid #FCA5A5',
            borderRadius:12,
            color:       '#DC2626',
            fontSize:    14,
          }}>
            {error}
          </div>
        )}

        {/* Resultados */}
        {resultados.length > 0 && (
          <ComparadorResultados
            resultados={resultados}
          />
        )}
      </div>

      <PortalFooter />
    </div>
  );
}
