'use client'

import { DataTable }  from 'mantine-datatable';
import {
  Group, Text, Badge, Stack,
  ActionIcon, Tooltip, Avatar,
} from '@mantine/core';
import {
  IconEdit, IconTrash, IconShield,
  IconMapPin, IconUser, IconPower, IconKey,
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
  onCambiarEstado:   (u: UsuarioListado) => void;
  onResetPassword:   (u: UsuarioListado) => void;
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
  onCambiarEstado,
  onResetPassword,
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
            'var(--mantine-color-default)',
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
          accessor: 'cargo',
          title:    'Cargo / Entidad',
          render:   (u) => (
            <Stack gap={2}>
              <Text size="sm">{u.cargo}</Text>
              {u.entidad && (
                <Text size="xs" c="dimmed">
                  {u.entidad}
                </Text>
              )}
            </Stack>
          ),
        },
        {
          accessor: 'rol',
          title:    'Rol',
          width:    160,
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
          accessor: 'activo',
          title:    'Estado',
          width:    100,
          render:   (u) => (
            <Badge
              color={u.activo ? 'green' : 'red'}
              variant="light"
              size="sm"
            >
              {u.activo ? 'Activo' : 'Inactivo'}
            </Badge>
          ),
        },
        {
          accessor:  'acciones',
          title:     '',
          width:     180,
          textAlign: 'right',
          render:    (u) => (
            <Group gap={4} justify="flex-end" wrap="nowrap">
              {puedeAsignarProv && (
                <Tooltip label="Asignar provincias">
                  <ActionIcon
                    variant="subtle"
                    color="teal"
                    size="sm"
                    onClick={() => onAsignarProvincia(u)}
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
                <Tooltip label={u.activo ? "Desactivar usuario" : "Activar usuario"}>
                  <ActionIcon
                    variant="subtle"
                    color={u.activo ? "red" : "green"}
                    size="sm"
                    onClick={() => onCambiarEstado(u)}
                    disabled={u.id === usuarioActualId} // No desactivarse a sí mismo
                  >
                    <IconPower size={15} />
                  </ActionIcon>
                </Tooltip>
              )}
              {puedeEditar && (
                <Tooltip label="Resetear contraseña">
                  <ActionIcon
                    variant="subtle"
                    color="orange"
                    size="sm"
                    onClick={() => onResetPassword(u)}
                  >
                    <IconKey size={15} />
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
              {puedeEliminar && u.id !== usuarioActualId && (
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
