'use client'

import { useState }  from 'react';
import { Group, Tooltip, Text } from '@mantine/core';
import { IconStar, IconStarFilled } from '@tabler/icons-react';

interface EstrellaRatingProps {
  valor:       number;         // valor actual (0-5)
  readonly?:   boolean;        // si true, solo muestra
  onChange?:   (valor: number) => void;
  size?:       number;
  mostrarNumero?: boolean;
}

export function EstrellaRating({
  valor,
  readonly  = false,
  onChange,
  size      = 16,
  mostrarNumero = false,
}: EstrellaRatingProps) {
  const [hover, setHover] = useState(0);
  const valorActivo = hover || valor;

  return (
    <Group gap={2} align="center">
      {[1, 2, 3, 4, 5].map((estrella) => {
        const llena = estrella <= valorActivo;
        return (
          <Tooltip
            key={estrella}
            label={`${estrella} estrella${estrella > 1 ? 's' : ''}`}
            disabled={readonly}
          >
            <span
              style={{
                cursor:     readonly ? 'default' : 'pointer',
                lineHeight: 1,
                display:    'inline-flex',
              }}
              onClick={() => {
                if (!readonly && onChange) onChange(estrella);
              }}
              onMouseEnter={() => {
                if (!readonly) setHover(estrella);
              }}
              onMouseLeave={() => {
                if (!readonly) setHover(0);
              }}
            >
              {llena ? (
                <IconStarFilled
                  size={size}
                  color="#F59E0B"
                  style={{ transition: 'transform 100ms ease' }}
                />
              ) : (
                <IconStar
                  size={size}
                  color="#D1D5DB"
                />
              )}
            </span>
          </Tooltip>
        );
      })}
      {mostrarNumero && valor > 0 && (
        <Text size="xs" fw={600} c="gray.6" ml={2}>
          {parseFloat(String(valor)).toFixed(1)}
        </Text>
      )}
    </Group>
  );
}
