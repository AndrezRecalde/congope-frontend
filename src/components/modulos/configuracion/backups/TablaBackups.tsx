'use client'

import { useState } from 'react';
import {
  Stack, Group, Text, Badge, Button,
  ActionIcon, Tooltip, Paper, Table,
  Alert, Modal, Code, Tabs, ThemeIcon,
  Skeleton, Center, Progress,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDatabaseExport,
  IconDownload,
  IconTrash,
  IconAlertTriangle,
  IconInfoCircle,
  IconDatabase,
  IconRefresh,
  IconTerminal2,
  IconShieldLock,
  IconClock,
} from '@tabler/icons-react';
import {
  useBackups,
  useGenerarBackup,
  useDescargarBackup,
  useEliminarBackup,
} from '@/queries/backup.queries';
import type { BackupItem }
  from '@/types/backup.types';

// ── Modal de instrucciones de restauración ───────

function ModalRestauracion({
  abierto,
  onCerrar,
}: {
  abierto:  boolean;
  onCerrar: () => void;
}) {
  return (
    <Modal
      opened={abierto}
      onClose={onCerrar}
      title={
        <Group gap="xs">
          <ThemeIcon
            size={28}
            radius="md"
            color="orange"
            variant="light"
          >
            <IconTerminal2 size={16} />
          </ThemeIcon>
          <Text fw={700} size="sm">
            Cómo restaurar un backup
          </Text>
        </Group>
      }
      size="lg"
    >
      <Stack gap="md">

        <Alert
          icon={<IconAlertTriangle size={15} />}
          color="orange"
          variant="light"
          title="Acción irreversible"
        >
          <Text size="xs">
            Restaurar un backup reemplaza TODOS
            los datos actuales de la base de datos.
            Solo un administrador del servidor
            debe realizar esta operación.
          </Text>
        </Alert>

        <Tabs defaultValue="linux">
          <Tabs.List>
            <Tabs.Tab
              value="linux"
              leftSection={
                <IconTerminal2 size={13} />
              }
            >
              Linux / macOS
            </Tabs.Tab>
            <Tabs.Tab
              value="docker"
              leftSection={
                <IconDatabase size={13} />
              }
            >
              Docker
            </Tabs.Tab>
          </Tabs.List>

          {/* ── Linux / macOS ── */}
          <Tabs.Panel value="linux" pt="md">
            <Stack gap="sm">
              <Text size="sm" fw={600} c="gray.7">
                Paso 1 — Subir el archivo al servidor
              </Text>
              <Code block fz="xs">
                {`scp congope_backup_YYYY-MM-DD_HH-ii-ss.sql \\
  usuario@servidor:/tmp/`}
              </Code>

              <Text size="sm" fw={600} c="gray.7">
                Paso 2 — Conectar al servidor y
                restaurar
              </Text>
              <Code block fz="xs">
                {`# Restaurar la base de datos
psql \\
  --host=localhost \\
  --port=5432 \\
  --username=tu_usuario \\
  --dbname=congope_db \\
  --file=/tmp/congope_backup_YYYY-MM-DD_HH-ii-ss.sql`}
              </Code>

              <Text size="sm" fw={600} c="gray.7">
                Paso 3 — Limpiar el archivo temporal
              </Text>
              <Code block fz="xs">
                {`rm /tmp/congope_backup_*.sql`}
              </Code>

              <Alert
                icon={<IconInfoCircle size={13} />}
                color="blue"
                variant="light"
              >
                <Text size="xs">
                  Si la base de datos tiene datos
                  existentes y el backup falla por
                  conflictos, borrar primero el
                  contenido con DROP SCHEMA PUBLIC
                  CASCADE antes de restaurar.
                </Text>
              </Alert>
            </Stack>
          </Tabs.Panel>

          {/* ── Docker ── */}
          <Tabs.Panel value="docker" pt="md">
            <Stack gap="sm">
              <Text size="sm" fw={600} c="gray.7">
                Copiar el backup al contenedor
              </Text>
              <Code block fz="xs">
                {`docker cp congope_backup_*.sql \\
  nombre_contenedor_postgres:/tmp/`}
              </Code>

              <Text size="sm" fw={600} c="gray.7">
                Restaurar dentro del contenedor
              </Text>
              <Code block fz="xs">
                {`docker exec -it nombre_contenedor_postgres \\
  psql \\
    --username=tu_usuario \\
    --dbname=congope_db \\
    --file=/tmp/congope_backup_*.sql`}
              </Code>
            </Stack>
          </Tabs.Panel>
        </Tabs>

      </Stack>
    </Modal>
  );
}

