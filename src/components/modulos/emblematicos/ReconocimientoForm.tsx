'use client'

import { useState } from 'react';

import {
  Stack, TextInput, Select, Textarea,
  Button, Group, NumberInput, Box, LoadingOverlay,
} from '@mantine/core';
import { useForm, isNotEmpty } from '@mantine/form';
import type { Reconocimiento } from '@/services/axios';
import type {
  ReconocimientoFormValues,
} from '@/types/emblematico.types';
import type { CreateReconocimientoDto } from
  '@/services/emblematicos.service';

const AMBITOS = [
  { value: 'Nacional',      label: 'Nacional' },
  { value: 'Internacional', label: 'Internacional' },
];

const ANIO_ACTUAL = new Date().getFullYear();

interface ReconocimientoFormProps {
  reconocimiento?: Reconocimiento;
  onSubmit:        (datos: CreateReconocimientoDto) => Promise<void> | void;
  onCancel:        () => void;
}

export function ReconocimientoForm({
  reconocimiento,
  onSubmit,
  onCancel,
}: ReconocimientoFormProps) {
  const esEdicion = !!reconocimiento;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReconocimientoFormValues>({
    initialValues: {
      titulo:              reconocimiento?.titulo              ?? '',
      organismo_otorgante: reconocimiento?.organismo_otorgante ?? '',
      ambito:              reconocimiento?.ambito              ?? '',
      // anio: integer, min 1990, max 2026 según OpenAPI
      anio:                reconocimiento?.anio ?? ANIO_ACTUAL,
      descripcion:         reconocimiento?.descripcion         ?? '',
    },
    validate: {
      titulo: isNotEmpty('El título es requerido'),
      organismo_otorgante: isNotEmpty(
        'El organismo otorgante es requerido'
      ),
      ambito: isNotEmpty('Selecciona el ámbito'),
      anio: (value) => {
        if (!value && value !== 0)
          return 'El año es requerido';
        if (Number(value) < 1990)
          return 'El año mínimo es 1990';
        if (Number(value) > ANIO_ACTUAL)
          return `El año máximo es ${ANIO_ACTUAL}`;
        return null;
      },
    },
  });

  const handleSubmit = async (
    values: ReconocimientoFormValues
  ) => {
    setIsSubmitting(true);
    const dto: CreateReconocimientoDto = {
      titulo:              values.titulo,
      organismo_otorgante: values.organismo_otorgante,
      ambito:
        values.ambito as CreateReconocimientoDto['ambito'],
      anio:        Number(values.anio),
      descripcion: values.descripcion || null,
    };
    try {
      await onSubmit(dto);
    } catch {
      // Manejado globalmente
    } finally {
      if (typeof window !== 'undefined') {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isSubmitting} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
        <TextInput
          label="Título del reconocimiento"
          placeholder="Ej: Premio a la Sostenibilidad Ambiental 2025"
          required
          {...form.getInputProps('titulo')}
        />

        <TextInput
          label="Organismo otorgante"
          placeholder="Ej: Naciones Unidas - PNUD"
          required
          {...form.getInputProps('organismo_otorgante')}
        />

        <Group grow align="flex-start">
          <Select
            label="Ámbito"
            placeholder="Seleccionar"
            data={AMBITOS}
            required
            {...form.getInputProps('ambito')}
          />
          <NumberInput
            label="Año"
            placeholder={String(ANIO_ACTUAL)}
            required
            min={1990}
            max={ANIO_ACTUAL}
            {...form.getInputProps('anio')}
          />
        </Group>

        <Textarea
          label="Descripción"
          placeholder="Contexto y detalles del reconocimiento..."
          autosize
          minRows={3}
          maxRows={5}
          {...form.getInputProps('descripcion')}
        />

        <Group justify="flex-end" gap="sm" pt="xs">
          <Button
            variant="subtle"
            color="gray"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            color="congope"
            loading={isSubmitting}
          >
            {esEdicion
              ? 'Guardar cambios'
              : 'Agregar reconocimiento'}
          </Button>
        </Group>
      </Stack>
      </form>
    </Box>
  );
}
