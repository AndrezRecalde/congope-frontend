import Link from 'next/link';

export function PortalFooter() {
  return (
    <footer style={{
      background:  'var(--portal-navy)',
      padding:     '48px 0 32px',
      borderTop:   '3px solid var(--portal-gold)',
    }}>
      <div style={{
        maxWidth:        1280,
        margin:          '0 auto',
        padding:         '0 24px',
        display:         'grid',
        gridTemplateColumns:'1fr auto',
        gap:             48,
        alignItems:      'start',
      }}>
        {/* Identidad */}
        <div>
          <div style={{
            fontFamily:    'var(--font-playfair)',
            fontSize:      22,
            fontWeight:    700,
            color:         'white',
            marginBottom:  4,
          }}>
            CONGOPE
          </div>
          <div style={{
            fontSize:      12,
            color:         'rgba(255,255,255,0.5)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom:  16,
          }}>
            Consorcio de Gobiernos Autónomos<br />
            Descentralizados Provinciales del Ecuador
          </div>
          <p style={{
            fontSize:   13,
            color:      'rgba(255,255,255,0.4)',
            lineHeight: 1.6,
            margin:     0,
            maxWidth:   380,
          }}>
            Plataforma de transparencia y cooperación
            internacional para los 23 GAD Provinciales
            del Ecuador.
          </p>
        </div>

        {/* Links */}
        <div style={{
          fontSize:   12,
          color:      'rgba(255,255,255,0.4)',
          textAlign:  'right',
        }}>
          <div style={{
            marginBottom:4,
            color:'rgba(201,168,76,0.7)',
            fontWeight:600,
          }}>
            Ecuador, {new Date().getFullYear()}
          </div>
          <div>
            Plataforma de Cooperación Internacional
          </div>
        </div>
      </div>

      {/* Línea base */}
      <div style={{
        maxWidth:     1280,
        margin:       '32px auto 0',
        padding:      '16px 24px 0',
        borderTop:    '1px solid rgba(255,255,255,0.08)',
        display:      'flex',
        justifyContent:'space-between',
        alignItems:   'center',
      }}>
        <span style={{
          fontSize: 11,
          color:    'rgba(255,255,255,0.3)',
        }}>
          © {new Date().getFullYear()} CONGOPE.
          Todos los derechos reservados.
        </span>
        <Link
          href="/dashboard"
          style={{
            fontSize:      11,
            color:         'rgba(201,168,76,0.6)',
            textDecoration:'none',
          }}
        >
          Acceso institucional →
        </Link>
      </div>
    </footer>
  );
}
