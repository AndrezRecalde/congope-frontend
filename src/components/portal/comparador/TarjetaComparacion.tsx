'use client'

import { Card, Group, Text, Badge, ThemeIcon, Stack, Divider, Box } from '@mantine/core';
import { 
  IconFolderOpen, 
  IconPlayerPlay, 
  IconCheck, 
  IconCoin, 
  IconUsers, 
  IconTrophy, 
  IconBulb 
} from '@tabler/icons-react';
import type { EstadisticasProvincia } from '@/types/comparador.types';

interface TarjetaComparacionProps {
  provincia: EstadisticasProvincia;
  color:     string;
  index:     number;
}

export function TarjetaComparacion({
  provincia,
  color,
  index,
}: TarjetaComparacionProps) {
  const kpis = [
    {
      etiqueta: 'Total proyectos',
      valor:    provincia.proyectos.total,
      icono:    <IconFolderOpen size={16} />,
    },
    {
      etiqueta: 'En ejecución',
      valor:    provincia.proyectos.en_ejecucion,
      icono:    <IconPlayerPlay size={16} />,
    },
    {
      etiqueta: 'Finalizados',
      valor:    provincia.proyectos.finalizado,
      icono:    <IconCheck size={16} />,
    },
    {
      etiqueta: 'Inversión',
      valor:    provincia.monto_formateado,
      icono:    <IconCoin size={16} />,
    },
    {
      etiqueta: 'Actores',
      valor:    provincia.actores_count,
      icono:    <IconUsers size={16} />,
    },
    {
      etiqueta: 'Emblemáticos',
      valor:    provincia.emblematicos_count,
      icono:    <IconTrophy size={16} />,
    },
    {
      etiqueta: 'Buenas Prácticas',
      valor:    provincia.practicas_count,
      icono:    <IconBulb size={16} />,
    },
  ];

  return (
    <Card radius="xl" p={0} withBorder shadow="sm">
      {/* Header */}
      <Box p="lg" style={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
        borderBottom: `3px solid ${color}`,
      }}>
        <Group wrap="nowrap" mb={4}>
          <ThemeIcon size={28} radius="xl" style={{ background: color, color: 'white' }}>
            <Text fw={700} size="sm">{index + 1}</Text>
          </ThemeIcon>
          <Text
            fw={700}
            size="xl"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--portal-navy)', lineHeight: 1.2 }}
          >
            {provincia.nombre}
          </Text>
        </Group>
        <Text size="xs" c="dimmed" mt="xs">
          Capital: {provincia.capital} {' · '} Código: {provincia.codigo}
        </Text>
      </Box>

      {/* KPIs */}
      <Stack gap={0} p="lg">
        {kpis.map((kpi, i) => (
          <Box key={kpi.etiqueta}>
            <Group justify="space-between" py="sm">
              <Group gap="xs">
                <Text c="dimmed" display="flex" style={{ alignItems: 'center' }}>{kpi.icono}</Text>
                <Text size="sm" c="dimmed">{kpi.etiqueta}</Text>
              </Group>
              <Text size="sm" fw={700} style={{ color }}>{kpi.valor}</Text>
            </Group>
            {i < kpis.length - 1 && <Divider color="gray.1" />}
          </Box>
        ))}

        {provincia.sectores_top.length > 0 && (
          <Box mt="md">
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb="xs" style={{ letterSpacing: '0.06em' }}>
              Sectores principales
            </Text>
            <Group gap="xs">
              {provincia.sectores_top.map((s) => (
                <Badge
                  key={s.sector}
                  variant="light"
                  color={color}
                  style={{ backgroundColor: `${color}15` }}
                >
                  {s.sector} ({s.total})
                </Badge>
              ))}
            </Group>
          </Box>
        )}
      </Stack>
    </Card>
  );
}
