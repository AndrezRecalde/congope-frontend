'use client'

import {
  Paper, Stack, Group, Text, Badge,
  ActionIcon, Tooltip, Anchor, Button,
} from '@mantine/core';
import {
  IconStar, IconStarFilled, IconEdit,
  IconTrash, IconMapPin, IconEye,
} from '@tabler/icons-react';
import Link from 'next/link';
import { EstrellaRating } from './EstrellaRating';
import { formatFecha } from '@/utils/formatters';
import {
  COLOR_REPLICABILIDAD,
} from '@/types/practica.types';
import type { BuenaPractica } from '@/services/axios';

interface PracticaCardProps {
  practica:        BuenaPractica;
  onEditar:        (p: BuenaPractica) => void;
  onEliminar:      (p: BuenaPractica) => void;
  onDestacar:      (p: BuenaPractica) => void;
  onValorar:       (p: BuenaPractica) => void;
  puedeEditar:     boolean;
  puedeEliminar:   boolean;
  puedeDestacar:   boolean;
  puedeValorar:    boolean;
  destacandoId?:   string | null; // ID del que está siendo destacado
}

export function PracticaCard({
  practica,
  onEditar,
  onEliminar,
  onDestacar,
  onValorar,
  puedeEditar,
  puedeEliminar,
  puedeDestacar,
  puedeValorar,
  destacandoId,
}: PracticaCardProps) {
  const calificacion = parseFloat(
    practica.calificacion_promedio ?? '0'
  );
  const yaValoro = !!practica.mi_valoracion;
  const isDestacada = practica.es_destacada === true || String(practica.es_destacada) === '1' || String(practica.es_destacada).toLowerCase() === 'true';

  return (
    <Paper
      p="lg"
      radius="lg"
      style={{
        border: isDestacada
          ? '2px solid #F59E0B'
          : '1px solid var(--mantine-color-gray-3)',
        background: isDestacada
          ? '#FFFBEB'
          : 'white',
        transition: 'box-shadow 200ms ease',
      }}
    >
      <Stack gap="sm">
        {/* Cabecera: badges y acciones */}
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="wrap">
            {isDestacada && (
              <Badge
                leftSection={<IconStarFilled size={10} />}
                color="yellow"
                variant="filled"
                size="xs"
              >
                Destacada
              </Badge>
            )}
            <Badge
              color={
                COLOR_REPLICABILIDAD[practica.replicabilidad]
              }
              variant="light"
              size="xs"
            >
              {practica.replicabilidad}
            </Badge>
          </Group>

          <Group gap={4} wrap="nowrap">
            {puedeDestacar && (
              <Tooltip
                label={
                  isDestacada
                    ? 'Quitar destacado'
                    : 'Marcar como destacada'
                }
              >
                <ActionIcon
                  variant="subtle"
                  color={isDestacada ? 'yellow' : 'gray'}
                  size="sm"
                  loading={destacandoId === practica.id}
                  onClick={(e) => { e.preventDefault(); onDestacar(practica); }}
                >
                  {isDestacada ? (
                    <IconStarFilled size={15} />
                  ) : (
                    <IconStar size={15} />
                  )}
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label="Ver detalle">
              <ActionIcon
                component={Link}
                href={`/buenas-practicas/${practica.id}`}
                variant="subtle"
                color="gray"
                size="sm"
              >
                <IconEye size={15} />
              </ActionIcon>
            </Tooltip>
            {puedeEditar && (
              <Tooltip label="Editar">
                <ActionIcon
                  variant="subtle"
                  color="congope"
                  size="sm"
                  onClick={() => onEditar(practica)}
                >
                  <IconEdit size={15} />
                </ActionIcon>
              </Tooltip>
            )}
            {puedeEliminar && (
              <Tooltip label="Eliminar">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => onEliminar(practica)}
                >
                  <IconTrash size={15} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>

        {/* Título */}
        <Anchor
          component={Link}
          href={`/buenas-practicas/${practica.id}`}
          fw={600}
          size="sm"
          c="gray.9"
          style={{ textDecoration: 'none' }}
          lineClamp={2}
        >
          {practica.titulo}
        </Anchor>

        {/* Descripción del problema (truncada) */}
        <Text size="xs" c="dimmed" lineClamp={3} lh={1.5}>
          {practica.descripcion_problema}
        </Text>

        {/* Provincia */}
        {practica.provincia && (
          <Group gap={4}>
            <IconMapPin
              size={12}
              color="var(--mantine-color-gray-5)"
            />
            <Text size="xs" c="dimmed">
              {practica.provincia.nombre}
            </Text>
          </Group>
        )}

        {/* Separador */}
        <div
          style={{
            borderTop: '1px solid var(--mantine-color-gray-2)',
            paddingTop: 8,
          }}
        >
          <Group justify="space-between" align="center">
            {/* Calificación promedio */}
            <Group gap="xs">
              <EstrellaRating
                valor={calificacion}
                readonly
                size={14}
              />
              {calificacion > 0 && (
                <Text size="xs" c="dimmed">
                  {calificacion.toFixed(1)}
                </Text>
              )}
            </Group>

            {/* Botón valorar */}
            {puedeValorar && (
              <Button
                size="xs"
                variant={yaValoro ? 'light' : 'subtle'}
                color={yaValoro ? 'teal' : 'gray'}
                onClick={() => onValorar(practica)}
              >
                {yaValoro
                  ? `Mi valoración: ${practica.mi_valoracion!.puntuacion}★`
                  : 'Valorar'}
              </Button>
            )}
          </Group>
        </div>

        {/* Metadata */}
        <Text size="xs" c="dimmed">
          Registrado por {practica.registrado_por?.name ?? '—'} ·{' '}
          {formatFecha(practica.created_at)}
        </Text>
      </Stack>
    </Paper>
  );
}
