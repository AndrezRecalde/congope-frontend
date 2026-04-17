"use client";

import { Group, TextInput, Select, Button, Paper, Switch } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import apiClient, { extractData } from "@/services/axios";
import type { Provincia } from "@/services/axios";
import type { PracticaFiltros } from "@/types/practica.types";

const OPCIONES_REPLICABILIDAD = [
  { value: "", label: "Todas" },
  { value: "Alta", label: "Alta" },
  { value: "Media", label: "Media" },
  { value: "Baja", label: "Baja" },
];

interface PracticasFiltrosProps {
  filtros: PracticaFiltros;
  onChange: (f: PracticaFiltros) => void;
  onLimpiar: () => void;
}

export function PracticasFiltros({
  filtros,
  onChange,
  onLimpiar,
}: PracticasFiltrosProps) {
  const [searchInput, setSearchInput] = useState(filtros.search ?? "");
  const [debounced] = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    if (debounced !== filtros.search) {
      onChange({ ...filtros, search: debounced, page: 1 });
    }
    // onChange and filtros are stable references from parent;
    // including them would cause infinite re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const { data: provinciasData } = useQuery({
    queryKey: queryKeys.provincias.list,
    queryFn: async () => {
      const res = await apiClient.get("/publico/provincias");
      return extractData<Provincia[]>(res);
    },
    staleTime: Infinity,
  });

  const opcionesProvincias = [
    { value: "", label: "Todas las provincias" },
    ...(provinciasData ?? []).map((p) => ({
      value: p.id,
      label: p.nombre,
    })),
  ];

  const hayFiltros =
    !!filtros.search ||
    !!filtros.provincia_id ||
    !!filtros.replicabilidad ||
    !!filtros.es_destacada;

  return (
    <Paper
      p="md"
      mb="md"
      radius="md"
      style={{
        border: "1px solid var(--mantine-color-gray-3)",
        background: "var(--mantine-color-gray-0)",
      }}
    >
      <Group gap="sm" wrap="wrap" align="center">
        <TextInput
          placeholder="Buscar por título o descripción..."
          leftSection={<IconSearch size={15} />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.currentTarget.value)}
          style={{ flex: 1, minWidth: 200 }}
          size="sm"
        />

        <Select
          placeholder="Provincia"
          data={opcionesProvincias}
          value={filtros.provincia_id ?? ""}
          onChange={(val) =>
            onChange({
              ...filtros,
              provincia_id: val ?? "",
              page: 1,
            })
          }
          w={160}
          size="sm"
          searchable
        />

        <Select
          placeholder="Replicabilidad"
          data={OPCIONES_REPLICABILIDAD}
          value={filtros.replicabilidad ?? ""}
          onChange={(val) =>
            onChange({
              ...filtros,
              replicabilidad: val as PracticaFiltros["replicabilidad"],
              page: 1,
            })
          }
          w={140}
          size="sm"
        />

        <Switch
          label="Solo destacadas"
          checked={!!filtros.es_destacada}
          onChange={(e) =>
            onChange({
              ...filtros,
              es_destacada: e.currentTarget.checked ? true : undefined,
              page: 1,
            })
          }
          size="sm"
        />

        {hayFiltros && (
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconX size={14} />}
            onClick={() => {
              setSearchInput("");
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
