'use client'

import { PageHeader }
  from '@/components/ui/PageHeader/PageHeader';
import { GrafoRedCooperacion }
  from '@/components/modulos/analisis/GrafoRedCooperacion';

export default function RedCooperacionPage() {
  return (
    <>
      <PageHeader
        titulo="Red de Cooperación"
        descripcion="Visualización de relaciones entre actores cooperantes y provincias del Ecuador"
        breadcrumbs={[
          { label: 'Inicio',   href: '/dashboard' },
          { label: 'Análisis', href: '/analisis/red' },
          { label: 'Red de Cooperación' },
        ]}
      />
      <GrafoRedCooperacion />
    </>
  );
}
