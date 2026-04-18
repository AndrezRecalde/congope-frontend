"use client";

import { Group, TextInput, Select, Button, Paper } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useState } from "react";
import type { RedFiltros } from "@/types/red.types";

const OPCIONES_TIPO = [
  { value: "", label: "Todos los tipos" },
  { value: "Regional", label: "Regional" },
  { value: "Nacional", label: "Nacional" },
  { value: "Internacional", label: "Internacional" },
  { value: "Temática", label: "Temática" },
];

const OPCIONES_ROL = [
  { value: "", label: "Todos los roles" },
  { value: "Miembro", label: "Miembro" },
  { value: "Coordinador", label: "Coordinador" },
  { value: "Observador", label: "Observador" },
];

interface RedesFiltrosProps {
  filtros: RedFiltros;
  onChange: (f: RedFiltros) => void;
  onLimpiar: () => void;
}

export function RedesFiltros({
  filtros,
  onChange,
  onLimpiar,
}: RedesFiltrosProps) {
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

  const hayFiltros =
    !!filtros.search || !!filtros.tipo || !!filtros.rol_congope;

  return (
    <Paper p="md" mb="md" radius="md">
      <Group gap="sm" wrap="wrap">
        <TextInput
          placeholder="Buscar por nombre u objetivo..."
          leftSection={<IconSearch size={15} />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.currentTarget.value)}
          style={{ flex: 1, minWidth: 220 }}
          size="sm"
        />
        <Select
          placeholder="Tipo de red"
          data={OPCIONES_TIPO}
          value={filtros.tipo ?? ""}
          onChange={(val) =>
            onChange({
              ...filtros,
              tipo: val as RedFiltros["tipo"],
              page: 1,
            })
          }
          w={160}
          size="sm"
        />
        <Select
          placeholder="Rol de CONGOPE"
          data={OPCIONES_ROL}
          value={filtros.rol_congope ?? ""}
          onChange={(val) =>
            onChange({
              ...filtros,
              rol_congope: val as RedFiltros["rol_congope"],
              page: 1,
            })
          }
          w={160}
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
