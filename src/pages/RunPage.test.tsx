import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { RunPage } from './RunPage';
import { jsonResponse, renderWithProviders, stubApi } from '../test/renderWithProviders';
import type { Run } from '../api/types';

const RUN: Run = {
  id: '75',
  anchorId: '1',
  homeDomain: 'testanchor.stellar.org',
  network: 'testnet',
  startedAt: '2026-09-14T10:39:06.393Z',
  finishedAt: '2026-09-14T10:39:21.761Z',
  status: 'complete',
  overallScore: 0.9,
  checksLibVersion: '0.2.3',
  grades: [{ sep: 1, score: 0.8, applicable: true }],
  results: [
    {
      checkId: 'sep1.toml-cors',
      sep: 1,
      status: 'fail',
      severity: 'error',
      message: 'The response did not include Access-Control-Allow-Origin.',
      specRef: 'SEP-1 §Specification, CORS',
      evidence: [
        {
          method: 'GET',
          url: 'https://testanchor.stellar.org/.well-known/stellar.toml',
          statusCode: 200,
          headers: {},
        },
      ],
      durationMs: 4,
      title: 'the stellar.toml sets the CORS header',
    },
  ],
};

function renderPage(run: Run) {
  stubApi({ '/api/runs/75': () => jsonResponse(run) });

  return renderWithProviders(
    <Routes>
      <Route path="/run/:runId" element={<RunPage />} />
    </Routes>,
    { route: '/run/75' },
  );
}

describe('RunPage', () => {
  it('names the run and links back to its anchor', async () => {
    renderPage(RUN);

    expect(await screen.findByRole('heading', { name: 'Run #75' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'testanchor.stellar.org' })).toHaveAttribute(
      'href',
      '/anchor/testanchor.stellar.org',
    );
  });

  it('records when the run happened and how long it took', async () => {
    renderPage(RUN);

    expect(await screen.findByText(/Started .*2026/)).toBeInTheDocument();
    expect(screen.getByText('Took 15.4 s')).toBeInTheDocument();
    expect(screen.getByText('v0.2.3')).toBeInTheDocument();
  });

  it('renders the grade and the checks from that run', async () => {
    renderPage(RUN);

    expect(await screen.findByText('90.0%')).toBeInTheDocument();
    expect(screen.getByText('the stellar.toml sets the CORS header')).toBeInTheDocument();
    expect(screen.getByText('1 ran')).toBeInTheDocument();
  });

  it('does not label a complete run as anything unusual', async () => {
    renderPage(RUN);

    await screen.findByRole('heading', { name: 'Run #75' });
    expect(screen.queryByText('complete')).not.toBeInTheDocument();
  });

  it('flags a run that did not complete', async () => {
    renderPage({ ...RUN, status: 'aborted', finishedAt: null });

    expect(await screen.findByText('aborted')).toBeInTheDocument();
  });

  it('shows a not-found error for an unknown run', async () => {
    stubApi({ '/api/runs/75': () => jsonResponse({ error: 'unknown run' }, 404, 'Not Found') });

    renderWithProviders(
      <Routes>
        <Route path="/run/:runId" element={<RunPage />} />
      </Routes>,
      { route: '/run/75' },
    );

    expect(await screen.findByRole('heading', { name: 'Not found' })).toBeInTheDocument();
  });
});
