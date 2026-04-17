"use client";

import {
  Stack,
  TextInput,
  PasswordInput,
  Select,
  MultiSelect,
  Button,
  Group,
  Divider,
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
import type { CreateUsuarioDto } from "@/services/usuarios.service";

const ROLES_OPCIONES = (
  Object.entries(LABEL_ROL) as [RolSistema, string][]
).map(([value, label]) => ({ value, label }));

interface UsuarioFormProps {
  usuario?: UsuarioListado;
  onSubmit: (datos: CreateUsuarioDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function UsuarioForm({
  usuario,
  onSubmit,
  onCancel,
  isLoading = false,
}: UsuarioFormProps) {
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
      password: "",
      rol: rolActual,
      provincia_ids: provinciasActuales,
    },
    validate: {
      name: isNotEmpty("El nombre es requerido"),
      email: isEmail("Ingresa un email válido"),
      password: (value) => {
        if (esEdicion) return null; // opcional en edición
        if (!value || value.length < 8) {
          return "La contraseña debe tener al menos 8 caracteres";
        }
        return null;
      },
      rol: isNotEmpty("Selecciona el rol del usuario"),
    },
  });

  const handleSubmit = (values: UsuarioFormValues) => {
    const dto: CreateUsuarioDto = {
      name: values.name,
      email: values.email,
      password: values.password,
      rol: values.rol as RolSistema,
      provincia_ids:
        values.provincia_ids.length > 0 ? values.provincia_ids : undefined,
    };
    onSubmit(dto);
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

        <PasswordInput
          label={esEdicion ? "Nueva contraseña" : "Contraseña"}
          placeholder={
            esEdicion
              ? "Dejar en blanco para no cambiar"
              : "Mínimo 8 caracteres"
          }
          required={!esEdicion}
          {...form.getInputProps("password")}
        />

        <Divider label="Permisos y acceso" labelPosition="left" />

        <Select
          label="Rol del sistema"
          placeholder="Seleccionar rol"
          data={ROLES_OPCIONES}
          required
          {...form.getInputProps("rol")}
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
            {...form.getInputProps("provincia_ids")}
          />
        )}

        <Group justify="flex-end" gap="sm" pt="xs">
          <Button
            variant="subtle"
            color="gray"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" color="congope" loading={isLoading}>
            {esEdicion ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
