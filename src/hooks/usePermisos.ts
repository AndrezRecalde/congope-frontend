'use client';

import { useAppSelector } from '@/store/hooks';
import {
  selectPermisos,
  selectRoles,
} from '@/store/slices/authSlice';
import type { Rol } from '@/services/axios';

export function usePermisos() {
  const permisos = useAppSelector(selectPermisos);
  const roles    = useAppSelector(selectRoles);

  /** Verifica si el usuario tiene el permiso exacto */
  const can = (permiso: string): boolean =>
    permisos.includes(permiso);

  /** Verifica si el usuario tiene el rol exacto */
  const hasRole = (rol: Rol): boolean =>
    roles.includes(rol);

  const esSuperAdmin = (): boolean =>
    roles.includes('super_admin');

  const esAdminProvincial = (): boolean =>
    roles.includes('admin_provincial');

  /** Puede crear y editar (editor, admin o super) */
  const puedeEditar = (): boolean =>
    esSuperAdmin() ||
    esAdminProvincial() ||
    roles.includes('editor');

  return {
    can,
    hasRole,
    esSuperAdmin,
    esAdminProvincial,
    puedeEditar,
  };
}
