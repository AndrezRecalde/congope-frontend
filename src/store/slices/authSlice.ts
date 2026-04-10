import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Usuario } from '@/services/axios';

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  usuario: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ usuario: Usuario; token: string }>
    ) => {
      state.usuario         = action.payload.usuario;
      state.token           = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading       = false;
    },
    clearCredentials: (state) => {
      state.usuario         = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.isLoading       = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  selectors: {
    selectUsuario:          (state) => state.usuario,
    selectToken:            (state) => state.token,
    selectIsAuthenticated:  (state) => state.isAuthenticated,
    selectIsLoading:        (state) => state.isLoading,
    selectRoles:            (state) => state.usuario?.roles ?? [],
    selectPermisos:         (state) => state.usuario?.permissions ?? [],
    selectProvincias:       (state) => state.usuario?.provincias ?? [],
  },
});

export const { setCredentials, clearCredentials, setLoading } =
  authSlice.actions;
export const {
  selectUsuario,
  selectToken,
  selectIsAuthenticated,
  selectIsLoading,
  selectRoles,
  selectPermisos,
  selectProvincias,
} = authSlice.selectors;
export default authSlice.reducer;
