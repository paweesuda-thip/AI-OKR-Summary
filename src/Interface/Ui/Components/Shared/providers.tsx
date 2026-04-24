'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '@/src/Interface/Ui/queryClient';
import { ThemeProvider } from '@/src/Interface/Ui/Components/Shared/theme-provider';
import { TooltipProvider } from '@/src/Interface/Ui/Primitives/tooltip';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Client-side providers wrapper.
 *
 * Consolidates all client-only context providers:
 * - TanStack Query (data fetching, caching)
 * - Theme (dark/light mode)
 * - Tooltip (radix tooltip context)
 */
export function Providers({ children }: ProvidersProps) {
  // Use useState to ensure the QueryClient is stable across re-renders
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <TooltipProvider delay={0}>
          {children}
        </TooltipProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
