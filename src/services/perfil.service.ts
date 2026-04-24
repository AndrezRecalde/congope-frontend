import apiClient from "./axios";

export interface ActualizarPerfilDto {
  name?: string;
  email?: string;
  telefono?: string | null;
  cargo?: string | null;
  entidad?: string | null;
  dni?: string | null;
}

export interface CambiarPasswordDto {
  password_actual: string;
  password_nuevo: string;
  password_nuevo_confirmation: string;
}

export interface PerfilUsuario {
  id: number;
  name: string;
  email: string;
  telefono: string | null;
  cargo: string | null;
  entidad: string | null;
  dni: string | null;
  roles: string[];
  permissions: string[];
  provincias: Array<{ id: string; nombre: string }>;
  email_verified_at: string | null;
}

/**
 * Normaliza el campo `provincias` que el backend puede devolver
 * como objeto plano { uuid: nombre } en lugar de Array<{ id, nombre }>.
 */
function normalizarPerfil(raw: unknown): PerfilUsuario {
  const data = raw as PerfilUsuario & {
    provincias: Array<{ id: string; nombre: string }> | Record<string, string>;
  };

  const provincias: Array<{ id: string; nombre: string }> = Array.isArray(
    data.provincias,
  )
    ? data.provincias
    : Object.entries(data.provincias ?? {}).map(([id, nombre]) => ({
        id: id as string,
        nombre: nombre as string,
      }));

  return { ...data, provincias };
}

export const perfilService = {
  obtener: async (): Promise<PerfilUsuario> => {
    const res = await apiClient.get("/auth/me");
    return normalizarPerfil(res.data.data);
  },

  actualizar: async (datos: ActualizarPerfilDto): Promise<PerfilUsuario> => {
    const res = await apiClient.put("/auth/perfil", datos);
    return normalizarPerfil(res.data.data);
  },

  cambiarPassword: async (datos: CambiarPasswordDto): Promise<void> => {
    await apiClient.put("/auth/password", datos);
  },
};
