import { describe, expect, it } from 'vitest';
import { isDocumentLevelLink, specLinkFor } from './specLink';

describe('specLinkFor', () => {
  it('zero-pads the SEP number the way the repository names its files', () => {
    expect(specLinkFor('SEP-1 §Specification')?.url).toBe(
      'https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md#specification',
    );
    expect(specLinkFor('SEP-10 §Token')?.url).toBe(
      'https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md#token',
    );
  });

  it('links each section name to the heading that contains it', () => {
    // SEP-1: the clause families live under five sections. Slugs verified
    // against the document, not derived — a wrong anchor is a silent 404.
    const expectations: ReadonlyArray<readonly [string, string]> = [
      ['SEP-1 §Specification, CORS', '#specification'],
      ['SEP-1 §Specification, max file size', '#specification'],
      ['SEP-1 §General Information, ACCOUNTS', '#general-information'],
      ['SEP-1 §General Information, SIGNING_KEY', '#general-information'],
      ['SEP-1 §Currency Documentation, code', '#currency-documentation'],
      ['SEP-1 §Organization Documentation, ORG_URL', '#organization-documentation'],
      ['SEP-1 §Validator Information, ALIAS', '#validator-information'],
    ];
    for (const [ref, fragment] of expectations) {
      expect(specLinkFor(ref)?.url, ref).toContain(fragment);
    }
  });

  it('maps SEP-10 clause names to the headings that actually contain them', () => {
    // "Response (Success)" and "Response (Error)" are clause names, not
    // headings: the document headings are "Success" and "Error" under
    // Response. "Authentication flow" is a clause family under the
    // Authentication Endpoint section.
    const expectations: ReadonlyArray<readonly [string, string]> = [
      ['SEP-10 §Response (Success)', '#success'],
      ['SEP-10 §Response (Error)', '#error'],
      ['SEP-10 §Authentication flow', '#authentication-endpoint'],
      ['SEP-10 §Authentication Endpoint', '#authentication-endpoint'],
      ['SEP-10 §Cross-Origin Headers', '#cross-origin-headers'],
      ['SEP-10 §Request Parameters', '#request-parameters'],
      ['SEP-10 §Token', '#token'],
    ];
    for (const [ref, fragment] of expectations) {
      expect(specLinkFor(ref)?.url, ref).toContain(fragment);
    }
  });

  it('links the SEP-8 clause to the stellar.toml section of SEP-8', () => {
    expect(specLinkFor('SEP-8 §SEP-1 stellar.toml, regulated / approval_server')?.url).toBe(
      'https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0008.md#sep-1-stellartoml',
    );
  });

  it('falls back to the document when a clause has no curated anchor, and says so', () => {
    const link = specLinkFor('SEP-1 §Some Future Clause');
    expect(link).not.toBeNull();
    expect(isDocumentLevelLink(link!)).toBe(true);
    expect(link!.url.endsWith('/sep-0001.md')).toBe(true);
  });

  it('returns null for a reference that does not parse, so callers can show plain text', () => {
    expect(specLinkFor(null)).toBeNull();
    expect(specLinkFor('')).toBeNull();
    expect(specLinkFor('not a spec ref')).toBeNull();
  });

  it('tolerates surrounding whitespace in the clause', () => {
    expect(specLinkFor('SEP-10 §Token  ')?.url).toContain('#token');
  });
});
