"use client";

import React from "react";

import {
  Stack,
  TextInput,
  Select,
  MultiSelect,
  Button,
  Group,
  Divider,
  Switch,
  Checkbox,
} from "@mantine/core";
import { useForm, isNotEmpty, isEmail } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import apiClient, { extractData } from "@/services/axios";
import type { Provincia } from "@/services/axios";
import type {
  UsuarioListado,
  RolSistema,
  UsuarioFormValues,
} from "@/types/usuario.types";
import { LABEL_ROL } from "@/types/usuario.types";
import type { CreateUsuarioDto, UpdateUsuarioDto } from "@/services/usuarios.service";

const ROLES_OPCIONES = (
  Object.entries(LABEL_ROL) as [RolSistema, string][]
).map(([value, label]) => ({ value, label }));

interface UsuarioFormProps {
  usuario?: UsuarioListado;
  onSubmit: (datos: any) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function UsuarioForm({
  usuario,
  onSubmit,
  onCancel,
  isLoading = false,
}: UsuarioFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const esEdicion = !!usuario;

  const { data: provinciasData } = useQuery({
    queryKey: queryKeys.provincias.list,
    queryFn: async () => {
      const res = await apiClient.get("/publico/provincias");
      return extractData<Provincia[]>(res);
    },
    staleTime: Infinity,
  });

  const opcionesProvincias = (provinciasData ?? []).map((p) => ({
    value: p.id,
    label: p.nombre,
  }));

  // Extraer rol actual del usuario
  const rolActual = (usuario?.roles?.[0]?.name ?? "") as RolSistema | "";

  // Provincias asignadas actualmente
  const provinciasActuales = (usuario?.provincias ?? []).map((p) => p.id);

  const form = useForm<UsuarioFormValues>({
    initialValues: {
      name: usuario?.name ?? "",
      email: usuario?.email ?? "",
      telefono: usuario?.telefono ?? "",
      cargo: usuario?.cargo ?? "",
      activo: usuario?.activo ?? false,
      entidad: usuario?.entidad ?? "",
      dni: usuario?.dni ?? "",
      enviar_correo: true,
      rol: rolActual,
      provincia_ids: provinciasActuales,
    },
    validate: {
      name: isNotEmpty("El nombre es requerido"),
      email: isEmail("Ingresa un email válido"),
      telefono: isNotEmpty("El teléfono es requerido"),
      cargo: isNotEmpty("El cargo es requerido"),
      rol: isNotEmpty("Selecciona el rol del usuario"),
    },
  });

  const handleSubmit = async (values: UsuarioFormValues) => {
    setIsSubmitting(true);
    try {
      if (esEdicion) {
        const dto: UpdateUsuarioDto = {
          name: values.name,
          email: values.email,
          telefono: values.telefono,
          cargo: values.cargo,
          activo: values.activo,
          entidad: values.entidad || null,
          dni: values.dni || null,
        };
        await onSubmit(dto);
      } else {
        const dto: CreateUsuarioDto = {
          name: values.name,
          email: values.email,
          telefono: values.telefono,
          cargo: values.cargo,
          activo: values.activo,
          entidad: values.entidad || null,
          dni: values.dni || null,
          enviar_correo: values.enviar_correo,
          rol: values.rol as RolSistema,
          provincia_ids:
            values.provincia_ids.length > 0 ? values.provincia_ids : undefined,
        };
        await onSubmit(dto);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Nombre completo"
          placeholder="Ej: Juan Carlos Pérez"
          required
          {...form.getInputProps("name")}
        />

        <TextInput
          label="Correo electrónico"
          placeholder="usuario@congope.gob.ec"
          type="email"
          required
          {...form.getInputProps("email")}
        />

        <Group grow>
          <TextInput
            label="Teléfono"
            placeholder="Ej: 0991234567"
            required
            {...form.getInputProps("telefono")}
          />
          <TextInput
            label="DNI"
            placeholder="Ej: 1712345678"
            {...form.getInputProps("dni")}
          />
        </Group>

        <Group grow>
          <TextInput
            label="Cargo"
            placeholder="Ej: Analista de Proyectos"
            required
            {...form.getInputProps("cargo")}
          />
          <TextInput
            label="Entidad"
            placeholder="Ej: CONGOPE"
            {...form.getInputProps("entidad")}
          />
        </Group>

        {esEdicion && (
          <Switch
            label="Usuario Activo"
            description="Si está inactivo, no podrá acceder al sistema"
            color="teal"
            checked={form.values.activo}
            onChange={(e) => form.setFieldValue("activo", e.currentTarget.checked)}
          />
        )}

        {!esEdicion && (
          <>
            <Divider label="Generación de Credenciales" labelPosition="left" />
            <Checkbox
              label="Enviar credenciales autogeneradas por correo electrónico"
              description="La contraseña se autogenerará y el usuario deberá cambiarla en su primer inicio de sesión."
              checked={form.values.enviar_correo}
              onChange={(e) => form.setFieldValue("enviar_correo", e.currentTarget.checked)}
            />
          </>
        )}

        <Divider label="Permisos y acceso" labelPosition="left" />

        <Select
          label="Rol del sistema"
          placeholder="Seleccionar rol"
          data={ROLES_OPCIONES}
          required
          {...form.getInputProps("rol")}
          disabled={esEdicion} // El rol se cambia en otra acción
        />

        {/* Provincias — solo si el rol es provincial */}
        {(form.values.rol === "admin_provincial" ||
          form.values.rol === "editor" ||
          form.values.rol === "visualizador") && (
          <MultiSelect
            label="Provincias asignadas"
            placeholder="Seleccionar provincias..."
            description="Deja vacío para acceso a todas las provincias"
            data={opcionesProvincias}
            searchable
            disabled={esEdicion} // Las provincias se asignan en otra acción
            {...form.getInputProps("provincia_ids")}
          />
        )}

        <Group justify="flex-end" gap="sm" pt="xs">
          <Button
            variant="subtle"
            color="gray"
            onClick={onCancel}
            disabled={isLoading || isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" color="congope" loading={isLoading || isSubmitting}>
            {esEdicion ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
