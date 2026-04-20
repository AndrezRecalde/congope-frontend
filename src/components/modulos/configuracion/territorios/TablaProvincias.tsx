'use client'

import { useState } from 'react';
import {
  Table, TextInput, ActionIcon, Group,
  Text, Badge, Tooltip, Skeleton,
  Paper, Stack, Alert,
} from '@mantine/core';
import {
  IconEdit, IconCheck, IconX,
  IconInfoCircle, IconMapPin,
} from '@tabler/icons-react';
import {
  useProvinciasAdmin,
  useEditarProvincia,
} from '@/queries/territorios.queries';
import type { ProvinciaAdmin } from '@/types/territorio.types';

// Fila individual con edición inline
function FilaProvincia({
  provincia,
  puedeEditar,
}: {
  provincia:   ProvinciaAdmin;
  puedeEditar: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [nombre,   setNombre]   =
    useState(provincia.nombre);
  const [capital,  setCapital]  =
    useState(provincia.capital ?? '');

  const { mutate: editar, isPending } =
    useEditarProvincia();

  const handleGuardar = () => {
    // Solo guardar si hubo cambios
    const cambios: Record<string, string> = {};
    if (nombre.trim() !== provincia.nombre)
      cambios.nombre = nombre.trim();
    if (capital.trim() !== (provincia.capital ?? ''))
      cambios.capital = capital.trim();

    if (Object.keys(cambios).length === 0) {
      setEditando(false);
      return;
    }

    editar(
      { id: provincia.id, datos: cambios },
      { onSuccess: () => setEditando(false) }
    );
  };

  const handleCancelar = () => {
    setNombre(provincia.nombre);
    setCapital(provincia.capital ?? '');
    setEditando(false);
  };

  return (
    <Table.Tr
      style={{
        background: editando
          ? 'var(--mantine-color-blue-0)'
          : undefined,
      }}
    >
      {/* Código INEC — no editable */}
      <Table.Td>
        <Badge
          variant="outline"
          color="gray"
          size="sm"
          ff="monospace"
        >
          {provincia.codigo}
        </Badge>
      </Table.Td>

      {/* Nombre — editable */}
      <Table.Td>
        {editando ? (
          <TextInput
            value={nombre}
            onChange={(e) =>
              setNombre(e.currentTarget.value)
            }
            size="xs"
            style={{ minWidth: 200 }}
            autoFocus
          />
        ) : (
          <Text size="sm" fw={500}>
            {provincia.nombre}
          </Text>
        )}
      </Table.Td>

      {/* Capital — editable */}
      <Table.Td>
        {editando ? (
          <TextInput
            value={capital}
            onChange={(e) =>
              setCapital(e.currentTarget.value)
            }
            size="xs"
            style={{ minWidth: 160 }}
          />
        ) : (
          <Group gap="xs">
            <IconMapPin
              size={12}
              color="var(--mantine-color-gray-5)"
            />
            <Text size="sm" c="dimmed">
              {provincia.capital ?? '—'}
            </Text>
          </Group>
        )}
      </Table.Td>

      {/* Acciones */}
      <Table.Td>
        <Group gap={4} justify="flex-end"
          wrap="nowrap">
          {editando ? (
            <>
              <Tooltip label="Guardar cambios">
                <ActionIcon
                  variant="filled"
                  color="green"
                  size="sm"
                  loading={isPending}
                  onClick={handleGuardar}
                >
                  <IconCheck size={13} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Cancelar">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={handleCancelar}
                  disabled={isPending}
                >
                  <IconX size={13} />
                </ActionIcon>
              </Tooltip>
            </>
          ) : (
            puedeEditar && (
              <Tooltip label="Editar">
                <ActionIcon
                  variant="subtle"
                  color="congope"
                  size="sm"
                  onClick={() => setEditando(true)}
                >
                  <IconEdit size={14} />
                </ActionIcon>
              </Tooltip>
            )
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

// Componente principal
interface TablaProvinciasProps {
  puedeEditar: boolean;
}

export function TablaProvincias({
  puedeEditar,
}: TablaProvinciasProps) {
  const {
    data: provincias = [],
    isLoading,
  } = useProvinciasAdmin();

  if (isLoading) {
    return (
      <Stack gap="xs">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} height={44} radius="md" />
        ))}
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {/* Aviso informativo */}
      <Alert
        icon={<IconInfoCircle size={15} />}
        color="blue"
        variant="light"
        radius="md"
      >
        <Text size="xs">
          El código INEC de cada provincia no es
          editable — es un identificador oficial del
          Ecuador. Solo puedes actualizar el nombre
          y la ciudad capital.
        </Text>
      </Alert>

      <Paper
        radius="md"
        style={{
          border:
            '1px solid var(--mantine-color-gray-3)',
          overflow: 'hidden',
        }}
      >
        <Table
          striped
          highlightOnHover
          withRowBorders
        >
          <Table.Thead
            style={{
              background:
                'var(--mantine-color-gray-1)',
            }}
          >
            <Table.Tr>
              <Table.Th w={80}>Código</Table.Th>
              <Table.Th>Provincia</Table.Th>
              <Table.Th w={200}>Capital</Table.Th>
              <Table.Th w={100} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {provincias.map((provincia) => (
              <FilaProvincia
                key={provincia.id}
                provincia={provincia}
                puedeEditar={puedeEditar}
              />
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Text size="xs" c="dimmed" ta="right">
        {provincias.length} provincias del Ecuador
      </Text>
    </Stack>
  );
}
