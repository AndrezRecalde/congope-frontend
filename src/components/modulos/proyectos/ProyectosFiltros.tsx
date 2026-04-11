'use client'

import {
  Group, TextInput, Select, Button, Paper,
} from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useActores }          from '@/queries/actores.queries';
import { useQuery }            from '@tanstack/react-query';
import { queryKeys }           from '@/lib/query-client';
import apiClient, { extractData } from '@/services/axios';
import type { Provincia }      from '@/services/axios';
import type { ProyectoFiltros } from '@/types/proyecto.types';

const OPCIONES_ESTADO = [
  { value: '',              label: 'Todos los estados' },
  { value: 'En gestión',   label: 'En gestión' },
  { value: 'En ejecución', label: 'En ejecución' },
  { value: 'Finalizado',   label: 'Finalizado' },
  { value: 'Suspendido',   label: 'Suspendido' },
];

interface ProyectosFiltrosProps {
  filtros:   ProyectoFiltros;
  onChange:  (filtros: ProyectoFiltros) => void;
  onLimpiar: () => void;
}

export function ProyectosFiltros({
  filtros,
  onChange,
  onLimpiar,
}: ProyectosFiltrosProps) {
  const [searchInput, setSearchInput] = useState(
    filtros.search ?? ''
  );
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    if (debouncedSearch !== filtros.search) {
      onChange({ ...filtros, search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  const { data: actoresData } = useActores({ per_page: 100 });
  const { data: provinciasData } = useQuery({
    queryKey: queryKeys.provincias.list,
    queryFn:  async () => {
      const res = await apiClient.get('/provincias');
      return extractData<Provincia[]>(res);
    },
    staleTime: Infinity,
  });

  const opcionesActores = [
    { value: '', label: 'Todos los actores' },
    ...(actoresData?.data ?? []).map((a) => ({
      value: a.id,
      label: a.nombre,
    })),
  ];

  const opcionesProvincias = [
    { value: '', label: 'Todas las provincias' },
    ...(provinciasData ?? []).map((p) => ({
      value: p.id,
      label: p.nombre,
    })),
  ];

  const hayFiltros =
    !!filtros.search ||
    !!filtros.estado ||
    !!filtros.actor_id ||
    !!filtros.provincia_id;

  return (
    <Paper
      p="md"
      mb="md"
      radius="md"
      style={{
        border: '1px solid var(--mantine-color-gray-3)',
        background: 'var(--mantine-color-gray-0)',
      }}
    >
      <Group gap="sm" wrap="wrap">
        <TextInput
          placeholder="Buscar por nombre o código..."
          leftSection={<IconSearch size={15} />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.currentTarget.value)}
          style={{ flex: 1, minWidth: 200 }}
          size="sm"
        />
        <Select
          placeholder="Estado"
          data={OPCIONES_ESTADO}
          value={filtros.estado ?? ''}
          onChange={(val) =>
            onChange({
              ...filtros,
              estado: val as ProyectoFiltros['estado'],
              page: 1,
            })
          }
          w={150}
          size="sm"
        />
        <Select
          placeholder="Actor"
          data={opcionesActores}
          value={filtros.actor_id ?? ''}
          onChange={(val) =>
            onChange({ ...filtros, actor_id: val ?? '', page: 1 })
          }
          w={200}
          size="sm"
          searchable
        />
        <Select
          placeholder="Provincia"
          data={opcionesProvincias}
          value={filtros.provincia_id ?? ''}
          onChange={(val) =>
            onChange({
              ...filtros,
              provincia_id: val ?? '',
              page: 1,
            })
          }
          w={160}
          size="sm"
          searchable
        />
        {hayFiltros && (
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconX size={14} />}
            onClick={() => {
              setSearchInput('');
              onLimpiar();
            }}
          >
            Limpiar
          </Button>
        )}
      </Group>
    </Paper>
  );
}
