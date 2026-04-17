import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Query keys centralizados — evita strings sueltos por el código
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  actores: {
    all: ["actores"] as const,
    list: (p: object) => ["actores", "list", p] as const,
    detail: (id: string) => ["actores", id] as const,
  },
  proyectos: {
    all: ["proyectos"] as const,
    list: (p: object) => ["proyectos", "list", p] as const,
    detail: (id: string) => ["proyectos", id] as const,
    hitos: (pid: string) => ["proyectos", pid, "hitos"] as const,
  },
  practicas: {
    all: ["practicas"] as const,
    list: (p: object) => ["practicas", "list", p] as const,
    detail: (id: string) => ["practicas", id] as const,
  },
  redes: {
    all: ["redes"] as const,
    list: (p: object) => ["redes", "list", p] as const,
    detail: (id: string) => ["redes", id] as const,
  },
  emblematicos: {
    all: ["emblematicos"] as const,
    list: (p: object) => ["emblematicos", "list", p] as const,
    detail: (id: string) => ["emblematicos", id] as const,
  },
  documentos: {
    all: ["documentos"] as const,
    list: (p: object) => ["documentos", "list", p] as const,
  },
  eventos: {
    all: ["eventos"] as const,
    list: (p: object) => ["eventos", "list", p] as const,
    detail: (id: string) => ["eventos", id] as const,
    compromisos: (id: string) => ["eventos", id, "compromisos"] as const,
  },
  dashboard: {
    index: ["dashboard"] as const,
    graficaAnual: ["dashboard", "grafica-anual"] as const,
    graficaOds: ["dashboard", "grafica-ods"] as const,
  },
  provincias: {
    list: ["provincias", "list"] as const,
    detail: (id: string) => ["provincias", id] as const,
  },
  cantones: {
    list: (p: object) => ["cantones", "list", p] as const,
  },
  parroquias: {
    list: (p: object) => ["parroquias", "list", p] as const,
  },
  ods: {
    list: ["ods", "list"] as const,
    detail: (id: number) => ["ods", id] as const,
  },
  usuarios: {
    all: ["usuarios"] as const,
    list: (p: object) => ["usuarios", "list", p] as const,
    detail: (id: number) => ["usuarios", id] as const,
  },
  auditoria: {
    list: (p: object) => ["auditoria", "list", p] as const,
  },
  misCompromisos: {
    pendientes: ["mis-compromisos", "pendientes"] as const,
  },
  beneficiarios: {
    all: ["beneficiarios"] as const,
    list: (p: object) => ["beneficiarios", "list", p] as const,
    detail: (id: string) => ["beneficiarios", id] as const,
  },
} as const;
