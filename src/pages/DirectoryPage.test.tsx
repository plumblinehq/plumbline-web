import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DirectoryPage } from './DirectoryPage';
import { jsonResponse, renderWithProviders, stubApi } from '../test/renderWithProviders';
import type { AnchorSummary } from '../api/types';

const ANCHOR: AnchorSummary = {
  id: '1',
  homeDomain: 'testanchor.stellar.org',
  network: 'testnet',
  displayName: 'SDF Test Anchor',
  optedOut: false,
  lastRunId: '75',
  lastRunAt: '2026-09-14T10:39:06.393Z',
  lastRunStatus: 'complete',
  overallScore: 0.9,
  grades: [
    { sep: 1, score: 0.8, applicable: true },
    { sep: 10, score: 1, applicable: true },
  ],
};

const CATALOGUE = [
  {
    id: 'sep1.toml-reachable',
    sep: 1,
    title: 'the stellar.toml is reachable',
    description: 'Fetches the well-known path.',
    severity: 'error',
    specRef: 'SEP-1 §Specification',
    requires: [],
  },
];

function stubbed(anchors: AnchorSummary[]) {
  return stubApi({
    '/api/anchors': () => jsonResponse(anchors),
    '/api/checks': () => jsonResponse(CATALOGUE),
  });
}

describe('DirectoryPage', () => {
  it('renders the anchors the API returned', async () => {
    stubbed([ANCHOR]);

    renderWithProviders(<DirectoryPage />);

    expect(await screen.findByText('SDF Test Anchor')).toBeInTheDocument();
    expect(screen.getByText('1 anchor matches these filters.')).toBeInTheDocument();
  });

  it('says nothing is monitored yet when there are no anchors and no filters', async () => {
    stubbed([]);

    renderWithProviders(<DirectoryPage />);

    expect(await screen.findByText('No anchors are being monitored yet.')).toBeInTheDocument();
  });

  it('pushes a chosen filter to the API rather than filtering in the browser', async () => {
    const api = stubbed([ANCHOR]);
    const user = userEvent.setup();

    renderWithProviders(<DirectoryPage />);
    await screen.findByText('SDF Test Anchor');

    await user.selectOptions(screen.getByLabelText('Network'), 'testnet');

    await waitFor(() => {
      expect(api.calls.some((call) => call.includes('network=testnet'))).toBe(true);
    });
  });

  it('offers to clear the filters when they match nothing', async () => {
    stubbed([]);
    const user = userEvent.setup();

    renderWithProviders(<DirectoryPage />);
    await screen.findByText('No anchors are being monitored yet.');

    await user.selectOptions(screen.getByLabelText('Implements'), '1');

    expect(await screen.findByText(/No anchors match these filters/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });

  it('reads the filters out of the URL on first render', async () => {
    const api = stubbed([ANCHOR]);

    renderWithProviders(<DirectoryPage />, { route: '/?network=testnet&sort=score' });

    await screen.findByText('SDF Test Anchor');

    expect(api.calls.some((call) => call.includes('network=testnet'))).toBe(true);
    expect(api.calls.some((call) => call.includes('sort=score'))).toBe(true);
  });
});
