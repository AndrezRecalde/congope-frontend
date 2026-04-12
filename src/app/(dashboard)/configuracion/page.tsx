'use client'

import { useState }        from 'react';
import {
  Tabs, Button, Group, TextInput, Select,
  Paper, Stack, Text,
  Badge, MultiSelect,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { modals }            from '@mantine/modals';
import {
  IconUsers, IconShield, IconPlus,
  IconSearch, IconMapPin,
} from '@tabler/icons-react';
import { PageHeader }        from '@/components/ui/PageHeader/PageHeader';
import { UsuariosTable }     from '@/components/modulos/configuracion/UsuariosTable';
import { AuditoriaTable }    from '@/components/modulos/configuracion/AuditoriaTable';
import { UsuarioForm }       from '@/components/modulos/configuracion/UsuarioForm';
import {
  useUsuarios,
  useCrearUsuario,
  useActualizarUsuario,
  useEliminarUsuario,
  useCambiarRol,
  useAsignarProvincias,
  useAuditoria,
} from '@/queries/usuarios.queries';
import { usePermisos }  from '@/hooks/usePermisos';
import { useConfirm }   from '@/hooks/useConfirm';
import { useAppSelector } from '@/store/hooks';
import { selectUsuario } from '@/store/slices/authSlice';
import {
  LABEL_ROL,
  COLOR_ROL,
  type UsuarioListado,
  type RolSistema,
} from '@/types/usuario.types';

// Opciones de roles para el select de filtro
const ROLES_FILTRO = [
  { value: '', label: 'Todos los roles' },
  { value: 'super_admin',      label: 'Super Admin' },
  { value: 'admin_provincial', label: 'Admin Provincial' },
  { value: 'editor',           label: 'Editor' },
  { value: 'visualizador',     label: 'Visualizador' },
  { value: 'publico',          label: 'Público' },
];

const ACCIONES_FILTRO = [
  { value: '',         label: 'Todas las acciones' },
  { value: 'crear',    label: 'Crear' },
  { value: 'editar',   label: 'Editar' },
  { value: 'eliminar', label: 'Eliminar' },
  { value: 'publicar', label: 'Publicar' },
];

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import apiClient, { extractData, type Provincia } from '@/services/axios';

export default function ConfiguracionPage() {
  const [tabActiva, setTabActiva] =
    useState<string>('usuarios');

  // ── Estado usuarios ──────────────────────────────
  const [searchInput, setSearchInput] = useState('');
  const [rolFiltro, setRolFiltro]     = useState('');
  const [pageUsuarios, setPageUsuarios] = useState(1);
  const [debouncedSearch] =
    useDebouncedValue(searchInput, 400);

  // ── Estado auditoría ─────────────────────────────
  const [accionFiltro, setAccionFiltro] = useState('');
  const [pageAuditoria, setPageAuditoria] = useState(1);

  const { can }     = usePermisos();
  const { confirmar } = useConfirm();
  const usuarioActual = useAppSelector(selectUsuario);

  // Permisos
  const puedeVerUsuarios    = can('usuarios.ver');
  const puedeCrear          = can('usuarios.crear');
  const puedeEditar         = can('usuarios.editar');
  const puedeEliminar       = can('usuarios.eliminar');
  const puedeAsignarRol     = can('usuarios.asignar_rol');
  const puedeAsignarProv    = can('usuarios.asignar_provincia');
  const puedeVerAuditoria   = can('usuarios.ver_auditoria');

  // ── Queries de usuarios ──────────────────────────
  const {
    data: usuariosData,
    isLoading: cargandoUsuarios,
  } = useUsuarios({
    search:   debouncedSearch,
    rol:      rolFiltro,
    page:     pageUsuarios,
    per_page: 15,
  });

  // ── Queries de auditoría ─────────────────────────
  const {
    data: auditoriaData,
    isLoading: cargandoAuditoria,
  } = useAuditoria({
    accion:   accionFiltro,
    page:     pageAuditoria,
    per_page: 20,
  });

  // ── Mutations ────────────────────────────────────
  const {
    mutate: crearUsuario,
    isPending: creando,
  } = useCrearUsuario();
  const {
    mutate: actualizarUsuario,
    isPending: actualizando,
  } = useActualizarUsuario();
  const { mutate: eliminarUsuario } =
    useEliminarUsuario();
  const {
    mutate: cambiarRol,
    isPending: cambiandoRol,
  } = useCambiarRol();
  const {
    mutate: asignarProvincias,
    isPending: asignandoProv,
  } = useAsignarProvincias();

  const usuarios  = usuariosData?.data  ?? [];
  const auditoria = auditoriaData?.data ?? [];

  // ── Acciones de usuarios ─────────────────────────
  const abrirModalCrear = () => {
    modals.open({
      title:    'Nuevo usuario',
      size:     'md',
      children: (
        <UsuarioForm
          onSubmit={(datos) =>
            crearUsuario(datos, {
              onSuccess: () => modals.closeAll(),
            })
          }
          onCancel={() => modals.closeAll()}
          isLoading={creando}
        />
      ),
    });
  };

  const abrirModalEditar = (u: UsuarioListado) => {
    modals.open({
      title:    'Editar usuario',
      size:     'md',
      children: (
        <UsuarioForm
          usuario={u}
          onSubmit={(datos) =>
            actualizarUsuario(
              { id: u.id, datos },
              { onSuccess: () => modals.closeAll() }
            )
          }
          onCancel={() => modals.closeAll()}
          isLoading={actualizando}
        />
      ),
    });
  };

  const abrirModalRol = (u: UsuarioListado) => {
    const rolActual =
      (u.roles?.[0]?.name ?? '') as RolSistema;
    let nuevoRol = rolActual;

    modals.open({
      title:    `Cambiar rol — ${u.name}`,
      size:     'sm',
      children: (
        <Stack gap="md" p="sm">
          <Group gap="xs" align="center">
            <Text size="sm" c="dimmed">
              Rol actual:
            </Text>
            <Badge
              color={COLOR_ROL[rolActual] ?? 'gray'}
              variant="light"
              size="sm"
            >
              {LABEL_ROL[rolActual] ?? rolActual}
            </Badge>
          </Group>
          <Select
            label="Nuevo rol"
            data={[
              { value: 'super_admin',
                label: 'Super Administrador' },
              { value: 'admin_provincial',
                label: 'Administrador Provincial' },
              { value: 'editor',
                label: 'Editor' },
              { value: 'visualizador',
                label: 'Visualizador' },
              { value: 'publico',
                label: 'Público' },
            ]}
            defaultValue={rolActual}
            onChange={(v) =>
              nuevoRol = (v ?? rolActual) as RolSistema
            }
          />
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => modals.closeAll()}
            >
              Cancelar
            </Button>
            <Button
              color="violet"
              loading={cambiandoRol}
              leftSection={<IconShield size={15} />}
              onClick={() =>
                cambiarRol(
                  { id: u.id, rol: nuevoRol },
                  { onSuccess: () => modals.closeAll() }
                )
              }
            >
              Cambiar rol
            </Button>
          </Group>
        </Stack>
      ),
    });
  };

  const abrirModalProvincias = (u: UsuarioListado) => {
    modals.open({
      title:    `Provincias — ${u.name}`,
      size:     'sm',
      children: (
        <AsignarProvinciasForm
          usuario={u}
          onGuardar={(ids) =>
            asignarProvincias(
              { id: u.id, provincia_ids: ids },
              { onSuccess: () => modals.closeAll() }
            )
          }
          onCerrar={() => modals.closeAll()}
          isLoading={asignandoProv}
        />
      ),
    });
  };

  return (
    <>
      <PageHeader
        titulo="Configuración"
        descripcion="Gestión de usuarios del sistema y registro de actividad"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Configuración' },
        ]}
      />

      <Tabs
        value={tabActiva}
        onChange={(v) => setTabActiva(v ?? 'usuarios')}
      >
        <Tabs.List mb="md">
          {puedeVerUsuarios && (
            <Tabs.Tab
              value="usuarios"
              leftSection={<IconUsers size={16} />}
            >
              Usuarios
              {usuariosData?.meta?.total != null && (
                <Badge
                  size="xs"
                  variant="light"
                  color="gray"
                  ml="xs"
                >
                  {usuariosData.meta.total}
                </Badge>
              )}
            </Tabs.Tab>
          )}
          {puedeVerAuditoria && (
            <Tabs.Tab
              value="auditoria"
              leftSection={<IconShield size={16} />}
            >
              Auditoría
            </Tabs.Tab>
          )}
        </Tabs.List>

        {/* ── Tab Usuarios ── */}
        {puedeVerUsuarios && (
          <Tabs.Panel value="usuarios">
            <Stack gap="md">
              {/* Filtros y botón crear */}
              <Paper
                p="md"
                radius="md"
                style={{
                  border:
                    '1px solid var(--mantine-color-gray-3)',
                  background:
                    'var(--mantine-color-gray-0)',
                }}
              >
                <Group gap="sm" wrap="wrap"
                  justify="space-between">
                  <Group gap="sm" wrap="wrap"
                    style={{ flex: 1 }}>
                    <TextInput
                      placeholder="Buscar usuario..."
                      leftSection={<IconSearch size={15} />}
                      value={searchInput}
                      onChange={(e) =>
                        setSearchInput(
                          e.currentTarget.value
                        )
                      }
                      style={{ flex: 1, minWidth: 200 }}
                      size="sm"
                    />
                    <Select
                      placeholder="Rol"
                      data={ROLES_FILTRO}
                      value={rolFiltro}
                      onChange={(v) => {
                        setRolFiltro(v ?? '');
                        setPageUsuarios(1);
                      }}
                      w={180}
                      size="sm"
                    />
                  </Group>
                  {puedeCrear && (
                    <Button
                      color="congope"
                      size="sm"
                      leftSection={<IconPlus size={15} />}
                      onClick={abrirModalCrear}
                    >
                      Nuevo usuario
                    </Button>
                  )}
                </Group>
              </Paper>

              <UsuariosTable
                usuarios={usuarios}
                total={usuariosData?.meta?.total ?? 0}
                page={pageUsuarios}
                perPage={15}
                isLoading={cargandoUsuarios}
                onPageChange={setPageUsuarios}
                onEditar={abrirModalEditar}
                onEliminar={(u) =>
                  confirmar({
                    titulo:     'Eliminar usuario',
                    mensaje:    `¿Eliminar al usuario "${u.name}"? Esta acción no se puede deshacer.`,
                    textoBoton: 'Eliminar',
                    colorBoton: 'red',
                    onConfirmar: () =>
                      eliminarUsuario(u.id),
                  })
                }
                onCambiarRol={abrirModalRol}
                onAsignarProvincia={abrirModalProvincias}
                puedeEditar={puedeEditar}
                puedeEliminar={puedeEliminar}
                puedeAsignarRol={puedeAsignarRol}
                puedeAsignarProv={puedeAsignarProv}
                usuarioActualId={usuarioActual?.id ?? 0}
              />
            </Stack>
          </Tabs.Panel>
        )}

        {/* ── Tab Auditoría ── */}
        {puedeVerAuditoria && (
          <Tabs.Panel value="auditoria">
            <Stack gap="md">
              {/* Filtros auditoría */}
              <Paper
                p="md"
                radius="md"
                style={{
                  border:
                    '1px solid var(--mantine-color-gray-3)',
                  background:
                    'var(--mantine-color-gray-0)',
                }}
              >
                <Group gap="sm" wrap="wrap">
                  <Select
                    placeholder="Filtrar por acción"
                    data={ACCIONES_FILTRO}
                    value={accionFiltro}
                    onChange={(v) => {
                      setAccionFiltro(v ?? '');
                      setPageAuditoria(1);
                    }}
                    w={200}
                    size="sm"
                  />
                  <Text size="xs" c="dimmed">
                    Haz clic en una fila para ver
                    los detalles del cambio.
                  </Text>
                </Group>
              </Paper>

              <AuditoriaTable
                registros={auditoria}
                total={auditoriaData?.meta?.total ?? 0}
                page={pageAuditoria}
                perPage={20}
                isLoading={cargandoAuditoria}
                onPageChange={setPageAuditoria}
              />
            </Stack>
          </Tabs.Panel>
        )}
      </Tabs>
    </>
  );
}

