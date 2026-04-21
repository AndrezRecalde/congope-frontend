'use client'

import { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { Select, Button, Group, Text, Box, Paper, Title, ActionIcon, Alert, SimpleGrid } from '@mantine/core';
import { IconPlus, IconX, IconAlertCircle, IconScale } from '@tabler/icons-react';
import { portalService } from '@/services/portal.service';
import type { OpcionesFiltro } from '@/services/portal.service';
import { COLORES_PROVINCIAS } from '@/types/comparador.types';

interface ComparadorSelectorProps {
  onComparar:     (ids: string[]) => void;
  onLimpiar:      () => void;
  cargando:       boolean;
  hayResultados:  boolean;
}

export function ComparadorSelector({
  onComparar,
  onLimpiar,
  cargando,
  hayResultados,
}: ComparadorSelectorProps) {
  const [opciones, setOpciones] = useState<OpcionesFiltro['provincias']>([]);

  const form = useForm({
    initialValues: {
      provincias: ['', ''],
    },
    validate: {
      provincias: (value) => {
        const selected = value.filter(Boolean);
        const unique = new Set(selected);
        if (selected.length > 0 && unique.size !== selected.length) {
          return 'Tienes provincias duplicadas. Selecciona provincias distintas para compararlas correctamente.';
        }
        return null;
      }
    }
  });

  useEffect(() => {
    portalService.mapaCatalogos()
      .then((cat) => setOpciones(cat.opciones_filtro.provincias))
      .catch(console.error);
  }, []);

  const seleccionadas = form.values.provincias;
  const puedeAgregar = seleccionadas.length < 3;
  const puedeQuitar  = seleccionadas.length > 2;

  const agregarSlot = () => {
    if (puedeAgregar) {
      form.insertListItem('provincias', '');
    }
  };

  const quitarSlot = (index: number) => {
    if (!puedeQuitar) return;
    form.removeListItem('provincias', index);
  };

  const ids = seleccionadas.filter(Boolean);
  const idsUnicos = [...new Set(ids)];
  const puedeComparar = idsUnicos.length >= 2 && !cargando && !form.errors.provincias;

  const handleLimpiar = () => {
    form.setValues({ provincias: ['', ''] });
    onLimpiar();
  };

  const disponiblesParaSlot = (index: number) => {
    const otrasSel = seleccionadas.filter((_, i) => i !== index && seleccionadas[i] !== '');
    return opciones.filter((p) => !otrasSel.includes(p.value));
  };

  const handleSubmit = form.onSubmit((values) => {
    const validIds = values.provincias.filter(Boolean);
    const unique = [...new Set(validIds)];
    if (unique.length >= 2) {
      onComparar(unique);
    }
  });

  return (
    <Paper radius="xl" p={{ base: 'md', sm: 'xl' }} shadow="md" withBorder mb="xl">
      <Title order={2} style={{ fontFamily: 'var(--font-playfair)', color: 'var(--portal-navy)' }} mb="xl">
        Selecciona las provincias a comparar
      </Title>

      <form onSubmit={handleSubmit}>
        <SimpleGrid cols={{ base: 1, sm: seleccionadas.length }} spacing="md" mb="lg">
          {seleccionadas.map((valor, index) => (
            <Box key={index} pos="relative">
              <Box
                pos="absolute"
                top={0}
                bottom={0}
                left={0}
                w={4}
                style={{ background: COLORES_PROVINCIAS[index], borderRadius: '4px 0 0 4px' }}
              />

              <Box pl={12}>
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={6} style={{ letterSpacing: '0.06em' }}>
                  Provincia {index + 1}
                </Text>

                <Group gap="xs" wrap="nowrap" align="center">
                  <Select
                    flex={1}
                    placeholder="Seleccionar provincia..."
                    data={disponiblesParaSlot(index)}
                    {...form.getInputProps(`provincias.${index}`)}
                    radius="md"
                    size="md"
                    styles={{
                      input: {
                        borderColor: valor ? COLORES_PROVINCIAS[index] : undefined,
                        backgroundColor: valor ? `${COLORES_PROVINCIAS[index]}08` : undefined,
                        color: valor ? 'var(--portal-navy)' : undefined,
                        fontFamily: 'var(--font-dm-sans)',
                      }
                    }}
                  />

                  {puedeQuitar && (
                    <ActionIcon
                      variant="default"
                      size="xl"
                      radius="md"
                      onClick={() => quitarSlot(index)}
                      title="Quitar"
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  )}
                </Group>
              </Box>
            </Box>
          ))}
        </SimpleGrid>

        {form.errors.provincias && (
          <Alert icon={<IconAlertCircle size={16} />} color="yellow" variant="light" mb="md" radius="md">
            {form.errors.provincias}
          </Alert>
        )}

        <Group justify="space-between" align="center" wrap="wrap">
          <Box>
            {puedeAgregar && (
              <Button
                variant="default"
                leftSection={<IconPlus size={16} />}
                onClick={agregarSlot}
                radius="md"
                style={{ borderStyle: 'dashed' }}
              >
                Agregar tercera provincia
              </Button>
            )}
          </Box>

          <Group>
            {hayResultados && (
              <Button
                variant="default"
                leftSection={<IconX size={16} />}
                onClick={handleLimpiar}
                radius="md"
              >
                Nueva comparación
              </Button>
            )}

            <Button
              type="submit"
              disabled={!puedeComparar}
              loading={cargando}
              leftSection={!cargando && <IconScale size={18} />}
              radius="md"
              color={puedeComparar ? 'var(--portal-navy)' : 'gray'}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                boxShadow: puedeComparar ? '0 4px 14px rgba(11,31,58,0.25)' : undefined,
              }}
            >
              Comparar provincias
            </Button>
          </Group>
        </Group>
      </form>
    </Paper>
  );
}
