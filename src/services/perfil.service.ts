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

export const perfilService = {
  obtener: async (): Promise<PerfilUsuario> => {
    const res = await apiClient.get("/auth/me");
    return res.data.data as PerfilUsuario;
  },

  actualizar: async (datos: ActualizarPerfilDto): Promise<PerfilUsuario> => {
    const res = await apiClient.put("/auth/perfil", datos);
    return res.data.data as PerfilUsuario;
  },

  cambiarPassword: async (datos: CambiarPasswordDto): Promise<void> => {
    await apiClient.put("/auth/password", datos);
  },
};
