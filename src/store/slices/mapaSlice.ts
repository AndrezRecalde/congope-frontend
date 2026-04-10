import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MapaViewport {
  latitude:  number;
  longitude: number;
  zoom:      number;
}

interface MapaFiltros {
  estado?:      string;
  provincia_id?: string;
  ods_id?:      number;
  actor_id?:    string;
  anio?:        number;
}

interface MapaState {
  viewport:     MapaViewport;
  capasActivas: string[];
  filtros:      MapaFiltros;
}

// Ecuador centrado — coordenadas del centro geográfico
const ECUADOR_CENTER: MapaViewport = {
  latitude:  -1.8312,
  longitude: -78.1834,
  zoom:       6.5,
};

const initialState: MapaState = {
  viewport:     ECUADOR_CENTER,
  capasActivas: ['proyectos', 'provincias'],
  filtros:      {},
};

const mapaSlice = createSlice({
  name: 'mapa',
  initialState,
  reducers: {
    setViewport: (state, action: PayloadAction<MapaViewport>) => {
      state.viewport = action.payload;
    },
    toggleCapa: (state, action: PayloadAction<string>) => {
      const capa = action.payload;
      if (state.capasActivas.includes(capa)) {
        state.capasActivas = state.capasActivas.filter(
          (c) => c !== capa
        );
      } else {
        state.capasActivas.push(capa);
      }
    },
    setFiltrosMapa: (
      state,
      action: PayloadAction<MapaFiltros>
    ) => {
      state.filtros = { ...state.filtros, ...action.payload };
    },
    limpiarFiltrosMapa: (state) => {
      state.filtros = {};
    },
    resetearMapa: (state) => {
      state.viewport = ECUADOR_CENTER;
      state.filtros  = {};
    },
  },
  selectors: {
    selectViewport:     (state) => state.viewport,
    selectCapasActivas: (state) => state.capasActivas,
    selectFiltrosMapa:  (state) => state.filtros,
  },
});

export const {
  setViewport,
  toggleCapa,
  setFiltrosMapa,
  limpiarFiltrosMapa,
  resetearMapa,
} = mapaSlice.actions;
export const {
  selectViewport,
  selectCapasActivas,
  selectFiltrosMapa,
} = mapaSlice.selectors;
export default mapaSlice.reducer;
