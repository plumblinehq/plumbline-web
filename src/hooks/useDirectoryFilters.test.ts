import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FILTERS,
  isDefaultFilters,
  parseDirectoryFilters,
  toAnchorQuery,
  toSearchParams,
} from './useDirectoryFilters';

function parse(search: string) {
  return parseDirectoryFilters(new URLSearchParams(search));
}

describe('parseDirectoryFilters', () => {
  it('reads every supported filter', () => {
    expect(parse('network=testnet&sep=10&min_score=0.8&sort=score')).toEqual({
      network: 'testnet',
      sep: 10,
      minScore: 0.8,
      sort: 'score',
    });
  });

  it('treats an empty query string as no filters', () => {
    expect(parse('')).toEqual(DEFAULT_FILTERS);
  });

  it('ignores an unknown network instead of sending the API a 400', () => {
    expect(parse('network=mainnet').network).toBeUndefined();
  });

  it('ignores a non-integer or non-positive sep', () => {
    expect(parse('sep=ten').sep).toBeUndefined();
    expect(parse('sep=0').sep).toBeUndefined();
    expect(parse('sep=-1').sep).toBeUndefined();
    expect(parse('sep=2.5').sep).toBeUndefined();
    expect(parse('sep=10abc').sep).toBeUndefined();
  });

  it('ignores a min_score outside the range the API accepts', () => {
    expect(parse('min_score=1.5').minScore).toBeUndefined();
    expect(parse('min_score=-0.1').minScore).toBeUndefined();
    expect(parse('min_score=abc').minScore).toBeUndefined();
    expect(parse('min_score=0.8abc').minScore).toBeUndefined();
  });

  it('keeps min_score of zero, which is a real filter', () => {
    expect(parse('min_score=0').minScore).toBe(0);
  });

  it('falls back to name ordering for an unknown sort', () => {
    expect(parse('sort=whatever').sort).toBe('name');
  });
});

describe('toSearchParams', () => {
  it('omits defaults so the plain directory URL stays clean', () => {
    expect(toSearchParams(DEFAULT_FILTERS).toString()).toBe('');
  });

  it('serialises the filters it was given', () => {
    expect(
      toSearchParams({ network: 'pubnet', sep: 1, minScore: 0.5, sort: 'score' }).toString(),
    ).toBe('network=pubnet&sep=1&min_score=0.5&sort=score');
  });

  it('round-trips through parse unchanged', () => {
    const filters = { network: 'pubnet', sep: 1, minScore: 0.5, sort: 'score' } as const;
    expect(parseDirectoryFilters(toSearchParams(filters))).toEqual(filters);
  });
});

describe('toAnchorQuery', () => {
  it('maps the filter names onto the API client query', () => {
    expect(toAnchorQuery({ network: 'pubnet', sep: 1, minScore: 0.7, sort: 'score' })).toEqual({
      network: 'pubnet',
      sep: 1,
      minScore: 0.7,
      sort: 'score',
    });
  });
});

describe('isDefaultFilters', () => {
  it('knows when nothing is filtered', () => {
    expect(isDefaultFilters(DEFAULT_FILTERS)).toBe(true);
    expect(isDefaultFilters({ ...DEFAULT_FILTERS, sep: 10 })).toBe(false);
    expect(isDefaultFilters({ ...DEFAULT_FILTERS, sort: 'score' })).toBe(false);
  });
});
