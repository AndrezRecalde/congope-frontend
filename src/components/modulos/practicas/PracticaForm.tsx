"use client";

import {
  Stack,
  TextInput,
  Select,
  Textarea,
  Button,
  Group,
  Checkbox,
  Divider,
  Text,
  Box,
  LoadingOverlay,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useForm, isNotEmpty } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import apiClient, { extractData } from "@/services/axios";
import { useProyectos } from "@/queries/proyectos.queries";
import { usePractica } from "@/queries/practicas.queries";
import type { BuenaPractica, Provincia } from "@/services/axios";
import type { PracticaFormValues } from "@/types/practica.types";
import type { CreatePracticaDto } from "@/services/practicas.service";

const OPCIONES_REPLICABILIDAD = [
  { value: "Alta", label: "Alta — Fácilmente aplicable en otras provincias" },
  { value: "Media", label: "Media — Aplicable con adaptaciones moderadas" },
  { value: "Baja", label: "Baja — Requiere condiciones muy específicas" },
];

interface PracticaFormProps {
  practica?: BuenaPractica;
  onSubmit: (datos: CreatePracticaDto) => Promise<void> | void;
  onCancel: () => void;
}

export function PracticaForm({
  practica,
  onSubmit,
  onCancel,
}: PracticaFormProps) {
  const esEdicion = !!practica;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: practicaDetalle, isLoading: cargandoDetalle } = usePractica(
    esEdicion ? practica.id : null,
  );

  // Cargar provincias y proyectos para los selects
  const { data: provinciasData } = useQuery({
    queryKey: queryKeys.provincias.list,
    queryFn: async () => {
      const res = await apiClient.get("/publico/provincias");
      return extractData<Provincia[]>(res);
    },
    staleTime: Infinity,
  });

  const { data: proyectosData } = useProyectos({
    per_page: 100,
  });

  const opcionesProvincias = (provinciasData ?? []).map((p) => ({
    value: p.id,
    label: p.nombre,
  }));

  const opcionesProyectos = [
    { value: "", label: "Sin proyecto asociado" },
    ...(proyectosData?.data ?? []).map((p) => ({
      value: p.id,
      label: `${p.codigo} — ${p.nombre}`,
    })),
  ];

  const form = useForm<PracticaFormValues>({
    initialValues: {
      provincia_id: practica?.provincia?.id ?? "",
      proyecto_id: practica?.proyecto?.id ?? "",
      titulo: practica?.titulo ?? "",
      descripcion_problema: practica?.descripcion_problema ?? "",
      metodologia: practica?.metodologia ?? "",
      resultados: practica?.resultados ?? "",
      replicabilidad: practica?.replicabilidad ?? "",
      es_destacada: practica?.es_destacada ?? false,
    },
    validate: {
      provincia_id: isNotEmpty("Selecciona la provincia de origen"),
      titulo: isNotEmpty("El título es requerido"),
      descripcion_problema: isNotEmpty(
        "Describe el problema que resuelve esta práctica",
      ),
      metodologia: isNotEmpty("Describe la metodología aplicada"),
      resultados: isNotEmpty("Describe los resultados obtenidos"),
      replicabilidad: isNotEmpty("Selecciona el nivel de replicabilidad"),
    },
  });

  useEffect(() => {
    if (esEdicion && practicaDetalle) {
      form.setValues({
        provincia_id: practicaDetalle.provincia?.id ?? "",
        proyecto_id: practicaDetalle.proyecto?.id ?? "",
        titulo: practicaDetalle.titulo,
        descripcion_problema: practicaDetalle.descripcion_problema,
        metodologia: practicaDetalle.metodologia,
        resultados: practicaDetalle.resultados,
        replicabilidad: practicaDetalle.replicabilidad,
        es_destacada:
          practicaDetalle.es_destacada === true ||
          String(practicaDetalle.es_destacada) === "1" ||
          String(practicaDetalle.es_destacada).toLowerCase() === "true",
      });
    }
    // form is a stable reference from useForm (Mantine guarantees this)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practicaDetalle, esEdicion]);

  const handleSubmit = async (values: PracticaFormValues) => {
    setIsSubmitting(true);
    const dto: CreatePracticaDto = {
      provincia_id: values.provincia_id,
      proyecto_id: values.proyecto_id || null,
      titulo: values.titulo,
      descripcion_problema: values.descripcion_problema,
      metodologia: values.metodologia,
      resultados: values.resultados,
      replicabilidad:
        values.replicabilidad as CreatePracticaDto["replicabilidad"],
      es_destacada: values.es_destacada,
    };

    try {
      await onSubmit(dto);
    } catch {
      // Si falla, detener el loader local
    } finally {
      if (typeof window !== "undefined") {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={(esEdicion && cargandoDetalle) || isSubmitting}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Datos básicos */}
          <TextInput
            label="Título de la buena práctica"
            placeholder="Nombre descriptivo de la iniciativa"
            required
            {...form.getInputProps("titulo")}
          />

          <Group grow align="flex-start">
            <Select
              label="Provincia de origen"
              placeholder="Seleccionar provincia"
              data={opcionesProvincias}
              required
              searchable
              {...form.getInputProps("provincia_id")}
            />
            <Select
              label="Proyecto relacionado"
              placeholder="Buscar proyecto (opcional)"
              data={opcionesProyectos}
              searchable
              clearable
              description="Opcional — vincular con un proyecto existente"
              {...form.getInputProps("proyecto_id")}
            />
          </Group>

          <Select
            label="Nivel de replicabilidad"
            placeholder="¿Qué tan fácil es replicar esta práctica?"
            data={OPCIONES_REPLICABILIDAD}
            required
            {...form.getInputProps("replicabilidad")}
          />

          <Divider
            label={
              <Text
                size="xs"
                fw={600}
                c="dimmed"
                tt="uppercase"
                style={{ letterSpacing: "0.05em" }}
              >
                Contenido de la práctica
              </Text>
            }
            labelPosition="left"
          />

          {/*
          Los campos de contenido usan Textarea con autosize
          porque el texto puede ser extenso.
          En una versión futura se podría usar @mantine/tiptap
          pero para el MVP Textarea es suficiente.
        */}
          <Textarea
            label="Descripción del problema"
            placeholder="¿Qué problema identificaste y quisiste resolver?"
            required
            autosize
            minRows={3}
            maxRows={6}
            {...form.getInputProps("descripcion_problema")}
          />

          <Textarea
            label="Metodología aplicada"
            placeholder="¿Cómo se implementó la solución? ¿Qué pasos se siguieron?"
            required
            autosize
            minRows={3}
            maxRows={6}
            {...form.getInputProps("metodologia")}
          />

          <Textarea
            label="Resultados obtenidos"
            placeholder="¿Cuáles fueron los resultados medibles y concretos?"
            required
            autosize
            minRows={3}
            maxRows={6}
            {...form.getInputProps("resultados")}
          />

          <Checkbox
            label="Marcar como práctica destacada"
            description="Las prácticas destacadas aparecen primero en el listado"
            {...form.getInputProps("es_destacada", {
              type: "checkbox",
            })}
          />

          {/* Botones */}
          <Group justify="flex-end" gap="sm" pt="xs">
            <Button
              variant="subtle"
              color="gray"
              onClick={onCancel}
              disabled={isSubmitting || cargandoDetalle}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="congope"
              loading={isSubmitting}
              disabled={cargandoDetalle}
            >
              {esEdicion ? "Guardar cambios" : "Crear práctica"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
