"use client";

import { useState } from "react";
import {
  SimpleGrid,
  Button,
  Skeleton,
  Stack,
  Pagination,
  Center,
  Group,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconStar } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { PracticaCard } from "@/components/modulos/practicas/PracticaCard";
import { PracticasFiltros } from "@/components/modulos/practicas/PracticasFiltros";
import { PracticaForm } from "@/components/modulos/practicas/PracticaForm";
import { ValoracionModal } from "@/components/modulos/practicas/ValoracionModal";
import {
  usePracticas,
  useCrearPractica,
  useActualizarPractica,
  useEliminarPractica,
  useDestacarPractica,
} from "@/queries/practicas.queries";
import { usePermisos } from "@/hooks/usePermisos";
import { useConfirm } from "@/hooks/useConfirm";
import type { BuenaPractica } from "@/services/axios";
import type { PracticaFiltros } from "@/types/practica.types";
import { practicasService } from "@/services/practicas.service";

const FILTROS_INICIALES: PracticaFiltros = {
  search: "",
  provincia_id: "",
  replicabilidad: "",
  es_destacada: undefined,
  page: 1,
};

export default function BuenasPracticasPage() {
  const [filtros, setFiltros] = useState<PracticaFiltros>(FILTROS_INICIALES);
  const [destacandoId, setDestacandoId] = useState<string | null>(null);

  const { can } = usePermisos();
  const puedeCrear = can("practicas.crear");
  const puedeEditar = can("practicas.editar");
  const puedeEliminar = can("practicas.eliminar");
  const puedeDestacar = can("practicas.destacar");
  const puedeValorar = can("practicas.valorar");
  const puedeExportar = can("practicas.exportar");

  const { data, isLoading } = usePracticas({
    search: filtros.search,
    provincia_id: filtros.provincia_id,
    replicabilidad: filtros.replicabilidad,
    es_destacada: filtros.es_destacada,
    page: filtros.page,
    per_page: 12, // 3 columnas × 4 filas
  });

  const { mutateAsync: crearPracticaAsync } = useCrearPractica();
  const { mutateAsync: actualizarPracticaAsync } = useActualizarPractica();
  const { mutate: eliminarPractica } = useEliminarPractica();
  const { mutate: destacar } = useDestacarPractica();
  const { confirmar } = useConfirm();

  const practicas = data?.data ?? [];
  const lastPage = data?.meta?.last_page ?? 1;

  // ── Abrir modal CREAR ──────────────────────────────────
  const abrirModalCrear = () => {
    modals.open({
      title: "Nueva buena práctica",
      size: "xl",
      children: (
        <PracticaForm
          onSubmit={async (datos) => {
            await crearPracticaAsync(datos);
            modals.closeAll();
          }}
          onCancel={() => modals.closeAll()}
        />
      ),
    });
  };

  // ── Abrir modal EDITAR ─────────────────────────────────
  const abrirModalEditar = (practica: BuenaPractica) => {
    modals.open({
      title: "Editar buena práctica",
      size: "xl",
      children: (
        <PracticaForm
          practica={practica}
          onSubmit={async (datos) => {
            await actualizarPracticaAsync({ id: practica.id, datos });
            modals.closeAll();
          }}
          onCancel={() => modals.closeAll()}
        />
      ),
    });
  };

  // ── Confirmar ELIMINAR ─────────────────────────────────
  const confirmarEliminar = (practica: BuenaPractica) => {
    confirmar({
      titulo: "Eliminar práctica",
      mensaje: `¿Eliminar "${practica.titulo}"? Esta acción no se puede deshacer.`,
      textoBoton: "Eliminar",
      colorBoton: "red",
      onConfirmar: () => eliminarPractica(practica.id),
    });
  };

  // ── Destacar / desdestacar ─────────────────────────────
  const handleDestacar = (practica: BuenaPractica) => {
    setDestacandoId(practica.id);
    const isDestacada =
      practica.es_destacada === true ||
      String(practica.es_destacada) === "1" ||
      String(practica.es_destacada).toLowerCase() === "true";
    destacar(
      { id: practica.id, es_destacada: !isDestacada },
      {
        onSettled: () => setDestacandoId(null),
      },
    );
  };

  // ── Abrir modal VALORAR ────────────────────────────────
  const abrirModalValorar = (practica: BuenaPractica) => {
    modals.open({
      title: `Valorar: ${practica.titulo}`,
      size: "md",
      children: (
        <ValoracionModal
          practica={practica}
          onCerrar={() => modals.closeAll()}
        />
      ),
    });
  };

  // ── Exportar ───────────────────────────────────────────
  // NOTA: El OpenAPI documenta 500 para este endpoint.
  // Manejar con try/catch y notificación informativa.
  const handleExportar = async () => {
    try {
      await practicasService.exportar();
    } catch {
      notifications.show({
        title: "Exportación no disponible",
        message:
          "El módulo de exportación de buenas " +
          "prácticas está temporalmente en mantenimiento.",
        color: "orange",
        autoClose: 5000,
      });
    }
  };

  return (
    <>
      <PageHeader
        titulo="Buenas Prácticas"
        descripcion="Iniciativas y experiencias exitosas de los GAD Provinciales del Ecuador"
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Buenas Prácticas" },
        ]}
        acciones={
          <Group gap="sm">
            {puedeExportar && (
              <Button
                variant="outline"
                color="congope"
                size="sm"
                onClick={handleExportar}
              >
                Exportar
              </Button>
            )}
            {puedeCrear && (
              <Button
                color="congope"
                leftSection={<IconPlus size={16} />}
                onClick={abrirModalCrear}
              >
                Nueva práctica
              </Button>
            )}
          </Group>
        }
      />

      {/* Filtros */}
      <PracticasFiltros
        filtros={filtros}
        onChange={setFiltros}
        onLimpiar={() => setFiltros(FILTROS_INICIALES)}
      />

      {/* Grid de tarjetas — skeleton */}
      {isLoading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={280} radius="lg" />
          ))}
        </SimpleGrid>
      ) : practicas.length === 0 ? (
        <EmptyState
          icono={<IconStar size={36} />}
          titulo="No hay buenas prácticas registradas"
          descripcion={
            filtros.search ||
            filtros.provincia_id ||
            filtros.replicabilidad ||
            filtros.es_destacada
              ? "No se encontraron prácticas con los filtros aplicados."
              : "Aún no hay buenas prácticas registradas en el sistema."
          }
          accion={
            puedeCrear ? (
              <Button
                color="congope"
                leftSection={<IconPlus size={16} />}
                onClick={abrirModalCrear}
              >
                Registrar primera práctica
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {practicas.map((practica) => (
              <PracticaCard
                key={practica.id}
                practica={practica}
                onEditar={abrirModalEditar}
                onEliminar={confirmarEliminar}
                onDestacar={handleDestacar}
                onValorar={abrirModalValorar}
                puedeEditar={puedeEditar}
                puedeEliminar={puedeEliminar}
                puedeDestacar={puedeDestacar}
                puedeValorar={puedeValorar}
                destacandoId={destacandoId}
              />
            ))}
          </SimpleGrid>

          {/* Paginación */}
          {lastPage > 1 && (
            <Center mt="md">
              <Pagination
                value={filtros.page ?? 1}
                onChange={(p) => setFiltros((prev) => ({ ...prev, page: p }))}
                total={lastPage}
                color="congope"
                radius="md"
              />
            </Center>
          )}
        </Stack>
      )}
    </>
  );
}
