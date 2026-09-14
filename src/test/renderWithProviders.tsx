import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import type { HttpResponseLike } from '../api/client';

/**
 * Tests never reach the network. The site's whole premise is that its numbers
 * come from somewhere else, so the fixtures here are the real API's shapes
 * captured from the deployed instance, not invented ones.
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0, gcTime: 0 },
    },
  });
}

export function renderWithProviders(ui: ReactNode, { route = '/' }: { route?: string } = {}) {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

export function jsonResponse(body: unknown, status = 200, statusText = 'OK'): HttpResponseLike {
  return { ok: status >= 200 && status < 300, status, statusText, json: async () => body };
}

export interface StubbedApi {
  /** Every URL requested, in order. */
  calls: string[];
}

/**
 * Routes a request by pathname. `handlers` is keyed by the path the client
 * asks for, so a test says exactly which endpoint it is standing in for.
 */
export function stubApi(handlers: Record<string, () => HttpResponseLike>): StubbedApi {
  const calls: string[] = [];

  vi.stubGlobal('fetch', async (input: string) => {
    calls.push(input);
    const path = new URL(input).pathname;
    const handler = handlers[path];
    if (handler === undefined) {
      throw new Error(`The test did not stub ${path}`);
    }
    return handler();
  });

  return { calls };
}
