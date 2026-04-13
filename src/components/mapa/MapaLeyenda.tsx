'use client'

import { Paper, Stack, Text, Group, Box, Divider }
  from '@mantine/core';
import { COLOR_PIN_ESTADO } from '@/types/mapa.types';

export function MapaLeyenda() {
  return (
    <Paper
      p="sm"
      radius="md"
      shadow="sm"
      style={{
        position:  'absolute',
        bottom:    48,  // Encima de los controles de MapLibre
        right:     16,
        zIndex:    10,
        minWidth:  160,
        border:    '1px solid var(--mantine-color-gray-3)',
        background:'rgba(255,255,255,0.95)',
      }}
    >
      <Stack gap="xs">
        {/* Pines por estado */}
        <Text size="xs" fw={600} c="dimmed" tt="uppercase"
          style={{ letterSpacing: '0.05em' }}>
          Estado del proyecto
        </Text>
        {Object.entries(COLOR_PIN_ESTADO).map(
          ([estado, color]) => (
            <Group key={estado} gap="xs">
              <Box
                style={{
                  width:        10,
                  height:       10,
                  borderRadius: '50%',
                  background:   color,
                  border:       '1.5px solid white',
                  boxShadow:    '0 1px 3px rgba(0,0,0,0.2)',
                  flexShrink:   0,
                }}
              />
              <Text size="xs">{estado}</Text>
            </Group>
          )
        )}

        <Divider my={4} />

        {/* Intensidad de provincias */}
        <Text size="xs" fw={600} c="dimmed" tt="uppercase"
          style={{ letterSpacing: '0.05em' }}>
          Proyectos por provincia
        </Text>
        <Stack gap={4}>
          {[
            { color: '#1A3A5C', label: 'Muchos' },
            { color: '#2E6DA4', label: 'Varios' },
            { color: '#93C5FD', label: 'Pocos' },
            { color: '#DBEAFE', label: 'Uno' },
            { color: '#E5E7EB', label: 'Ninguno' },
          ].map(({ color, label }) => (
            <Group key={label} gap="xs">
              <Box
                style={{
                  width:        10,
                  height:       10,
                  borderRadius: 2,
                  background:   color,
                  flexShrink:   0,
                }}
              />
              <Text size="xs">{label}</Text>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
