'use client'

import {
  Stack, TextInput, Select, Textarea, FileInput,
  Button, Group, TagsInput, Divider, Text,
  SimpleGrid,
} from '@mantine/core';
import { useForm, isNotEmpty, isEmail } from '@mantine/form';
import type { ActorCooperacion, CreateActorDto }
  from '@/services/axios';
import type { ActorFormValues } from '@/types/actor.types';

// Opciones para los selects
const TIPOS_ACTOR = [
  { value: 'ONG',          label: 'ONG' },
  { value: 'Multilateral', label: 'Multilateral' },
  { value: 'Embajada',     label: 'Embajada' },
  { value: 'Bilateral',    label: 'Bilateral' },
  { value: 'Privado',      label: 'Privado' },
  { value: 'Academia',     label: 'Academia' },
];

const ESTADOS_ACTOR = [
  { value: 'Activo',    label: 'Activo' },
  { value: 'Inactivo',  label: 'Inactivo' },
  { value: 'Potencial', label: 'Potencial' },
];

interface ActorFormProps {
  actor?:      ActorCooperacion; // Si se pasa, modo edición
  onSubmit:    (datos: CreateActorDto) => void;
  onCancel:    () => void;
  isLoading?:  boolean;
}

export function ActorForm({
  actor,
  onSubmit,
  onCancel,
  isLoading = false,
}: ActorFormProps) {
  const esEdicion = !!actor;

  const form = useForm<ActorFormValues>({
    initialValues: {
      identificador_institucional: actor?.identificador_institucional ?? '',
      nombre:            actor?.nombre            ?? '',
      logo:              null,
      tipo:              actor?.tipo              ?? '',
      pais_origen:       actor?.pais_origen       ?? '',
      estado:            actor?.estado            ?? 'Activo',
      contacto_nombre:   actor?.contacto_nombre   ?? '',
      contacto_email:    actor?.contacto_email    ?? '',
      contacto_telefono: actor?.contacto_telefono ?? '',
      sitio_web:         actor?.sitio_web         ?? '',
      notas:             actor?.notas             ?? '',
      // areas_tematicas es string[] según el OpenAPI
      areas_tematicas:   actor?.areas_tematicas   ?? [],
    },
    validate: {
      nombre: isNotEmpty('El nombre es requerido'),
      tipo:   isNotEmpty('Selecciona el tipo de actor'),
      pais_origen: isNotEmpty('El país de origen es requerido'),
      contacto_email: (value) =>
        value && value.length > 0
          ? isEmail('Ingresa un email válido')(value)
          : null,
      sitio_web: (value) => {
        if (!value || value.length === 0) return null;
        try {
          new URL(value);
          return null;
        } catch {
          return 'Ingresa una URL válida (ej: https://ejemplo.com)';
        }
      },
    },
  });

  const handleSubmit = (values: ActorFormValues) => {
    // Construir el DTO limpiando campos vacíos opcionales
    const dto: CreateActorDto = {
      identificador_institucional: values.identificador_institucional || null,
      nombre:      values.nombre,
      logo:        values.logo,
      tipo:        values.tipo as CreateActorDto['tipo'],
      pais_origen: values.pais_origen,
      estado:      values.estado,
      // Campos opcionales: enviar null si están vacíos
      contacto_nombre:
        values.contacto_nombre || null,
      contacto_email:
        values.contacto_email || null,
      contacto_telefono:
        values.contacto_telefono || null,
      sitio_web:
        values.sitio_web || null,
      notas:
        values.notas || null,
      // areas_tematicas: enviar solo si hay elementos
      areas_tematicas:
        values.areas_tematicas.length > 0
          ? values.areas_tematicas
          : undefined,
    };
    onSubmit(dto);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">

        {/* Datos principales */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput
            label="Identificador Institucional"
            placeholder="Ej: 1768153530001"
            maxLength={25}
            {...form.getInputProps('identificador_institucional')}
          />
          <TextInput
            label="Nombre del actor"
            placeholder="Ej: Banco Interamericano de Desarrollo (BID)"
            withAsterisk
            {...form.getInputProps('nombre')}
          />
        </SimpleGrid>

        <FileInput
          label="Logo del actor"
          placeholder={esEdicion && actor?.logo ? 'Subir nuevo logo para reemplazar el actual' : 'Subir imagen (máx 2MB)'}
          accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
          clearable
          {...form.getInputProps('logo')}
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Select
            label="Tipo de actor"
            placeholder="Seleccionar tipo"
            data={TIPOS_ACTOR}
            withAsterisk
            {...form.getInputProps('tipo')}
          />
          <Select
            label="Estado"
            data={ESTADOS_ACTOR}
            {...form.getInputProps('estado')}
          />
        </SimpleGrid>

        <TextInput
          label="País de origen"
          placeholder="Ej: Estados Unidos, Alemania"
          withAsterisk
          {...form.getInputProps('pais_origen')}
        />

        <Divider
          label={
            <Text size="xs" fw={600} c="dimmed" tt="uppercase">
              Información de contacto
            </Text>
          }
          labelPosition="left"
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput
            label="Nombre del contacto"
            placeholder="Nombre completo"
            {...form.getInputProps('contacto_nombre')}
          />
          <TextInput
            label="Email del contacto"
            placeholder="contacto@organizacion.org"
            {...form.getInputProps('contacto_email')}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput
            label="Teléfono"
            placeholder="+1 202 555 0199"
            {...form.getInputProps('contacto_telefono')}
          />
          <TextInput
            label="Sitio web"
            placeholder="https://www.organizacion.org"
            {...form.getInputProps('sitio_web')}
          />
        </SimpleGrid>

        <Divider
          label={
            <Text size="xs" fw={600} c="dimmed" tt="uppercase">
              Áreas temáticas y notas
            </Text>
          }
          labelPosition="left"
        />

        {/*
          TagsInput de Mantine para las áreas temáticas.
          areas_tematicas es string[] según el OpenAPI.
          El usuario puede escribir y presionar Enter para agregar.
        */}
        <TagsInput
          label="Áreas temáticas"
          placeholder="Escribe un área y presiona Enter"
          description="Ej: Agricultura, Desarrollo Sostenible, Innovación"
          {...form.getInputProps('areas_tematicas')}
          clearable
        />

        <Textarea
          label="Notas adicionales"
          placeholder="Información adicional relevante sobre el actor..."
          rows={3}
          {...form.getInputProps('notas')}
        />

        {/* Botones de acción */}
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
            loading={isLoading}
          >
            {esEdicion ? 'Guardar cambios' : 'Crear actor'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
