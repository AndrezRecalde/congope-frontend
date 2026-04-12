'use client'

import { DataTable }  from 'mantine-datatable';
import {
  Group, Text, Badge, Stack,
  ActionIcon, Tooltip, Avatar,
} from '@mantine/core';
import {
  IconEdit, IconTrash, IconShield,
  IconMapPin, IconUser,
} from '@tabler/icons-react';
import { formatFecha }  from '@/utils/formatters';
import {
  COLOR_ROL, LABEL_ROL,
  type UsuarioListado,
  type RolSistema,
} from '@/types/usuario.types';

interface UsuariosTableProps {
  usuarios:          UsuarioListado[];
  total:             number;
  page:              number;
  perPage:           number;
  isLoading:         boolean;
  onPageChange:      (page: number) => void;
  onEditar:          (u: UsuarioListado) => void;
  onEliminar:        (u: UsuarioListado) => void;
  onCambiarRol:      (u: UsuarioListado) => void;
  onAsignarProvincia:(u: UsuarioListado) => void;
  puedeEditar:       boolean;
  puedeEliminar:     boolean;
  puedeAsignarRol:   boolean;
  puedeAsignarProv:  boolean;
  usuarioActualId:   number;
}

export function UsuariosTable({
  usuarios,
  total,
  page,
  perPage,
  isLoading,
  onPageChange,
  onEditar,
  onEliminar,
  onCambiarRol,
  onAsignarProvincia,
  puedeEditar,
  puedeEliminar,
  puedeAsignarRol,
  puedeAsignarProv,
  usuarioActualId,
}: UsuariosTableProps) {
  return (
    <DataTable
      records={usuarios}
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
      noRecordsText="No se encontraron usuarios"
      loadingText="Cargando usuarios..."
      paginationText={({ from, to, totalRecords }) =>
        `Mostrando ${from}–${to} de ${totalRecords}`
      }
      styles={{
        header: {
          backgroundColor:
            'var(--mantine-color-gray-1)',
        },
      }}
      columns={[
        {
          accessor: 'name',
          title:    'Usuario',
          render:   (u) => (
            <Group gap="sm" wrap="nowrap">
              <Avatar
                size={34}
                radius="xl"
                color={
                  COLOR_ROL[
                    u.roles?.[0]?.name as RolSistema
                  ] ?? 'gray'
                }
                variant="light"
              >
                <IconUser size={16} />
              </Avatar>
              <Stack gap={2}>
                <Group gap="xs">
                  <Text size="sm" fw={500}>
                    {u.name}
                  </Text>
                  {u.id === usuarioActualId && (
                    <Badge
                      size="xs"
                      variant="outline"
                      color="congope"
                    >
                      Tú
                    </Badge>
                  )}
                </Group>
                <Text size="xs" c="dimmed">
                  {u.email}
                </Text>
              </Stack>
            </Group>
          ),
        },
        {
          accessor: 'rol',
          title:    'Rol',
          width:    180,
          render:   (u) => {
            const rolNombre =
              u.roles?.[0]?.name as RolSistema;
            if (!rolNombre) return (
              <Text size="xs" c="dimmed">Sin rol</Text>
            );
            return (
              <Badge
                size="sm"
                color={COLOR_ROL[rolNombre] ?? 'gray'}
                variant="light"
              >
                {LABEL_ROL[rolNombre] ?? rolNombre}
              </Badge>
            );
          },
        },
        {
          accessor: 'provincias',
          title:    'Provincias',
          width:    160,
          render:   (u) => {
            const count = u.provincias?.length ?? 0;
            if (count === 0) return (
              <Text size="xs" c="dimmed">
                Todas
              </Text>
            );
            return (
              <Group gap={4}>
                <IconMapPin
                  size={12}
                  color="var(--mantine-color-gray-5)"
                />
                <Text size="xs">
                  {count} provincia
                  {count !== 1 ? 's' : ''}
                </Text>
              </Group>
            );
          },
        },
        {
          accessor:  'created_at',
          title:     'Registrado',
          width:     120,
          render:    (u) => (
            <Text size="xs" c="dimmed">
              {formatFecha(u.created_at)}
            </Text>
          ),
        },
        {
          accessor:  'acciones',
          title:     '',
          width:     130,
          textAlign: 'right',
          render:    (u) => (
            <Group gap={4} justify="flex-end"
              wrap="nowrap">
              {puedeAsignarProv && (
                <Tooltip label="Asignar provincias">
                  <ActionIcon
                    variant="subtle"
                    color="teal"
                    size="sm"
                    onClick={() =>
                      onAsignarProvincia(u)
                    }
                  >
                    <IconMapPin size={15} />
                  </ActionIcon>
                </Tooltip>
              )}
              {puedeAsignarRol && (
                <Tooltip label="Cambiar rol">
                  <ActionIcon
                    variant="subtle"
                    color="violet"
                    size="sm"
                    onClick={() => onCambiarRol(u)}
                  >
                    <IconShield size={15} />
                  </ActionIcon>
                </Tooltip>
              )}
              {puedeEditar && (
                <Tooltip label="Editar">
                  <ActionIcon
                    variant="subtle"
                    color="congope"
                    size="sm"
                    onClick={() => onEditar(u)}
                  >
                    <IconEdit size={15} />
                  </ActionIcon>
                </Tooltip>
              )}
              {puedeEliminar &&
               u.id !== usuarioActualId && (
                <Tooltip label="Eliminar">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => onEliminar(u)}
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
