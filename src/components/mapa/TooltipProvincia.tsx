'use client'

import { Paper, Text, Stack, Group, Badge, Divider } from
  '@mantine/core';
import type { ProvinciaMapaData } from '@/types/mapa.types';

interface TooltipProvinciaProps {
  datos:     ProvinciaMapaData;
  posicion:  { x: number; y: number };
}

export function TooltipProvincia({
  datos,
  posicion,
}: TooltipProvinciaProps) {
  // Compensar el tooltip para que no tape el cursor
  const offsetX = posicion.x > window.innerWidth - 220
    ? -210 : 16;
  const offsetY = posicion.y > window.innerHeight - 200
    ? -180 : 16;

  return (
    <Paper
      p="md"
      radius="md"
      shadow="lg"
      style={{
        position:    'absolute',
        left:        posicion.x + offsetX,
        top:         posicion.y + offsetY,
        zIndex:      1000,
        minWidth:    200,
        maxWidth:    240,
        pointerEvents: 'none', // No interceptar eventos del mapa
        border: '1px solid var(--mantine-color-gray-3)',
      }}
    >
      <Stack gap="xs">
        <Text fw={700} size="sm" c="congope.8">
          {datos.nombre}
        </Text>

        <Group justify="space-between">
          <Text size="xs" c="dimmed">Total proyectos</Text>
          <Badge color="congope" variant="light" size="sm">
            {datos.proyectos_count}
          </Badge>
        </Group>

        {datos.proyectos_count > 0 && (
          <>
            <Divider />
            <Stack gap={4}>
              {datos.estados.en_ejecucion > 0 && (
                <Group justify="space-between">
                  <Text size="xs" c="blue.6">
                    En ejecución
                  </Text>
                  <Text size="xs" fw={600}>
                    {datos.estados.en_ejecucion}
                  </Text>
                </Group>
              )}
              {datos.estados.en_gestion > 0 && (
                <Group justify="space-between">
                  <Text size="xs" c="yellow.7">
                    En gestión
                  </Text>
                  <Text size="xs" fw={600}>
                    {datos.estados.en_gestion}
                  </Text>
                </Group>
              )}
              {datos.estados.finalizado > 0 && (
                <Group justify="space-between">
                  <Text size="xs" c="green.7">
                    Finalizados
                  </Text>
                  <Text size="xs" fw={600}>
                    {datos.estados.finalizado}
                  </Text>
                </Group>
              )}
              {datos.monto_total > 0 && (
                <>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Inversión total
                    </Text>
                    <Text size="xs" fw={600} c="congope.8">
                      {datos.monto_formateado}
                    </Text>
                  </Group>
                </>
              )}
            </Stack>
          </>
        )}

        {datos.proyectos_count === 0 && (
          <Text size="xs" c="dimmed" fs="italic">
            Sin proyectos registrados
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
