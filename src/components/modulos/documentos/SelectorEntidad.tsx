'use client'

import {
  Paper, Group, Select, Text, Badge,
} from '@mantine/core';
import { useActores }    from '@/queries/actores.queries';
import { useRedes }      from '@/queries/redes.queries';
import { useProyectos }  from '@/queries/proyectos.queries';
import { useQuery }      from '@tanstack/react-query';
import { queryKeys }     from '@/lib/query-client';
import apiClient from '@/services/axios';
import type { Evento }   from '@/services/axios';
import type { DocumentoFiltro }
  from '@/types/documento.types';

const TIPOS_ENTIDAD = [
  { value: 'proyecto', label: 'Proyecto' },
  { value: 'actor',    label: 'Actor cooperante' },
  { value: 'red',      label: 'Red de articulación' },
  { value: 'evento',   label: 'Evento' },
];

interface SelectorEntidadProps {
  filtro:    DocumentoFiltro;
  onChange:  (f: DocumentoFiltro) => void;
  totalDocs: number;
}

export function SelectorEntidad({
  filtro,
  onChange,
  totalDocs,
}: SelectorEntidadProps) {
  // Cargar las entidades disponibles según el tipo
  const { data: proyectosData } = useProyectos({
    per_page: 100,
  });
  const { data: actoresData } = useActores({
    per_page: 100,
  });
  const { data: redesData }  = useRedes({
    per_page: 100,
  });
  const { data: eventosData } = useQuery({
    queryKey: queryKeys.eventos.list({}),
    queryFn:  async () => {
      const res = await apiClient.get('/eventos', {
        params: { per_page: 100 },
      });
      return (res.data as {
        data: Evento[];
      }).data;
    },
  });

  // Opciones de entidades según el tipo seleccionado
  const opcionesEntidad = (() => {
    switch (filtro.entidad_tipo) {
      case 'proyecto':
        return (proyectosData?.data ?? []).map((p) => ({
          value: p.id,
          label: `${p.codigo} — ${p.nombre}`,
        }));
      case 'actor':
        return (actoresData?.data ?? []).map((a) => ({
          value: a.id,
          label: a.nombre,
        }));
      case 'red':
        return (redesData?.data ?? []).map((r) => ({
          value: r.id,
          label: r.nombre,
        }));
      case 'evento':
        return (eventosData ?? []).map((e) => ({
          value: e.id,
          label: e.titulo,
        }));
      default:
        return [];
    }
  })();

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
      <Group gap="sm" wrap="wrap" align="flex-end">
        <Select
          label="Tipo de entidad"
          placeholder="Seleccionar tipo"
          data={TIPOS_ENTIDAD}
          value={filtro.entidad_tipo}
          onChange={(val) =>
            onChange({
              entidad_tipo: (val ?? '') as
                DocumentoFiltro['entidad_tipo'],
              entidad_id: '', // Resetear la entidad
            })
          }
          w={180}
          size="sm"
        />

        <Select
          label="Entidad específica"
          placeholder={
            filtro.entidad_tipo
              ? 'Buscar y seleccionar...'
              : 'Primero selecciona el tipo'
          }
          data={opcionesEntidad}
          value={filtro.entidad_id}
          onChange={(val) =>
            onChange({
              ...filtro,
              entidad_id: val ?? '',
            })
          }
          disabled={!filtro.entidad_tipo}
          style={{ flex: 1, minWidth: 280 }}
          size="sm"
          searchable
        />

        {filtro.entidad_id && (
          <Badge
            variant="light"
            color="congope"
            size="sm"
            style={{ alignSelf: 'flex-end',
                     marginBottom: 2 }}
          >
            {totalDocs} documento
            {totalDocs !== 1 ? 's' : ''}
          </Badge>
        )}
      </Group>
    </Paper>
  );
}
