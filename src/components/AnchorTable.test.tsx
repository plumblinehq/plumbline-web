import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { AnchorTable } from './AnchorTable';
import { sepColumns } from '../lib/format';
import type { AnchorSummary } from '../api/types';

function anchor(overrides: Partial<AnchorSummary> = {}): AnchorSummary {
  return {
    id: '1',
    homeDomain: 'anchor.example',
    network: 'pubnet',
    displayName: 'Example Anchor',
    optedOut: false,
    lastRunId: '10',
    lastRunAt: '2026-09-14T09:00:00.000Z',
    lastRunStatus: 'complete',
    overallScore: 0.9,
    grades: [
      { sep: 1, score: 1, applicable: true },
      { sep: 10, score: 0.8, applicable: true },
    ],
    ...overrides,
  };
}

function renderTable(anchors: AnchorSummary[], now?: Date) {
  return render(
    <MemoryRouter>
      <AnchorTable anchors={anchors} now={now} />
    </MemoryRouter>,
  );
}

describe('sepColumns', () => {
  it('derives the columns from the data so a newly graded SEP needs no web change', () => {
    expect(
      sepColumns([
        anchor({ grades: [{ sep: 10, score: 1, applicable: true }] }),
        anchor({ grades: [{ sep: 1, score: 1, applicable: true }] }),
      ]),
    ).toEqual([1, 10]);
  });

  it('returns no columns when there is nothing graded', () => {
    expect(sepColumns([anchor({ grades: [] })])).toEqual([]);
  });
});

describe('AnchorTable', () => {
  it('links each row to its anchor page', () => {
    renderTable([anchor()]);

    expect(screen.getByRole('link', { name: 'Example Anchor' })).toHaveAttribute(
      'href',
      '/anchor/anchor.example',
    );
  });

  it('falls back to the domain when an anchor has no display name', () => {
    renderTable([anchor({ displayName: null })]);

    expect(screen.getByRole('link', { name: 'anchor.example' })).toBeInTheDocument();
  });

  it('shows the per-SEP score and the overall score', () => {
    renderTable([anchor()]);

    const row = screen.getByRole('row', { name: /Example Anchor/ });
    expect(within(row).getByText('100.0%')).toBeInTheDocument();
    expect(within(row).getByText('80.0%')).toBeInTheDocument();
    expect(within(row).getByText('90.0%')).toBeInTheDocument();
  });

  it('renders an unimplemented SEP as a dash, not as a zero score', () => {
    renderTable([
      anchor({ grades: [{ sep: 10, score: 0, applicable: false }], overallScore: null }),
    ]);

    const row = screen.getByRole('row', { name: /Example Anchor/ });
    const dash = within(row).getByTitle(/not implemented/);

    expect(dash).toHaveTextContent('—');
    expect(within(row).queryByText('0.0%')).not.toBeInTheDocument();
  });

  it('marks a testnet anchor so a reader does not mistake it for real money', () => {
    renderTable([anchor({ network: 'testnet' })]);

    expect(screen.getByText('testnet')).toHaveAttribute(
      'title',
      expect.stringContaining('no real funds'),
    );
  });

  it('says never rather than inventing a time for an anchor with no run', () => {
    renderTable([anchor({ lastRunAt: null, overallScore: null })]);

    expect(screen.getByText('never')).toBeInTheDocument();
  });

  it('flags a last run that did not complete', () => {
    renderTable([anchor({ lastRunStatus: 'aborted' })]);

    expect(screen.getByText('(aborted)')).toBeInTheDocument();
  });

  it('renders relative times against the injected clock', () => {
    renderTable(
      [anchor({ lastRunAt: '2026-09-14T09:00:00.000Z' })],
      new Date('2026-09-14T12:00:00.000Z'),
    );

    expect(screen.getByText('3 hours ago')).toBeInTheDocument();
  });
});
