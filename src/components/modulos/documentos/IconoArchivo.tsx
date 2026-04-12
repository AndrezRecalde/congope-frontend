import { ThemeIcon } from '@mantine/core';
import {
  IconFileTypePdf,
  IconPhoto,
  IconFileTypeXls,
  IconFileTypeDocx,
  IconFile,
} from '@tabler/icons-react';
import {
  getTipoArchivo,
} from '@/types/documento.types';

interface IconoArchivoProps {
  mimeType: string;
  size?:    number;
}

export function IconoArchivo({
  mimeType,
  size = 32,
}: IconoArchivoProps) {
  const tipo = getTipoArchivo(mimeType);

  const config = {
    pdf:     { icono: IconFileTypePdf,  color: 'red' },
    imagen:  { icono: IconPhoto,        color: 'pink' },
    excel:   { icono: IconFileTypeXls,  color: 'green' },
    word:    { icono: IconFileTypeDocx, color: 'blue' },
    generico:{ icono: IconFile,         color: 'gray' },
  }[tipo];

  const Icono = config.icono;

  return (
    <ThemeIcon
      size={size}
      radius="md"
      color={config.color}
      variant="light"
    >
      <Icono size={size * 0.55} />
    </ThemeIcon>
  );
}
