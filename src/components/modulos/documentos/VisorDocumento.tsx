'use client'

import { useEffect } from 'react';
import {
  Modal, Stack, Group, Text, Badge,
  Button, Center, Loader, Alert,
  ActionIcon, Tooltip, ThemeIcon,
} from '@mantine/core';
import {
  IconDownload,
  IconAlertCircle,
  IconFileUnknown,
  IconExternalLink,
  IconX,
} from '@tabler/icons-react';
import {
  useDocumentoPreview,
  getTipoPreview,
} from '@/hooks/useDocumentoPreview';

// Tipos de ícono por categoría de documento
const ICONO_CATEGORIA: Record<string, string> = {
  'Convenio':      '📄',
  'Informe':       '📊',
  'Acta':          '📋',
  'Anexo':         '📎',
  'Normativa':     '⚖️',
  'Comunicación':  '✉️',
  'Fotografía':    '🖼️',
};

export interface DocumentoParaVisor {
  id:             string;
  titulo:         string;
  categoria:      string;
  nombre_archivo: string;
  mime_type:      string;
  tamano_legible: string;
  url_descarga:   string;
  es_publico:     boolean;
  version:        number;
}

interface VisorDocumentoProps {
  documento:  DocumentoParaVisor | null;
  onCerrar:   () => void;
}

