"use client";

import { Group, TextInput, Select, Button, Paper, Switch } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import apiClient, { extractData } from "@/services/axios";
import type { Provincia } from "@/services/axios";
import type { EmblematicoFiltros } from "@/types/emblematico.types";

interface EmblematicoFiltrosProps {
  filtros: EmblematicoFiltros;
  onChange: (f: EmblematicoFiltros) => void;
  onLimpiar: () => void;
}

export function EmblematicosFiltros({
  filtros,
  onChange,
  onLimpiar,
}: EmblematicoFiltrosProps) {
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
    filtros.es_publico !== undefined;

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
          style={{ flex: 1, minWidth: 220 }}
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
          w={170}
          size="sm"
          searchable
        />
        <Switch
          label="Solo públicos"
          checked={!!filtros.es_publico}
          onChange={(e) =>
            onChange({
              ...filtros,
              es_publico: e.currentTarget.checked ? true : undefined,
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
