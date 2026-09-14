import { describe, expect, it } from 'vitest';
import {
  apiBase,
  ApiError,
  badgeUrl,
  buildAnchorsQuery,
  createApiClient,
  DEFAULT_API_BASE,
  parseEvidence,
  resolveApiBase,
  type FetchLike,
  type HttpResponseLike,
} from './client';

function jsonResponse(body: unknown, status = 200, statusText = 'OK'): HttpResponseLike {
  return { ok: status >= 200 && status < 300, status, statusText, json: async () => body };
}

function recordingFetch(response: HttpResponseLike) {
  const calls: Array<{ url: string; init: RequestInit | undefined }> = [];
  const fetchImpl: FetchLike = async (url, init) => {
    calls.push({ url, init });
    return response;
  };
  return { calls, fetchImpl };
}

describe('resolveApiBase', () => {
  it('falls back to the public deployment so local dev needs no setup', () => {
    expect(resolveApiBase(undefined)).toBe(DEFAULT_API_BASE);
    expect(resolveApiBase('')).toBe(DEFAULT_API_BASE);
    expect(resolveApiBase('   ')).toBe(DEFAULT_API_BASE);
  });

  it('strips trailing slashes, which would produce a double slash and a 404', () => {
    expect(resolveApiBase('https://api.example.com/')).toBe('https://api.example.com');
    expect(resolveApiBase('https://api.example.com///')).toBe('https://api.example.com');
  });

  it('keeps a configured base url as given', () => {
    expect(resolveApiBase('http://localhost:3000')).toBe('http://localhost:3000');
  });
});

describe('buildAnchorsQuery', () => {
  it('omits unset filters rather than sending empty values the API rejects', () => {
    expect(buildAnchorsQuery({})).toBe('');
  });

  it('serialises every filter with the API names', () => {
    expect(buildAnchorsQuery({ network: 'pubnet', sep: 10, minScore: 0.8, sort: 'score' })).toBe(
      '?network=pubnet&sep=10&min_score=0.8&sort=score',
    );
  });

  it('serialises a partial filter set', () => {
    expect(buildAnchorsQuery({ sep: 1 })).toBe('?sep=1');
  });

  it('keeps minScore of zero, which is a real filter and not an absent one', () => {
    expect(buildAnchorsQuery({ minScore: 0 })).toBe('?min_score=0');
  });
});

describe('parseEvidence', () => {
  it('parses the JSON string the API returns for a JSONB column', () => {
    const raw = JSON.stringify([
      { method: 'GET', url: 'https://a.example/.well-known/stellar.toml', statusCode: 200 },
    ]);
    expect(parseEvidence(raw)).toHaveLength(1);
    expect(parseEvidence(raw)[0]?.method).toBe('GET');
  });

  it('returns an empty list for the empty array the API sends on a passing check', () => {
    expect(parseEvidence('[]')).toEqual([]);
  });

  it('returns an empty list rather than throwing on malformed JSON', () => {
    expect(parseEvidence('{not json')).toEqual([]);
  });

  it('returns an empty list when the payload is not an array', () => {
    expect(parseEvidence('{"method":"GET"}')).toEqual([]);
  });

  it('returns an empty list for a missing or non-string value', () => {
    expect(parseEvidence(undefined)).toEqual([]);
    expect(parseEvidence(null)).toEqual([]);
    expect(parseEvidence('')).toEqual([]);
    expect(parseEvidence([{ method: 'GET' }])).toEqual([]);
  });

  it('drops entries that are not evidence rather than rendering a broken row', () => {
    const raw = JSON.stringify([
      { method: 'GET', url: 'https://a.example', statusCode: 200 },
      { method: 'GET' },
      'nonsense',
      null,
    ]);
    expect(parseEvidence(raw)).toHaveLength(1);
  });
});

describe('createApiClient', () => {
  const baseUrl = 'https://api.example.com';

  it('requests the anchors path with the serialised filters', async () => {
    const { calls, fetchImpl } = recordingFetch(jsonResponse([]));
    await createApiClient({ baseUrl, fetch: fetchImpl }).listAnchors({ network: 'testnet' });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe('https://api.example.com/api/anchors?network=testnet');
    expect(calls[0]?.init?.method).toBe('GET');
  });

  it('lowercases nothing but encodes a domain so it cannot escape the path', async () => {
    const { calls, fetchImpl } = recordingFetch(jsonResponse({ homeDomain: 'a/b' }));
    await createApiClient({ baseUrl, fetch: fetchImpl }).getAnchor('a/b.example');

    expect(calls[0]?.url).toBe('https://api.example.com/api/anchors/a%2Fb.example');
  });

  it('parses evidence out of a run result before handing it to the UI', async () => {
    const { fetchImpl } = recordingFetch(
      jsonResponse({
        id: '1',
        results: [
          {
            checkId: 'sep1.toml-cors',
            evidence: JSON.stringify([
              { method: 'GET', url: 'https://a.example', statusCode: 200 },
            ]),
          },
          { checkId: 'sep1.toml-size' },
        ],
      }),
    );

    const run = await createApiClient({ baseUrl, fetch: fetchImpl }).getRun('1');

    expect(run.results[0]?.evidence).toHaveLength(1);
    expect(run.results[1]?.evidence).toEqual([]);
  });

  it('treats a missing results array as an empty run rather than crashing the page', async () => {
    const { fetchImpl } = recordingFetch(jsonResponse({ id: '1' }));
    const run = await createApiClient({ baseUrl, fetch: fetchImpl }).getRun('1');

    expect(run.results).toEqual([]);
  });

  it('throws a typed ApiError naming the url and status on a non-2xx response', async () => {
    const { fetchImpl } = recordingFetch(
      jsonResponse({ error: 'unknown anchor' }, 404, 'Not Found'),
    );
    const client = createApiClient({ baseUrl, fetch: fetchImpl });

    const error = await client.getAnchor('missing.example').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(404);
    expect((error as ApiError).url).toBe('https://api.example.com/api/anchors/missing.example');
    expect((error as ApiError).message).toContain('404');
  });

  it('uses the configured base url for every endpoint', async () => {
    const { calls, fetchImpl } = recordingFetch(jsonResponse([]));
    const client = createApiClient({ baseUrl, fetch: fetchImpl });

    await client.listRuns('a.example', 5);
    await client.getHistory('a.example', 30);
    await client.listChecks();

    expect(calls.map((call) => call.url)).toEqual([
      'https://api.example.com/api/anchors/a.example/runs?limit=5',
      'https://api.example.com/api/anchors/a.example/history?days=30',
      'https://api.example.com/api/checks',
    ]);
  });

  it('defaults to the module-level base url when none is given', () => {
    expect(createApiClient().baseUrl).toBe(apiBase);
  });
});

describe('badgeUrl', () => {
  it('points at the API badge endpoint so the README can embed a live score', () => {
    expect(badgeUrl('a.example', 'https://api.example.com')).toBe(
      'https://api.example.com/badge/a.example.svg',
    );
  });
});
