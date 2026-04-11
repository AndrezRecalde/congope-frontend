'use client'

import { useState }   from 'react';
import {
  Stack, Textarea, Button, Group,
  Text, Alert,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { EstrellaRating } from './EstrellaRating';
import type { BuenaPractica } from '@/services/axios';
import {
  useValorarPractica,
  useEliminarValoracion,
} from '@/queries/practicas.queries';

interface ValoracionModalProps {
  practica:  BuenaPractica;
  onCerrar:  () => void;
}

export function ValoracionModal({
  practica,
  onCerrar,
}: ValoracionModalProps) {
  const valoracionPrevia = practica.mi_valoracion;
  const [puntuacion, setPuntuacion] = useState(
    valoracionPrevia?.puntuacion ?? 0
  );
  const [comentario, setComentario] = useState(
    valoracionPrevia?.comentario ?? ''
  );

  const { mutate: valorar, isPending: valorando } =
    useValorarPractica(practica.id);
  const { mutate: eliminarValoracion, isPending: eliminando } =
    useEliminarValoracion(practica.id);

  const handleGuardar = () => {
    if (puntuacion === 0) return;
    valorar(
      {
        puntuacion,
        comentario: comentario.trim() || null,
      },
      { onSuccess: onCerrar }
    );
  };

  const handleEliminar = () => {
    eliminarValoracion(undefined, { onSuccess: onCerrar });
  };

  return (
    <Stack gap="md">
      <Stack gap="xs">
        <Text size="sm" fw={500}>Tu puntuación</Text>
        <EstrellaRating
          valor={puntuacion}
          onChange={setPuntuacion}
          size={28}
        />
        {puntuacion === 0 && (
          <Text size="xs" c="red">
            Selecciona una puntuación del 1 al 5
          </Text>
        )}
      </Stack>

      <Textarea
        label="Comentario (opcional)"
        placeholder="¿Por qué esta puntuación? ¿Sería aplicable en tu provincia?"
        value={comentario}
        onChange={(e) => setComentario(e.currentTarget.value)}
        maxLength={500}
        rows={3}
        description={`${comentario.length}/500 caracteres`}
      />

      {valoracionPrevia && (
        <Alert
          icon={<IconInfoCircle size={14} />}
          color="blue"
          variant="light"
          py="xs"
        >
          <Text size="xs">
            Ya tienes una valoración registrada
            ({valoracionPrevia.puntuacion}★). Al guardar
            se actualizará.
          </Text>
        </Alert>
      )}

      <Group justify="space-between">
        {valoracionPrevia && (
          <Button
            variant="subtle"
            color="red"
            size="sm"
            onClick={handleEliminar}
            loading={eliminando}
          >
            Eliminar valoración
          </Button>
        )}
        <Group gap="sm" ml="auto">
          <Button
            variant="subtle"
            color="gray"
            onClick={onCerrar}
            disabled={valorando || eliminando}
          >
            Cancelar
          </Button>
          <Button
            color="congope"
            onClick={handleGuardar}
            loading={valorando}
            disabled={puntuacion === 0}
          >
            {valoracionPrevia ? 'Actualizar valoración' : 'Guardar valoración'}
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
