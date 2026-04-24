'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Center, Loader, Alert, Text } from '@mantine/core';
import { IconShieldLock } from '@tabler/icons-react';
import { useAppSelector } from '@/store/hooks';
import { selectIsLoading } from '@/store/slices/authSlice';
import { usePermisos } from '@/hooks/usePermisos';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { GrafoRedCooperacion } from '@/components/modulos/analisis/GrafoRedCooperacion';

export default function RedCooperacionPage() {
  const { can } = usePermisos();
  const cargando = useAppSelector(selectIsLoading);
  const router   = useRouter();

  // Redirigir si no tiene permiso una vez que la sesión está lista
  useEffect(() => {
    if (!cargando && !can('analisis.ver')) {
      router.replace('/dashboard');
    }
  }, [cargando, can, router]);

  // Mientras verifica permisos
  if (cargando) {
    return (
      <Center h={400}>
        <Loader size="sm" />
      </Center>
    );
  }

  // Sin permiso — mostrar mensaje breve antes de redirigir
  if (!can('analisis.ver')) {
    return (
      <Center h={400}>
        <Alert
          icon={<IconShieldLock size={16} />}
          color="red"
          title="Sin acceso"
          maw={360}
        >
          <Text size="sm">
            No tienes permiso para acceder al análisis de red de cooperación.
          </Text>
        </Alert>
      </Center>
    );
  }

  return (
    <>
      <PageHeader
        titulo="Red de Cooperación"
        descripcion="Visualización de relaciones entre actores cooperantes y provincias del Ecuador"
        breadcrumbs={[
          { label: 'Inicio',    href: '/dashboard' },
          { label: 'Análisis',  href: '/analisis/red' },
          { label: 'Red de Cooperación' },
        ]}
      />
      <GrafoRedCooperacion />
    </>
  );
}
