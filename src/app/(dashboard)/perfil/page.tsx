"use client";

import { useEffect } from "react";
import {
  Grid,
  Stack,
  Paper,
  Title,
  Text,
  Group,
  Tabs,
  TextInput,
  Button,
  PasswordInput,
  Badge,
  Avatar,
  Divider,
  Alert,
  ThemeIcon,
  SimpleGrid,
  Progress,
  Skeleton,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconUser,
  IconShieldLock,
  IconShieldCheck,
  IconKey,
  IconMail,
  IconCheck,
  IconAlertCircle,
  IconBuildingBank,
  IconFolderOpen,
  IconStar,
  IconNetwork,
  IconTrophy,
  IconFiles,
  IconCalendar,
  IconUsers,
  IconMap,
  IconLayoutDashboard,
  IconFileAnalytics,
  IconFlag,
  IconMapPin,
  IconPhone,
  IconId,
  IconBriefcase,
  IconBuilding,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import {
  usePerfil,
  useActualizarPerfil,
  useCambiarPassword,
} from "@/queries/perfil.queries";

// ── Constantes ──────────────────────────────────────────

const ETIQUETA_ROL: Record<string, string> = {
  super_admin: "Super Administrador",
  admin_provincial: "Administrador Provincial",
  editor: "Editor",
  visualizador: "Visualizador",
  publico: "Público",
};

const COLOR_ROL: Record<string, string> = {
  super_admin: "red",
  admin_provincial: "blue",
  editor: "green",
  visualizador: "gray",
  publico: "gray",
};

const GRUPOS_PERMISOS = [
  { grupo: "Proyectos", icono: IconFolderOpen, prefijo: "proyectos" },
  { grupo: "Hitos", icono: IconFlag, prefijo: "hitos" },
  { grupo: "Actores", icono: IconBuildingBank, prefijo: "actores" },
  { grupo: "Buenas Prácticas", icono: IconStar, prefijo: "practicas" },
  { grupo: "Redes", icono: IconNetwork, prefijo: "redes" },
  { grupo: "Emblemáticos", icono: IconTrophy, prefijo: "emblematicos" },
  { grupo: "Documentos", icono: IconFiles, prefijo: "documentos" },
  { grupo: "Eventos", icono: IconCalendar, prefijo: "eventos" },
  { grupo: "Mapa", icono: IconMap, prefijo: "mapa" },
  { grupo: "Análisis", icono: IconFileAnalytics, prefijo: "analisis" },
  { grupo: "Dashboard", icono: IconLayoutDashboard, prefijo: "dashboard" },
  { grupo: "Reportes", icono: IconFileAnalytics, prefijo: "reportes" },
  { grupo: "Usuarios", icono: IconUsers, prefijo: "usuarios" },
];

// ── Indicador de fortaleza de contraseña ────────────────

function FortalezaPassword({ password }: { password: string }) {
  const calcularFortaleza = (p: string) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  if (!password) return null;

  const score = calcularFortaleza(password);
  const config = [
    { label: "Muy débil", color: "red", value: 20 },
    { label: "Débil", color: "orange", value: 40 },
    { label: "Regular", color: "yellow", value: 60 },
    { label: "Fuerte", color: "lime", value: 80 },
    { label: "Muy fuerte", color: "green", value: 100 },
  ][score - 1] ?? { label: "Muy débil", color: "red", value: 20 };

  return (
    <Stack gap={4} mt={4}>
      <Progress
        value={config.value}
        color={config.color}
        size="xs"
        radius="xl"
      />
      <Text size="xs" c={`${config.color}.6`}>
        Fortaleza: {config.label}
      </Text>
    </Stack>
  );
}

// ── Tab 1: Información personal ─────────────────────────

interface TabInformacionProps {
  nombre: string;
  email: string;
  telefono: string | null;
  cargo: string | null;
  entidad: string | null;
  dni: string | null;
  isPending: boolean;
  onGuardar: (datos: {
    name?: string;
    email?: string;
    telefono?: string | null;
    cargo?: string | null;
    entidad?: string | null;
    dni?: string | null;
  }) => void;
  erroresApi: Record<string, string>;
}

function TabInformacion({
  nombre,
  email,
  telefono,
  cargo,
  entidad,
  dni,
  isPending,
  onGuardar,
  erroresApi,
}: TabInformacionProps) {
  const form = useForm({
    initialValues: {
      name: nombre,
      email,
      telefono: telefono ?? "",
      cargo: cargo ?? "",
      entidad: entidad ?? "",
      dni: dni ?? "",
    },
    validate: {
      name: (v) =>
        !v.trim()
          ? "El nombre es requerido"
          : v.length > 200
            ? "Máximo 200 caracteres"
            : null,
      email: (v) =>
        !v.trim()
          ? "El email es requerido"
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
            ? "Email inválido"
            : null,
      telefono: (v) => (v && v.length > 20 ? "Máximo 20 caracteres" : null),
      cargo: (v) => (v && v.length > 150 ? "Máximo 150 caracteres" : null),
      entidad: (v) => (v && v.length > 200 ? "Máximo 200 caracteres" : null),
      dni: (v) => (v && v.length > 20 ? "Máximo 20 caracteres" : null),
    },
  });

  // Propagar errores del backend al formulario
  useEffect(() => {
    if (erroresApi.name) form.setFieldError("name", erroresApi.name);
    if (erroresApi.email) form.setFieldError("email", erroresApi.email);
    if (erroresApi.telefono)
      form.setFieldError("telefono", erroresApi.telefono);
    if (erroresApi.cargo) form.setFieldError("cargo", erroresApi.cargo);
    if (erroresApi.entidad) form.setFieldError("entidad", erroresApi.entidad);
    if (erroresApi.dni) form.setFieldError("dni", erroresApi.dni);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erroresApi]);

  // Solo enviamos los campos que cambiaron
  const handleSubmit = form.onSubmit((values) => {
    const cambios: {
      name?: string;
      email?: string;
      telefono?: string | null;
      cargo?: string | null;
      entidad?: string | null;
      dni?: string | null;
    } = {};

    if (values.name !== nombre) cambios.name = values.name;
    if (values.email !== email) cambios.email = values.email;
    if (values.telefono !== (telefono ?? ""))
      cambios.telefono = values.telefono || null;
    if (values.cargo !== (cargo ?? "")) cambios.cargo = values.cargo || null;
    if (values.entidad !== (entidad ?? ""))
      cambios.entidad = values.entidad || null;
    if (values.dni !== (dni ?? "")) cambios.dni = values.dni || null;

    if (Object.keys(cambios).length === 0) return;
    onGuardar(cambios);
  });

  const hayChange =
    form.values.name !== nombre ||
    form.values.email !== email ||
    form.values.telefono !== (telefono ?? "") ||
    form.values.cargo !== (cargo ?? "") ||
    form.values.entidad !== (entidad ?? "") ||
    form.values.dni !== (dni ?? "");

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {/* ── Datos de acceso ── */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput
            label="Nombre completo"
            leftSection={<IconUser size={16} />}
            {...form.getInputProps("name")}
            disabled={isPending}
          />
          <TextInput
            label="Correo electrónico"
            leftSection={<IconMail size={16} />}
            {...form.getInputProps("email")}
            disabled={isPending}
            //description="Si cambias tu email, deberás verificarlo."
          />
        </SimpleGrid>

        <Divider label="Información adicional" labelPosition="left" />

        {/* ── Datos profesionales ── */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput
            label="Teléfono"
            leftSection={<IconPhone size={16} />}
            placeholder="Ej: +593 99 999 9999"
            {...form.getInputProps("telefono")}
            disabled={isPending}
          />
          <TextInput
            label="Cédula / DNI"
            leftSection={<IconId size={16} />}
            placeholder="Número de identificación"
            {...form.getInputProps("dni")}
            disabled={isPending}
          />
          <TextInput
            label="Cargo"
            leftSection={<IconBriefcase size={16} />}
            placeholder="Tu cargo o puesto"
            {...form.getInputProps("cargo")}
            disabled={isPending}
          />
          <TextInput
            label="Entidad / Institución"
            leftSection={<IconBuilding size={16} />}
            placeholder="Nombre de tu institución"
            {...form.getInputProps("entidad")}
            disabled={isPending}
          />
        </SimpleGrid>

        <Group justify="flex-end">
          {hayChange && (
            <Button
              variant="subtle"
              color="gray"
              onClick={() => form.reset()}
              disabled={isPending}
            >
              Descartar cambios
            </Button>
          )}
          <Button
            type="submit"
            loading={isPending}
            disabled={!hayChange}
            leftSection={<IconCheck size={15} />}
          >
            Guardar cambios
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

// ── Tab 2: Seguridad / Contraseña ────────────────────────

interface TabSeguridadProps {
  onCambiar: (datos: {
    password_actual: string;
    password_nuevo: string;
    password_nuevo_confirmation: string;
  }) => void;
  isPending: boolean;
}

function TabSeguridad({ onCambiar, isPending }: TabSeguridadProps) {
  const form = useForm({
    initialValues: {
      password_actual: "",
      password_nuevo: "",
      password_nuevo_confirmation: "",
    },
    validate: {
      password_actual: (v) => (!v ? "La contraseña actual es requerida" : null),
      password_nuevo: (v) =>
        !v
          ? "La nueva contraseña es requerida"
          : v.length < 8
            ? "Mínimo 8 caracteres"
            : null,
      password_nuevo_confirmation: (v, vals) =>
        v !== vals.password_nuevo ? "Las contraseñas no coinciden" : null,
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    onCambiar(values);
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Alert
          icon={<IconShieldLock size={15} />}
          color="blue"
          variant="light"
          radius="md"
        >
          <Text size="xs">
            Usa una contraseña única que no uses en otros servicios. Mínimo 8
            caracteres, idealmente con letras, números y símbolos.
          </Text>
        </Alert>

        <PasswordInput
          label="Contraseña actual"
          leftSection={<IconKey size={16} />}
          placeholder="Tu contraseña actual"
          {...form.getInputProps("password_actual")}
          disabled={isPending}
        />

        <Divider label="Nueva contraseña" labelPosition="left" />

        <Stack gap={4}>
          <PasswordInput
            label="Nueva contraseña"
            leftSection={<IconShieldLock size={16} />}
            placeholder="Mínimo 8 caracteres"
            {...form.getInputProps("password_nuevo")}
            disabled={isPending}
          />
          <FortalezaPassword password={form.values.password_nuevo} />
        </Stack>

        <PasswordInput
          label="Confirmar nueva contraseña"
          leftSection={<IconShieldCheck size={16} />}
          placeholder="Repite la nueva contraseña"
          {...form.getInputProps("password_nuevo_confirmation")}
          disabled={isPending}
        />

        <Group justify="flex-end">
          <Button
            type="submit"
            loading={isPending}
            color="red"
            leftSection={<IconKey size={15} />}
          >
            Cambiar contraseña
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

// ── Tab 3: Mis permisos ──────────────────────────────────

interface TabPermisosProps {
  permisos: string[];
  provincias: Array<{ id: string; nombre: string }>;
}

function TabPermisos({ permisos, provincias }: TabPermisosProps) {
  const etiquetaPermiso = (p: string): string => {
    const accion = p.split(".")[1] ?? p;
    const mapa: Record<string, string> = {
      ver: "Ver",
      crear: "Crear",
      editar: "Editar",
      eliminar: "Eliminar",
      exportar: "Exportar",
      ver_auditoria: "Ver auditoría",
      ver_global: "Vista global",
      ver_todas_provincias: "Ver todas las provincias",
      ver_confidencial: "Ver confidenciales",
      ver_todas_capas: "Ver todas las capas",
      cambiar_estado: "Cambiar estado",
      destacar: "Destacar",
      valorar: "Valorar",
      publicar: "Publicar",
      subir: "Subir",
      gestionar_miembros: "Gestionar miembros",
      gestionar_participantes: "Gestionar participantes",
      asignar_rol: "Asignar roles",
      asignar_provincia: "Asignar provincias",
      completar: "Completar",
      resolver: "Resolver",
      generar: "Generar",
      exportar_masivo: "Exportar masivo",
    };
    return mapa[accion] ?? accion;
  };

  return (
    <Stack gap="lg">
      {/* Provincias asignadas */}
      {provincias.length > 0 && (
        <Paper
          p="md"
          radius="md"
          style={{
            background: "var(--mantine-color-blue-0)",
            border: "1px solid var(--mantine-color-blue-2)",
          }}
        >
          <Group gap="xs" mb="sm">
            <ThemeIcon size={24} radius="md" color="blue" variant="light">
              <IconMapPin size={13} />
            </ThemeIcon>
            <Text fw={600} size="sm">
              Provincias asignadas
            </Text>
          </Group>
          <Group gap="xs">
            {provincias.map((p) => (
              <Badge key={p.id} variant="light" color="blue">
                {p.nombre}
              </Badge>
            ))}
          </Group>
        </Paper>
      )}

      {/* Grid de permisos por módulo */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
        {GRUPOS_PERMISOS.map(({ grupo, icono: Icono, prefijo }) => {
          const permisosGrupo = permisos.filter((p) =>
            p.startsWith(prefijo + "."),
          );
          if (permisosGrupo.length === 0) return null;

          return (
            <Paper
              key={prefijo}
              p="md"
              radius="md"
              style={{ border: "1px solid var(--mantine-color-gray-3)" }}
            >
              <Group gap="xs" mb="sm">
                <ThemeIcon size={28} radius="md" color="blue" variant="light">
                  <Icono size={15} />
                </ThemeIcon>
                <Text fw={600} size="sm">
                  {grupo}
                </Text>
              </Group>
              <Stack gap={4}>
                {permisosGrupo.map((p) => (
                  <Group key={p} gap="xs">
                    <IconCheck size={12} color="var(--mantine-color-green-6)" />
                    <Text size="xs" c="dimmed">
                      {etiquetaPermiso(p)}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Paper>
          );
        })}
      </SimpleGrid>

      {permisos.length === 0 && (
        <Alert
          icon={<IconAlertCircle size={15} />}
          color="orange"
          variant="light"
        >
          <Text size="sm">
            Tu cuenta no tiene permisos asignados. Contacta al administrador del
            sistema.
          </Text>
        </Alert>
      )}
    </Stack>
  );
}

// ── Página principal ─────────────────────────────────────

export default function PerfilPage() {
  const { data: perfil, isLoading } = usePerfil();
  const {
    mutate: actualizar,
    isPending: actualizando,
    error: errorActualizar,
  } = useActualizarPerfil();
  const { mutate: cambiarPwd, isPending: cambiando } = useCambiarPassword();

  // Extraer errores de API para los formularios
  const erroresApi =
    (
      errorActualizar as {
        response?: { data?: { errors?: Record<string, string> } };
      } | null
    )?.response?.data?.errors ?? {};

  if (isLoading) {
    return (
      <>
        <PageHeader
          titulo="Mi Perfil"
          breadcrumbs={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Mi Perfil" },
          ]}
        />
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Skeleton height={280} radius="xl" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Skeleton height={400} radius="xl" />
          </Grid.Col>
        </Grid>
      </>
    );
  }

  if (!perfil) return null;

  // Iniciales para el avatar
  const iniciales = perfil.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const rolPrincipal = perfil.roles[0] ?? "publico";

  return (
    <>
      <PageHeader
        titulo="Mi Perfil"
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Mi Perfil" },
        ]}
      />

      <Grid gutter="lg">
        {/* ── Columna izquierda: tarjeta de identidad ── */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            {/* Tarjeta de perfil */}
            <Paper
              p="xl"
              radius="xl"
              style={{
                border: "1px solid var(--mantine-color-gray-3)",
                textAlign: "center",
              }}
            >
              {/* Avatar con iniciales */}
              <Avatar
                size={80}
                radius="xl"
                mx="auto"
                mb="md"
                style={{
                  background:
                    "linear-gradient(135deg, #1E4D8C 0%, #0B1F3A 100%)",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {iniciales}
              </Avatar>

              {/* Nombre */}
              <Title order={4} mb={4}>
                {perfil.name}
              </Title>

              {/* Email */}
              <Text size="sm" c="dimmed" mb="md">
                {perfil.email}
              </Text>

              {/* Rol */}
              <Badge
                size="md"
                color={COLOR_ROL[rolPrincipal] ?? "gray"}
                variant="light"
                mb="md"
              >
                {ETIQUETA_ROL[rolPrincipal] ?? rolPrincipal}
              </Badge>

              <Divider my="sm" />

              {/* Estadísticas rápidas */}
              <SimpleGrid cols={2} spacing="xs" mb="sm">
                <div>
                  <Text fw={700} size="lg">
                    {perfil.permissions.length}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Permisos
                  </Text>
                </div>
                <div>
                  <Text fw={700} size="lg">
                    {perfil.provincias.length > 0
                      ? perfil.provincias.length
                      : "∞"}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Provincias
                  </Text>
                </div>
              </SimpleGrid>

              {/* Provincias asignadas */}
              {perfil.provincias.length > 0 ? (
                <>
                  <Divider
                    label={
                      <Text size="xs" c="dimmed" fw={600}>
                        Provincias asignadas
                      </Text>
                    }
                    labelPosition="left"
                    mb="xs"
                  />
                  <Group gap={6} justify="center" wrap="wrap">
                    {perfil.provincias.map((p) => (
                      <Badge
                        key={p.id}
                        size="sm"
                        variant="light"
                        color="blue"
                        leftSection={<IconMapPin size={10} />}
                      >
                        {p.nombre}
                      </Badge>
                    ))}
                  </Group>
                </>
              ) : (
                <>
                  <Divider
                    label={
                      <Text size="xs" c="dimmed" fw={600}>
                        Cobertura
                      </Text>
                    }
                    labelPosition="left"
                    mb="xs"
                  />
                  <Badge
                    size="sm"
                    variant="light"
                    color="teal"
                    leftSection={<IconMap size={10} />}
                  >
                    Acceso global — todas las provincias
                  </Badge>
                </>
              )}
            </Paper>

            {/* Información de la cuenta */}
            <Paper
              p="md"
              radius="xl"
              style={{ border: "1px solid var(--mantine-color-gray-3)" }}
            >
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                tt="uppercase"
                style={{ letterSpacing: "0.08em" }}
                mb="sm"
              >
                Información de la cuenta
              </Text>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Estado
                  </Text>
                  <Badge size="xs" color="green" variant="light">
                    Activo
                  </Badge>
                </Group>
                {/* <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Email verificado
                  </Text>
                  {perfil.email_verified_at ? (
                    <Badge size="xs" color="green" variant="light">
                      Verificado
                    </Badge>
                  ) : (
                    <Badge size="xs" color="orange" variant="light">
                      Sin verificar
                    </Badge>
                  )}
                </Group> */}
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>

        {/* ── Columna derecha: tabs de edición ── */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper
            p="xl"
            radius="xl"
            style={{ border: "1px solid var(--mantine-color-gray-3)" }}
          >
            <Tabs defaultValue="informacion">
              <Tabs.List mb="xl">
                <Tabs.Tab
                  value="informacion"
                  leftSection={<IconUser size={15} />}
                >
                  Información personal
                </Tabs.Tab>
                <Tabs.Tab
                  value="seguridad"
                  leftSection={<IconShieldLock size={15} />}
                >
                  Seguridad
                </Tabs.Tab>
                <Tabs.Tab
                  value="permisos"
                  leftSection={<IconShieldCheck size={15} />}
                >
                  Mis permisos{" "}
                  <Badge size="xs" variant="light" color="blue" ml="xs">
                    {perfil.permissions.length}
                  </Badge>
                </Tabs.Tab>
              </Tabs.List>

              {/* Tab información */}
              <Tabs.Panel value="informacion">
                <TabInformacion
                  nombre={perfil.name}
                  email={perfil.email}
                  telefono={perfil.telefono}
                  cargo={perfil.cargo}
                  entidad={perfil.entidad}
                  dni={perfil.dni}
                  isPending={actualizando}
                  onGuardar={actualizar}
                  erroresApi={erroresApi}
                />
              </Tabs.Panel>

              {/* Tab seguridad */}
              <Tabs.Panel value="seguridad">
                <TabSeguridad onCambiar={cambiarPwd} isPending={cambiando} />
              </Tabs.Panel>

              {/* Tab permisos */}
              <Tabs.Panel value="permisos">
                <TabPermisos
                  permisos={perfil.permissions}
                  provincias={perfil.provincias}
                />
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  );
}
