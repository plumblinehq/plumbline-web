import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { RunList } from './RunList';
import type { RunSummary } from '../api/types';

const RUN: RunSummary = {
  id: '75',
  startedAt: '2026-09-14T10:39:06.393Z',
  finishedAt: '2026-09-14T10:39:21.761Z',
  status: 'complete',
  overallScore: 0.9,
  checksLibVersion: '0.2.3',
  counts: { pass: 38, fail: 3, skip: 11, error: 0 },
};

function renderList(runs: RunSummary[], now?: Date) {
  return render(
    <MemoryRouter>
      <RunList runs={runs} now={now} />
    </MemoryRouter>,
  );
}

describe('RunList', () => {
  it('links each run to its permalink', () => {
    renderList([RUN]);

    expect(screen.getByRole('link', { name: '#75' })).toHaveAttribute('href', '/run/75');
  });

  it('shows the counts the API reported, not a tally of the page', () => {
    renderList([RUN]);

    expect(screen.getByText('38 pass · 3 fail · 11 skip')).toBeInTheDocument();
  });

  it('shows when the run started and how long it took', () => {
    renderList([RUN], new Date('2026-09-14T12:00:00.000Z'));

    expect(screen.getByText('1 hour ago')).toBeInTheDocument();
    expect(screen.getByText('15.4 s')).toBeInTheDocument();
  });

  it('records the checks version that produced each run', () => {
    renderList([RUN]);

    expect(screen.getByText('v0.2.3')).toBeInTheDocument();
  });

  it('flags a run that did not complete', () => {
    renderList([{ ...RUN, status: 'aborted', finishedAt: null }]);

    expect(screen.getByText('aborted')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('says so when the anchor has never been scanned', () => {
    renderList([]);

    expect(screen.getByText('No runs recorded yet.')).toBeInTheDocument();
  });
});
