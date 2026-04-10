import { NextRequest, NextResponse } from 'next/server';

// Rutas accesibles sin autenticación
const RUTAS_PUBLICAS = ['/', '/emblematicos', '/mapa'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas del portal público → pasar siempre
  const esPublica = RUTAS_PUBLICAS.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );
  if (esPublica || pathname === '/login') {
    return NextResponse.next();
  }

  // Rutas del dashboard sin cookie → redirigir a login
  // La verificación real del token JWT ocurre en
  // src/app/(dashboard)/layout.tsx con Server Layout Guard
  const token = request.cookies.get('congope_token');
  if (!token && pathname.startsWith('/dashboard')) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Excluir archivos estáticos y rutas de Next.js internos
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)',
  ],
};
