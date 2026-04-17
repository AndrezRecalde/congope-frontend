"use client";

import {
  Stack,
  TextInput,
  Select,
  Switch,
  Group,
  Button,
  Box,
  LoadingOverlay,
} from "@mantine/core";
import { useState } from "react";
import { useForm, isNotEmpty } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import apiClient, { extractData } from "@/services/axios";
import type {
  DocumentoItem,
  CategoriaDocumento,
  Provincia,
} from "@/services/axios";
import type { EditarDocumentoValues } from "@/types/documento.types";
import type { EditarDocumentoDto } from "@/services/documentos.service";

const CATEGORIAS: Array<{
  value: CategoriaDocumento;
  label: string;
}> = [
  { value: "Convenio", label: "Convenio" },
  { value: "Informe", label: "Informe" },
  { value: "Acta", label: "Acta" },
  { value: "Anexo", label: "Anexo" },
  { value: "Normativa", label: "Normativa" },
  { value: "Comunicación", label: "Comunicación" },
  { value: "Fotografía", label: "Fotografía" },
];

interface EditarDocumentoFormProps {
  documento: DocumentoItem;
  onSubmit: (dto: EditarDocumentoDto) => Promise<void>;
  onCancel: () => void;
}

export function EditarDocumentoForm({
  documento,
  onSubmit,
  onCancel,
}: EditarDocumentoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: provinciasData } = useQuery({
    queryKey: queryKeys.provincias.list,
    queryFn: async () => {
      const res = await apiClient.get("/publico/provincias");
      return extractData<Provincia[]>(res);
    },
    staleTime: Infinity,
  });

  const opcionesProvincias = [
    { value: "", label: "Sin provincia específica" },
    ...(provinciasData ?? []).map((p) => ({
      value: p.id,
      label: p.nombre,
    })),
  ];

  const form = useForm<EditarDocumentoValues>({
    initialValues: {
      titulo: documento.titulo,
      categoria: documento.categoria as CategoriaDocumento,
      es_publico: documento.es_publico,
      // fecha_vencimiento viene como "YYYY-MM-DD"
      fecha_vencimiento: documento.fecha_vencimiento ?? "",
      provincia_id: documento.provincia_id ?? "",
    },
    validate: {
      titulo: isNotEmpty("El título es requerido"),
      categoria: isNotEmpty("La categoría es requerida"),
    },
  });

  const handleSubmit = async (values: EditarDocumentoValues) => {
    const dto: EditarDocumentoDto = {
      titulo: values.titulo,
      categoria: values.categoria as CategoriaDocumento,
      es_publico: values.es_publico,
      fecha_vencimiento: values.fecha_vencimiento || null,
      provincia_id: values.provincia_id || null,
    };
    setIsSubmitting(true);
    try {
      await onSubmit(dto);
    } finally {
      setIsSubmitting(false);
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
          <TextInput
            label="Título del documento"
            required
            {...form.getInputProps("titulo")}
          />

          <Select
            label="Categoría"
            data={CATEGORIAS}
            required
            {...form.getInputProps("categoria")}
          />

          <Group grow align="flex-start">
            <TextInput
              label="Fecha de vencimiento"
              type="date"
              {...form.getInputProps("fecha_vencimiento")}
            />
            <Select
              label="Provincia"
              placeholder="Sin provincia"
              data={opcionesProvincias}
              {...form.getInputProps("provincia_id")}
            />
          </Group>

          <Switch
            label="Documento público"
            {...form.getInputProps("es_publico", {
              type: "checkbox",
            })}
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
              Guardar cambios
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
