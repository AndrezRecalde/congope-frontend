"use client";

import { useState } from "react";
import { modals } from "@mantine/modals";
import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { ExportMenu } from "@/components/ui/ExportMenu/ExportMenu";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { ActoresTable } from "@/components/modulos/actores/ActoresTable";
import { ActoresFiltros } from "@/components/modulos/actores/ActoresFiltros";
import { ActorForm } from "@/components/modulos/actores/ActorForm";
import {
  useActores,
  useCrearActor,
  useActualizarActor,
  useEliminarActor,
} from "@/queries/actores.queries";
import { actoresService } from "@/services/actores.service";
import { usePermisos } from "@/hooks/usePermisos";
import { useConfirm } from "@/hooks/useConfirm";
import type { ActorCooperacion } from "@/services/axios";
import type { ActorFiltros } from "@/types/actor.types";
import { IconBuildingBank } from "@tabler/icons-react";

const FILTROS_INICIALES: ActorFiltros = {
  search: "",
  tipo: "",
  estado: "",
  page: 1,
};

function CrearActorModal() {
  const { mutate: crearActor, isPending: creando } = useCrearActor();

  return (
    <ActorForm
      onSubmit={(datos) =>
        crearActor(datos, {
          onSuccess: () => modals.closeAll(),
        })
      }
      onCancel={() => modals.closeAll()}
      isLoading={creando}
    />
  );
}

function EditarActorModal({ actor }: { actor: ActorCooperacion }) {
  const { mutate: actualizarActor, isPending: actualizando } =
    useActualizarActor();

  return (
    <ActorForm
      actor={actor}
      onSubmit={(datos) =>
        actualizarActor(
          { id: actor.id, datos },
          { onSuccess: () => modals.closeAll() },
        )
      }
      onCancel={() => modals.closeAll()}
      isLoading={actualizando}
    />
  );
}

export default function ActoresPage() {
  const [filtros, setFiltros] = useState<ActorFiltros>(FILTROS_INICIALES);
  const [exportando, setExportando] = useState(false);

  // Permisos del usuario actual
  const { can } = usePermisos();
  const puedeCrear = can("actores.crear");
  const puedeEditar = can("actores.editar");
  const puedeEliminar = can("actores.eliminar");
  const puedeExportar = can("actores.exportar");

  // Data y mutaciones
  const { data, isLoading, isFetching } = useActores({
    search: filtros.search,
    tipo: filtros.tipo,
    estado: filtros.estado,
    page: filtros.page,
    per_page: 15,
  });
  const { mutate: eliminarActor, isPending: eliminando } = useEliminarActor();
  const { confirmar } = useConfirm();

  // ── Abrir modal CREAR ──────────────────────────────────
  const abrirModalCrear = () => {
    modals.open({
      title: "Nuevo actor de cooperación",
      size: "lg",
      children: <CrearActorModal />,
    });
  };

  // ── Abrir modal EDITAR ─────────────────────────────────
  const abrirModalEditar = (actor: ActorCooperacion) => {
    modals.open({
      title: "Editar actor de cooperación",
      size: "lg",
      children: <EditarActorModal actor={actor} />,
    });
  };

  // ── Confirmar ELIMINAR ─────────────────────────────────
  const confirmarEliminar = (actor: ActorCooperacion) => {
    confirmar({
      titulo: "Eliminar actor",
      mensaje: `¿Estás seguro de que deseas eliminar "${actor.nombre}"? Esta acción no se puede deshacer.`,
      textoBoton: "Eliminar actor",
      colorBoton: "red",
      onConfirmar: () => eliminarActor(actor.id),
    });
  };

  // ── Exportar ───────────────────────────────────────────
  const handleExportar = async (_formato: "pdf" | "excel" | "csv") => {
    setExportando(true);
    try {
      await actoresService.exportar({
        search: filtros.search,
        tipo: filtros.tipo,
        estado: filtros.estado,
      });
    } finally {
      setExportando(false);
    }
  };

  const actores = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  // const lastPage = data?.meta?.last_page ?? 1;

  return (
    <>
      <PageHeader
        titulo="Actores de Cooperación"
        descripcion="Organizaciones e instituciones que participan en la cooperación internacional con los GAD Provinciales"
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Actores" },
        ]}
        acciones={
          <>
            {puedeExportar && (
              <ExportMenu onExportar={handleExportar} loading={exportando} />
            )}
            {puedeCrear && (
              <Button
                color="congope"
                leftSection={<IconPlus size={16} />}
                onClick={abrirModalCrear}
              >
                Nuevo actor
              </Button>
            )}
          </>
        }
      />

      {/* Filtros */}
      <ActoresFiltros
        filtros={filtros}
        onChange={setFiltros}
        onLimpiar={() => setFiltros(FILTROS_INICIALES)}
      />

      {/* Tabla o estado vacío */}
      {!isLoading && actores.length === 0 ? (
        <EmptyState
          icono={<IconBuildingBank size={36} />}
          titulo="No hay actores registrados"
          descripcion={
            filtros.search || filtros.tipo || filtros.estado
              ? "No se encontraron actores con los filtros aplicados. Intenta con otros criterios."
              : "Aún no hay actores de cooperación registrados en el sistema. Crea el primero."
          }
          accion={
            puedeCrear ? (
              <Button
                color="congope"
                leftSection={<IconPlus size={16} />}
                onClick={abrirModalCrear}
              >
                Crear primer actor
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ActoresTable
          actores={actores}
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
