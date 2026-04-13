'use client'

import {
  Paper, Stack, Select, Button, Title,
  Group, Text, Badge, ActionIcon, Collapse,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconFilter, IconX, IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import type { MapaFiltros } from '@/types/mapa.types';
import type { Provincia, Ods } from '@/services/axios';

interface MapaFiltrosPanelProps {
  filtros:    MapaFiltros;
  provincias: Provincia[];
  ods:        Ods[];
  actores:    Array<{ id: string; nombre: string;
                      tipo: string }>;
  onChange:   (f: MapaFiltros) => void;
  onLimpiar:  () => void;
}

const OPCIONES_ESTADO = [
  { value: '',              label: 'Todos los estados' },
  { value: 'En gestión',   label: 'En gestión' },
  { value: 'En ejecución', label: 'En ejecución' },
  { value: 'Finalizado',   label: 'Finalizado' },
  { value: 'Suspendido',   label: 'Suspendido' },
];

export function MapaFiltrosPanel({
  filtros,
  provincias,
  ods,
  actores,
  onChange,
  onLimpiar,
}: MapaFiltrosPanelProps) {
  const [abierto, { toggle }] = useDisclosure(true);

  const opcionesProvincias = [
    { value: '', label: 'Todas las provincias' },
    ...provincias.map((p) => ({
      value: p.id,
      label: p.nombre,
    })),
  ];

  const opcionesOds = [
    { value: '', label: 'Todos los ODS' },
    ...ods.map((o) => ({
      value: String(o.id),
      label: `ODS ${o.numero} — ${o.nombre}`,
    })),
  ];

  const opcionesActores = [
    { value: '', label: 'Todos los actores' },
    ...actores.map((a) => ({
      value: a.id,
      label: `${a.nombre} (${a.tipo})`,
    })),
  ];

  const filtrosActivos = Object.values(filtros).filter(
    (v) => v !== '' && v !== undefined && v !== null
  ).length;

  return (
    <Paper
      p="md"
      radius="lg"
      shadow="md"
      style={{
        position:  'absolute',
        top:       16,
        right:     16,
        zIndex:    10,
        width:     280,
        border:    '1px solid var(--mantine-color-gray-3)',
        background:'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Cabecera del panel */}
      <Group justify="space-between" mb={abierto ? 'sm' : 0}>
        <Group gap="xs">
          <IconFilter
            size={16}
            color="var(--mantine-color-congope-8)"
          />
          <Title order={6} c="congope.8">
            Filtros del mapa
          </Title>
          {filtrosActivos > 0 && (
            <Badge
              size="xs"
              color="congope"
              circle
            >
              {filtrosActivos}
            </Badge>
          )}
        </Group>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={toggle}
        >
          {abierto
            ? <IconChevronUp size={14} />
            : <IconChevronDown size={14} />}
        </ActionIcon>
      </Group>

      {/* Filtros colapsables */}
      <Collapse in={abierto}>
        <Stack gap="sm">
          <Select
            placeholder="Estado del proyecto"
            data={OPCIONES_ESTADO}
            value={filtros.estado ?? ''}
            onChange={(val) =>
              onChange({ ...filtros, estado: val ?? '' })
            }
            size="sm"
            clearable={false}
          />

          <Select
            placeholder="Provincia"
            data={opcionesProvincias}
            value={filtros.provincia_id ?? ''}
            onChange={(val) =>
              onChange({
                ...filtros,
                provincia_id: val ?? '',
              })
            }
            size="sm"
            searchable
          />

          <Select
            placeholder="ODS"
            data={opcionesOds}
            value={
              filtros.ods_id
                ? String(filtros.ods_id)
                : ''
            }
            onChange={(val) =>
              onChange({
                ...filtros,
                ods_id: val ? Number(val) : null,
              })
            }
            size="sm"
            searchable
          />

          <Select
            placeholder="Actor cooperante"
            data={opcionesActores}
            value={filtros.actor_id ?? ''}
            onChange={(val) =>
              onChange({
                ...filtros,
                actor_id: val ?? '',
              })
            }
            size="sm"
            searchable
          />

          {filtrosActivos > 0 && (
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              leftSection={<IconX size={12} />}
              onClick={onLimpiar}
              fullWidth
            >
              Limpiar filtros
            </Button>
          )}
        </Stack>
      </Collapse>
    </Paper>
  );
}
