'use client'

import { useRef, useState, useEffect } from 'react';
import {
  Modal, Stack, Text, Group, Button,
  Paper, Badge, Alert, Divider,
  Checkbox, TextInput,
} from '@mantine/core';
import {
  IconUpload,
  IconInfoCircle,
  IconFileUpload,
} from '@tabler/icons-react';
import { DatePickerInput }
  from '@mantine/dates';

// El tipo del documento activo que se va a versionar
export interface DocumentoActivo {
  id:            string;
  titulo:        string;
  version:       number;
  tamano_legible:string;
  nombre_archivo:string;
  categoria:     string;
}

interface ModalNuevaVersionProps {
  documento:  DocumentoActivo | null;
  abierto:    boolean;
  onCerrar:   () => void;
  onSubir:    (
    documentoId: string,
    datos: {
      archivo:            File;
      titulo?:            string;
      fecha_vencimiento?: string;
      es_publico?:        boolean;
    }
  ) => void;
  subiendo: boolean;
}

export function ModalNuevaVersion({
  documento,
  abierto,
  onCerrar,
  onSubir,
  subiendo,
}: ModalNuevaVersionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivo,  setArchivo]  =
    useState<File | null>(null);
  const [titulo,   setTitulo]   = useState('');
  const [fechaVenc,setFechaVenc]= useState<Date | null>(
    null
  );
  const [esPublico,setEsPublico]= useState<boolean | null>(
    null
  );
  const [arrastre, setArrastre] = useState(false);

  useEffect(() => {
    if (!abierto) {
      setArchivo(null);
      setTitulo('');
      setFechaVenc(null);
      setEsPublico(null);
      setArrastre(false);
    }
  }, [abierto]);

  const handleArchivoSeleccionado = (
    file: File | null
  ) => {
    if (!file) return;
    setArchivo(file);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    setArrastre(false);
    const file = e.dataTransfer.files[0];
    if (file) handleArchivoSeleccionado(file);
  };

  const handleSubmit = () => {
    if (!documento || !archivo) return;

    onSubir(documento.id, {
      archivo,
      titulo:             titulo || undefined,
      fecha_vencimiento:  fechaVenc
        ? (() => {
            const d = new Date(fechaVenc as any);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          })()
        : undefined,
      es_publico: esPublico ?? undefined,
    });
  };

  const handleCerrar = () => {
    setArchivo(null);
    setTitulo('');
    setFechaVenc(null);
    setEsPublico(null);
    onCerrar();
  };

  if (!documento) return null;

  return (
    <Modal
      opened={abierto}
      onClose={handleCerrar}
      title={
        <Group gap="xs">
          <IconFileUpload size={18}
            color="var(--mantine-color-blue-6)" />
          <Text fw={700} size="sm">
            Nueva versión del documento
          </Text>
        </Group>
      }
      size="md"
    >
      <Stack gap="md">

        {/* Info del documento actual */}
        <Paper p="sm" radius="md"
          style={{
            background: 'var(--mantine-color-blue-0)',
            border:
              '1px solid var(--mantine-color-blue-2)',
          }}
        >
          <Group gap="xs" wrap="nowrap">
            <div style={{ flex: 1 }}>
              <Text size="sm" fw={600} lineClamp={1}>
                {documento.titulo}
              </Text>
              <Text size="xs" c="dimmed">
                {documento.nombre_archivo} ·{' '}
                {documento.tamano_legible}
              </Text>
            </div>
            <Badge color="blue" variant="light">
              Versión actual: v{documento.version}
            </Badge>
          </Group>
        </Paper>

        <Alert
          icon={<IconInfoCircle size={14} />}
          color="gray"
          variant="light"
          radius="md"
        >
          <Text size="xs">
            La versión actual pasará a ser historial.
            La nueva versión{' '}
            <strong>v{documento.version + 1}</strong>{' '}
            será la que se muestre en el listado.
          </Text>
        </Alert>

        {/* Dropzone del archivo */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setArrastre(true);
          }}
          onDragLeave={() => setArrastre(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border:        `2px dashed ${
              arrastre
                ? 'var(--mantine-color-blue-5)'
                : archivo
                ? 'var(--mantine-color-green-5)'
                : 'var(--mantine-color-gray-4)'
            }`,
            borderRadius:  12,
            padding:       '24px 16px',
            textAlign:     'center',
            cursor:        'pointer',
            background:    arrastre
              ? 'var(--mantine-color-blue-0)'
              : archivo
              ? 'var(--mantine-color-green-0)'
              : 'var(--mantine-color-gray-0)',
            transition:    'all 200ms ease',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={(e) =>
              handleArchivoSeleccionado(
                e.target.files?.[0] ?? null
              )
            }
          />
          {archivo ? (
            <Stack gap={4} align="center">
              <Text size="sm" fw={600}
                c="green.7">
                ✓ {archivo.name}
              </Text>
              <Text size="xs" c="dimmed">
                {(archivo.size / 1024).toFixed(1)} KB ·
                Clic para cambiar
              </Text>
            </Stack>
          ) : (
            <Stack gap={4} align="center">
              <IconUpload size={28}
                color="var(--mantine-color-gray-5)" />
              <Text size="sm" fw={500} c="dimmed">
                Arrastra el archivo aquí o{' '}
                <Text span c="blue.6" fw={600}>
                  haz clic para seleccionar
                </Text>
              </Text>
              <Text size="xs" c="dimmed">
                Máximo 20 MB
              </Text>
            </Stack>
          )}
        </div>

        <Divider
          label="Opciones (heredan de la versión actual)"
          labelPosition="center"
        />

        {/* Título opcional */}
        <TextInput
          label="Título (opcional)"
          placeholder={documento.titulo}
          description="Deja vacío para mantener el mismo título"
          size="sm"
          value={titulo}
          onChange={(e) =>
            setTitulo(e.currentTarget.value)
          }
        />

        {/* Fecha de vencimiento opcional */}
        <DatePickerInput
          label="Nueva fecha de vencimiento (opcional)"
          placeholder="Heredar fecha actual"
          size="sm"
          clearable
          minDate={new Date()}
          value={fechaVenc as any}
          onChange={(val) => setFechaVenc(val as any)}
          locale="es"
        />

        {/* Visibilidad */}
        <Checkbox
          label="Cambiar visibilidad pública"
          description="Marcar si quieres cambiar si el documento es público"
          checked={esPublico !== null}
          onChange={(e) =>
            setEsPublico(
              e.currentTarget.checked ? true : null
            )
          }
        />

        {esPublico !== null && (
          <Checkbox
            label="Es público"
            checked={esPublico}
            onChange={(e) =>
              setEsPublico(e.currentTarget.checked)
            }
            ml="md"
          />
        )}

        {/* Acciones */}
        <Group justify="flex-end" gap="sm">
          <Button
            variant="default"
            onClick={handleCerrar}
            disabled={subiendo}
          >
            Cancelar
          </Button>
          <Button
            loading={subiendo}
            disabled={!archivo}
            leftSection={
              <IconFileUpload size={15} />
            }
            onClick={handleSubmit}
          >
            {subiendo
              ? 'Subiendo...'
              : `Subir como v${documento.version + 1}`}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
