"use client";

import { useState } from "react";
import {
  Tabs,
  Button,
  Group,
  TextInput,
  Select,
  Paper,
  Stack,
  Text,
  Badge,
  MultiSelect,
  Divider,
  Title,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconUsers,
  IconShield,
  IconPlus,
  IconSearch,
  IconMapPin,
  IconMap,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { UsuariosTable } from "@/components/modulos/configuracion/UsuariosTable";
import { AuditoriaTable } from "@/components/modulos/configuracion/AuditoriaTable";
import { UsuarioForm } from "@/components/modulos/configuracion/UsuarioForm";
import { TablaProvincias } from "@/components/modulos/configuracion/territorios/TablaProvincias";
import { TablaCantones } from "@/components/modulos/configuracion/territorios/TablaCantones";
import {
  useUsuarios,
  useCrearUsuario,
  useActualizarUsuario,
  useEliminarUsuario,
  useCambiarRol,
  useAsignarProvincias,
  useAuditoria,
  useCambiarEstado,
  useResetPassword,
} from "@/queries/usuarios.queries";
import { usePermisos } from "@/hooks/usePermisos";
import { useConfirm } from "@/hooks/useConfirm";
import { useAppSelector } from "@/store/hooks";
import { selectUsuario } from "@/store/slices/authSlice";
import {
  LABEL_ROL,
  COLOR_ROL,
  type UsuarioListado,
  type RolSistema,
} from "@/types/usuario.types";

// Opciones de roles para el select de filtro
const ROLES_FILTRO = [
  { value: "", label: "Todos los roles" },
  { value: "super_admin", label: "Super Admin" },
  { value: "admin_provincial", label: "Admin Provincial" },
  { value: "editor", label: "Editor" },
  { value: "visualizador", label: "Visualizador" },
  { value: "publico", label: "Público" },
];

const ACCIONES_FILTRO = [
  { value: "", label: "Todas las acciones" },
  { value: "crear", label: "Crear" },
  { value: "editar", label: "Editar" },
  { value: "eliminar", label: "Eliminar" },
  { value: "publicar", label: "Publicar" },
];

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import apiClient, { extractData, type Provincia } from "@/services/axios";

export default function ConfiguracionPage() {
  const [tabActiva, setTabActiva] = useState<string>("usuarios");

  // ── Estado usuarios ──────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [rolFiltro, setRolFiltro] = useState("");
  const [pageUsuarios, setPageUsuarios] = useState(1);
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);

  // ── Estado auditoría ─────────────────────────────
  const [accionFiltro, setAccionFiltro] = useState("");
  const [pageAuditoria, setPageAuditoria] = useState(1);

  const { can } = usePermisos();
  const { confirmar } = useConfirm();
  const usuarioActual = useAppSelector(selectUsuario);

  const esSuperAdmin = usuarioActual?.roles?.some(
    (r: string | { name: string }) =>
      typeof r === "string"
        ? r === "super_admin"
        : r.name === "super_admin"
  ) ?? false;

  // Permisos
  const puedeVerUsuarios = can("usuarios.ver");
  const puedeCrear = can("usuarios.crear");
  const puedeEditar = can("usuarios.editar");
  const puedeEliminar = can("usuarios.eliminar");
  const puedeAsignarRol = can("usuarios.asignar_rol");
  const puedeAsignarProv = can("usuarios.asignar_provincia");
  const puedeVerAuditoria = can("usuarios.ver_auditoria");

  // ── Queries de usuarios ──────────────────────────
  const { data: usuariosData, isFetching: fetchingUsuarios } = useUsuarios({
    search: debouncedSearch,
    rol: rolFiltro,
    page: pageUsuarios,
    per_page: 15,
  });

  // ── Queries de auditoría ─────────────────────────
  const { data: auditoriaData, isFetching: fetchingAuditoria } = useAuditoria({
    accion: accionFiltro,
    page: pageAuditoria,
    per_page: 20,
  });

  // ── Mutations ────────────────────────────────────
  const { mutateAsync: crearUsuarioAsync } = useCrearUsuario();
  const { mutateAsync: actualizarUsuarioAsync } = useActualizarUsuario();
  const { mutate: eliminarUsuario } = useEliminarUsuario();
  const { mutate: cambiarRol, isPending: cambiandoRol } = useCambiarRol();
  const { mutate: asignarProvincias, isPending: asignandoProv } =
    useAsignarProvincias();
  const { mutate: cambiarEstado } = useCambiarEstado();
  const { mutateAsync: resetPasswordAsync } = useResetPassword();

  const usuarios = usuariosData?.data ?? [];
  const auditoria = auditoriaData?.data ?? [];

  // ── Acciones de usuarios ─────────────────────────
  const abrirModalCrear = () => {
    modals.open({
      title: "Nuevo usuario",
      size: "md",
      children: (
        <UsuarioForm
          onSubmit={async (datos) => {
            try {
              await crearUsuarioAsync(datos);
              modals.closeAll();
            } catch (error) {
              // El error ya se maneja en el hook
            }
          }}
          onCancel={() => modals.closeAll()}
        />
      ),
    });
  };

  const abrirModalEditar = (u: UsuarioListado) => {
    modals.open({
      title: "Editar usuario",
      size: "md",
      children: (
        <UsuarioForm
          usuario={u}
          onSubmit={async (datos) => {
            try {
              await actualizarUsuarioAsync({ id: u.id, datos });
              modals.closeAll();
            } catch (error) {
              // El error ya se maneja en el hook
            }
          }}
          onCancel={() => modals.closeAll()}
        />
      ),
    });
  };

  const abrirModalRol = (u: UsuarioListado) => {
    const rolActual = (u.roles?.[0]?.name ?? "") as RolSistema;
    let nuevoRol = rolActual;

    modals.open({
      title: `Cambiar rol — ${u.name}`,
      size: "sm",
      children: (
        <Stack gap="md" p="sm">
          <Group gap="xs" align="center">
            <Text size="sm" c="dimmed">
              Rol actual:
            </Text>
            <Badge
              color={COLOR_ROL[rolActual] ?? "gray"}
              variant="light"
              size="sm"
            >
              {LABEL_ROL[rolActual] ?? rolActual}
            </Badge>
          </Group>
          <Select
            label="Nuevo rol"
            data={[
              { value: "super_admin", label: "Super Administrador" },
              { value: "admin_provincial", label: "Administrador Provincial" },
              { value: "editor", label: "Editor" },
              { value: "visualizador", label: "Visualizador" },
              { value: "publico", label: "Público" },
            ]}
            defaultValue={rolActual}
            onChange={(v) => (nuevoRol = (v ?? rolActual) as RolSistema)}
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
                  { onSuccess: () => modals.closeAll() },
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
      title: `Provincias — ${u.name}`,
      size: "sm",
      children: (
        <AsignarProvinciasForm
          usuario={u}
          onGuardar={(ids) =>
            asignarProvincias(
              { id: u.id, provincia_ids: ids },
              { onSuccess: () => modals.closeAll() },
            )
          }
          onCerrar={() => modals.closeAll()}
          isLoading={asignandoProv}
        />
      ),
    });
  };

  const cambiarEstadoUsuario = (u: UsuarioListado) => {
    confirmar({
      titulo: u.activo ? "Desactivar usuario" : "Activar usuario",
      mensaje: `¿Estás seguro de que deseas ${
        u.activo ? "desactivar" : "activar"
      } al usuario "${u.name}"? ${
        u.activo
          ? "El usuario no podrá acceder al sistema."
          : "El usuario podrá acceder al sistema nuevamente."
      }`,
      textoBoton: u.activo ? "Desactivar" : "Activar",
      colorBoton: u.activo ? "red" : "green",
      onConfirmar: () => cambiarEstado(u.id),
    });
  };

  const abrirModalResetPassword = (u: UsuarioListado) => {
    modals.open({
      title: "Resetear Contraseña",
      size: "sm",
      children: (
        <ResetPasswordForm
          u={u}
          onCancel={() => modals.closeAll()}
          onConfirm={async (enviarCorreo) => {
            try {
              const res = await resetPasswordAsync({ id: u.id, enviar_correo: enviarCorreo });
              modals.closeAll();
              if (!enviarCorreo && res.password_generada) {
                modals.open({
                  title: "Contraseña generada",
                  children: (
                    <Stack gap="sm">
                      <Text size="sm">Por favor comparte la siguiente contraseña temporal con el usuario de forma segura:</Text>
                      <Paper p="sm" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)', textAlign: 'center' }}>
                        <Text size="lg" fw={700} style={{ fontFamily: 'monospace' }}>{res.password_generada}</Text>
                      </Paper>
                      <Button fullWidth onClick={() => modals.closeAll()}>Cerrar</Button>
                    </Stack>
                  )
                });
              }
            } catch (error) {
              // El error ya se maneja en el hook
            }
          }}
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
          { label: "Inicio", href: "/dashboard" },
          { label: "Configuración" },
        ]}
      />

      <Tabs value={tabActiva} onChange={(v) => setTabActiva(v ?? "usuarios")}>
        <Tabs.List mb="md">
          {puedeVerUsuarios && (
            <Tabs.Tab value="usuarios" leftSection={<IconUsers size={16} />}>
              Usuarios
              {usuariosData?.meta?.total != null && (
                <Badge size="xs" variant="light" color="gray" ml="xs">
                  {usuariosData.meta.total}
                </Badge>
              )}
            </Tabs.Tab>
          )}
          {puedeVerAuditoria && (
            <Tabs.Tab value="auditoria" leftSection={<IconShield size={16} />}>
              Auditoría
            </Tabs.Tab>
          )}
          <Tabs.Tab value="territorios" leftSection={<IconMap size={16} />}>
            Territorios
          </Tabs.Tab>
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
                  border: "1px solid var(--mantine-color-gray-3)",
                  background: "var(--mantine-color-gray-0)",
                }}
              >
                <Group gap="sm" wrap="wrap" justify="space-between">
                  <Group gap="sm" wrap="wrap" style={{ flex: 1 }}>
                    <TextInput
                      placeholder="Buscar usuario..."
                      leftSection={<IconSearch size={15} />}
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.currentTarget.value)}
                      style={{ flex: 1, minWidth: 200 }}
                      size="sm"
                    />
                    <Select
                      placeholder="Rol"
                      data={ROLES_FILTRO}
                      value={rolFiltro}
                      onChange={(v) => {
                        setRolFiltro(v ?? "");
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
                isLoading={fetchingUsuarios}
                onPageChange={setPageUsuarios}
                onEditar={abrirModalEditar}
                onEliminar={(u) =>
                  confirmar({
                    titulo: "Eliminar usuario",
                    mensaje: `¿Eliminar al usuario "${u.name}"? Esta acción no se puede deshacer.`,
                    textoBoton: "Eliminar",
                    colorBoton: "red",
                    onConfirmar: () => eliminarUsuario(u.id),
                  })
                }
                onCambiarRol={abrirModalRol}
                onAsignarProvincia={abrirModalProvincias}
                onCambiarEstado={cambiarEstadoUsuario}
                onResetPassword={abrirModalResetPassword}
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
                  border: "1px solid var(--mantine-color-gray-3)",
                  background: "var(--mantine-color-gray-0)",
                }}
              >
                <Group gap="sm" wrap="wrap">
                  <Select
                    placeholder="Filtrar por acción"
                    data={ACCIONES_FILTRO}
                    value={accionFiltro}
                    onChange={(v) => {
                      setAccionFiltro(v ?? "");
                      setPageAuditoria(1);
                    }}
                    w={200}
                    size="sm"
                  />
                  <Text size="xs" c="dimmed">
                    Haz clic en una fila para ver los detalles del cambio.
                  </Text>
                </Group>
              </Paper>

              <AuditoriaTable
                registros={auditoria}
                total={auditoriaData?.meta?.total ?? 0}
                page={pageAuditoria}
                perPage={20}
                isLoading={fetchingAuditoria}
                onPageChange={setPageAuditoria}
              />
            </Stack>
          </Tabs.Panel>
        )}

        {/* ── Tab Territorios ── */}
        <Tabs.Panel value="territorios">
          <Stack gap="xl">
            {/* Sección Provincias */}
            <div>
              <Group gap="xs" mb="md">
                <Title order={5} c="gray.7">
                  Provincias del Ecuador
                </Title>
                <Badge variant="light" color="gray" size="sm">
                  24
                </Badge>
              </Group>
              <TablaProvincias puedeEditar={esSuperAdmin} />
            </div>

            {/* Separador visual */}
            <Divider
              label={
                <Group gap="xs">
                  <IconMap size={14} />
                  <Text size="xs" fw={600}>
                    Cantones
                  </Text>
                </Group>
              }
              labelPosition="left"
            />

            {/* Sección Cantones */}
            <div>
              <Group gap="xs" mb="md">
                <Title order={5} c="gray.7">
                  Cantones del Ecuador
                </Title>
                <Badge variant="light" color="gray" size="sm">
                  221
                </Badge>
              </Group>
              <TablaCantones puedeEditar={esSuperAdmin} />
            </div>
          </Stack>
        </Tabs.Panel>
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
  usuario: UsuarioListado;
  onGuardar: (ids: string[]) => void;
  onCerrar: () => void;
  isLoading: boolean;
}) {
  const { data: provinciasData } = useQuery({
    queryKey: queryKeys.provincias.list,
    queryFn: async () => {
      const res = await apiClient.get("/publico/provincias");
      return extractData<Provincia[]>(res);
    },
    staleTime: Infinity,
  });

  const [seleccionadas, setSeleccionadas] = useState<string[]>(
    (usuario.provincias ?? []).map((p) => p.id),
  );

  const opciones = (provinciasData ?? []).map((p: Provincia) => ({
    value: p.id,
    label: p.nombre,
  }));

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

function ResetPasswordForm({
  u,
  onCancel,
  onConfirm,
}: {
  u: UsuarioListado;
  onCancel: () => void;
  onConfirm: (enviar: boolean) => Promise<void>;
}) {
  const [enviarCorreo, setEnviarCorreo] = useState(true);
  const [loading, setLoading] = useState(false);

  return (
    <Stack gap="md" p="sm">
      <Text size="sm">
        Se generará una nueva contraseña segura para el usuario <strong>{u.name}</strong>.
      </Text>
      <div style={{ paddingBottom: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
          <input 
            type="checkbox" 
            checked={enviarCorreo}
            onChange={(e) => setEnviarCorreo(e.target.checked)}
          />
          Enviar nueva contraseña por correo
        </label>
      </div>
      <Group justify="flex-end" gap="sm">
        <Button variant="subtle" color="gray" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          color="orange"
          loading={loading}
          onClick={async () => {
            setLoading(true);
            try {
              await onConfirm(enviarCorreo);
            } finally {
              setLoading(false);
            }
          }}
        >
          Resetear
        </Button>
      </Group>
    </Stack>
  );
}
