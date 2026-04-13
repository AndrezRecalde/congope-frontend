import apiClient, {
  extractData,
  type Proyecto,
  type Provincia,
  type Ods,
  type PaginatedResponse,
} from "./axios";
import type { MapaFiltros } from "@/types/mapa.types";

export const mapaService = {
  /**
   * GET /api/v1/proyectos
   * Con filtros opcionales. Carga todos (per_page alto)
   * para no paginar el mapa.
   */
  listarProyectos: async (filtros: MapaFiltros = {}): Promise<Proyecto[]> => {
    const params = Object.fromEntries(
      Object.entries({
        ...filtros,
        per_page: 200, // Suficiente para el mapa
        page: 1,
      }).filter(([, v]) => v !== "" && v !== undefined && v !== null),
    );
    const res = await apiClient.get("/proyectos", {
      params,
    });
    const data = res.data as PaginatedResponse<Proyecto>;
    return data.data;
  },

  /**
   * GET /api/v1/proyectos/:id
   * Para el Drawer lateral con información completa.
   */
  obtenerProyecto: async (id: string): Promise<Proyecto> => {
    const res = await apiClient.get(`/proyectos/${id}`);
    return extractData<Proyecto>(res);
  },

  /**
   * GET /api/v1/provincias
   * Para calcular estadísticas por provincia y el select.
   */
  listarProvincias: async (): Promise<Provincia[]> => {
    const res = await apiClient.get("/provincias");
    return extractData<Provincia[]>(res);
  },

  /**
   * GET /api/v1/ods
   * Para el select de filtro de ODS.
   */
  listarOds: async (): Promise<Ods[]> => {
    const res = await apiClient.get("/ods");
    return extractData<Ods[]>(res);
  },
};
