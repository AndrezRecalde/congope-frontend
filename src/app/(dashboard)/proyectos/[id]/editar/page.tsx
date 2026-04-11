'use client'

import { use }          from 'react';
import { useRouter }    from 'next/navigation';
import { Paper, Skeleton, Stack } from '@mantine/core';
import { PageHeader }   from
  '@/components/ui/PageHeader/PageHeader';
import { ProyectoForm } from
  '@/components/modulos/proyectos/ProyectoForm';
import {
  useProyecto,
  useActualizarProyecto,
} from '@/queries/proyectos.queries';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditarProyectoPage(props: PageProps) {
  const { id } = use(props.params);
  const router  = useRouter();

  const { data: proyecto, isLoading } = useProyecto(id);
  const { mutate: actualizarProyecto, isPending } =
    useActualizarProyecto();

  if (isLoading) {
    return (
      <>
        <PageHeader
          titulo="Cargando proyecto..."
          breadcrumbs={[
            { label: 'Inicio',     href: '/dashboard' },
            { label: 'Proyectos', href: '/proyectos' },
            { label: 'Editar' },
          ]}
        />
        <Paper p="xl" radius="lg">
          <Stack gap="md">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={44} radius="md" />
            ))}
          </Stack>
        </Paper>
      </>
    );
  }

  if (!proyecto) return null;

  return (
    <>
      <PageHeader
        titulo={`Editar: ${proyecto.nombre}`}
        breadcrumbs={[
          { label: 'Inicio',           href: '/dashboard' },
          { label: 'Proyectos',       href: '/proyectos' },
          { label: proyecto.nombre,   href: `/proyectos/${id}` },
          { label: 'Editar' },
        ]}
      />
      <Paper
        p="xl"
        radius="lg"
        style={{
          border: '1px solid var(--mantine-color-gray-3)',
        }}
      >
        <ProyectoForm
          proyecto={proyecto}
          onSubmit={(datos) =>
            actualizarProyecto(
              { id, datos },
              {
                onSuccess: () =>
                  router.push(`/proyectos/${id}`),
              }
            )
          }
          onCancel={() => router.push(`/proyectos/${id}`)}
          isLoading={isPending}
        />
      </Paper>
    </>
  );
}
