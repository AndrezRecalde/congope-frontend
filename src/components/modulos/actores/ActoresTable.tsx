"use client";

import { useState } from "react";
import { DataTable } from "mantine-datatable";
import {
  Group,
  Badge,
  Text,
  ActionIcon,
  Tooltip,
  Stack,
  Anchor,
} from "@mantine/core";
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconWorld,
  IconMail,
} from "@tabler/icons-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { formatFecha } from "@/utils/formatters";
import type { ActorCooperacion } from "@/services/axios";

interface ActoresTableProps {
  actores: ActorCooperacion[];
  total: number;
  page: number;
  perPage: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onEditar: (actor: ActorCooperacion) => void;
  onEliminar: (actor: ActorCooperacion) => void;
  puedeEditar: boolean;
  puedeEliminar: boolean;
}

export function ActoresTable({
  actores,
  total,
  page,
  perPage,
  isLoading,
  onPageChange,
  onEditar,
  onEliminar,
  puedeEditar,
  puedeEliminar,
}: ActoresTableProps) {
  // Filas seleccionadas (para operaciones masivas futuras)
  const [selectedRecords, setSelectedRecords] = useState<ActorCooperacion[]>(
    [],
  );

  return (
    <DataTable
      records={actores}
      fetching={isLoading}
      totalRecords={total}
      recordsPerPage={perPage}
      page={page}
      onPageChange={onPageChange}
      selectedRecords={selectedRecords}
      onSelectedRecordsChange={setSelectedRecords}
      // Estilos alineados con el sistema Clean & Professional
      striped
      highlightOnHover
      withTableBorder
      withColumnBorders={false}
      borderRadius="md"
      minHeight={300}
      noRecordsText="No se encontraron actores de cooperación"
      loadingText="Cargando actores..."
      paginationText={({ from, to, totalRecords }) =>
        `Mostrando ${from}–${to} de ${totalRecords} actores`
      }
      styles={{
        header: {
          backgroundColor: "var(--mantine-color-body)",
        },
        pagination: {
          backgroundColor: "var(--mantine-color-body)",
          borderTop: "1px solid var(--mantine-color-default-border)",
          padding: "12px 16px",
        },
      }}
      columns={[
        {
          accessor: "nombre",
          title: "Actor / Organización",
          sortable: true,
          width: "30%",
          render: (actor) => (
            <Stack gap={2}>
              <Anchor
                component={Link}
                href={`/actores/${actor.id}`}
                size="sm"
                fw={500}
                c="congope.6"
                style={{ textDecoration: "none" }}
              >
                {actor.nombre}
              </Anchor>
              {actor.sitio_web && (
                <Group gap={4}>
                  <IconWorld size={11} color="var(--mantine-color-gray-5)" />
                  <Text size="xs" c="dimmed" truncate maw={200}>
                    {actor.sitio_web.replace(/^https?:\/\//, "")}
                  </Text>
                </Group>
              )}
            </Stack>
          ),
        },
        {
          accessor: "tipo",
          title: "Tipo",
          width: 120,
          render: (actor) => (
            <Badge variant="light" color="blue" size="sm">
              {actor.tipo}
            </Badge>
          ),
        },
        {
          accessor: "pais_origen",
          title: "País",
          width: 130,
          render: (actor) => <Text size="sm">{actor.pais_origen}</Text>,
        },
        {
          accessor: "areas_tematicas",
          title: "Áreas temáticas",
          render: (actor) => (
            <Group gap={4} wrap="wrap" maw={280}>
              {actor.areas_tematicas.slice(0, 3).map((area) => (
                <Badge key={area} variant="dot" color="gray" size="xs">
                  {area}
                </Badge>
              ))}
              {actor.areas_tematicas.length > 3 && (
                <Text size="xs" c="dimmed">
                  +{actor.areas_tematicas.length - 3} más
                </Text>
              )}
            </Group>
          ),
        },
        {
          accessor: "estado",
          title: "Estado",
          width: 100,
          render: (actor) => <StatusBadge estado={actor.estado} tipo="actor" />,
        },
        {
          accessor: "contacto_email",
          title: "Contacto",
          width: 160,
          render: (actor) =>
            actor.contacto_email ? (
              <Group gap={4}>
                <IconMail size={13} color="var(--mantine-color-gray-5)" />
                <Text size="xs" c="dimmed" truncate maw={130}>
                  {actor.contacto_email}
                </Text>
              </Group>
            ) : (
              <Text size="xs" c="dimmed">
                —
              </Text>
            ),
        },
        {
          accessor: "created_at",
          title: "Registrado",
          width: 120,
          render: (actor) => (
            <Text size="xs" c="dimmed">
              {formatFecha(actor.created_at)}
            </Text>
          ),
        },
        {
          accessor: "acciones",
          title: "",
          width: 100,
          textAlign: "right",
          render: (actor) => (
            <Group gap={4} justify="flex-end" wrap="nowrap">
              <Tooltip label="Ver detalle" position="top">
                <ActionIcon
                  component={Link}
                  href={`/actores/${actor.id}`}
                  variant="subtle"
                  color="gray"
                  size="sm"
                >
                  <IconEye size={15} />
                </ActionIcon>
              </Tooltip>

              {puedeEditar && (
                <Tooltip label="Editar" position="top">
                  <ActionIcon
                    variant="subtle"
                    color="congope"
                    size="sm"
                    onClick={() => onEditar(actor)}
                  >
                    <IconEdit size={15} />
                  </ActionIcon>
                </Tooltip>
              )}

              {puedeEliminar && (
                <Tooltip label="Eliminar" position="top">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => onEliminar(actor)}
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
