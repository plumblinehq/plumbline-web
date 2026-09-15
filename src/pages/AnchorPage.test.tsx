import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

function renderPage(detail: AnchorDetail, history: unknown = [], runs: unknown = []) {
  stubApi({
    '/api/anchors/testanchor.stellar.org': () => jsonResponse(detail),
    '/api/anchors/testanchor.stellar.org/history': () => jsonResponse(history),
    '/api/anchors/testanchor.stellar.org/runs': () => jsonResponse(runs),
  });

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

  it('charts the score history and says when there is none', async () => {
    renderPage(DETAIL, []);

    expect(await screen.findByRole('heading', { name: 'Score history' })).toBeInTheDocument();
    // The chart is lazy-loaded, so this assertion waits for a second chunk
    // rather than for a state update.
    expect(
      await screen.findByText('No runs recorded in this window yet.', {}, { timeout: 5000 }),
    ).toBeInTheDocument();
  });

  it('lists recent runs with a permalink to each', async () => {
    renderPage(
      DETAIL,
      [],
      [
        {
          id: '75',
          startedAt: '2026-09-14T10:39:06.393Z',
          finishedAt: '2026-09-14T10:39:21.761Z',
          status: 'complete',
          overallScore: 0.9,
          checksLibVersion: '0.2.3',
          counts: { pass: 38, fail: 3, skip: 11, error: 0 },
        },
      ],
    );

    expect(await screen.findByRole('link', { name: '#75' })).toHaveAttribute('href', '/run/75');
    expect(screen.getByText('38 pass · 3 fail · 11 skip')).toBeInTheDocument();
  });

  it('renders the raw wire shape behind the live anchor pages', async () => {
    // Regression, 2026-09-15: every anchor page crashed into the error
    // boundary with `TypeError: Cannot convert undefined or null to object`.
    // The cause was evidence items recorded without a `headers` field — the
    // checks package stores headers only where headers are the point — which
    // reached `Object.keys(item.headers)` in CheckRow unnormalised. This test
    // returns the payload exactly as the API serialises it (evidence as a
    // JSON *string*, items without `headers`) and asserts the page renders.
    const WIRE = {
      id: '1',
      homeDomain: 'anclap.com',
      network: 'pubnet',
      displayName: 'Anclap',
      addedAt: '2026-09-09T19:42:09.623Z',
      optedOut: false,
      optOutNote: null,
      latestRun: {
        id: '75',
        anchorId: '1',
        homeDomain: 'anclap.com',
        network: 'pubnet',
        startedAt: '2026-09-14T10:39:06.393Z',
        finishedAt: '2026-09-14T10:39:21.761Z',
        status: 'complete',
        overallScore: 0.9,
        checksLibVersion: '0.2.3',
        grades: [
          { sep: 1, score: 0.8, applicable: true },
          { sep: 10, score: 1, applicable: true },
        ],
        results: [
          {
            checkId: 'sep1.currency-image-reachable',
            sep: 1,
            status: 'pass',
            severity: 'warning',
            message: null,
            specRef: null,
            evidence: JSON.stringify([
              {
                method: 'GET',
                url: 'https://static.anclap.com/coin/pen.png',
                statusCode: 200,
                body: 'png bytes',
              },
            ]),
            durationMs: 340,
            title: 'every advertised currency image is reachable',
          },
          {
            checkId: 'sep1.toml-cors',
            sep: 1,
            status: 'pass',
            severity: 'info',
            message: null,
            specRef: null,
            evidence: '[]',
            durationMs: 210,
            title: 'stellar.toml is served with CORS headers',
          },
        ],
      },
    };
    stubApi({
      '/api/anchors/anclap.com': () => jsonResponse(WIRE),
      '/api/anchors/anclap.com/history': () => jsonResponse([]),
      '/api/anchors/anclap.com/runs': () => jsonResponse([]),
    });

    renderWithProviders(
      <Routes>
        <Route path="/anchor/:homeDomain" element={<AnchorPage />} />
      </Routes>,
      { route: '/anchor/anclap.com' },
    );

    expect(await screen.findByRole('heading', { name: 'Anclap' })).toBeInTheDocument();

    const row = screen.getByText('every advertised currency image is reachable');
    await userEvent.setup().click(row);

    expect(
      screen.getByText('No response headers were recorded for this exchange.'),
    ).toBeInTheDocument();
  });

  it('marks the grade when the latest run had checks Plumbline could not complete', async () => {
    // Copied from the live API (2026-09-15): mykobo.co's run shows 24 pass,
    // 3 error, 25 skip and a 100% score. The errors are Plumbline's own
    // network failures — excluded from the score, but never hidden.
    const withErrors: AnchorDetail = {
      ...DETAIL,
      latestRun: {
        ...DETAIL.latestRun!,
        overallScore: 1,
        grades: [{ sep: 1, score: 1, applicable: true }],
        results: [
          {
            checkId: 'sep10.challenge-returns-200',
            sep: 10,
            status: 'error',
            severity: 'error',
            message: 'Plumbline failed to run this check: fetch failed',
            specRef: null,
            evidence: [],
            durationMs: 409,
            title: 'the challenge endpoint returns 200',
          },
        ],
      },
    };
    renderPage(withErrors);

    await screen.findByText('100.0%', { selector: 'p' });
    expect(screen.getByText('*1 check could not run')).toBeInTheDocument();
  });

  it('leaves the grade unmarked when every check in the latest run completed', async () => {
    renderPage(DETAIL);

    await screen.findByText('90.0%', { selector: 'p' });
    expect(screen.queryByText(/could not run/)).not.toBeInTheDocument();
  });

  it('links a check result to the clause it enforces in the SEP document', async () => {
    const detailed: AnchorDetail = {
      ...DETAIL,
      latestRun: {
        ...DETAIL.latestRun!,
        results: [
          {
            checkId: 'sep1.toml-cors',
            sep: 1,
            status: 'fail',
            severity: 'error',
            message: 'The response did not include Access-Control-Allow-Origin.',
            specRef: 'SEP-1 §Specification, CORS',
            evidence: [],
            durationMs: 12,
            title: 'the stellar.toml sets the CORS header',
          },
        ],
      },
    };
    renderPage(detailed);

    const row = await screen.findByText('the stellar.toml sets the CORS header');
    await userEvent.setup().click(row);

    expect(
      screen.getByRole('link', { name: 'SEP-1 §Specification, CORS' }),
    ).toHaveAttribute(
      'href',
      'https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md#specification',
    );
  });

  it('shows a not-found error for an unknown anchor', async () => {
    stubApi({
      '/api/anchors/testanchor.stellar.org': () =>
        jsonResponse({ error: 'unknown anchor' }, 404, 'Not Found'),
      '/api/anchors/testanchor.stellar.org/history': () => jsonResponse([]),
      '/api/anchors/testanchor.stellar.org/runs': () => jsonResponse([]),
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
