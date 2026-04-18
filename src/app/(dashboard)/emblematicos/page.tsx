"use client";

import { useState } from "react";
import { Button } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconPlus, IconTrophy } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { EmblematicoTable } from "@/components/modulos/emblematicos/EmblematicoTable";
import { EmblematicosFiltros } from "@/components/modulos/emblematicos/EmblematicoFiltros";
import { EmblematicoForm } from "@/components/modulos/emblematicos/EmblematicoForm";
import {
  useEmblematicos,
  useCrearEmblematico,
  useActualizarEmblematico,
  useEliminarEmblematico,
  usePublicarEmblematico,
} from "@/queries/emblematicos.queries";
import { usePermisos } from "@/hooks/usePermisos";
import { useConfirm } from "@/hooks/useConfirm";
import type { ProyectoEmblematico } from "@/services/axios";
import type { EmblematicoFiltros } from "@/types/emblematico.types";

const FILTROS_INICIALES: EmblematicoFiltros = {
  search: "",
  provincia_id: "",
  es_publico: undefined,
  page: 1,
};

export default function EmblematicoPage() {
  const [filtros, setFiltros] = useState<EmblematicoFiltros>(FILTROS_INICIALES);
  const [publicandoId, setPublicandoId] = useState<string | null>(null);

  const { can } = usePermisos();
  const puedeCrear = can("emblematicos.crear");
  const puedeEditar = can("emblematicos.editar");
  const puedeEliminar = can("emblematicos.eliminar");
  const puedePublicar = can("emblematicos.publicar");

  const { data, isLoading, isFetching } = useEmblematicos({
    search: filtros.search,
    provincia_id: filtros.provincia_id,
    es_publico: filtros.es_publico,
    page: filtros.page,
    per_page: 15,
  });

  const { mutateAsync: crearEmblematicoAsync } = useCrearEmblematico();
  const { mutateAsync: actualizarEmblematicoAsync } =
    useActualizarEmblematico();
  const { mutate: eliminarEmblematico, isPending: eliminando } =
    useEliminarEmblematico();
  const { mutate: publicar } = usePublicarEmblematico();

  const tableLoading = isLoading || isFetching || eliminando;
  const { confirmar } = useConfirm();

  const emblematicos = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const abrirModalCrear = () => {
    modals.open({
      title: "Nuevo proyecto emblemático",
      size: "lg",
      children: (
        <EmblematicoForm
          onSubmit={async (datos) => {
            await crearEmblematicoAsync(datos);
            modals.closeAll();
          }}
          onCancel={() => modals.closeAll()}
        />
      ),
    });
  };

  const abrirModalEditar = (e: ProyectoEmblematico) => {
    modals.open({
      title: "Editar proyecto emblemático",
      size: "lg",
      children: (
        <EmblematicoForm
          emblematico={e}
          onSubmit={async (datos) => {
            await actualizarEmblematicoAsync({ id: e.id, datos });
            modals.closeAll();
          }}
          onCancel={() => modals.closeAll()}
        />
      ),
    });
  };

  const confirmarEliminar = (e: ProyectoEmblematico) => {
    confirmar({
      titulo: "Eliminar emblemático",
      mensaje: `¿Eliminar "${e.titulo}"? Esta acción no se puede deshacer.`,
      textoBoton: "Eliminar",
      colorBoton: "red",
      onConfirmar: () => eliminarEmblematico(e.id),
    });
  };

  const handlePublicar = (e: ProyectoEmblematico) => {
    setPublicandoId(e.id);
    publicar(
      { id: e.id, es_publico: !e.es_publico },
      { onSettled: () => setPublicandoId(null) },
    );
  };

  return (
    <>
      <PageHeader
        titulo="Proyectos Emblemáticos"
        descripcion="Iniciativas de alto impacto y reconocimiento internacional de los GAD Provinciales"
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Emblemáticos" },
        ]}
        acciones={
          puedeCrear && (
            <Button
              color="congope"
              leftSection={<IconPlus size={16} />}
              onClick={abrirModalCrear}
            >
              Nuevo emblemático
            </Button>
          )
        }
      />

      <EmblematicosFiltros
        filtros={filtros}
        onChange={setFiltros}
        onLimpiar={() => setFiltros(FILTROS_INICIALES)}
      />

      {!isLoading && emblematicos.length === 0 ? (
        <EmptyState
          icono={<IconTrophy size={36} />}
          titulo="No hay proyectos emblemáticos"
          descripcion={
            filtros.search || filtros.provincia_id
              ? "No se encontraron emblemáticos con los filtros aplicados."
              : "Aún no hay proyectos emblemáticos registrados."
          }
          accion={
            puedeCrear ? (
              <Button
                color="congope"
                leftSection={<IconPlus size={16} />}
                onClick={abrirModalCrear}
              >
                Crear primer emblemático
              </Button>
            ) : undefined
          }
        />
      ) : (
        <EmblematicoTable
          emblematicos={emblematicos}
          total={total}
          page={filtros.page ?? 1}
          perPage={15}
          isLoading={tableLoading}
          onPageChange={(p) => setFiltros((prev) => ({ ...prev, page: p }))}
          onEditar={abrirModalEditar}
          onEliminar={confirmarEliminar}
          onPublicar={handlePublicar}
          puedeEditar={puedeEditar}
          puedeEliminar={puedeEliminar}
          puedePublicar={puedePublicar}
          publicandoId={publicandoId}
        />
      )}
    </>
  );
}
