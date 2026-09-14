import { QueryClient } from '@tanstack/react-query';

/**
 * The server rescans on a schedule measured in tens of minutes, so refetching
 * on every window focus would mostly re-read identical bytes. Five minutes
 * keeps a directory tab current without hammering a free-tier API that cold
 * starts on the first request.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
