import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DirectoryFilters } from './DirectoryFilters';
import { DEFAULT_FILTERS, type DirectoryFilters as Filters } from '../hooks/useDirectoryFilters';

function setup(filters: Filters = DEFAULT_FILTERS, seps: number[] = [1, 10]) {
  const onChange = vi.fn();
  const onReset = vi.fn();
  render(<DirectoryFilters filters={filters} seps={seps} onChange={onChange} onReset={onReset} />);
  return { onChange, onReset, user: userEvent.setup() };
}

describe('DirectoryFilters', () => {
  it('shows the current filters', () => {
    setup({ network: 'testnet', sep: 10, minScore: 0.7, sort: 'score' });

    expect(screen.getByLabelText('Network')).toHaveValue('testnet');
    expect(screen.getByLabelText('Implements')).toHaveValue('10');
    expect(screen.getByLabelText('Minimum score')).toHaveValue('0.7');
    expect(screen.getByLabelText('Sort by')).toHaveValue('score');
  });

  it('offers only the SEPs the catalogue actually grades', () => {
    setup(DEFAULT_FILTERS, [1, 10]);

    const sepSelect = screen.getByLabelText('Implements');
    expect(sepSelect).toHaveTextContent('SEP-1');
    expect(sepSelect).toHaveTextContent('SEP-10');
    expect(sepSelect).not.toHaveTextContent('SEP-24');
  });

  it('reports a network choice as a filter', async () => {
    const { onChange, user } = setup();

    await user.selectOptions(screen.getByLabelText('Network'), 'testnet');

    expect(onChange).toHaveBeenCalledWith('network', 'testnet');
  });

  it('clears a filter when the any-option is chosen', async () => {
    const { onChange, user } = setup({ ...DEFAULT_FILTERS, network: 'pubnet' });

    await user.selectOptions(screen.getByLabelText('Network'), 'all');

    expect(onChange).toHaveBeenCalledWith('network', undefined);
  });

  it('passes the numeric minimum score, not the option label', async () => {
    const { onChange, user } = setup();

    await user.selectOptions(screen.getByLabelText('Minimum score'), '0.7');

    expect(onChange).toHaveBeenCalledWith('minScore', 0.7);
  });

  it('hides the clear button when nothing is filtered', () => {
    setup();

    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });

  it('offers the clear button once a filter is set', async () => {
    const { onReset, user } = setup({ ...DEFAULT_FILTERS, sep: 1 });

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(onReset).toHaveBeenCalledOnce();
  });
});
