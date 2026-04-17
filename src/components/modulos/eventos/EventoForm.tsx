'use client'

import { useState } from 'react';
import {
  Stack, TextInput, Select, Textarea,
  Switch, Button, Group,
  Collapse, LoadingOverlay, Box,
} from '@mantine/core';
import { useForm, isNotEmpty } from '@mantine/form';
import type { Evento }     from '@/services/axios';
import type { TipoEvento } from '@/services/axios';
import type {
  EventoFormValues,
} from '@/types/evento.types';
import type { CreateEventoDto }
  from '@/services/eventos.service';

const TIPOS_EVENTO = [
  { value: 'Misión técnica',    label: 'Misión técnica' },
  { value: 'Reunión bilateral', label: 'Reunión bilateral' },
  { value: 'Conferencia',       label: 'Conferencia' },
  { value: 'Visita de campo',   label: 'Visita de campo' },
  { value: 'Virtual',           label: 'Virtual' },
  { value: 'Otro',              label: 'Otro' },
];

interface EventoFormProps {
  evento?:    Evento;
  onSubmit:   (datos: CreateEventoDto) => Promise<void> | void;
  onCancel:   () => void;
  isLoading?: boolean;
}

// Helper: convierte "DD/MM/YYYY" a "YYYY-MM-DD"
// para el input type=date
function fechaApiAInput(fecha: string): string {
  if (!fecha) return '';
  // Formato del API: "20/08/2026"
  const partes = fecha.split('/');
  if (partes.length !== 3) return '';
  const [dia, mes, anio] = partes;
  return `${anio}-${mes}-${dia}`;
}

export function EventoForm({
  evento,
  onSubmit,
  onCancel,
  isLoading = false,
}: EventoFormProps) {
  const esEdicion = !!evento;

  const form = useForm<EventoFormValues>({
    initialValues: {
      titulo:       evento?.titulo       ?? '',
      tipo_evento:  (evento?.tipo_evento as TipoEvento) ?? '' as TipoEvento,
      // fecha_evento del API: "DD/MM/YYYY"
      // el input type=date necesita "YYYY-MM-DD"
      fecha_evento: evento?.fecha_evento
        ? fechaApiAInput(evento.fecha_evento)
        : '',
      lugar:        evento?.lugar        ?? '',
      es_virtual:   evento?.es_virtual   ?? false,
      url_virtual:  evento?.url_virtual  ?? '',
      descripcion:  evento?.descripcion  ?? '',
    },
    validate: {
      titulo: isNotEmpty('El título es requerido'),
      tipo_evento: isNotEmpty(
        'Selecciona el tipo de evento'
      ),
      fecha_evento: isNotEmpty(
        'La fecha del evento es requerida'
      ),
      // url_virtual requerida si es_virtual=true
      url_virtual: (value, values) => {
        if (!values.es_virtual) return null;
        if (!value || value.trim() === '') {
          return 'La URL es requerida para eventos virtuales';
        }
        try {
          new URL(value);
          return null;
        } catch {
          return 'Ingresa una URL válida';
        }
      },
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: EventoFormValues) => {
    setIsSubmitting(true);
    try {
      const dto: CreateEventoDto = {
        titulo:       values.titulo,
        tipo_evento:  values.tipo_evento,
        // Enviar en formato "YYYY-MM-DD"
        // (el input type=date ya da este formato)
        fecha_evento: values.fecha_evento,
        lugar:        values.lugar       || null,
        es_virtual:   values.es_virtual,
        url_virtual:  values.es_virtual
          ? values.url_virtual || null
          : null,
        descripcion:  values.descripcion || null,
      };
      await onSubmit(dto);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isLoading || isSubmitting} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Título del evento"
            placeholder="Ej: Cumbre Climática de Regiones"
          required
          {...form.getInputProps('titulo')}
        />

        <Group grow align="flex-start">
          <Select
            label="Tipo de evento"
            placeholder="Seleccionar tipo"
            data={TIPOS_EVENTO}
            required
            {...form.getInputProps('tipo_evento')}
          />
          <TextInput
            label="Fecha del evento"
            type="date"
            required
            {...form.getInputProps('fecha_evento')}
          />
        </Group>

        <Switch
          label="Evento virtual"
          description="Reunión en línea (Zoom, Teams, etc.)"
          {...form.getInputProps('es_virtual', {
            type: 'checkbox',
          })}
        />

        {/* URL virtual — solo si es_virtual=true */}
        <Collapse in={form.values.es_virtual}>
          <TextInput
            label="URL de la reunión"
            placeholder="https://zoom.us/j/..."
            type="url"
            {...form.getInputProps('url_virtual')}
          />
        </Collapse>

        {/* Lugar — solo si NO es virtual */}
        <Collapse in={!form.values.es_virtual}>
          <TextInput
            label="Lugar"
            placeholder="Ej: Centro de Convenciones, Quito"
            {...form.getInputProps('lugar')}
          />
        </Collapse>

        <Textarea
          label="Descripción"
          placeholder="Agenda, objetivos o notas del evento..."
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
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            color="congope"
            loading={isLoading || isSubmitting}
          >
            {esEdicion ? 'Guardar cambios' : 'Crear evento'}
          </Button>
        </Group>
      </Stack>
    </form>
    </Box>
  );
}