// ── Modal de confirmación de eliminación ─────────

function ModalConfirmarEliminar({
  backup,
  onConfirmar,
  onCerrar,
  eliminando,
}: {
  backup:     BackupItem | null;
  onConfirmar:() => void;
  onCerrar:   () => void;
  eliminando: boolean;
}) {
  return (
    <Modal
      opened={!!backup}
      onClose={onCerrar}
      title={
        <Group gap="xs">
          <ThemeIcon
            size={28}
            radius="md"
            color="red"
            variant="light"
          >
            <IconTrash size={16} />
          </ThemeIcon>
          <Text fw={700} size="sm">
            Eliminar backup
          </Text>
        </Group>
      }
      size="sm"
    >
      {backup && (
        <Stack gap="md">
          <Text size="sm">
            ¿Seguro que deseas eliminar este backup?
            Esta acción no se puede deshacer.
          </Text>
          <Paper
            p="sm"
            radius="md"
            style={{
              background:
                'var(--mantine-color-gray-0)',
              border:
                '1px solid var(--mantine-color-gray-3)',
            }}
          >
            <Text size="xs" ff="monospace"
              fw={600} c="gray.7">
              {backup.archivo}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {backup.tamano_legible} ·{' '}
              {backup.creado_en}
            </Text>
          </Paper>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="default"
              size="sm"
              onClick={onCerrar}
              disabled={eliminando}
            >
              Cancelar
            </Button>
            <Button
              color="red"
              size="sm"
              loading={eliminando}
              leftSection={<IconTrash size={14} />}
              onClick={onConfirmar}
            >
              Sí, eliminar
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}

// ── Componente principal ─────────────────────────

export function TablaBackups() {
  const { data, isLoading, refetch } = useBackups();
  const { mutate: generar, isPending: generando } =
    useGenerarBackup();
  const { descargar, descargando } =
    useDescargarBackup();
  const { mutate: eliminar, isPending: eliminando } =
    useEliminarBackup();

  const [backupAEliminar, setBackupAEliminar] =
    useState<BackupItem | null>(null);

  const [
    modalRestauracionAbierto,
    { open:  abrirRestauracion,
      close: cerrarRestauracion },
  ] = useDisclosure(false);

  const backups = data?.data  ?? [];
  const meta    = data?.meta;

  // Porcentaje de almacenamiento usado
  const porcentajeUsado = meta
    ? Math.min(
        (meta.total / meta.max_backups) * 100, 100
      )
    : 0;

  if (isLoading) {
    return (
      <Stack gap="sm">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={64} radius="md" />
        ))}
      </Stack>
    );
  }

  return (
    <>
      <Stack gap="lg">

        {/* ── Cabecera con acciones ── */}
        <Group justify="space-between" wrap="wrap"
          gap="sm">
          <Stack gap={4}>
            <Group gap="xs">
              <Text fw={700} size="sm">
                Backups de la base de datos
              </Text>
              <Badge
                variant="light"
                color={
                  porcentajeUsado >= 80
                    ? 'orange' : 'gray'
                }
                size="sm"
              >
                {meta?.total ?? 0} /
                {meta?.max_backups ?? 10}
              </Badge>
            </Group>
            <Text size="xs" c="dimmed">
              PostgreSQL 17 · Formato SQL plain text ·
              Máximo {meta?.max_backups ?? 10} backups
            </Text>
          </Stack>
          <Group gap="xs">
            {/* Botón de ayuda restauración */}
            <Button
              variant="subtle"
              color="orange"
              size="sm"
              leftSection={<IconTerminal2 size={14} />}
              onClick={abrirRestauracion}
            >
              ¿Cómo restaurar?
            </Button>
            {/* Refrescar lista */}
            <Tooltip label="Refrescar lista">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={() => refetch()}
              >
                <IconRefresh size={15} />
              </ActionIcon>
            </Tooltip>
            {/* Generar nuevo backup */}
            <Button
              size="sm"
              loading={generando}
              leftSection={
                <IconDatabaseExport size={15} />
              }
              onClick={() => generar()}
              disabled={generando}
            >
              {generando
                ? 'Generando...'
                : 'Nuevo backup'}
            </Button>
          </Group>
        </Group>

        {/* ── Alerta de seguridad ── */}
        <Alert
          icon={<IconShieldLock size={15} />}
          color="blue"
          variant="light"
          radius="md"
        >
          <Text size="xs">
            Los backups se almacenan en el servidor
            en <Code fz="xs">storage/app/backups/</Code>.
            Descarga y guarda una copia externa
            regularmente. Los backups más antiguos
            se eliminan automáticamente cuando se
            supera el límite de {meta?.max_backups ?? 10}.
          </Text>
        </Alert>

        {/* ── Barra de uso ── */}
        {meta && meta.total > 0 && (
          <div>
            <Group justify="space-between" mb={4}>
              <Text size="xs" c="dimmed">
                Almacenamiento de backups
              </Text>
              <Text size="xs" c="dimmed">
                {meta.total} de {meta.max_backups}
              </Text>
            </Group>
            <Progress
              value={porcentajeUsado}
              color={
                porcentajeUsado >= 80
                  ? 'orange'
                  : porcentajeUsado >= 60
                  ? 'yellow'
                  : 'blue'
              }
              size="xs"
              radius="xl"
            />
          </div>
        )}

        {/* ── Tabla de backups ── */}
        {backups.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="sm">
              <ThemeIcon
                size={56}
                radius="xl"
                color="gray"
                variant="light"
              >
                <IconDatabase size={28} />
              </ThemeIcon>
              <Text fw={600} c="gray.6">
                No hay backups disponibles
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                Genera el primer backup haciendo clic
                en "Nuevo backup".
              </Text>
            </Stack>
          </Center>
        ) : (
          <Paper
            radius="md"
            style={{
              border:
                '1px solid var(--mantine-color-gray-3)',
              overflow: 'hidden',
            }}
          >
            <Table
              striped
              highlightOnHover
              withRowBorders
            >
              <Table.Thead
                style={{
                  background:
                    'var(--mantine-color-gray-1)',
                }}
              >
                <Table.Tr>
                  <Table.Th>Archivo</Table.Th>
                  <Table.Th w={100} ta="right">
                    Tamaño
                  </Table.Th>
                  <Table.Th w={160}>
                    <Group gap={5}>
                      <IconClock size={13} />
                      Generado
                    </Group>
                  </Table.Th>
                  <Table.Th w={110} ta="center">
                    Acciones
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {backups.map((backup, index) => (
                  <Table.Tr key={backup.archivo}>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <ThemeIcon
                          size={28}
                          radius="md"
                          color="blue"
                          variant="light"
                        >
                          <IconDatabase size={14} />
                        </ThemeIcon>
                        <div>
                          <Text
                            size="xs"
                            fw={600}
                            ff="monospace"
                            lineClamp={1}
                            style={{
                              maxWidth: 300,
                            }}
                          >
                            {backup.archivo}
                          </Text>
                          {index === 0 && (
                            <Badge
                              size="xs"
                              color="green"
                              variant="light"
                            >
                              Más reciente
                            </Badge>
                          )}
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="xs" c="dimmed"
                        ff="monospace">
                        {backup.tamano_legible}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {backup.creado_en}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group
                        gap="xs"
                        justify="center"
                        wrap="nowrap"
                      >
                        {/* Descargar */}
                        <Tooltip label="Descargar backup">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            loading={
                              descargando ===
                              backup.archivo
                            }
                            onClick={() =>
                              descargar(backup.archivo)
                            }
                          >
                            <IconDownload size={15} />
                          </ActionIcon>
                        </Tooltip>
                        {/* Eliminar */}
                        <Tooltip label="Eliminar backup">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() =>
                              setBackupAEliminar(backup)
                            }
                          >
                            <IconTrash size={15} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {/* ── Alerta si está generando ── */}
        {generando && (
          <Alert
            icon={<IconDatabaseExport size={15} />}
            color="blue"
            variant="light"
          >
            <Text size="xs">
              Generando backup de PostgreSQL...
              Esto puede tardar unos segundos
              dependiendo del tamaño de la base de datos.
              No cierres esta página.
            </Text>
          </Alert>
        )}

      </Stack>

      {/* ── Modales ── */}
      <ModalRestauracion
        abierto={modalRestauracionAbierto}
        onCerrar={cerrarRestauracion}
      />

      <ModalConfirmarEliminar
        backup={backupAEliminar}
        onConfirmar={() => {
          if (backupAEliminar) {
            eliminar(backupAEliminar.archivo, {
              onSuccess: () =>
                setBackupAEliminar(null),
            });
          }
        }}
        onCerrar={() => setBackupAEliminar(null)}
        eliminando={eliminando}
      />
    </>
  );
}
