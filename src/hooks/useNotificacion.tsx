'use client';

import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconInfoCircle,
} from '@tabler/icons-react';

export function useNotificacion() {
  const exito = (mensaje: string, titulo = 'Éxito') =>
    notifications.show({
      title:     titulo,
      message:   mensaje,
      color:     'green',
      icon:      <IconCheck size={16} />,
      autoClose: 4000,
    });

  const error = (mensaje: string, titulo = 'Error') =>
    notifications.show({
      title:     titulo,
      message:   mensaje,
      color:     'red',
      icon:      <IconX size={16} />,
      autoClose: 6000,
    });

  const advertencia = (mensaje: string, titulo = 'Atención') =>
    notifications.show({
      title:     titulo,
      message:   mensaje,
      color:     'yellow',
      icon:      <IconAlertTriangle size={16} />,
      autoClose: 5000,
    });

  const info = (mensaje: string, titulo = 'Información') =>
    notifications.show({
      title:     titulo,
      message:   mensaje,
      color:     'blue',
      icon:      <IconInfoCircle size={16} />,
      autoClose: 4000,
    });

  return { exito, error, advertencia, info };
}
