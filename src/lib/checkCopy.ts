import type { CheckStatus, Severity } from '../api/types';

/**
 * The words a reader needs to interpret a result correctly. They live outside
 * the components so the pills, the check rows and the methodology page cannot
 * drift into explaining the same status three different ways.
 */

export const STATUS_LABELS: Record<CheckStatus, string> = {
  pass: 'Pass',
  fail: 'Fail',
  skip: 'Skip',
  error: 'Error',
};

/**
 * The distinctions matter to a reader deciding whether to trust a low score:
 * `fail` is the anchor's problem, `error` is Plumbline's, and `skip` is
 * neither — it is excluded from the denominator entirely.
 */
export const STATUS_EXPLANATIONS: Record<CheckStatus, string> = {
  pass: 'The anchor conforms to the clause this check enforces.',
  fail: 'The anchor does not conform. This counts against the score.',
  skip: 'Not applicable, excluded from the score. A failed prerequisite or an optional feature the anchor does not declare.',
  error:
    'Plumbline could not complete the check — a timeout, a DNS failure or a bug. Not the anchor’s fault.',
};

/**
 * Severity is not a judgement Plumbline makes: it is the spec's own wording
 * mapped mechanically. Showing the spec word rather than "high"/"low" keeps
 * that traceable.
 */
export const SEVERITY_LABELS: Record<Severity, string> = {
  error: 'MUST',
  warning: 'SHOULD',
  info: 'Info',
};

export const SEVERITY_EXPLANATIONS: Record<Severity, string> = {
  error: 'The spec says MUST. A failure here counts against the score.',
  warning:
    'The spec says SHOULD or RECOMMENDED. A failure is reported but does not count against the score.',
  info: 'The spec states no obligation. This is an observation.',
};
