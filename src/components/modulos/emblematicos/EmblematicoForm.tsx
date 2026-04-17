"use client";

import { useState } from "react";

import {
  Stack,
  TextInput,
  Select,
  Textarea,
  Button,
  Group,
  Box,
  LoadingOverlay,
} from "@mantine/core";
import { useForm, isNotEmpty } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import apiClient, { extractData } from "@/services/axios";
import { useProyectos } from "@/queries/proyectos.queries";
import type { ProyectoEmblematico, Provincia } from "@/services/axios";
import type { EmblematicoFormValues } from "@/types/emblematico.types";
import type { CreateEmblematicoDto } from "@/services/emblematicos.service";

interface EmblematicoFormProps {
  emblematico?: ProyectoEmblematico;
  onSubmit: (datos: CreateEmblematicoDto) => Promise<void> | void;
  onCancel: () => void;
}

export function EmblematicoForm({
  emblematico,
  onSubmit,
  onCancel,
}: EmblematicoFormProps) {
  const esEdicion = !!emblematico;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: proyectosData } = useProyectos({
    per_page: 100,
  });

  const { data: provinciasData } = useQuery({
    queryKey: queryKeys.provincias.list,
    queryFn: async () => {
      const res = await apiClient.get("/publico/provincias");
      return extractData<Provincia[]>(res);
    },
    staleTime: Infinity,
  });

  const opcionesProyectos = (proyectosData?.data ?? []).map((p) => ({
    value: p.id,
    label: `${p.codigo} — ${p.nombre}`,
  }));

  const opcionesProvincias = (provinciasData ?? []).map((p) => ({
    value: p.id,
    label: p.nombre,
  }));

  const form = useForm<EmblematicoFormValues>({
    initialValues: {
      proyecto_id: emblematico?.proyecto?.id ?? "",
      provincia_id: emblematico?.provincia?.id ?? "",
      titulo: emblematico?.titulo ?? "",
      descripcion_impacto: emblematico?.descripcion_impacto ?? "",
      periodo: emblematico?.periodo ?? "",
    },
    validate: {
      proyecto_id: isNotEmpty("Selecciona el proyecto"),
      provincia_id: isNotEmpty("Selecciona la provincia"),
      titulo: isNotEmpty("El título es requerido"),
      descripcion_impacto: isNotEmpty(
        "La descripción del impacto es requerida",
      ),
    },
  });

  const handleSubmit = async (values: EmblematicoFormValues) => {
    setIsSubmitting(true);
    const dto: CreateEmblematicoDto = {
      proyecto_id: values.proyecto_id,
      provincia_id: values.provincia_id,
      titulo: values.titulo,
      descripcion_impacto: values.descripcion_impacto,
      periodo: values.periodo || null,
    };
    try {
      await onSubmit(dto);
    } catch {
      // Error manejado globalmente
    } finally {
      if (typeof window !== "undefined") {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={isSubmitting}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Select
            label="Proyecto de cooperación"
            placeholder="Buscar proyecto..."
            data={opcionesProyectos}
            required
            searchable
            {...form.getInputProps("proyecto_id")}
          />

          <Select
            label="Provincia ejecutora"
            placeholder="Seleccionar provincia"
            data={opcionesProvincias}
            required
            searchable
            {...form.getInputProps("provincia_id")}
          />

          <TextInput
            label="Título del proyecto emblemático"
            placeholder="Ej: Implementación del Corredor Bioceánico"
            required
            {...form.getInputProps("titulo")}
          />

          <Textarea
            label="Descripción del impacto"
            placeholder="¿Cuál fue el impacto concreto y medible de este proyecto?"
            required
            autosize
            minRows={4}
            maxRows={8}
            {...form.getInputProps("descripcion_impacto")}
          />

          <TextInput
            label="Período de ejecución"
            placeholder="Ej: 2024-2026"
            description="Formato libre — Ej: 2023, 2023-2025, Q1 2024"
            {...form.getInputProps("periodo")}
          />

          <Group justify="flex-end" gap="sm" pt="xs">
            <Button
              variant="subtle"
              color="gray"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" color="congope" loading={isSubmitting}>
              {esEdicion ? "Guardar cambios" : "Crear emblemático"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
