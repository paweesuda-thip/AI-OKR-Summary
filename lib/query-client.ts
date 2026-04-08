import { QueryClient } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data stays fresh for 5 minutes — prevents refetching on re-mount
        staleTime: 5 * 60 * 1000,
        // Garbage-collect unused cache entries after 30 minutes
        gcTime: 30 * 60 * 1000,
        // Retry failed requests twice with exponential back-off
        retry: 2,
        // Don't refetch when window regains focus (dashboard is long-lived)
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  // Server: always create a new client (avoid cross-request leakage)
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  // Browser: reuse a singleton
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
