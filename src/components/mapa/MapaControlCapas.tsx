'use client'

import { Paper, Stack, Switch, Text } from '@mantine/core';

interface MapaControlCapasProps {
  mostrarProvincias:   boolean;
  mostrarPines:        boolean;
  onToggleProvincias:  () => void;
  onTogglePines:       () => void;
}

export function MapaControlCapas({
  mostrarProvincias,
  mostrarPines,
  onToggleProvincias,
  onTogglePines,
}: MapaControlCapasProps) {
  return (
    <Paper
      p="sm"
      radius="md"
      shadow="sm"
      style={{
        position:  'absolute',
        bottom:    48,
        left:      16,
        zIndex:    10,
        border:    '1px solid var(--mantine-color-gray-3)',
        background:'rgba(255,255,255,0.95)',
      }}
    >
      <Stack gap="xs">
        <Text size="xs" fw={600} c="dimmed" tt="uppercase"
          style={{ letterSpacing: '0.05em' }}>
          Capas
        </Text>
        <Switch
          label="Provincias"
          size="xs"
          checked={mostrarProvincias}
          onChange={onToggleProvincias}
          color="congope"
        />
        <Switch
          label="Pines de proyectos"
          size="xs"
          checked={mostrarPines}
          onChange={onTogglePines}
          color="congope"
        />
      </Stack>
    </Paper>
  );
}
