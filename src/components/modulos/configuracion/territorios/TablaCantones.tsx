'use client'

import { useState, useEffect } from 'react';
import {
  Stack, Group, Select, TextInput,
  Text, Badge, ActionIcon, Tooltip,
  Pagination, Center, Skeleton, Paper,
  Alert, Table, LoadingOverlay,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconSearch, IconEdit, IconCheck,
  IconX, IconInfoCircle,
} from '@tabler/icons-react';
import {
  useCantonesAdmin,
  useEditarCanton,
} from '@/queries/territorios.queries';
import {
  useProvinciasAdmin,
} from '@/queries/territorios.queries';
import type { CantonAdmin } from '@/types/territorio.types';
import dayjs from 'dayjs';

// Fila de cantón con edición inline del nombre
function FilaCanton({
  canton,
  puedeEditar,
}: {
  canton:      CantonAdmin;
  puedeEditar: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [nombre,   setNombre]   = useState(canton.nombre);

  const { mutate: editar, isPending } =
    useEditarCanton();

  const handleGuardar = () => {
    if (nombre.trim() === canton.nombre) {
      setEditando(false);
      return;
    }
    editar(
      { id: canton.id, datos: { nombre: nombre.trim() } },
      { onSuccess: () => setEditando(false) }
    );
  };

  const handleCancelar = () => {
    setNombre(canton.nombre);
    setEditando(false);
  };

  // Formatear fecha de actualización
  // Los cantones usan "actualizado_el" (ISO 8601)
  const actualizado = canton.actualizado_el
    ? dayjs(canton.actualizado_el).format('DD/MM/YYYY')
    : '—';

  return (
    <Table.Tr
      style={{
        background: editando
          ? 'var(--mantine-color-blue-0)'
          : undefined,
      }}
    >
      {/* Código INEC */}
      <Table.Td>
        <Badge
          variant="outline"
          color="gray"
          size="xs"
          ff="monospace"
        >
          {canton.codigo}
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
            style={{ minWidth: 220 }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGuardar();
              if (e.key === 'Escape') handleCancelar();
            }}
          />
        ) : (
          <Text size="sm">{canton.nombre}</Text>
        )}
      </Table.Td>

      {/* Provincia */}
      <Table.Td>
        <Text size="xs" c="dimmed">
          {canton.provincia?.nombre ?? '—'}
        </Text>
      </Table.Td>

      {/* Última actualización */}
      <Table.Td>
        <Text size="xs" c="dimmed">
          {actualizado}
        </Text>
      </Table.Td>

      {/* Acciones */}
      <Table.Td>
        <Group gap={4} justify="flex-end"
          wrap="nowrap">
          {editando ? (
            <>
              <Tooltip label="Guardar (Enter)">
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
              <Tooltip label="Cancelar (Esc)">
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
              <Tooltip label="Editar nombre">
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

// Componente principal de cantones
interface TablaCantonesProps {
  puedeEditar: boolean;
}

export function TablaCantones({
  puedeEditar,
}: TablaCantonesProps) {
  const [searchInput, setSearchInput] = useState('');
  const [provinciaId, setProvinciaId] = useState('');
  const [page, setPage] = useState(1);

  const [debouncedSearch] =
    useDebouncedValue(searchInput, 400);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, provinciaId]);

  const {
    data,
    isLoading,
    isFetching,
  } = useCantonesAdmin({
    search:       debouncedSearch || undefined,
    provincia_id: provinciaId    || undefined,
    page,
    per_page:     15,
  });

  const {
    data: provincias = [],
  } = useProvinciasAdmin();

  const cantones = data?.data  ?? [];
  const meta     = data?.meta;

  const opcionesProvincias = [
    { value: '', label: 'Todas las provincias' },
    ...provincias.map((p) => ({
      value: p.id,
      label: p.nombre,
    })),
  ];

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
          El código INEC y la provincia de un cantón
          no son editables. Solo puedes actualizar
          el nombre. Hay 221 cantones en el sistema.
        </Text>
      </Alert>

      {/* Filtros */}
      <Group gap="sm" wrap="wrap">
        <TextInput
          placeholder="Buscar cantón..."
          leftSection={<IconSearch size={14} />}
          value={searchInput}
          onChange={(e) =>
            setSearchInput(e.currentTarget.value)
          }
          size="sm"
          style={{ flex: 1, minWidth: 200 }}
        />
        <Select
          placeholder="Provincia"
          data={opcionesProvincias}
          value={provinciaId}
          onChange={(v) =>
            setProvinciaId(v ?? '')
          }
          searchable
          clearable
          size="sm"
          w={200}
        />
      </Group>

      {/* Contador de resultados */}
      {meta && (
        <Text size="xs" c="dimmed">
          {meta.total} cantone
          {meta.total !== 1 ? 's' : ''}
          {(debouncedSearch || provinciaId)
            ? ' con los filtros aplicados'
            : ' en total'}
        </Text>
      )}

      {/* Tabla */}
      {isLoading ? (
        <Stack gap="xs">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} height={44} radius="md" />
          ))}
        </Stack>
      ) : cantones.length === 0 ? (
        <Center py="xl">
          <Text size="sm" c="dimmed">
            No se encontraron cantones
            {debouncedSearch
              ? ` con el nombre "${debouncedSearch}"`
              : ''}
          </Text>
        </Center>
      ) : (
        <Paper
          radius="md"
          pos="relative"
          style={{
            border:
              '1px solid var(--mantine-color-gray-3)',
            overflow: 'hidden',
            minHeight: 200,
          }}
        >
          <LoadingOverlay 
            visible={isFetching && !isLoading} 
            zIndex={1000} 
            overlayProps={{ radius: "sm", blur: 2 }} 
          />
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
                <Table.Th w={90}>Código</Table.Th>
                <Table.Th>Nombre</Table.Th>
                <Table.Th w={180}>Provincia</Table.Th>
                <Table.Th w={130}>
                  Actualizado
                </Table.Th>
                <Table.Th w={90} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {cantones.map((canton) => (
                <FilaCanton
                  key={canton.id}
                  canton={canton}
                  puedeEditar={puedeEditar}
                />
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      {/* Paginación */}
      {meta && meta.last_page > 1 && (
        <Center>
          <Pagination
            total={meta.last_page}
            value={page}
            onChange={setPage}
            size="sm"
            color="congope"
          />
        </Center>
      )}
    </Stack>
  );
}
