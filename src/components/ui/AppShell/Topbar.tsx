"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Group,
  Text,
  Avatar,
  Menu,
  ActionIcon,
  Indicator,
  Divider,
  Box,
  UnstyledButton,
  Switch,
  useMantineColorScheme,
  useComputedColorScheme,
} from "@mantine/core";
import {
  IconMenu2,
  IconBell,
  IconUser,
  IconLogout,
  IconSettings,
  IconChevronDown,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { clearCredentials, selectUsuario } from "@/store/slices/authSlice";
import { authService } from "@/services/auth.service";

// Mapa de rutas a títulos legibles
const TITULOS: Record<string, string> = {
  "/dashboard": "Dashboard Ejecutivo",
  "/actores": "Actores de Cooperación",
  "/actores/nuevo": "Nuevo Actor",
  "/proyectos": "Proyectos",
  "/proyectos/nuevo": "Nuevo Proyecto",
  "/buenas-practicas": "Buenas Prácticas",
  "/buenas-practicas/nueva": "Nueva Buena Práctica",
  "/redes": "Redes y Articulación",
  "/redes/nueva": "Nueva Red",
  "/emblematicos": "Proyectos Emblemáticos",
  "/emblematicos/nuevo": "Nuevo Emblemático",
  "/mapa": "Mapa Interactivo",
  "/documentos": "Gestión Documental",
  "/eventos": "Agenda y Eventos",
  "/eventos/nuevo": "Nuevo Evento",
  "/reportes": "Reportería",
  "/configuracion": "Configuración",
  "/configuracion/usuarios": "Gestión de Usuarios",
  "/configuracion/auditoria": "Auditoría del Sistema",
};

function getTitulo(pathname: string): string {
  if (TITULOS[pathname]) return TITULOS[pathname];
  // Buscar por prefijo más específico primero
  const prefijo = Object.keys(TITULOS)
    .filter((k) => pathname.startsWith(k) && k !== "/")
    .sort((a, b) => b.length - a.length)[0];
  return prefijo ? TITULOS[prefijo] : "CONGOPE";
}

function getIniciales(nombre: string): string {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const usuario = useAppSelector(selectUsuario);

  const { toggleColorScheme, setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  const titulo = getTitulo(pathname);
  const iniciales = usuario ? getIniciales(usuario.name) : "U";
  const rolPrincipal = usuario?.roles?.[0] ?? "";

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Si falla el logout en el servidor, continuar
      // limpiando localmente de todas formas
    } finally {
      // Limpiar localStorage
      localStorage.removeItem("congope_token");

      // Expirar la cookie
      document.cookie =
        "congope_token=; path=/; " +
        "expires=Thu, 01 Jan 1970 00:00:00 GMT; " +
        "SameSite=Strict";

      // Limpiar Redux
      dispatch(clearCredentials());

      // Desactivar modo oscuro al salir
      setColorScheme("light");

      // Redirigir al login
      router.push("/login");
    }
  };

  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      {/* ── Lado izquierdo ── */}
      <Group gap="sm" wrap="nowrap">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="md"
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Toggle sidebar"
        >
          <IconMenu2 size={18} />
        </ActionIcon>

        <Text
          fw={600}
          size="sm"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {titulo}
        </Text>
      </Group>

      {/* ── Lado derecho ── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .user-profile-btn {
              display: flex;
              align-items: center;
              padding: 4px 12px 4px 4px;
              border-radius: 40px;
              background-color: var(--mantine-color-default);
              border: 1px solid var(--mantine-color-default-border);
              transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
              cursor: pointer;
            }
            .user-profile-btn:hover {
              background-color: var(--mantine-color-default-hover);
              border-color: var(--mantine-color-default-border);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
              transform: translateY(-1px);
            }
            .user-avatar-modern {
              border: 2px solid var(--mantine-color-body);
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }
          `,
        }}
      />
      <Group gap="md" wrap="nowrap">
        {/* Notificaciones */}
        <Indicator
          color="red"
          size={7}
          offset={4}
          disabled={true} // Activar cuando haya notificaciones reales
        >
          <ActionIcon
            variant="subtle"
            color="gray"
            size="md"
            aria-label="Notificaciones"
          >
            <IconBell size={18} />
          </ActionIcon>
        </Indicator>

        {/* Menú de usuario */}
        <Menu
          shadow="lg"
          width={240}
          position="bottom-end"
          withArrow
          arrowPosition="center"
          radius="md"
          transitionProps={{ transition: "pop-top-right", duration: 150 }}
          styles={{
            item: {
              paddingTop: 8,
              paddingBottom: 8,
              marginTop: 2,
              marginBottom: 2,
            },
            label: {
              textTransform: "none", // Quita el uppercase por defecto
              fontSize: "var(--mantine-font-size-sm)",
              fontWeight: 600,
              paddingTop: 12,
              paddingBottom: 4,
            },
          }}
        >
          <Menu.Target>
            <UnstyledButton className="user-profile-btn">
              <Group gap="sm" wrap="nowrap">
                <Avatar
                  color="congope"
                  radius="xl"
                  size={38}
                  className="user-avatar-modern"
                >
                  {iniciales}
                </Avatar>
                <Box visibleFrom="sm">
                  <Text size="sm" fw={600} lh={1.1}>
                    {usuario?.name?.split(" ")[0] ?? "Usuario"}
                  </Text>
                  <Text size="xs" c="dimmed" lh={1.1} mt={4} tt="capitalize">
                    {rolPrincipal.replace(/_/g, " ")}
                  </Text>
                </Box>
                <IconChevronDown
                  size={16}
                  color="var(--mantine-color-gray-5)"
                  style={{ marginLeft: 4 }}
                />
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            {/* Info del usuario */}
            <Box
              px="md"
              py="md"
              style={{
                margin: "-4px -4px 4px -4px",
                background: "var(--mantine-color-default)",
                borderBottom: "1px solid var(--mantine-color-default-border)",
                borderTopLeftRadius: "calc(var(--mantine-radius-md) - 2px)",
                borderTopRightRadius: "calc(var(--mantine-radius-md) - 2px)",
              }}
            >
              <Group wrap="nowrap" gap="sm">
                <Avatar
                  color="congope"
                  radius="xl"
                  size={38}
                  style={{
                    border: "1px solid var(--mantine-color-default-border)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  {iniciales}
                </Avatar>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={600} lh={1.2} truncate>
                    {usuario?.name}
                  </Text>
                  <Text size="xs" c="dimmed" lh={1.2} mt={2} truncate>
                    {usuario?.email}
                  </Text>
                </Box>
              </Group>
            </Box>

            <Menu.Label>Opciones de cuenta</Menu.Label>

            <Menu.Item leftSection={<IconUser size={16} stroke={1.5} />}>
              Mi perfil
            </Menu.Item>

            <Menu.Item
              leftSection={<IconSettings size={16} stroke={1.5} />}
              onClick={() => router.push("/configuracion")}
            >
              Configuración
            </Menu.Item>

            <Menu.Item
              closeMenuOnClick={false}
              leftSection={
                computedColorScheme === "dark" ? (
                  <IconMoon
                    size={16}
                    stroke={1.5}
                    color="var(--mantine-color-blue-5)"
                  />
                ) : (
                  <IconSun
                    size={16}
                    stroke={1.5}
                    color="var(--mantine-color-yellow-5)"
                  />
                )
              }
              rightSection={
                <Switch
                  checked={computedColorScheme === "dark"}
                  onChange={() => toggleColorScheme()}
                  size="sm"
                  color="dark.4"
                  style={{ cursor: "pointer", pointerEvents: "none" }}
                />
              }
              onClick={(e) => {
                e.preventDefault();
                toggleColorScheme();
              }}
            >
              Modo oscuro
            </Menu.Item>

            <Divider my="xs" />

            <Menu.Item
              color="red"
              leftSection={<IconLogout size={16} stroke={1.5} />}
              onClick={handleLogout}
            >
              Cerrar sesión
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
