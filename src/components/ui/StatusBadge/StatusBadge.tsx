import { Badge, type MantineColor } from '@mantine/core';

interface StatusBadgeProps {
  estado: string;
  tipo?:  'proyecto' | 'actor' | 'generico';
  size?:  'xs' | 'sm' | 'md';
}

const COLORES_PROYECTO: Record<string, MantineColor> = {
  'En gestión':   'yellow',
  'En ejecución': 'blue',
  'Finalizado':   'green',
  'Suspendido':   'red',
};

const COLORES_ACTOR: Record<string, MantineColor> = {
  'Activo':    'teal',
  'Inactivo':  'gray',
  'Potencial': 'orange',
};

export function StatusBadge({
  estado,
  tipo = 'generico',
  size = 'sm',
}: StatusBadgeProps) {
  let color: MantineColor = 'gray';

  if (tipo === 'proyecto') {
    color = COLORES_PROYECTO[estado] ?? 'gray';
  } else if (tipo === 'actor') {
    color = COLORES_ACTOR[estado] ?? 'gray';
  }

  return (
    <Badge
      color={color}
      size={size}
      variant="light"
      radius="sm"
    >
      {estado}
    </Badge>
  );
}
