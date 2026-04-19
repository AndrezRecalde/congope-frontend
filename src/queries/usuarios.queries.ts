import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { queryKeys }      from '@/lib/query-client';
import {
  usuariosService,
  type UsuariosParams,
  type CreateUsuarioDto,
  type UpdateUsuarioDto,
  type UpdatePasswordDto,
} from '@/services/usuarios.service';
import {
  auditoriaService,
  type AuditoriaParams,
} from '@/services/auditoria.service';
import { getErrorMessage } from '@/services/axios';
import type { RolSistema } from '@/types/usuario.types';

// ── USUARIOS ─────────────────────────────────────────

export function useUsuarios(
  params: UsuariosParams = {}
) {
  return useQuery({
    queryKey: queryKeys.usuarios.list(params),
    queryFn:  () => usuariosService.listar(params),
    placeholderData: (prev) => prev,
  });
}

export function useUsuario(id: number | null) {
  return useQuery({
    queryKey: queryKeys.usuarios.detail(id ?? 0),
    queryFn:  () => usuariosService.obtener(id!),
    enabled:  !!id,
  });
}

export function useCrearUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: CreateUsuarioDto) =>
      usuariosService.crear(datos),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.usuarios.all,
      });
      notifications.show({
        title:   'Usuario creado',
        message: 'El usuario fue creado correctamente.',
        color:   'green',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al crear usuario',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}

export function useActualizarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id, datos,
    }: {
      id: number; datos: UpdateUsuarioDto;
    }) => usuariosService.actualizar(id, datos),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({
        queryKey: queryKeys.usuarios.all,
      });
      qc.invalidateQueries({
        queryKey: queryKeys.usuarios.detail(id),
      });
      notifications.show({
        title:   'Usuario actualizado',
        message: 'Los datos del usuario fueron actualizados.',
        color:   'green',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al actualizar',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}

export function useEliminarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      usuariosService.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.usuarios.all,
      });
      notifications.show({
        title:   'Usuario eliminado',
        message: 'El usuario fue eliminado del sistema.',
        color:   'orange',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al eliminar',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}

export function useCambiarRol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id, rol,
    }: {
      id: number; rol: RolSistema;
    }) => usuariosService.cambiarRol(id, rol),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.usuarios.all,
      });
      notifications.show({
        title:   'Rol actualizado',
        message: 'El rol del usuario fue cambiado.',
        color:   'blue',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al cambiar rol',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}

export function useAsignarProvincias() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id, provincia_ids,
    }: {
      id: number; provincia_ids: string[];
    }) => usuariosService.asignarProvincias(id, provincia_ids),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.usuarios.all,
      });
      notifications.show({
        title:   'Provincias asignadas',
        message: 'Las provincias del usuario fueron actualizadas.',
        color:   'green',
      });
    },
    onError: (error) =>
      notifications.show({
        title:   'Error al asignar provincias',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}

export function useCambiarEstado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usuariosService.cambiarEstado(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.usuarios.all });
      notifications.show({
        title: 'Estado actualizado',
        message: 'El estado del usuario ha sido actualizado.',
        color: 'green',
      });
    },
    onError: (error) =>
      notifications.show({
        title: 'Error al cambiar estado',
        message: getErrorMessage(error),
        color: 'red',
        autoClose: 6000,
      }),
  });
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enviar_correo }: { id: number; enviar_correo: boolean }) =>
      usuariosService.resetPassword(id, enviar_correo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.usuarios.all });
      notifications.show({
        title: 'Contraseña reseteada',
        message: 'La contraseña del usuario ha sido reseteada exitosamente.',
        color: 'green',
      });
    },
    onError: (error) =>
      notifications.show({
        title: 'Error al resetear contraseña',
        message: getErrorMessage(error),
        color: 'red',
        autoClose: 6000,
      }),
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (datos: UpdatePasswordDto) => usuariosService.updatePassword(datos),
    onSuccess: () => {
      notifications.show({
        title: 'Contraseña actualizada',
        message: 'Tu contraseña ha sido actualizada correctamente.',
        color: 'green',
      });
    },
    onError: (error) =>
      notifications.show({
        title: 'Error al actualizar contraseña',
        message: getErrorMessage(error),
        color: 'red',
        autoClose: 6000,
      }),
  });
}

// ── AUDITORÍA ────────────────────────────────────────

export function useAuditoria(
  params: AuditoriaParams = {}
) {
  return useQuery({
    queryKey: queryKeys.auditoria.list(params),
    queryFn:  () => auditoriaService.listar(params),
    placeholderData: (prev) => prev,
  });
}
