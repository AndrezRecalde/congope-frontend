"use client";

import { Group, TextInput, Select, Button, Paper } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useState } from "react";
import type { ActorFiltros } from "@/types/actor.types";

const OPCIONES_TIPO = [
  { value: "", label: "Todos los tipos" },
  { value: "ONG", label: "ONG" },
  { value: "Multilateral", label: "Multilateral" },
  { value: "Embajada", label: "Embajada" },
  { value: "Bilateral", label: "Bilateral" },
  { value: "Privado", label: "Privado" },
  { value: "Academia", label: "Academia" },
];

const OPCIONES_ESTADO = [
  { value: "", label: "Todos los estados" },
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
  { value: "Potencial", label: "Potencial" },
];

interface ActoresFiltrosProps {
  filtros: ActorFiltros;
  onChange: (filtros: ActorFiltros) => void;
  onLimpiar: () => void;
}

export function ActoresFiltros({
  filtros,
  onChange,
  onLimpiar,
}: ActoresFiltrosProps) {
  // Input de búsqueda con debounce de 400ms
  // para no lanzar una request por cada tecla
  const [searchInput, setSearchInput] = useState(filtros.search ?? "");
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    if (debouncedSearch !== filtros.search) {
      onChange({ ...filtros, search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, filtros, onChange]);

  const hayFiltrosActivos =
    !!filtros.search || !!filtros.tipo || !!filtros.estado;

  return (
    <Paper p="md" mb="md" radius="md">
      <Group gap="sm" wrap="wrap">
        <TextInput
          placeholder="Buscar por nombre o país..."
          leftSection={<IconSearch size={15} />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.currentTarget.value)}
          style={{ flex: 1, minWidth: 220 }}
          size="sm"
        />

        <Select
          placeholder="Tipo de actor"
          data={OPCIONES_TIPO}
          value={filtros.tipo ?? ""}
          onChange={(val) =>
            onChange({ ...filtros, tipo: val as ActorFiltros["tipo"], page: 1 })
          }
          w={160}
          size="sm"
          clearable={false}
        />

        <Select
          placeholder="Estado"
          data={OPCIONES_ESTADO}
          value={filtros.estado ?? ""}
          onChange={(val) =>
            onChange({
              ...filtros,
              estado: val as ActorFiltros["estado"],
              page: 1,
            })
          }
          w={160}
          size="sm"
          clearable={false}
        />

        {hayFiltrosActivos && (
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
