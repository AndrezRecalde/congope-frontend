'use client';

import { useAppSelector } from '@/store/hooks';
import {
  selectUsuario,
  selectToken,
  selectIsAuthenticated,
  selectIsLoading,
} from '@/store/slices/authSlice';

export function useAuth() {
  return {
    usuario:         useAppSelector(selectUsuario),
    token:           useAppSelector(selectToken),
    isAuthenticated: useAppSelector(selectIsAuthenticated),
    isLoading:       useAppSelector(selectIsLoading),
  };
}
