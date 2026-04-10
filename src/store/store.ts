import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer   from './slices/uiSlice';
import mapaReducer from './slices/mapaSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui:   uiReducer,
    mapa: mapaReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
