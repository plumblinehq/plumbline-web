/**
 * Turns a `specRef` like "SEP-10 §Response (Success)" into a link target.
 *
 * The map is not a transformation of the reference — SEP references name
 * clauses, not headings. It is a curated table where each entry resolves a
 * clause name to the heading that *contains* the clause, with the slug read
 * off the actual SEP document (stellar/stellar-protocol, master) rather than
 * derived. A wrong anchor is a silent 404 on the one link that invites the
 * reader to verify the claim, so entries were checked one by one; anything
 * that cannot be mapped confidently falls back to the top of the document
 * rather than a plausible-looking dead anchor.
 */

const SPEC_BASE = 'https://github.com/stellar/stellar-protocol/blob/master/ecosystem';

/** slug(section heading), verified against the SEP-1 document (v2.7.0). */
const SEP1 = {
  generalInformation: 'general-information',
  specification: 'specification',
  currencyDocumentation: 'currency-documentation',
  organizationDocumentation: 'organization-documentation',
  validatorInformation: 'validator-information',
};

/** slug(section heading), verified against the SEP-10 document (v3.4.1). */
const SEP10 = {
  authenticationEndpoint: 'authentication-endpoint',
  crossOriginHeaders: 'cross-origin-headers',
  requestParameters: 'request-parameters',
  success: 'success',
  error: 'error',
  token: 'token',
};

const SECTION_ANCHORS: Record<string, string> = {
  // SEP-1 — clause families live under five sections
  'General Information': SEP1.generalInformation,
  Specification: SEP1.specification,
  'Currency Documentation': SEP1.currencyDocumentation,
  'Organization Documentation': SEP1.organizationDocumentation,
  'Validator Information': SEP1.validatorInformation,

  // SEP-8 — its one check regulates the stellar.toml field the SEP defines
  'SEP-1 stellar.toml': 'sep-1-stellartoml',

  // SEP-10 — the specRef names clause families, the document names headings
  'Authentication Endpoint': SEP10.authenticationEndpoint,
  'Authentication flow': SEP10.authenticationEndpoint,
  'Cross-Origin Headers': SEP10.crossOriginHeaders,
  'Request Parameters': SEP10.requestParameters,
  'Response (Success)': SEP10.success,
  'Response (Error)': SEP10.error,
  Token: SEP10.token,
};

export interface SpecLink {
  /** The clause, as the checks package states it. */
  clause: string;
  /** Stable URL into the SEP document on GitHub. */
  url: string;
  /** Document-level link, for the fallback path. */
  documentUrl: string;
}

/**
 * The one canonical builder. Every spec reference on the site goes through
 * this, so the catalogue and the check results can never disagree on where a
 * clause lives.
 */
export function specLinkFor(ref: string | null | undefined): SpecLink | null {
  if (ref === null || ref === undefined || ref.length === 0) {
    return null;
  }

  const match = /^SEP-(\d+)\s+§(.+)$/.exec(ref);
  if (match === null) {
    return null;
  }

  const sep = match[1] ?? '';
  const clause = (match[2] ?? '').trim();

  const anchor = resolveAnchor(clause);
  // An unmapped clause links to the document root: readable, honest, and
  // still one click to the spec, rather than a plausible-looking 404.
  const fragment = anchor !== undefined ? `#${anchor}` : '';

  return {
    clause,
    url: `${SPEC_BASE}/sep-${sep.padStart(4, '0')}.md${fragment}`,
    documentUrl: `${SPEC_BASE}/sep-${sep.padStart(4, '0')}.md`,
  };
}

/** True when the reference parses but has no curated section anchor. */
export function isDocumentLevelLink(link: SpecLink): boolean {
  return link.url === link.documentUrl;
}

/**
 * The checks package names a clause `Section, field` (or, once, with a
 * parenthesised qualifier). Resolve the section: exact name first, then the
 * text before the first comma, then before a parenthesised qualifier.
 * "Response (Success)" must match exactly — cutting at the parenthesis
 * would leave a meaningless "Response".
 */
function resolveAnchor(clause: string): string | undefined {
  if (SECTION_ANCHORS[clause] !== undefined) {
    return SECTION_ANCHORS[clause];
  }
  const beforeComma = clause.split(',')[0]?.trim() ?? '';
  if (beforeComma.length > 0 && SECTION_ANCHORS[beforeComma] !== undefined) {
    return SECTION_ANCHORS[beforeComma];
  }
  const beforeParen = clause.split(' (')[0]?.trim() ?? '';
  if (beforeParen.length > 0 && SECTION_ANCHORS[beforeParen] !== undefined) {
    return SECTION_ANCHORS[beforeParen];
  }
  return undefined;
}
