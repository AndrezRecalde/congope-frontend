'use client'

import {
  Stack, TextInput, Select, Textarea,
  Button, Group, MultiSelect, Divider, Text,
} from '@mantine/core';
import { useForm, isNotEmpty } from '@mantine/form';
import { useActores } from '@/queries/actores.queries';
import type { Red }   from '@/services/axios';
import type { RedFormValues } from '@/types/red.types';
import type { CreateRedDto } from '@/services/redes.service';

const TIPOS_RED = [
  { value: 'Regional',      label: 'Regional' },
  { value: 'Nacional',      label: 'Nacional' },
  { value: 'Internacional', label: 'Internacional' },
  { value: 'Temática',      label: 'Temática' },
];

const ROLES_CONGOPE = [
  { value: 'Miembro',      label: 'Miembro' },
  { value: 'Coordinador',  label: 'Coordinador' },
  { value: 'Observador',   label: 'Observador' },
];

interface RedFormProps {
  red?:        Red;
  onSubmit:    (datos: CreateRedDto) => void;
  onCancel:    () => void;
  isLoading?:  boolean;
}

export function RedForm({
  red,
  onSubmit,
  onCancel,
  isLoading = false,
}: RedFormProps) {
  const esEdicion = !!red;

  // Actores disponibles para agregar como miembros
  // (solo al crear — al editar se usa el panel de miembros)
  const { data: actoresData } = useActores({ per_page: 100 });
  const opcionesActores = (actoresData?.data ?? []).map((a) => ({
    value: a.id,
    label: `${a.nombre} (${a.tipo} · ${a.pais_origen})`,
  }));

  const form = useForm<RedFormValues>({
    initialValues: {
      nombre:         red?.nombre         ?? '',
      tipo:           red?.tipo           ?? '',
      rol_congope:    red?.rol_congope    ?? '',
      objetivo:       red?.objetivo       ?? '',
      // fecha_adhesion viene como "DD/MM/YYYY" del API
      // pero el input type=date necesita "YYYY-MM-DD"
      // Convertir con dayjs si existe
      fecha_adhesion: red?.fecha_adhesion
        ? convertirFechaParaInput(red.fecha_adhesion)
        : '',
      actor_ids:      [],
      rol_miembro:    '',
    },
    validate: {
      nombre:      isNotEmpty('El nombre es requerido'),
      tipo:        isNotEmpty('Selecciona el tipo de red'),
      rol_congope: isNotEmpty('Selecciona el rol de CONGOPE'),
    },
  });

  const handleSubmit = (values: RedFormValues) => {
    const dto: CreateRedDto = {
      nombre:         values.nombre,
      tipo:           values.tipo,
      rol_congope:    values.rol_congope,
      objetivo:       values.objetivo || null,
      fecha_adhesion: values.fecha_adhesion || null,
    };
    // actor_ids solo al crear (shortcut de miembros iniciales)
    if (!esEdicion && values.actor_ids.length > 0) {
      dto.actor_ids  = values.actor_ids;
      dto.rol_miembro = values.rol_miembro || null;
    }
    onSubmit(dto);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Nombre de la red"
            placeholder="Ej: Red de Autoridades Regionales (ORU Fogar)"
            required
            {...form.getInputProps('nombre')}
          />

          <Group grow align="flex-start">
            <Select
              label="Tipo de red"
              placeholder="Seleccionar tipo"
              data={TIPOS_RED}
              required
              {...form.getInputProps('tipo')}
            />
            <Select
              label="Rol de CONGOPE"
              placeholder="Seleccionar rol"
              data={ROLES_CONGOPE}
              required
              {...form.getInputProps('rol_congope')}
            />
          </Group>

          <TextInput
            label="Fecha de adhesión"
            type="date"
            description="Fecha en que CONGOPE se adhirió a esta red"
            {...form.getInputProps('fecha_adhesion')}
          />

          <Textarea
            label="Objetivo de la red"
            placeholder="Describe el objetivo principal de esta red..."
            autosize
            minRows={3}
            maxRows={5}
            {...form.getInputProps('objetivo')}
          />

          {/* Miembros iniciales — solo al crear */}
          {!esEdicion && (
            <>
              <Divider
                label={
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase"
                    style={{ letterSpacing: '0.05em' }}>
                    Miembros iniciales (opcional)
                  </Text>
                }
                labelPosition="left"
              />
              <MultiSelect
                label="Actores miembros"
                placeholder="Buscar y seleccionar actores..."
                data={opcionesActores}
                searchable
                clearable
                description="Puedes agregar más miembros después desde el detalle de la red"
                {...form.getInputProps('actor_ids')}
              />
              {form.values.actor_ids.length > 0 && (
                <TextInput
                  label="Rol de los miembros"
                  placeholder="Ej: Asesor Técnico, Representante"
                  description="Rol asignado a todos los actores seleccionados"
                  {...form.getInputProps('rol_miembro')}
                />
              )}
            </>
          )}

          <Group justify="flex-end" gap="sm" pt="xs">
            <Button variant="subtle" color="gray"
              onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" color="congope"
              loading={isLoading}>
              {esEdicion ? 'Guardar cambios' : 'Crear red'}
            </Button>
          </Group>
        </Stack>
      </form>
  );
}

// Helper: convierte "DD/MM/YYYY" a "YYYY-MM-DD" para input type=date
function convertirFechaParaInput(fecha: string): string {
  // fecha_adhesion viene como "15/01/2023"
  if (!fecha) return '';
  const partes = fecha.split('/');
  if (partes.length !== 3) return '';
  const [dia, mes, anio] = partes;
  return `${anio}-${mes}-${dia}`;
}