export function VisorDocumento({
  documento,
  onCerrar,
}: VisorDocumentoProps) {
  const {
    estado,
    cargarPreview,
    limpiarPreview,
  } = useDocumentoPreview();

  const abierto = !!documento;

  // Cargar la previsualización cuando se abre
  // un documento nuevo
  useEffect(() => {
    if (!documento) return;

    const tipo = getTipoPreview(documento.mime_type);

    if (tipo !== 'none') {
      cargarPreview(
        documento.url_descarga,
        documento.mime_type
      );
    } else {
      // Tipo no soportado — mostrar mensaje
      // sin intentar cargar el archivo
    }

    // Limpiar al desmontar o cambiar documento
    return () => {
      limpiarPreview();
    };
  }, [documento?.id]);

  // Limpiar al cerrar el modal
  const handleCerrar = () => {
    limpiarPreview();
    onCerrar();
  };

  if (!documento) return null;

  const tipoPreview = getTipoPreview(
    documento.mime_type
  );
  const soportaPreview = tipoPreview !== 'none';

  return (
    <Modal
      opened={abierto}
      onClose={handleCerrar}
      title={
        <Group gap="xs" wrap="nowrap">
          <span style={{ fontSize: 18 }}>
            {ICONO_CATEGORIA[documento.categoria]
              ?? '📄'}
          </span>
          <div>
            <Text fw={600} size="sm" lineClamp={1}>
              {documento.titulo}
            </Text>
            <Group gap={6} mt={2}>
              <Badge
                size="xs"
                variant="light"
                color="blue"
              >
                {documento.categoria}
              </Badge>
              <Text size="xs" c="dimmed">
                {documento.tamano_legible}
              </Text>
              {documento.version > 1 && (
                <Badge
                  size="xs"
                  variant="outline"
                  color="gray"
                >
                  v{documento.version}
                </Badge>
              )}
              {documento.es_publico && (
                <Badge
                  size="xs"
                  variant="light"
                  color="green"
                >
                  Público
                </Badge>
              )}
            </Group>
          </div>
        </Group>
      }
      size={tipoPreview === 'pdf' ? '90%' : 'lg'}
      padding="md"
      styles={{
        header: {
          borderBottom:
            '1px solid var(--mantine-color-gray-3)',
          paddingBottom: 12,
          marginBottom:  0,
        },
        body: {
          padding: 0,
        },
      }}
    >
      {/* ── Barra de acciones ── */}
      <Group
        p="sm"
        justify="space-between"
        style={{
          borderBottom:
            '1px solid var(--mantine-color-gray-2)',
          background:
            'var(--mantine-color-gray-0)',
        }}
      >
        <Text size="xs" c="dimmed" ff="monospace">
          {documento.nombre_archivo}
        </Text>
        <Group gap="xs">
          {/* Abrir en pestaña nueva */}
          {estado.blobUrl && (
            <Tooltip label="Abrir en pestaña nueva">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                component="a"
                href={estado.blobUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconExternalLink size={14} />
              </ActionIcon>
            </Tooltip>
          )}
          {/* Botón de descarga */}
          <Button
            size="xs"
            variant="light"
            leftSection={<IconDownload size={13} />}
            component="a"
            href={estado.blobUrl ?? documento.url_descarga}
            download={documento.nombre_archivo}
          >
            Descargar
          </Button>
        </Group>
      </Group>

      {/* ── Área de previsualización ── */}
      <div style={{
        minHeight:       400,
        maxHeight:       '75vh',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        backgroundColor: '#1a1a2e',
        position:        'relative',
        overflow:        'hidden',
      }}>

        {/* Estado: Cargando */}
        {estado.cargando && (
          <Center style={{ height: 400 }}>
            <Stack align="center" gap="sm">
              <Loader color="white" size="md" />
              <Text size="sm" c="white" opacity={0.7}>
                Cargando previsualización...
              </Text>
            </Stack>
          </Center>
        )}

        {/* Estado: Error */}
        {estado.error && (
          <Center p="xl" style={{ width: '100%' }}>
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              title="Error al cargar"
              style={{ maxWidth: 360 }}
            >
              <Text size="sm">{estado.error}</Text>
              <Button
                mt="sm"
                size="xs"
                variant="light"
                color="red"
                leftSection={<IconDownload size={12} />}
                component="a"
                href={documento.url_descarga}
                download={documento.nombre_archivo}
              >
                Descargar en cambio
              </Button>
            </Alert>
          </Center>
        )}

        {/* Estado: Tipo no soportado */}
        {!soportaPreview &&
         !estado.cargando &&
         !estado.error && (
          <Center p="xl" style={{ width: '100%' }}>
            <Stack align="center" gap="md">
              <ThemeIcon
                size={64}
                radius="xl"
                color="gray"
                variant="light"
              >
                <IconFileUnknown size={32} />
              </ThemeIcon>
              <div style={{ textAlign: 'center' }}>
                <Text
                  fw={600}
                  c="white"
                  mb={4}
                >
                  Sin previsualización disponible
                </Text>
                <Text size="sm" c="gray.4" mb="md">
                  Este tipo de archivo
                  ({documento.mime_type.split('/')[1]?.toUpperCase()})
                  no puede mostrarse directamente
                  en el navegador.
                </Text>
                <Button
                  variant="white"
                  leftSection={<IconDownload size={14} />}
                  component="a"
                  href={documento.url_descarga}
                  download={documento.nombre_archivo}
                >
                  Descargar archivo
                </Button>
              </div>
            </Stack>
          </Center>
        )}

        {/* ── Visor de IMAGEN ── */}
        {estado.blobUrl &&
         estado.tipo === 'imagen' && (
          <div style={{
            width:          '100%',
            maxHeight:      '75vh',
            overflow:       'auto',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            padding:        16,
          }}>
            <img
              src={estado.blobUrl}
              alt={documento.titulo}
              style={{
                maxWidth:     '100%',
                maxHeight:    'calc(75vh - 32px)',
                objectFit:    'contain',
                borderRadius: 4,
                boxShadow:
                  '0 4px 24px rgba(0,0,0,0.4)',
                // Cursor para indicar que se puede
                // expandir si se abre en nueva pestaña
                cursor: 'zoom-in',
              }}
              onClick={() => {
                // Abrir imagen a tamaño completo
                // en nueva pestaña al hacer clic
                if (estado.blobUrl) {
                  window.open(
                    estado.blobUrl, '_blank'
                  );
                }
              }}
            />
          </div>
        )}

        {/* ── Visor de PDF ── */}
        {estado.blobUrl &&
         estado.tipo === 'pdf' && (
          <iframe
            src={estado.blobUrl}
            title={documento.titulo}
            style={{
              width:        '100%',
              height:       '75vh',
              border:       'none',
              display:      'block',
            }}
          />
        )}
      </div>

      {/* ── Footer con nombre del archivo ── */}
      <div style={{
        padding:      '8px 16px',
        borderTop:
          '1px solid var(--mantine-color-gray-2)',
        background:
          'var(--mantine-color-gray-0)',
        display:      'flex',
        alignItems:   'center',
        justifyContent:'space-between',
      }}>
        <Text size="xs" c="dimmed">
          {tipoPreview === 'imagen'
            ? '🖼️ Haz clic en la imagen para verla a tamaño completo'
            : tipoPreview === 'pdf'
            ? '📄 Usa los controles del visor para navegar el PDF'
            : ''}
        </Text>
        <Text size="xs" c="dimmed">
          {documento.tamano_legible}
        </Text>
      </div>
    </Modal>
  );
}
