import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CheckResults } from './CheckResults';
import type { CheckResult } from '../api/types';

function result(overrides: Partial<CheckResult> & Pick<CheckResult, 'checkId'>): CheckResult {
  return {
    sep: 1,
    status: 'pass',
    severity: 'error',
    message: null,
    specRef: null,
    evidence: [],
    durationMs: 0,
    title: `title for ${overrides.checkId}`,
    ...overrides,
  };
}

describe('CheckResults', () => {
  it('groups by SEP', () => {
    render(
      <CheckResults
        results={[result({ checkId: 'sep1.a', sep: 1 }), result({ checkId: 'sep10.a', sep: 10 })]}
      />,
    );

    expect(screen.getByRole('heading', { name: /^SEP-1\b/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^SEP-10\b/ })).toBeInTheDocument();
  });

  it('summarises each SEP by the rows it is showing', () => {
    render(
      <CheckResults
        results={[
          result({ checkId: 'sep1.a' }),
          result({ checkId: 'sep1.b', status: 'fail' }),
          result({ checkId: 'sep1.c', status: 'skip' }),
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: /1 pass · 1 fail · 1 skip/ })).toBeInTheDocument();
  });

  it('leads with failures inside a SEP group', () => {
    render(
      <CheckResults
        results={[
          result({ checkId: 'sep1.passing' }),
          result({ checkId: 'sep1.failing', status: 'fail' }),
        ]}
      />,
    );

    const headings = screen.getAllByText(/^sep1\./);
    expect(headings[0]).toHaveTextContent('sep1.failing');
  });

  it('says so when a run recorded nothing', () => {
    render(<CheckResults results={[]} />);

    expect(screen.getByText('This run recorded no check results.')).toBeInTheDocument();
  });
});
