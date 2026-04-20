'use client'

import { useState } from 'react';
import { DataTable }  from 'mantine-datatable';
import {
  Group, Text, Badge, Stack,
  ActionIcon, Tooltip, Switch,
} from '@mantine/core';
import {
  IconDownload, IconEdit, IconTrash,
  IconEye, IconEyeOff,
} from '@tabler/icons-react';
import { VisorDocumento, DocumentoParaVisor } from './VisorDocumento';
import { getTipoPreview } from '@/hooks/useDocumentoPreview';
import { IconoArchivo } from './IconoArchivo';
import { formatFecha } from '@/utils/formatters';
import {
  COLOR_CATEGORIA,
} from '@/types/documento.types';
import type { DocumentoItem } from '@/services/axios';

interface DocumentosTableProps {
  documentos:    DocumentoItem[];
  isLoading:     boolean;
  onDescargar:   (doc: DocumentoItem) => void;
  onEditar:      (doc: DocumentoItem) => void;
  onEliminar:    (doc: DocumentoItem) => void;
  onPublicar:    (doc: DocumentoItem) => void;
  puedeEditar:   boolean;
  puedeEliminar: boolean;
  puedePublicar: boolean;
  publicandoId?: string | null;
}

export function DocumentosTable({
  documentos,
  isLoading,
  onDescargar,
  onEditar,
  onEliminar,
  onPublicar,
  puedeEditar,
  puedeEliminar,
  puedePublicar,
  publicandoId,
}: DocumentosTableProps) {
  const [docPreview, setDocPreview] = useState<DocumentoParaVisor | null>(null);

  const columns = [
    {
      accessor:  'tipo' as const,
      title:     '',
      width:     52,
      render:    (doc: DocumentoItem) => (
        <div
          onClick={() => {
            const tipo = getTipoPreview(doc.mime_type);
            if (tipo !== 'none') setDocPreview(doc as unknown as DocumentoParaVisor);
          }}
          title={getTipoPreview(doc.mime_type) !== 'none' ? 'Previsualizar' : undefined}
          style={{
            cursor: getTipoPreview(doc.mime_type) !== 'none'
              ? 'pointer' : 'default',
          }}
        >
          <IconoArchivo
            mimeType={doc.mime_type}
            size={32}
          />
        </div>
      ),
    },
    {
      accessor: 'titulo' as const,
      title:    'Documento',
      render:   (doc: DocumentoItem) => (
        <Stack gap={2}>
          <Text size="sm" fw={500} lineClamp={1}>
            {doc.titulo}
          </Text>
          <Group gap="xs">
            <Badge
              size="xs"
              variant="light"
              color={
                COLOR_CATEGORIA[
                  doc.categoria as keyof typeof COLOR_CATEGORIA
                ] ?? 'gray'
              }
            >
              {doc.categoria}
            </Badge>
            <Text size="xs" c="dimmed">
              {doc.nombre_archivo}
            </Text>
          </Group>
        </Stack>
      ),
    },
    {
      accessor: 'tamano_legible' as const,
      title:    'Tamaño',
      width:    90,
      render:   (doc: DocumentoItem) => (
        <Text size="xs" c="dimmed">
          {doc.tamano_legible}
        </Text>
      ),
    },
    {
      accessor: 'version' as const,
      title:    'Ver.',
      width:    60,
      textAlign: 'center' as const,
      render:   (doc: DocumentoItem) => (
        <Badge
          size="xs"
          variant="outline"
          color="gray"
        >
          v{doc.version}
        </Badge>
      ),
    },
    {
      accessor: 'vencimiento' as const,
      title:    'Vencimiento',
      width:    130,
      render:   (doc: DocumentoItem) => {
        if (!doc.fecha_vencimiento) {
          return (
            <Text size="xs" c="dimmed">—</Text>
          );
        }
        return (
          <Stack gap={2}>
            <Text
              size="xs"
              fw={500}
              c={doc.vencido ? 'red.6' : 'gray.7'}
            >
              {formatFecha(doc.fecha_vencimiento)}
            </Text>
            {doc.vencido ? (
              <Badge
                size="xs"
                color="red"
                variant="light"
              >
                Vencido
              </Badge>
            ) : doc.dias_para_vencer !== null &&
                doc.dias_para_vencer <= 30 ? (
              <Badge
                size="xs"
                color="orange"
                variant="light"
              >
                {doc.dias_para_vencer}d restantes
              </Badge>
            ) : null}
          </Stack>
        );
      },
    },
    {
      accessor:  'es_publico' as const,
      title:     'Público',
      width:     90,
      textAlign: 'center' as const,
      render:    (doc: DocumentoItem) =>
        puedePublicar ? (
          <Tooltip
            label={
              doc.es_publico
                ? 'Visible en portal'
                : 'Solo interno'
            }
          >
            <Switch
              checked={doc.es_publico}
              onChange={() => onPublicar(doc)}
              disabled={publicandoId === doc.id}
              size="sm"
              color="green"
            />
          </Tooltip>
        ) : (
          <Badge
            size="xs"
            variant="light"
            color={doc.es_publico ? 'green' : 'gray'}
          >
            {doc.es_publico ? 'Público' : 'Interno'}
          </Badge>
        ),
    },
    {
      accessor:  'created_at' as const,
      title:     'Subido',
      width:     120,
      render:    (doc: DocumentoItem) => (
        <Text size="xs" c="dimmed">
          {formatFecha(doc.created_at)}
        </Text>
      ),
    },
    {
      accessor:  'acciones' as const,
      title:     '',
      width:     140,
      textAlign: 'right' as const,
      render:    (doc: DocumentoItem) => {
        const tipo = getTipoPreview(doc.mime_type);
        const soporta = tipo !== 'none';

        return (
          <Group gap={4} justify="flex-end" wrap="nowrap">
            <Tooltip
              label={
                soporta
                  ? 'Previsualizar'
                  : 'Sin previsualización disponible'
              }
            >
              <ActionIcon
                variant="subtle"
                color={soporta ? 'blue' : 'gray'}
                size="sm"
                onClick={() =>
                  soporta ? setDocPreview(doc as unknown as DocumentoParaVisor) : undefined
                }
                style={{
                  opacity: soporta ? 1 : 0.4,
                  cursor:  soporta ? 'pointer' : 'default',
                }}
              >
                {soporta
                  ? <IconEye size={15} />
                  : <IconEyeOff size={15} />
                }
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Descargar">
              <ActionIcon
                variant="subtle"
                color="congope"
                size="sm"
                onClick={() => onDescargar(doc)}
              >
                <IconDownload size={15} />
              </ActionIcon>
            </Tooltip>
            {puedeEditar && (
              <Tooltip label="Editar metadatos">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={() => onEditar(doc)}
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
                  onClick={() => onEliminar(doc)}
                >
                  <IconTrash size={15} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        );
      },
    },
  ];

  return (
    <>
      {/* @ts-expect-error - mantine-datatable has a known TypeScript union inference issue when no pagination is provided */}
      <DataTable
        records={documentos}
        fetching={isLoading}
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders={false}
        borderRadius="md"
        minHeight={200}
        noRecordsText="No hay documentos en esta entidad"
        loadingText="Cargando documentos..."
        styles={{
          header: {
            backgroundColor:
              'var(--mantine-color-default)',
          },
        }}
        columns={columns}
      />
      <VisorDocumento
        documento={docPreview}
        onCerrar={() => setDocPreview(null)}
      />
    </>
  );
}
