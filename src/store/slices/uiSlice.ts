import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarAbierto: boolean;
  colorScheme: 'light' | 'dark' | 'auto';
}

const initialState: UiState = {
  sidebarAbierto: true,
  colorScheme:    'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarAbierto = !state.sidebarAbierto;
    },
    setSidebar: (state, action: PayloadAction<boolean>) => {
      state.sidebarAbierto = action.payload;
    },
    setColorScheme: (
      state,
      action: PayloadAction<'light' | 'dark' | 'auto'>
    ) => {
      state.colorScheme = action.payload;
    },
  },
  selectors: {
    selectSidebarAbierto: (state) => state.sidebarAbierto,
    selectColorScheme:    (state) => state.colorScheme,
  },
});

export const { toggleSidebar, setSidebar, setColorScheme } =
  uiSlice.actions;
export const { selectSidebarAbierto, selectColorScheme } =
  uiSlice.selectors;
export default uiSlice.reducer;
