"use client";

import { useState } from "react";
import { Button } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconPlus, IconNetwork } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { RedesTable } from "@/components/modulos/redes/RedesTable";
import { RedesFiltros } from "@/components/modulos/redes/RedesFiltros";
import { RedForm } from "@/components/modulos/redes/RedForm";
import {
  useRedes,
  useCrearRed,
  useActualizarRed,
  useEliminarRed,
} from "@/queries/redes.queries";
import { usePermisos } from "@/hooks/usePermisos";
import { useConfirm } from "@/hooks/useConfirm";
import type { Red } from "@/services/axios";
import type { RedFiltros } from "@/types/red.types";

const FILTROS_INICIALES: RedFiltros = {
  search: "",
  tipo: "",
  rol_congope: "",
  page: 1,
};

function CrearRedModal() {
  const { mutate: crearRed, isPending: creando } = useCrearRed();

  return (
    <RedForm
      onSubmit={(datos) =>
        crearRed(datos, {
          onSuccess: () => modals.closeAll(),
        })
      }
      onCancel={() => modals.closeAll()}
      isLoading={creando}
    />
  );
}

function EditarRedModal({ red }: { red: Red }) {
  const { mutate: actualizarRed, isPending: actualizando } = useActualizarRed();

  return (
    <RedForm
      red={red}
      onSubmit={(datos) =>
        actualizarRed(
          { id: red.id, datos },
          { onSuccess: () => modals.closeAll() },
        )
      }
      onCancel={() => modals.closeAll()}
      isLoading={actualizando}
    />
  );
}

export default function RedesPage() {
  const [filtros, setFiltros] = useState<RedFiltros>(FILTROS_INICIALES);

  const { can } = usePermisos();
  const puedeCrear = can("redes.crear");
  const puedeEditar = can("redes.editar");
  const puedeEliminar = can("redes.eliminar");

  const { data, isLoading, isFetching } = useRedes({
    search: filtros.search,
    tipo: filtros.tipo,
    rol_congope: filtros.rol_congope,
    page: filtros.page,
    per_page: 15,
  });

  const { mutate: eliminarRed, isPending: eliminando } = useEliminarRed();
  const { confirmar } = useConfirm();

  const redes = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const abrirModalCrear = () => {
    modals.open({
      title: "Nueva red de articulación",
      size: "lg",
      children: <CrearRedModal />,
    });
  };

  const abrirModalEditar = (red: Red) => {
    modals.open({
      title: "Editar red de articulación",
      size: "lg",
      children: <EditarRedModal red={red} />,
    });
  };

  const confirmarEliminar = (red: Red) => {
    confirmar({
      titulo: "Eliminar red",
      mensaje: `¿Eliminar "${red.nombre}"? Esta acción no se puede deshacer.`,
      textoBoton: "Eliminar red",
      colorBoton: "red",
      onConfirmar: () => eliminarRed(red.id),
    });
  };

  return (
    <>
      <PageHeader
        titulo="Redes y Articulación"
        descripcion="Redes de cooperación internacional y articulación institucional del CONGOPE"
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Redes" },
        ]}
        acciones={
          puedeCrear && (
            <Button
              color="congope"
              leftSection={<IconPlus size={16} />}
              onClick={abrirModalCrear}
            >
              Nueva red
            </Button>
          )
        }
      />

      <RedesFiltros
        filtros={filtros}
        onChange={setFiltros}
        onLimpiar={() => setFiltros(FILTROS_INICIALES)}
      />

      {!isLoading && redes.length === 0 ? (
        <EmptyState
          icono={<IconNetwork size={36} />}
          titulo="No hay redes registradas"
          descripcion={
            filtros.search || filtros.tipo || filtros.rol_congope
              ? "No se encontraron redes con los filtros aplicados."
              : "Aún no hay redes de articulación registradas."
          }
          accion={
            puedeCrear ? (
              <Button
                color="congope"
                leftSection={<IconPlus size={16} />}
                onClick={abrirModalCrear}
              >
                Crear primera red
              </Button>
            ) : undefined
          }
        />
      ) : (
        <RedesTable
          redes={redes}
          total={total}
          page={filtros.page ?? 1}
          perPage={15}
          isLoading={isLoading || isFetching || eliminando}
          onPageChange={(p) => setFiltros((prev) => ({ ...prev, page: p }))}
          onEditar={abrirModalEditar}
          onEliminar={confirmarEliminar}
          puedeEditar={puedeEditar}
          puedeEliminar={puedeEliminar}
        />
      )}
    </>
  );
}
