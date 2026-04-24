"use client";

import {
  Stack,
  Divider,
  Box,
  Text,
  ActionIcon,
  Group,
  rem,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconLayoutDashboard,
  IconBuildingBank,
  IconFolderOpen,
  IconStar,
  IconNetwork,
  IconTrophy,
  IconMap2,
  IconFiles,
  IconCalendarEvent,
  IconChartBar,
  IconShield,
  IconCategory,
  IconSettings,
} from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar, selectSidebarAbierto } from "@/store/slices/uiSlice";
import { usePermisos } from "@/hooks/usePermisos";
import { NavItem } from "./NavItem";

const ICON_SIZE = 17;

// Navegación principal del sistema
const NAV_PRINCIPAL = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <IconLayoutDashboard size={ICON_SIZE} />,
    permiso: "dashboard.ver",
  },
  {
    href: "/actores",
    label: "Actores",
    icon: <IconBuildingBank size={ICON_SIZE} />,
    permiso: "actores.ver",
  },
  {
    href: "/proyectos",
    label: "Proyectos",
    icon: <IconFolderOpen size={ICON_SIZE} />,
    permiso: "proyectos.ver",
  },
  {
    href: "/buenas-practicas",
    label: "Buenas Prácticas",
    icon: <IconStar size={ICON_SIZE} />,
    permiso: "practicas.ver",
  },
  {
    href: "/redes",
    label: "Redes",
    icon: <IconNetwork size={ICON_SIZE} />,
    permiso: "redes.ver",
  },
  {
    href: "/emblematicos",
    label: "Emblemáticos",
    icon: <IconTrophy size={ICON_SIZE} />,
    permiso: "emblematicos.ver",
  },
  {
    href: "/mapa",
    label: "Mapa",
    icon: <IconMap2 size={ICON_SIZE} />,
    permiso: "mapa.ver",
  },
  {
    href: "/analisis/red",
    label: "Red de Cooperación",
    icon: <IconNetwork size={ICON_SIZE} />,
    permiso: "mapa.ver",
  },
];

// Herramientas de trabajo
const NAV_HERRAMIENTAS = [
  {
    href: "/documentos",
    label: "Documentos",
    icon: <IconFiles size={ICON_SIZE} />,
    permiso: "documentos.ver",
  },
  {
    href: "/eventos",
    label: "Agenda",
    icon: <IconCalendarEvent size={ICON_SIZE} />,
    permiso: "eventos.ver",
  },
  {
    href: "/reportes",
    label: "Reportes",
    icon: <IconChartBar size={ICON_SIZE} />,
    permiso: "reportes.generar",
  },
];

// Administración del sistema
const NAV_ADMIN = [
  {
    href: "/configuracion",
    label: "Administración",
    icon: <IconSettings size={ICON_SIZE} />,
    permiso: "usuarios.ver",
  },
  {
    href: "/configuracion/auditoria",
    label: "Auditoría",
    icon: <IconShield size={ICON_SIZE} />,
    permiso: "usuarios.ver_auditoria",
  },
  {
    href: "/configuracion/beneficiarios",
    label: "Beneficiarios",
    icon: <IconCategory size={ICON_SIZE} />,
    permiso: "categorias_beneficiarios.ver",
  },
];

interface SidebarProps {
  /** Callback para cerrar el drawer móvil al navegar */
  onNavigate?: () => void;
  /** Indica si el drawer móvil está abierto */
  mobileDrawerOpen?: boolean;
}

export function Sidebar({ onNavigate, mobileDrawerOpen = false }: SidebarProps) {
  const dispatch = useAppDispatch();
  const sidebarAbierto = useAppSelector(selectSidebarAbierto);
  const { can } = usePermisos();

  // En móvil, el drawer siempre muestra labels expandidos.
  // En desktop, respeta el estado Redux de colapso.
  const showExpanded = mobileDrawerOpen || sidebarAbierto;
  const isCollapsed = !showExpanded;

  return (
    <Stack h="100%" gap={0}>
      {/* Cabecera del sidebar con logo y botón colapsar (solo desktop) */}
      <Group
        justify={showExpanded ? "space-between" : "center"}
        p="sm"
        mb="xs"
        style={{
          borderBottom: "1px solid var(--mantine-color-gray-2)",
          height: 60, // Alineado con el topbar
          flexShrink: 0,
        }}
      >
        {showExpanded && (
          <Group gap="xs">
            <Box
              style={{
                width: 28,
                height: 28,
                borderRadius: "6px",
                background: "var(--mantine-color-congope-8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Text fw={700} size="xs" c="white">
                C
              </Text>
            </Box>
            <Text
              fw={700}
              size="sm"
              c="congope.8"
              style={{ letterSpacing: "0.03em" }}
            >
              CONGOPE
            </Text>
          </Group>
        )}

        {/* Botón colapsar/expandir: solo visible en desktop */}
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={() => dispatch(toggleSidebar())}
          aria-label={sidebarAbierto ? "Colapsar sidebar" : "Expandir sidebar"}
          visibleFrom="sm"
        >
          {sidebarAbierto ? (
            <IconChevronLeft size={16} />
          ) : (
            <IconChevronRight size={16} />
          )}
        </ActionIcon>
      </Group>

      {/* Área de navegación con scroll */}
      <Box
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "8px",
        }}
      >
        {/* Módulos principales */}
        <Stack gap={2}>
          {NAV_PRINCIPAL.filter((item) => can(item.permiso)).map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              collapsed={isCollapsed}
              onNavigate={onNavigate}
            />
          ))}
        </Stack>

        <Divider my="xs" />

        {/* Herramientas */}
        <Stack gap={2}>
          {NAV_HERRAMIENTAS.filter((item) => can(item.permiso)).map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              collapsed={isCollapsed}
              onNavigate={onNavigate}
            />
          ))}
        </Stack>

        {/* Administración — solo si tiene permisos */}
        {NAV_ADMIN.some((item) => can(item.permiso)) && (
          <>
            <Divider my="xs" />
            <Stack gap={2}>
              {showExpanded && (
                <Text
                  size="xs"
                  fw={600}
                  c="dimmed"
                  px="xs"
                  mb={4}
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontSize: rem(10),
                  }}
                >
                  Administración
                </Text>
              )}
              {NAV_ADMIN.filter((item) => can(item.permiso)).map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  collapsed={isCollapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </Stack>
          </>
        )}
      </Box>
    </Stack>
  );
}
