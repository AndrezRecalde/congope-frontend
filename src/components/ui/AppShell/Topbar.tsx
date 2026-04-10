'use client'

import { useRouter, usePathname } from 'next/navigation';
import {
  Group, Text, Avatar, Menu, ActionIcon,
  Indicator, Divider, Box,
} from '@mantine/core';
import {
  IconMenu2,
  IconBell,
  IconUser,
  IconLogout,
  IconSettings,
  IconChevronDown,
} from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar }  from '@/store/slices/uiSlice';
import {
  clearCredentials,
  selectUsuario,
} from '@/store/slices/authSlice';
import { authService } from '@/services/auth.service';

// Mapa de rutas a títulos legibles
const TITULOS: Record<string, string> = {
  '/dashboard':                 'Dashboard Ejecutivo',
  '/actores':                   'Actores de Cooperación',
  '/actores/nuevo':             'Nuevo Actor',
  '/proyectos':                 'Proyectos',
  '/proyectos/nuevo':           'Nuevo Proyecto',
  '/buenas-practicas':          'Buenas Prácticas',
  '/buenas-practicas/nueva':    'Nueva Buena Práctica',
  '/redes':                     'Redes y Articulación',
  '/redes/nueva':               'Nueva Red',
  '/emblematicos':              'Proyectos Emblemáticos',
  '/emblematicos/nuevo':        'Nuevo Emblemático',
  '/mapa':                      'Mapa Interactivo',
  '/documentos':                'Gestión Documental',
  '/eventos':                   'Agenda y Eventos',
  '/eventos/nuevo':             'Nuevo Evento',
  '/reportes':                  'Reportería',
  '/configuracion':             'Configuración',
  '/configuracion/usuarios':    'Gestión de Usuarios',
  '/configuracion/auditoria':   'Auditoría del Sistema',
};

function getTitulo(pathname: string): string {
  if (TITULOS[pathname]) return TITULOS[pathname];
  // Buscar por prefijo más específico primero
  const prefijo = Object.keys(TITULOS)
    .filter((k) => pathname.startsWith(k) && k !== '/')
    .sort((a, b) => b.length - a.length)[0];
  return prefijo ? TITULOS[prefijo] : 'CONGOPE';
}

function getIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

export function Topbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const usuario  = useAppSelector(selectUsuario);

  const titulo   = getTitulo(pathname);
  const iniciales = usuario
    ? getIniciales(usuario.name)
    : 'U';
  const rolPrincipal = usuario?.roles?.[0] ?? '';

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Si falla el logout en el servidor, continuar
      // limpiando localmente de todas formas
    } finally {
      // Limpiar localStorage
      localStorage.removeItem('congope_token');

      // Expirar la cookie
      document.cookie =
        'congope_token=; path=/; ' +
        'expires=Thu, 01 Jan 1970 00:00:00 GMT; ' +
        'SameSite=Strict';

      // Limpiar Redux
      dispatch(clearCredentials());

      // Redirigir al login
      router.push('/login');
    }
  };

  return (
    <Group
      h="100%"
      px="md"
      justify="space-between"
      wrap="nowrap"
    >
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
          c="gray.8"
          style={{
            whiteSpace: 'nowrap',
            overflow:   'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {titulo}
        </Text>
      </Group>

      {/* ── Lado derecho ── */}
      <Group gap="xs" wrap="nowrap">

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
          shadow="md"
          width={220}
          position="bottom-end"
          withArrow
          arrowPosition="center"
        >
          <Menu.Target>
            <Group
              gap="xs"
              style={{
                cursor:    'pointer',
                padding:   '4px 8px',
                borderRadius: 8,
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  'var(--mantine-color-gray-1)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  'transparent';
              }}
            >
              <Avatar
                color="congope"
                radius="xl"
                size={32}
                style={{ flexShrink: 0 }}
              >
                {iniciales}
              </Avatar>
              <Box visibleFrom="sm">
                <Text size="sm" fw={600} lh={1.2}>
                  {usuario?.name ?? 'Usuario'}
                </Text>
                <Text size="xs" c="dimmed" lh={1.2}>
                  {rolPrincipal}
                </Text>
              </Box>
              <IconChevronDown
                size={14}
                color="var(--mantine-color-gray-5)"
              />
            </Group>
          </Menu.Target>

          <Menu.Dropdown>
            {/* Info del usuario */}
            <Box px="sm" py="xs">
              <Text size="sm" fw={600} truncate>
                {usuario?.name}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {usuario?.email}
              </Text>
            </Box>

            <Divider />

            <Menu.Item
              leftSection={<IconUser size={14} />}
            >
              Mi perfil
            </Menu.Item>

            <Menu.Item
              leftSection={<IconSettings size={14} />}
              onClick={() => router.push('/configuracion')}
            >
              Configuración
            </Menu.Item>

            <Divider />

            <Menu.Item
              color="red"
              leftSection={<IconLogout size={14} />}
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
