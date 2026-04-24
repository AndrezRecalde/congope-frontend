'use client'

import { usePathname } from 'next/navigation';
import { NavLink, Tooltip, Badge } from '@mantine/core';
import Link from 'next/link';

interface NavItemProps {
  href:      string;
  label:     string;
  icon:      React.ReactNode;
  badge?:    number;
  collapsed?: boolean;
  /** Callback para cerrar el drawer móvil al navegar */
  onNavigate?: () => void;
}

export function NavItem({
  href,
  label,
  icon,
  badge,
  collapsed = false,
  onNavigate,
}: NavItemProps) {
  const pathname = usePathname();

  // Activo si es la ruta exacta o si es un prefijo
  // (excepto /dashboard que no debe activarse en sub-rutas)
  const isActive =
    pathname === href ||
    (href !== '/dashboard' && pathname.startsWith(href + '/'));

  const linkContent = (
    <>
      <style>{`
        .nav-item-collapsed .mantine-NavLink-section {
          margin-right: 0 !important;
        }
      `}</style>
      <NavLink
      component={Link}
      href={href}
      label={collapsed ? undefined : label}
      leftSection={icon}
      active={isActive}
      color="congope"
      variant={isActive ? 'filled' : 'subtle'}
      rightSection={
        !collapsed && badge && badge > 0 ? (
          <Badge
            size="xs"
            color="red"
            circle
            style={{ minWidth: 18 }}
          >
            {badge > 99 ? '99+' : badge}
          </Badge>
        ) : undefined
      }
      onClick={onNavigate}
      style={{
        borderRadius: 8,
        marginBottom: 2,
        padding:     collapsed ? '10px' : '8px 12px',
        justifyContent: collapsed ? 'center' : undefined,
      }}
      className={collapsed ? 'nav-item-collapsed' : undefined}
    />
    </>
  );

  if (collapsed) {
    return (
      <Tooltip
        label={label}
        position="right"
        withArrow
        arrowSize={6}
      >
        <div>{linkContent}</div>
      </Tooltip>
    );
  }

  return linkContent;
}
