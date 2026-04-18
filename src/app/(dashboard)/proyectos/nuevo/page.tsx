"use client";

import { useRouter } from "next/navigation";
import { Paper } from "@mantine/core";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { ProyectoForm } from "@/components/modulos/proyectos/ProyectoForm";
import { useCrearProyecto } from "@/queries/proyectos.queries";

export default function NuevoProyectoPage() {
  const router = useRouter();
  const { mutate: crearProyecto, isPending } = useCrearProyecto();

  return (
    <>
      <PageHeader
        titulo="Nuevo proyecto"
        descripcion="Registra un nuevo proyecto de cooperación internacional"
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Proyectos", href: "/proyectos" },
          { label: "Nuevo" },
        ]}
      />
      <Paper
        p="xl"
        radius="lg"
        style={{
          border: "1px solid var(--mantine-color-gray-3)",
        }}
      >
        <ProyectoForm
          onSubmit={(datos) =>
            crearProyecto(datos, {
              onSuccess: (proyecto) => router.push(`/proyectos/${proyecto.id}`),
            })
          }
          onCancel={() => router.push("/proyectos")}
          isLoading={isPending}
        />
      </Paper>
    </>
  );
}