// Formulario inline para asignar provincias
function AsignarProvinciasForm({
  usuario,
  onGuardar,
  onCerrar,
  isLoading,
}: {
  usuario:    UsuarioListado;
  onGuardar:  (ids: string[]) => void;
  onCerrar:   () => void;
  isLoading:  boolean;
}) {
  const { data: provinciasData } = useQuery({
    queryKey: queryKeys.provincias.list,
    queryFn:  async () => {
      const res = await apiClient.get('/provincias');
      return extractData<Provincia[]>(res);
    },
    staleTime: Infinity,
  });

  const [seleccionadas, setSeleccionadas] = useState<string[]>(
    (usuario.provincias ?? []).map((p) => p.id)
  );

  const opciones = (provinciasData ?? []).map(
    (p: Provincia) => ({
      value: p.id,
      label: p.nombre,
    })
  );

  return (
    <Stack gap="md" p="sm">
      <MultiSelect
        label="Provincias asignadas"
        placeholder="Seleccionar provincias..."
        description="Sin selección = acceso a todas las provincias"
        data={opciones}
        value={seleccionadas}
        onChange={setSeleccionadas}
        searchable
        clearable
      />
      <Group justify="flex-end" gap="sm">
        <Button
          variant="subtle"
          color="gray"
          onClick={onCerrar}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          color="teal"
          loading={isLoading}
          leftSection={<IconMapPin size={15} />}
          onClick={() => onGuardar(seleccionadas)}
        >
          Guardar provincias
        </Button>
      </Group>
    </Stack>
  );
}
