'use client'

import { useState } from 'react';
import {
  Stack, TextInput, Select, Switch, Group,
  Button, Text, Paper, Progress, Badge,
  Divider, rem, LoadingOverlay, Box,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { useForm, isNotEmpty } from '@mantine/form';
import {
  IconUpload, IconX, IconFile,
} from '@tabler/icons-react';
import { useQuery }     from '@tanstack/react-query';
import { queryKeys }    from '@/lib/query-client';
import apiClient, { extractData } from '@/services/axios';
import type {
  EntidadDocumento,
  CategoriaDocumento,
  Provincia,
} from '@/services/axios';
import type { SubirDocumentoValues }
  from '@/types/documento.types';
import type { SubirDocumentoDto }
  from '@/services/documentos.service';
import { formatBytes } from '@/utils/formatters';

const CATEGORIAS: Array<{
  value: CategoriaDocumento;
  label: string;
}> = [
  { value: 'Convenio',     label: 'Convenio' },
  { value: 'Informe',      label: 'Informe' },
  { value: 'Acta',         label: 'Acta' },
  { value: 'Anexo',        label: 'Anexo' },
  { value: 'Normativa',    label: 'Normativa' },
  { value: 'Comunicación', label: 'Comunicación' },
  { value: 'Fotografía',   label: 'Fotografía' },
];

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

interface SubirDocumentoFormProps {
  entidad_tipo: EntidadDocumento;
  entidad_id:   string;
  onSubmit:     (dto: SubirDocumentoDto) => Promise<void>;
  onCancel:     () => void;
}

export function SubirDocumentoForm({
  entidad_tipo,
  entidad_id,
  onSubmit,
  onCancel,
}: SubirDocumentoFormProps) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [errorArchivo, setErrorArchivo] =
    useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: provinciasData } = useQuery({
    queryKey: queryKeys.provincias.list,
    queryFn:  async () => {
      const res = await apiClient.get('/provincias');
      return extractData<Provincia[]>(res);
    },
    staleTime: Infinity,
  });

  const opcionesProvincias = [
    { value: '', label: 'Sin provincia específica' },
    ...(provinciasData ?? []).map((p) => ({
      value: p.id,
      label: p.nombre,
    })),
  ];

  const form = useForm<SubirDocumentoValues>({
    initialValues: {
      titulo:            '',
      categoria:         '',
      es_publico:        false,
      fecha_vencimiento: '',
      provincia_id:      '',
      archivo:           null,
    },
    validate: {
      titulo:    isNotEmpty('El título es requerido'),
      categoria: isNotEmpty('Selecciona la categoría'),
    },
  });

  const handleDrop = (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (file.size > MAX_SIZE_BYTES) {
      setErrorArchivo(
        `El archivo supera el límite de 20 MB. ` +
        `Tamaño actual: ${formatBytes(file.size)}`
      );
      return;
    }

    setErrorArchivo(null);
    setArchivo(file);

    // Auto-completar el título con el nombre
    // del archivo si el campo está vacío
    if (!form.values.titulo) {
      const nombreSinExtension = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ');
      form.setFieldValue('titulo', nombreSinExtension);
    }
  };

  const handleSubmit = async (
    values: SubirDocumentoValues
  ) => {
    if (!archivo) {
      setErrorArchivo('Debes seleccionar un archivo');
      return;
    }

    const dto: SubirDocumentoDto = {
      entidad_tipo,
      entidad_id,
      titulo:    values.titulo,
      categoria: values.categoria as CategoriaDocumento,
      archivo,
      es_publico:        values.es_publico,
      fecha_vencimiento: values.fecha_vencimiento || null,
      provincia_id:      values.provincia_id || null,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(dto);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Porcentaje de tamaño usado (visual)
  const porcentajeSize = archivo
    ? Math.round((archivo.size / MAX_SIZE_BYTES) * 100)
    : 0;

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={isSubmitting}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">

        {/* Dropzone de selección de archivo */}
        <Stack gap="xs">
          <Text size="sm" fw={500} c="gray.8">
            Archivo{' '}
            <Text span c="red.6">*</Text>
          </Text>

          {archivo ? (
            // Archivo seleccionado — mostrar preview
            <Paper
              p="md"
              radius="md"
              style={{
                border: '2px solid var(--mantine-color-congope-3)',
                background: 'var(--mantine-color-congope-0)',
              }}
            >
              <Group justify="space-between">
                <Group gap="sm">
                  <IconFile
                    size={24}
                    color="var(--mantine-color-congope-8)"
                  />
                  <Stack gap={2}>
                    <Text size="sm" fw={500} truncate
                      maw={300}>
                      {archivo.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {formatBytes(archivo.size)}
                    </Text>
                  </Stack>
                </Group>
                <Button
                  variant="subtle"
                  color="red"
                  size="xs"
                  leftSection={<IconX size={12} />}
                  onClick={() => setArchivo(null)}
                >
                  Quitar
                </Button>
              </Group>

              {/* Barra de tamaño */}
              <Progress
                value={porcentajeSize}
                size="xs"
                mt="xs"
                color={
                  porcentajeSize > 80 ? 'red' :
                  porcentajeSize > 50 ? 'orange' :
                  'congope'
                }
              />
              <Text size="xs" c="dimmed" ta="right">
                {formatBytes(archivo.size)} / 20 MB
              </Text>
            </Paper>
          ) : (
            // Dropzone vacío
            <Dropzone
              onDrop={handleDrop}
              maxSize={MAX_SIZE_BYTES}
              onReject={() =>
                setErrorArchivo(
                  'Archivo rechazado. Verifica el tamaño (máx. 20 MB).'
                )
              }
              radius="md"
              styles={{
                root: {
                  border: errorArchivo
                    ? '2px dashed var(--mantine-color-red-5)'
                    : '2px dashed var(--mantine-color-gray-3)',
                },
              }}
            >
              <Group
                justify="center"
                gap="md"
                mih={100}
                style={{ pointerEvents: 'none' }}
              >
                <Dropzone.Accept>
                  <IconUpload
                    size={36}
                    color="var(--mantine-color-congope-6)"
                  />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX
                    size={36}
                    color="var(--mantine-color-red-6)"
                  />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconFile
                    size={36}
                    color="var(--mantine-color-gray-5)"
                  />
                </Dropzone.Idle>

                <Stack gap={4} align="center">
                  <Text size="sm" fw={500}>
                    Arrastra el archivo aquí o haz clic
                  </Text>
                  <Text size="xs" c="dimmed">
                    Cualquier tipo de archivo · Máx. 20 MB
                  </Text>
                </Stack>
              </Group>
            </Dropzone>
          )}

          {errorArchivo && (
            <Text size="xs" c="red.6">
              {errorArchivo}
            </Text>
          )}
        </Stack>

        <Divider />

        {/* Metadatos */}
        <TextInput
          label="Título del documento"
          placeholder="Nombre descriptivo del documento"
          required
          {...form.getInputProps('titulo')}
        />

        <Select
          label="Categoría"
          placeholder="Seleccionar categoría"
          data={CATEGORIAS}
          required
          {...form.getInputProps('categoria')}
        />

        <Group grow align="flex-start">
          <TextInput
            label="Fecha de vencimiento"
            type="date"
            description="Opcional — para documentos con vigencia"
            {...form.getInputProps('fecha_vencimiento')}
          />
          <Select
            label="Provincia"
            placeholder="Sin provincia"
            data={opcionesProvincias}
            description="Opcional — para documentos provinciales"
            {...form.getInputProps('provincia_id')}
          />
        </Group>

        <Switch
          label="Documento público"
          description="Visible fuera del sistema (portal público)"
          {...form.getInputProps('es_publico', {
            type: 'checkbox',
          })}
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
            leftSection={<IconUpload size={15} />}
          >
            Subir documento
          </Button>
        </Group>
      </Stack>
      </form>
    </Box>
  );
}
