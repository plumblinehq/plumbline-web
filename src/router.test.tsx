import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';
import { appRoutes } from './router';
import { createTestQueryClient, jsonResponse, stubApi } from './test/renderWithProviders';

/**
 * These render the router's own route table rather than a copy of it, so a
 * route that is added without a page, or a path typo, fails here.
 */
function renderAt(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

function stubEverything() {
  return stubApi({
    '/api/anchors': () => jsonResponse([]),
    '/api/checks': () => jsonResponse([]),
  });
}

describe('routing', () => {
  it('serves the directory at the root', async () => {
    stubEverything();
    renderAt('/');

    expect(
      await screen.findByRole('heading', { name: 'Stellar anchor conformance directory' }),
    ).toBeInTheDocument();
  });

  it('serves the check catalogue', async () => {
    stubEverything();
    renderAt('/checks');

    expect(await screen.findByRole('heading', { name: 'Check catalogue' })).toBeInTheDocument();
  });

  it('serves the methodology page', async () => {
    stubEverything();
    renderAt('/about');

    expect(await screen.findByRole('heading', { name: 'Methodology' })).toBeInTheDocument();
  });

  it('renders a not-found page for an unknown path rather than a blank screen', async () => {
    stubEverything();
    renderAt('/anchor');

    expect(await screen.findByText('That page does not exist')).toBeInTheDocument();
  });

  it('keeps the navigation and the boundaries on every page', async () => {
    stubEverything();
    renderAt('/nonsense');

    expect(await screen.findByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByText(/never sends a/)).toBeInTheDocument();
  });
});
