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
} from "@mantine/core";
import { IconEye, IconEdit, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { formatFecha } from "@/utils/formatters";
import { COLOR_TIPO_RED, COLOR_ROL_CONGOPE } from "@/types/red.types";
import type { Red } from "@/services/axios";

interface RedesTableProps {
  redes: Red[];
  total: number;
  page: number;
  perPage: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onEditar: (red: Red) => void;
  onEliminar: (red: Red) => void;
  puedeEditar: boolean;
  puedeEliminar: boolean;
}

export function RedesTable({
  redes,
  total,
  page,
  perPage,
  isLoading,
  onPageChange,
  onEditar,
  onEliminar,
  puedeEditar,
  puedeEliminar,
}: RedesTableProps) {
  return (
    <DataTable
      records={redes}
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
      noRecordsText="No se encontraron redes"
      loadingText="Cargando redes..."
      paginationText={({ from, to, totalRecords }) =>
        `Mostrando ${from}–${to} de ${totalRecords} redes`
      }
      styles={{
        header: {
          backgroundColor: "var(--mantine-color-default)",
        },
      }}
      columns={[
        {
          accessor: "nombre",
          title: "Red / Articulación",
          render: (red) => (
            <Stack gap={2}>
              <Anchor
                component={Link}
                href={`/redes/${red.id}`}
                size="sm"
                fw={500}
                c="congope.6"
                style={{ textDecoration: "none" }}
              >
                {red.nombre}
              </Anchor>
              {red.objetivo && (
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {red.objetivo}
                </Text>
              )}
            </Stack>
          ),
        },
        {
          accessor: "tipo",
          title: "Tipo",
          width: 130,
          render: (red) => (
            <Badge color={COLOR_TIPO_RED[red.tipo]} variant="light" size="sm">
              {red.tipo}
            </Badge>
          ),
        },
        {
          accessor: "rol_congope",
          title: "Rol CONGOPE",
          width: 130,
          render: (red) => (
            <Badge
              color={COLOR_ROL_CONGOPE[red.rol_congope]}
              variant="light"
              size="sm"
            >
              {red.rol_congope}
            </Badge>
          ),
        },
        {
          accessor: "miembros_count",
          title: "Miembros",
          width: 100,
          textAlign: "center",
          render: (red) => (
            <Badge variant="outline" color="gray" size="sm">
              {red.miembros_count ?? red.miembros.length}
            </Badge>
          ),
        },
        {
          accessor: "fecha_adhesion",
          title: "Adhesión",
          width: 120,
          render: (red) => (
            <Text size="xs" c="dimmed">
              {red.fecha_adhesion ? formatFecha(red.fecha_adhesion) : "—"}
            </Text>
          ),
        },
        {
          accessor: "created_at",
          title: "Registrado",
          width: 110,
          render: (red) => (
            <Text size="xs" c="dimmed">
              {formatFecha(red.created_at)}
            </Text>
          ),
        },
        {
          accessor: "acciones",
          title: "",
          width: 100,
          textAlign: "right",
          render: (red) => (
            <Group gap={4} justify="flex-end" wrap="nowrap">
              <Tooltip label="Ver detalle">
                <ActionIcon
                  component={Link}
                  href={`/redes/${red.id}`}
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
                    onClick={() => onEditar(red)}
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
                    onClick={() => onEliminar(red)}
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
