'use client'

import { Tooltip, Badge, Group, Text, ThemeIcon, Stack } from '@mantine/core';
import {
  IconCircleCheck,
  IconAlertTriangle,
  IconAlertOctagon,
  IconMinus,
} from '@tabler/icons-react';
import type {
  ResultadoRiesgo,
  DatosRiesgo,
} from '@/utils/riesgo';
import { calcularRiesgo } from '@/utils/riesgo';

// Mapeo de nombre de ícono al componente
const ICONOS: Record<string, React.ComponentType<{
  size?: number; color?: string;
}>> = {
  IconCircleCheck:  IconCircleCheck,
  IconAlertTriangle:IconAlertTriangle,
  IconAlertOctagon: IconAlertOctagon,
  IconMinus:        IconMinus,
};

interface RiesgoBadgeProps {
  datos:    DatosRiesgo;
  variante?:'badge' | 'detalle';
  // Si ya tienes el resultado calculado, pásalo
  // para evitar recalcular en listas largas
  resultado?: ResultadoRiesgo;
}

export function RiesgoBadge({
  datos,
  variante = 'badge',
  resultado: resultadoProp,
}: RiesgoBadgeProps) {
  const resultado = resultadoProp
    ?? calcularRiesgo(datos);

  const Icono = ICONOS[resultado.icono]
    ?? IconMinus;

  if (variante === 'badge') {
    // ── Variante compacta para tabla y Kanban ──
    return (
      <Tooltip
        label={resultado.descripcion}
        position="top"
        withArrow
      >
        <Badge
          size="sm"
          variant="light"
          style={{
            background: resultado.colorFondo,
            color:      resultado.color,
            border:     `1px solid ${resultado.color}30`,
            cursor:     'default',
            textTransform: 'none',
          }}
          leftSection={
            <Icono size={11} color={resultado.color} />
          }
        >
          {resultado.etiqueta}
        </Badge>
      </Tooltip>
    );
  }

  // ── Variante expandida para cabecera del detalle ──
  return (
    <Tooltip
      label={resultado.descripcion}
      position="bottom"
      withArrow
      multiline
      w={220}
    >
      <Group
        gap="xs"
        style={{
          background:   resultado.colorFondo,
          border:       `1px solid ${resultado.color}40`,
          borderRadius: 8,
          padding:      '6px 12px',
          cursor:       'default',
        }}
      >
        <ThemeIcon
          size={22}
          radius="xl"
          style={{
            background: resultado.color + '20',
            color:      resultado.color,
          }}
          variant="light"
        >
          <Icono size={13} />
        </ThemeIcon>
        <Stack gap={0}>
          <Text
            size="xs"
            fw={700}
            style={{ color: resultado.color }}
          >
            {resultado.etiqueta}
          </Text>
          <Text size="xs" c="dimmed" lh={1.2}>
            {resultado.descripcion}
          </Text>
        </Stack>
      </Group>
    </Tooltip>
  );
}
