'use client'

import { useState, useEffect } from 'react';
import {
  Group, Select, TextInput, Button,
  Badge, Text,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch, IconMapPin,
         IconX } from '@tabler/icons-react';
import { useProvinciasAdmin }
  from '@/queries/territorios.queries';
import type { FiltrosKanban }
  from '@/types/kanban.types';

interface KanbanFiltrosProps {
  filtros:   FiltrosKanban;
  onChange:  (f: FiltrosKanban) => void;
  totalGeneral?: number;
}

export function KanbanFiltros({
  filtros,
  onChange,
  totalGeneral,
}: KanbanFiltrosProps) {
  const [searchInput, setSearchInput] =
    useState(filtros.search);
  const [debouncedSearch] =
    useDebouncedValue(searchInput, 400);

  // Propagar el search con debounce
  useEffect(() => {
    if (debouncedSearch !== filtros.search) {
      onChange({
        ...filtros,
        search: debouncedSearch,
      });
    }
  }, [debouncedSearch, filtros, onChange]);

  const { data: provincias = [] } =
    useProvinciasAdmin();

  const hayFiltros =
    !!filtros.provincia_id || !!filtros.search;

  const limpiar = () => {
    setSearchInput('');
    onChange({ provincia_id: '', search: '' });
  };

  return (
    <Group gap="sm" align="center" wrap="wrap">

      {/* Selector de provincia */}
      <Group gap="xs">
        <IconMapPin
          size={16}
          color="var(--mantine-color-gray-6)"
        />
        <Select
          placeholder="Todas las provincias"
          size="sm"
          w={220}
          clearable
          searchable
          data={[
            { value: '', label:
              'Todas las provincias' },
            ...provincias.map((p) => ({
              value: p.id,
              label: p.nombre,
            })),
          ]}
          value={filtros.provincia_id || null}
          onChange={(v) =>
            onChange({
              ...filtros,
              provincia_id: v ?? '',
            })
          }
          leftSection={
            filtros.provincia_id
              ? <div style={{
                  width:        8,
                  height:       8,
                  borderRadius: '50%',
                  background:   '#C9A84C',
                }} />
              : undefined
          }
          styles={{
            input: {
              fontWeight: filtros.provincia_id
                ? 600 : 400,
              color: filtros.provincia_id
                ? 'var(--mantine-color-dark-7)'
                : undefined,
            },
          }}
        />
      </Group>

      {/* Buscador */}
      <TextInput
        placeholder="Buscar por nombre o código..."
        leftSection={<IconSearch size={14} />}
        size="sm"
        w={240}
        value={searchInput}
        onChange={(e) => {
          setSearchInput(e.currentTarget.value);
        }}
        rightSection={
          searchInput ? (
            <ActionIconLite
              onClick={() => {
                setSearchInput('');
                onChange({
                  ...filtros,
                  search: '',
                });
              }}
            />
          ) : undefined
        }
      />

      {/* Indicador de filtros activos */}
      {hayFiltros && (
        <>
          <Badge
            variant="light"
            color="blue"
            size="sm"
          >
            Filtros activos
          </Badge>
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            leftSection={<IconX size={12} />}
            onClick={limpiar}
          >
            Limpiar
          </Button>
        </>
      )}

      {/* Total general */}
      {totalGeneral !== undefined && (
        <Text size="xs" c="dimmed" ml="auto">
          {totalGeneral.toLocaleString()} proyectos
          en total
        </Text>
      )}
    </Group>
  );
}

// Pequeño botón de limpiar
function ActionIconLite({
  onClick,
}: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor:         'pointer',
        color:          'var(--mantine-color-gray-5)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}
    >
      <IconX size={12} />
    </div>
  );
}
