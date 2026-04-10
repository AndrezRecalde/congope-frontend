import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // React Compiler: desactivado intencionalmente.
  // El stack incluye librerías (mantine-datatable, echarts-for-react,
  // react-map-gl) que pueden tener fricciones con el compilador.
  // Activar en v2.0 tras entrega y pruebas completas.
  reactCompiler: false,

  experimental: {
    // Optimiza tree-shaking de paquetes grandes
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/dates',
      '@mantine/notifications',
      '@tabler/icons-react',
      'echarts',
    ],
  },

  // images.domains está eliminado en Next.js 16
  // Usar remotePatterns obligatoriamente
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'congope.test',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
    ],
  },

  // Logging mejorado de Next.js 16 para desarrollo
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

export default nextConfig;
