import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { perfilService } from '@/services/perfil.service';
import { getErrorMessage } from '@/services/axios';

export function usePerfil() {
  return useQuery({
    queryKey:  ['auth', 'perfil'],
    queryFn:   perfilService.obtener,
    staleTime: 1000 * 60 * 5,
  });
}

export function useActualizarPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: perfilService.actualizar,
    onSuccess: (datos) => {
      // Actualizar el caché de auth/me
      qc.setQueryData(['auth', 'me'], (prev: unknown) => {
        if (prev && typeof prev === 'object') {
          return { ...(prev as object), ...datos };
        }
        return prev;
      });
      qc.invalidateQueries({
        queryKey: ['auth'],
      });
      notifications.show({
        title:   'Perfil actualizado',
        message: 'Tus datos han sido guardados.',
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

export function useCambiarPassword() {
  return useMutation({
    mutationFn: perfilService.cambiarPassword,
    onSuccess: () =>
      notifications.show({
        title:   '✅ Contraseña actualizada',
        message: 'Tu contraseña ha sido cambiada correctamente.',
        color:   'green',
        autoClose: 5000,
      }),
    onError: (error) =>
      notifications.show({
        title:   'Error al cambiar contraseña',
        message: getErrorMessage(error),
        color:   'red',
        autoClose: 6000,
      }),
  });
}
