'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function PortalHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll,
      { passive: true });
    return () =>
      window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`portal-header ${scrolled ? 'scrolled' : ''}`}
    >
      <div style={{
        maxWidth:   1280,
        margin:     '0 auto',
        padding:    '0 24px',
        height:     70,
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo e identidad */}
        <div style={{ display: 'flex',
          alignItems: 'center', gap: 12 }}>
          {/* Escudo institucional CONGOPE */}
          <div style={{
            width:        40,
            height:       40,
            background:
              'linear-gradient(135deg, ' +
              'var(--portal-gold) 0%, ' +
              'var(--portal-gold-lt) 100%)',
            borderRadius: 8,
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            fontSize:     18,
            fontWeight:   700,
            color:        'var(--portal-navy)',
            fontFamily:   'var(--font-playfair)',
            boxShadow:    '0 2px 8px rgba(201,168,76,0.4)',
          }}>
            C
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-playfair)',
              fontSize:   17,
              fontWeight: 700,
              color:      'white',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
            }}>
              CONGOPE
            </div>
            <div style={{
              fontSize:      10,
              color:         'rgba(255,255,255,0.6)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop:     1,
            }}>
              Cooperación Internacional
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav style={{ display: 'flex',
          alignItems: 'center', gap: 8 }}>
          {[
            { href: '#mapa',        label: 'Mapa' },
            { href: '#estadisticas',label: 'Estadísticas' },
            { href: '#emblematicos',label: 'Emblemáticos' },
            { href: '#practicas',   label: 'Buenas Prácticas' },
            { href: '/comparar',    label: 'Comparar', esLink: true },
          ].map((item) => {
            const estiloNav = {
              color:         'rgba(255,255,255,0.8)',
              textDecoration:'none',
              fontSize:      13,
              fontWeight:    500,
              padding:       '6px 14px',
              borderRadius:  100,
              transition:    'all 200ms ease',
              letterSpacing: '0.02em',
            };
            const hoverProps = {
              onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
                (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                (e.target as HTMLElement).style.color = 'white';
              },
              onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
                (e.target as HTMLElement).style.background = 'transparent';
                (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.8)';
              }
            };
            
            return item.esLink ? (
              <Link
                key={item.href}
                href={item.href}
                style={estiloNav}
                {...hoverProps}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                style={estiloNav}
                {...hoverProps}
              >
                {item.label}
              </a>
            );
          })}
          {/* Acceso al dashboard */}
          <Link
            href="/dashboard"
            style={{
              background:    'var(--portal-gold)',
              color:         'var(--portal-navy)',
              textDecoration:'none',
              fontSize:      13,
              fontWeight:    700,
              padding:       '8px 18px',
              borderRadius:  100,
              marginLeft:    8,
              letterSpacing: '0.02em',
              transition:    'all 200ms ease',
            }}
          >
            Acceder →
          </Link>
        </nav>
      </div>
    </header>
  );
}
