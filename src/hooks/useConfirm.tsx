'use client'

import { modals } from '@mantine/modals';
import { Text }   from '@mantine/core';

interface ConfirmOptions {
  titulo:      string;
  mensaje:     string;
  onConfirmar: () => void;
  colorBoton?: string;
  textoBoton?: string;
}

export function useConfirm() {
  const confirmar = ({
    titulo,
    mensaje,
    onConfirmar,
    colorBoton = 'red',
    textoBoton = 'Eliminar',
  }: ConfirmOptions) => {
    modals.openConfirmModal({
      title:    titulo,
      children: <Text size="sm">{mensaje}</Text>,
      labels: {
        confirm: textoBoton,
        cancel:  'Cancelar',
      },
      confirmProps: { color: colorBoton },
      onConfirm:    onConfirmar,
    });
  };

  return { confirmar };
}
