import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { AnchorPage } from './AnchorPage';
import { jsonResponse, renderWithProviders, stubApi } from '../test/renderWithProviders';
import type { AnchorDetail } from '../api/types';

const DETAIL: AnchorDetail = {
  id: '1',
  homeDomain: 'testanchor.stellar.org',
  network: 'testnet',
  displayName: 'SDF Test Anchor',
  addedAt: '2026-09-09T19:42:09.623Z',
  optedOut: false,
  optOutNote: null,
  latestRun: {
    id: '75',
    anchorId: '1',
    homeDomain: 'testanchor.stellar.org',
    network: 'testnet',
    startedAt: '2026-09-14T10:39:06.393Z',
    finishedAt: '2026-09-14T10:39:21.761Z',
    status: 'complete',
    overallScore: 0.9,
    checksLibVersion: '0.2.3',
    grades: [
      { sep: 1, score: 0.8, applicable: true },
      { sep: 10, score: 1, applicable: true },
    ],
    results: [],
  },
};

function renderPage(detail: AnchorDetail) {
  stubApi({ '/api/anchors/testanchor.stellar.org': () => jsonResponse(detail) });

  return renderWithProviders(
    <Routes>
      <Route path="/anchor/:homeDomain" element={<AnchorPage />} />
    </Routes>,
    { route: '/anchor/testanchor.stellar.org' },
  );
}

describe('AnchorPage', () => {
  it('names the anchor, its network and its domain', async () => {
    renderPage(DETAIL);

    expect(await screen.findByRole('heading', { name: 'SDF Test Anchor' })).toBeInTheDocument();
    expect(screen.getByText('testnet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'testanchor.stellar.org' })).toHaveAttribute(
      'href',
      'https://testanchor.stellar.org',
    );
  });

  it('links to the stellar.toml the results were derived from', async () => {
    renderPage(DETAIL);

    expect(await screen.findByRole('link', { name: 'stellar.toml' })).toHaveAttribute(
      'href',
      'https://testanchor.stellar.org/.well-known/stellar.toml',
    );
  });

  it('shows the overall and per-SEP scores', async () => {
    renderPage(DETAIL);

    expect(await screen.findByText('90.0%')).toBeInTheDocument();
    expect(screen.getByText('80.0%')).toBeInTheDocument();
    expect(screen.getByText('SEP-10')).toBeInTheDocument();
  });

  it('records the checks version that produced the grade', async () => {
    renderPage(DETAIL);

    expect(await screen.findByText('v0.2.3')).toBeInTheDocument();
  });

  it('reports an unimplemented SEP as unimplemented, not as a zero', async () => {
    renderPage({
      ...DETAIL,
      latestRun: {
        ...DETAIL.latestRun!,
        grades: [
          { sep: 1, score: 1, applicable: true },
          { sep: 10, score: 0, applicable: false },
        ],
      },
    });

    expect(
      await screen.findByText(/not implemented — excluded from the score/),
    ).toBeInTheDocument();
    expect(screen.queryByText('0.0%')).not.toBeInTheDocument();
  });

  it('says when there is no run rather than rendering an empty grade', async () => {
    renderPage({ ...DETAIL, latestRun: null });

    expect(await screen.findByText(/has not been scanned yet/)).toBeInTheDocument();
  });

  it('says when an anchor asked to be removed', async () => {
    renderPage({
      ...DETAIL,
      optedOut: true,
      optOutNote: 'Emailed 2026-09-10.',
    });

    expect(await screen.findByText(/asked to be removed/)).toBeInTheDocument();
    expect(screen.getByText(/Emailed 2026-09-10/)).toBeInTheDocument();
  });

  it('shows a not-found error for an unknown anchor', async () => {
    stubApi({
      '/api/anchors/testanchor.stellar.org': () =>
        jsonResponse({ error: 'unknown anchor' }, 404, 'Not Found'),
    });

    renderWithProviders(
      <Routes>
        <Route path="/anchor/:homeDomain" element={<AnchorPage />} />
      </Routes>,
      { route: '/anchor/testanchor.stellar.org' },
    );

    expect(await screen.findByRole('heading', { name: 'Not found' })).toBeInTheDocument();
  });
});
