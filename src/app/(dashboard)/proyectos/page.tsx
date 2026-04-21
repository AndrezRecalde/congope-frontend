"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, SegmentedControl, Group, Center } from "@mantine/core";
import {
  IconPlus,
  IconLayoutKanban,
  IconTable,
  IconFolderOpen,
} from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { ExportMenu } from "@/components/ui/ExportMenu/ExportMenu";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { ProyectosTable } from "@/components/modulos/proyectos/ProyectosTable";
import { KanbanBoard } from "@/components/modulos/proyectos/kanban/KanbanBoard";
import { ProyectosFiltros } from "@/components/modulos/proyectos/ProyectosFiltros";
import {
  useProyectos,
  useEliminarProyecto,
  useCambiarEstadoProyecto,
} from "@/queries/proyectos.queries";
import { proyectosService } from "@/services/proyectos.service";
import { usePermisos } from "@/hooks/usePermisos";
import { useConfirm } from "@/hooks/useConfirm";
import type { Proyecto } from "@/services/axios";
import type { ProyectoFiltros, EstadoProyecto } from "@/types/proyecto.types";

const FILTROS_INICIALES: ProyectoFiltros = {
  search: "",
  estado: "",
  actor_id: "",
  provincia_id: "",
  page: 1,
};

// Opciones para cambiar estado rápidamente desde el modal
const OPCIONES_ESTADO_CAMBIO = [
  { value: "En gestión", label: "En gestión" },
  { value: "En ejecución", label: "En ejecución" },
  { value: "Finalizado", label: "Finalizado" },
  { value: "Suspendido", label: "Suspendido" },
] as const;

export default function ProyectosPage() {
  const router = useRouter();
  const [filtros, setFiltros] = useState<ProyectoFiltros>(FILTROS_INICIALES);
  const [vista, setVista] = useState<"tabla" | "kanban">("tabla");
  const [exportando, setExportando] = useState(false);

  const { can } = usePermisos();
  const puedeCrear = can("proyectos.crear");
  const puedeEditar = can("proyectos.editar");
  const puedeEliminar = can("proyectos.eliminar");
  const puedeExportar = can("proyectos.exportar");
  const puedeCambiarEstado = can("proyectos.cambiar_estado");

  const { data, isLoading } = useProyectos({
    search: filtros.search,
    estado: filtros.estado,
    actor_id: filtros.actor_id,
    provincia_id: filtros.provincia_id,
    page: filtros.page,
    per_page: 15,
  });
  const { mutate: eliminarProyecto, isPending: eliminando } =
    useEliminarProyecto();
  const { mutate: cambiarEstado, isPending: cambiandoEstado } =
    useCambiarEstadoProyecto();
  const { confirmar } = useConfirm();

  const proyectos = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  // Abrir modal para cambiar estado
  const abrirModalCambioEstado = (proyecto: Proyecto) => {
    modals.open({
      title: "Cambiar estado del proyecto",
      size: "sm",
      children: (
        <Group gap="xs" wrap="wrap">
          {OPCIONES_ESTADO_CAMBIO.filter(
            (op) => op.value !== proyecto.estado,
          ).map((op) => (
            <Button
              key={op.value}
              variant="light"
              size="sm"
              onClick={() => {
                cambiarEstado({
                  id: proyecto.id,
                  estado: op.value as EstadoProyecto,
                });
                modals.closeAll();
              }}
            >
              → {op.label}
            </Button>
          ))}
        </Group>
      ),
    });
  };

  const confirmarEliminar = (proyecto: Proyecto) => {
    confirmar({
      titulo: "Eliminar proyecto",
      mensaje: `¿Eliminar "${proyecto.nombre}"? Esta acción no se puede deshacer.`,
      textoBoton: "Eliminar proyecto",
      colorBoton: "red",
      onConfirmar: () => eliminarProyecto(proyecto.id),
    });
  };

  const handleExportar = async (_formato: "pdf" | "excel" | "csv") => {
    setExportando(true);
    console.log({ _formato });
    try {
      await proyectosService.exportar({
        search: filtros.search,
        estado: filtros.estado,
        actor_id: filtros.actor_id,
        format: _formato,
      });
    } finally {
      setExportando(false);
    }
  };

  return (
    <>
      <PageHeader
        titulo="Proyectos de Cooperación"
        descripcion="Gestión de proyectos de cooperación internacional y nacional de los GAD Provinciales"
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Proyectos" },
        ]}
        acciones={
          <Group gap="sm">
            {/* Toggle vista tabla / kanban */}
            <SegmentedControl
              value={vista}
              onChange={(v) => setVista(v as "tabla" | "kanban")}
              size="sm"
              data={[
                {
                  value: "tabla",
                  label: (
                    <Center style={{ gap: 10 }}>
                      <IconTable size={14} />
                      Tabla
                    </Center>
                  ),
                },
                {
                  value: "kanban",
                  label: (
                    <Center style={{ gap: 10 }}>
                      <IconLayoutKanban size={14} />
                      Kanban
                    </Center>
                  ),
                },
              ]}
            />
            {puedeExportar && (
              <ExportMenu onExportar={handleExportar} loading={exportando} />
            )}
            {puedeCrear && (
              <Button
                color="congope"
                leftSection={<IconPlus size={16} />}
                onClick={() => router.push("/proyectos/nuevo")}
              >
                Nuevo proyecto
              </Button>
            )}
          </Group>
        }
      />

      {/* Filtros — solo en vista tabla */}
      {vista === "tabla" && (
        <ProyectosFiltros
          filtros={filtros}
          onChange={setFiltros}
          onLimpiar={() => setFiltros(FILTROS_INICIALES)}
        />
      )}

      {/* Contenido según vista */}
      {!isLoading && proyectos.length === 0 ? (
        <EmptyState
          icono={<IconFolderOpen size={36} />}
          titulo="No hay proyectos registrados"
          descripcion={
            filtros.search || filtros.estado
              ? "No se encontraron proyectos con los filtros aplicados."
              : "Aún no hay proyectos registrados en el sistema."
          }
          accion={
            puedeCrear ? (
              <Button
                color="congope"
                leftSection={<IconPlus size={16} />}
                onClick={() => router.push("/proyectos/nuevo")}
              >
                Crear primer proyecto
              </Button>
            ) : undefined
          }
        />
      ) : vista === "tabla" ? (
        <ProyectosTable
          proyectos={proyectos}
          total={total}
          page={filtros.page ?? 1}
          perPage={15}
          isLoading={isLoading || eliminando || cambiandoEstado}
          onPageChange={(p) => setFiltros((prev) => ({ ...prev, page: p }))}
          onEditar={(p) => router.push(`/proyectos/${p.id}/editar`)}
          onEliminar={confirmarEliminar}
          onCambiarEstado={abrirModalCambioEstado}
          puedeEditar={puedeEditar}
          puedeEliminar={puedeEliminar}
          puedeCambiarEstado={puedeCambiarEstado}
        />
      ) : (
        <KanbanBoard
          filtrosGlobales={{
            actor_id: filtros.actor_id,
          }}
          onEditarProyecto={(proyecto) =>
            router.push(`/proyectos/${proyecto.id}/editar`)
          }
          puedeEditar={puedeEditar}
          puedeCambiarEstado={puedeCambiarEstado}
          onCambiarEstado={(id, estado) => cambiarEstado({ id, estado })}
        />
      )}
    </>
  );
}
