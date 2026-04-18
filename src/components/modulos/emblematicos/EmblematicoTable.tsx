"use client";

import { DataTable } from "mantine-datatable";
import {
  Group,
  Text,
  Badge,
  Stack,
  ActionIcon,
  Tooltip,
  Anchor,
  Switch,
} from "@mantine/core";
import { IconEye, IconEdit, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { formatFecha } from "@/utils/formatters";
import type { ProyectoEmblematico } from "@/services/axios";

interface EmblematicoTableProps {
  emblematicos: ProyectoEmblematico[];
  total: number;
  page: number;
  perPage: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onEditar: (e: ProyectoEmblematico) => void;
  onEliminar: (e: ProyectoEmblematico) => void;
  onPublicar: (e: ProyectoEmblematico) => void;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  puedePublicar: boolean;
  publicandoId?: string | null;
}

export function EmblematicoTable({
  emblematicos,
  total,
  page,
  perPage,
  isLoading,
  onPageChange,
  onEditar,
  onEliminar,
  onPublicar,
  puedeEditar,
  puedeEliminar,
  puedePublicar,
  publicandoId,
}: EmblematicoTableProps) {
  return (
    <DataTable
      records={emblematicos}
      fetching={isLoading}
      totalRecords={total}
      recordsPerPage={perPage}
      page={page}
      onPageChange={onPageChange}
      striped
      highlightOnHover
      withTableBorder
      withColumnBorders={false}
      borderRadius="md"
      minHeight={300}
      noRecordsText="No se encontraron proyectos emblemáticos"
      loadingText="Cargando emblemáticos..."
      paginationText={({ from, to, totalRecords }) =>
        `Mostrando ${from}–${to} de ${totalRecords}`
      }
      styles={{
        header: {
          backgroundColor: "var(--mantine-color-default)",
        },
      }}
      columns={[
        {
          accessor: "titulo",
          title: "Título",
          render: (e) => (
            <Stack gap={2}>
              <Anchor
                component={Link}
                href={`/emblematicos/${e.id}`}
                size="sm"
                fw={500}
                c="congope.6"
                style={{ textDecoration: "none" }}
                lineClamp={2}
              >
                {e.titulo}
              </Anchor>
              {e.periodo && (
                <Text size="xs" c="dimmed">
                  Período: {e.periodo}
                </Text>
              )}
            </Stack>
          ),
        },
        {
          accessor: "provincia",
          title: "Provincia",
          width: 130,
          render: (e) => <Text size="sm">{e.provincia?.nombre ?? "—"}</Text>,
        },
        {
          accessor: "proyecto",
          title: "Proyecto",
          width: 180,
          render: (e) =>
            e.proyecto ? (
              <Stack gap={2}>
                <Text size="xs" fw={500} truncate>
                  {e.proyecto.nombre}
                </Text>
                <Text size="xs" c="dimmed">
                  {e.proyecto.codigo}
                </Text>
              </Stack>
            ) : (
              <Text size="xs" c="dimmed">
                —
              </Text>
            ),
        },
        {
          accessor: "reconocimientos_count",
          title: "Reconocimientos",
          width: 130,
          textAlign: "center",
          render: (e) => (
            <Badge variant="light" color="yellow" size="sm">
              {e.reconocimientos_count ?? e.reconocimientos?.length ?? 0}
            </Badge>
          ),
        },
        {
          accessor: "es_publico",
          title: "Público",
          width: 90,
          textAlign: "center",
          render: (e) =>
            puedePublicar ? (
              <Tooltip
                label={
                  e.es_publico ? "Visible en portal público" : "No publicado"
                }
              >
                <Switch
                  checked={e.es_publico}
                  onChange={() => onPublicar(e)}
                  disabled={publicandoId === e.id}
                  size="sm"
                  color="green"
                />
              </Tooltip>
            ) : (
              <Badge
                variant="light"
                color={e.es_publico ? "green" : "gray"}
                size="xs"
              >
                {e.es_publico ? "Público" : "Privado"}
              </Badge>
            ),
        },
        {
          accessor: "created_at",
          title: "Registrado",
          width: 110,
          render: (e) => (
            <Text size="xs" c="dimmed">
              {/* NOTA: created_at en ISO 8601 completo */}
              {formatFecha(e.created_at)}
            </Text>
          ),
        },
        {
          accessor: "acciones",
          title: "",
          width: 100,
          textAlign: "right",
          render: (e) => (
            <Group gap={4} justify="flex-end" wrap="nowrap">
              <Tooltip label="Ver detalle">
                <ActionIcon
                  component={Link}
                  href={`/emblematicos/${e.id}`}
                  variant="subtle"
                  color="gray"
                  size="sm"
                >
                  <IconEye size={15} />
                </ActionIcon>
              </Tooltip>
              {puedeEditar && (
                <Tooltip label="Editar">
                  <ActionIcon
                    variant="subtle"
                    color="congope"
                    size="sm"
                    onClick={() => onEditar(e)}
                  >
                    <IconEdit size={15} />
                  </ActionIcon>
                </Tooltip>
              )}
              {puedeEliminar && (
                <Tooltip label="Eliminar">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => onEliminar(e)}
                  >
                    <IconTrash size={15} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          ),
        },
      ]}
    />
  );
}
