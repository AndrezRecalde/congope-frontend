export interface RegistroHistorial {
  id: string;
  accion: string;
  entidad: string;
  modelo_tipo: string;
  modelo_id: string;
  valores_anteriores: Record<string, unknown> | null;
  valores_nuevos: Record<string, unknown> | null;
  ip_address: string;
  created_at: string; // "YYYY-MM-DD HH:mm:ss"
  usuario: {
    id: number;
    name: string;
    email: string;
  } | null;
}

// Color del badge según la acción
export const COLOR_ACCION_HISTORIAL: Record<string, string> = {
  crear: "green",
  editar: "blue",
  eliminar: "red",
  publicar: "teal",
  restaurar: "orange",
};

// Ícono según la acción
export const ICONO_ACCION: Record<string, string> = {
  crear: "plus",
  editar: "edit",
  eliminar: "trash",
  publicar: "world",
  restaurar: "refresh",
};

// Ícono según la entidad
export const ICONO_ENTIDAD: Record<string, string> = {
  Proyecto: "folder",
  Hito: "flag",
  Emblemático: "trophy",
  Documento: "file",
  ODS: "leaf",
  Provincia: "map-pin",
};
