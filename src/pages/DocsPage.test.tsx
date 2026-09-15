import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { DocsPage } from './DocsPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <DocsPage />
    </MemoryRouter>,
  );
}

describe('DocsPage', () => {
  it('documents the real CLI surface, including the exit-code contract', () => {
    renderPage();

    expect(screen.getByText(/npx @plumblinehq\/plumbline-checks run --home-domain/)).toBeInTheDocument();
    expect(screen.getByText(/checks list --sep 10/)).toBeInTheDocument();
    expect(screen.getByText(/exit code is 0 unless an/i)).toBeInTheDocument();
  });

  it('documents the library entrypoints that actually exist', () => {
    renderPage();

    expect(screen.getByText(/run, all, RateLimitedHttpClient, consoleLogger/)).toBeInTheDocument();
  });

  it('lists the real API routes with their parameters', () => {
    renderPage();

    expect(screen.getByText('GET /api/anchors')).toBeInTheDocument();
    expect(screen.getByText(/network, sep, min_score/)).toBeInTheDocument();
    expect(screen.getByText('GET /api/anchors/:homeDomain/runs')).toBeInTheDocument();
    expect(screen.getByText('GET /api/runs/:runId')).toBeInTheDocument();
    expect(screen.getByText('GET /api/checks')).toBeInTheDocument();
  });

  it('explains lastRunErrorCount as the fully-verified vs not distinction', () => {
    renderPage();

    expect(screen.getByText(/fully-verified 100% from one that never ran everything/i)).toBeInTheDocument();
  });

  it('links to the methodology page instead of duplicating the scoring rules', () => {
    renderPage();

    const link = screen.getByRole('link', { name: 'methodology page' });
    expect(link).toHaveAttribute('href', '/about');
    expect(screen.getByText(/two copies of a rule eventually disagree/i)).toBeInTheDocument();
    // The scoring formula must NOT be restated here — it lives on /about only.
    expect(screen.queryByText(/sep_score = /)).not.toBeInTheDocument();
  });

  it('documents the spec-first rule for check contributions', () => {
    renderPage();

    expect(screen.getByText(/never\s+written from memory/i)).toBeInTheDocument();
    expect(screen.getByText(/maps to error/i)).toBeInTheDocument();
  });
});
