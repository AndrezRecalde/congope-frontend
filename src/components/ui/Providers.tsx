'use client';

import { MantineProvider }  from '@mantine/core';
import { Notifications }    from '@mantine/notifications';
import { ModalsProvider }   from '@mantine/modals';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider }       from '@tanstack/react-query';
import { ReactQueryDevtools }        from '@tanstack/react-query-devtools';
import { themeCongope }    from '@/lib/mantine';
import { store }           from '@/store/store';
import { queryClient }     from '@/lib/query-client';
import { env }             from '@/lib/env';
import { AuthInitializer } from './AuthInitializer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider
          theme={themeCongope}
          defaultColorScheme="light"
        >
          <ModalsProvider>
            <Notifications
              position="top-right"
              zIndex={1000}
              autoClose={4000}
            />
            <AuthInitializer>
              {children}
            </AuthInitializer>
          </ModalsProvider>
        </MantineProvider>
        {env.NEXT_PUBLIC_APP_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ReduxProvider>
  );
}
