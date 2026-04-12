'use client'

import { useState }   from 'react';
import {
  Button, Alert, Text, Stack, Center,
  ThemeIcon, Box, LoadingOverlay,
} from '@mantine/core';
import { modals }     from '@mantine/modals';
import {
  IconUpload, IconFiles, IconAlertCircle,
} from '@tabler/icons-react';
import { PageHeader }       from '@/components/ui/PageHeader/PageHeader';
import { EmptyState }       from '@/components/ui/EmptyState/EmptyState';
import { SelectorEntidad }  from '@/components/modulos/documentos/SelectorEntidad';
import { DocumentosTable }  from '@/components/modulos/documentos/DocumentosTable';
import { SubirDocumentoForm } from '@/components/modulos/documentos/SubirDocumentoForm';
import { EditarDocumentoForm } from '@/components/modulos/documentos/EditarDocumentoForm';
import {
  useDocumentos,
  useSubirDocumento,
  useEditarDocumento,
  useEliminarDocumento,
  usePublicarDocumento,
} from '@/queries/documentos.queries';
import { documentosService } from '@/services/documentos.service';
import { usePermisos } from '@/hooks/usePermisos';
import { useConfirm }  from '@/hooks/useConfirm';
import type {
  DocumentoItem,
} from '@/services/axios';
import type {
  EntidadDocumento,
} from '@/types/documento.types';
import type { DocumentoFiltro } from '@/types/documento.types';

const FILTRO_INICIAL: DocumentoFiltro = {
  entidad_tipo: '',
  entidad_id:   '',
};

export default function DocumentosPage() {
  const [filtro, setFiltro] =
    useState<DocumentoFiltro>(FILTRO_INICIAL);
  const [publicandoId, setPublicandoId] =
    useState<string | null>(null);

  const { can }     = usePermisos();
  const puedeSubir    = can('documentos.subir');
  const puedeEditar   = can('documentos.editar');
  const puedeEliminar = can('documentos.eliminar');
  const puedePublicar = can('documentos.publicar');

  const {
    data: documentos = [],
    isLoading,
    isError,
  } = useDocumentos(
    filtro.entidad_tipo as EntidadDocumento | '',
    filtro.entidad_id
  );

  const { mutateAsync: subirDocAsync } = useSubirDocumento();
  const { mutateAsync: editarDocAsync } = useEditarDocumento();
  const { mutate: eliminarDoc, isPending: eliminando } = useEliminarDocumento();
  const { mutate: publicarDoc } = usePublicarDocumento();
  const { confirmar } = useConfirm();

  // ── Modal SUBIR ──────────────────────────────────
  const abrirModalSubir = () => {
    modals.open({
      title: 'Subir documento',
      size:  'lg',
      children: (
        <SubirDocumentoForm
          entidad_tipo={
            filtro.entidad_tipo as EntidadDocumento
          }
          entidad_id={filtro.entidad_id}
          onSubmit={async (dto) => {
            await subirDocAsync(dto);
            modals.closeAll();
          }}
          onCancel={() => modals.closeAll()}
        />
      ),
    });
  };

  // ── Modal EDITAR ─────────────────────────────────
  const abrirModalEditar = (doc: DocumentoItem) => {
    modals.open({
      title: 'Editar metadatos del documento',
      size:  'md',
      children: (
        <EditarDocumentoForm
          documento={doc}
          onSubmit={async (dto) => {
            await editarDocAsync({ id: doc.id, dto });
            modals.closeAll();
          }}
          onCancel={() => modals.closeAll()}
        />
      ),
    });
  };

  // ── ELIMINAR ─────────────────────────────────────
  const confirmarEliminar = (doc: DocumentoItem) => {
    confirmar({
      titulo:     'Eliminar documento',
      mensaje:    `¿Eliminar "${doc.titulo}"? El archivo se eliminará permanentemente.`,
      textoBoton: 'Eliminar documento',
      colorBoton: 'red',
      onConfirmar: () => eliminarDoc(doc.id),
    });
  };

  // ── PUBLICAR ─────────────────────────────────────
  const handlePublicar = (doc: DocumentoItem) => {
    setPublicandoId(doc.id);
    publicarDoc({ id: doc.id, es_publico: !doc.es_publico }, {
      onSettled: () => setPublicandoId(null),
    });
  };

  // ── DESCARGAR ────────────────────────────────────
  const handleDescargar = (doc: DocumentoItem) => {
    documentosService.descargar(doc);
  };

  const hayEntidadSeleccionada =
    !!filtro.entidad_tipo && !!filtro.entidad_id;

  return (
    <Box pos="relative" mih="100%">
      <LoadingOverlay
        visible={eliminando}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      
      <PageHeader
        titulo="Gestión Documental"
        descripcion="Repositorio centralizado de documentos de proyectos, actores, redes y eventos"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Documentos' },
        ]}
        acciones={
          puedeSubir && hayEntidadSeleccionada && (
            <Button
              color="congope"
              leftSection={<IconUpload size={16} />}
              onClick={abrirModalSubir}
            >
              Subir documento
            </Button>
          )
        }
      />

      {/* Selector de entidad */}
      <SelectorEntidad
        filtro={filtro}
        onChange={setFiltro}
        totalDocs={documentos.length}
      />

      {/* Contenido según el estado */}
      {!hayEntidadSeleccionada ? (
        // Instrucción inicial
        <Center py="3xl">
          <Stack align="center" gap="md" maw={400}>
            <ThemeIcon
              size={72}
              radius="xl"
              color="gray"
              variant="light"
            >
              <IconFiles size={36} />
            </ThemeIcon>
            <Text size="sm" c="dimmed" ta="center">
              Selecciona el tipo de entidad y la entidad
              específica para ver sus documentos asociados.
            </Text>
          </Stack>
        </Center>
      ) : isError ? (
        // Error del backend (500 documentado en OpenAPI)
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="orange"
          title="No se pudieron cargar los documentos"
          radius="md"
        >
          Ocurrió un error al consultar los documentos
          de esta entidad. El backend puede estar
          procesando la solicitud. Intenta nuevamente
          en unos momentos.
        </Alert>
      ) : !isLoading && documentos.length === 0 ? (
        <EmptyState
          icono={<IconFiles size={36} />}
          titulo="Sin documentos"
          descripcion="Esta entidad aún no tiene documentos asociados."
          accion={
            puedeSubir ? (
              <Button
                color="congope"
                leftSection={<IconUpload size={16} />}
                onClick={abrirModalSubir}
              >
                Subir primer documento
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DocumentosTable
          documentos={documentos}
          isLoading={isLoading}
          onDescargar={handleDescargar}
          onEditar={abrirModalEditar}
          onEliminar={confirmarEliminar}
          onPublicar={handlePublicar}
          puedeEditar={puedeEditar}
          puedeEliminar={puedeEliminar}
          puedePublicar={puedePublicar}
          publicandoId={publicandoId}
        />
      )}
    </Box>
  );
}
