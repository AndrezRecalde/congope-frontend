'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials, clearCredentials } from '@/store/slices/authSlice';
import { authService } from '@/services/auth.service';
import { Center, Loader } from '@mantine/core';
import { usePathname } from 'next/navigation';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('congope_token');
      
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        // Valida el token contra el servidor y obtiene al usuario nuevamente
        const user = await authService.me();
        dispatch(setCredentials({ usuario: user, token }));
      } catch (error) {
        // Token inválido o sesión expirada
        localStorage.removeItem('congope_token');
        document.cookie =
          'congope_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
        dispatch(clearCredentials());
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [dispatch]);

  // No bloquear el render si estamos en la página de login
  if (isInitializing && pathname !== '/login') {
    return (
      <Center h="100vh">
        <Loader color="congope" type="bars" />
      </Center>
    );
  }

  return <>{children}</>;
}
