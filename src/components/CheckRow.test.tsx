import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CheckRow } from './CheckRow';
import type { CheckResult, Evidence } from '../api/types';

const FAILING: CheckResult = {
  checkId: 'sep10.challenge-decodes',
  sep: 10,
  status: 'fail',
  severity: 'error',
  message: 'The transaction field did not decode as a base64 transaction envelope.',
  specRef: 'SEP-10 §Response (Success)',
  evidence: [
    {
      method: 'GET',
      url: 'https://kbtrading.org/auth?account=GBNG7IM',
      statusCode: 200,
      headers: { 'access-control-allow-origin': 'https://plumbline.example' },
      body: '{"transaction":"AAAAAgAAAAAglAa2vQ6x9FKm"}',
    },
  ],
  durationMs: 12,
  title: 'the challenge transaction decodes as XDR',
};

describe('CheckRow', () => {
  it('shows the title, id, status and severity without opening anything', () => {
    render(<CheckRow result={FAILING} />);

    expect(screen.getByText('the challenge transaction decodes as XDR')).toBeInTheDocument();
    expect(screen.getByText('sep10.challenge-decodes')).toBeInTheDocument();
    expect(screen.getByText('Fail')).toBeInTheDocument();
    expect(screen.getByText('MUST')).toBeInTheDocument();
  });

  it('starts collapsed, so a long list stays scannable', () => {
    const { container } = render(<CheckRow result={FAILING} />);

    expect(container.querySelector('details')).not.toHaveAttribute('open');
  });

  it('opens to the message, the spec reference and the exchange behind it', async () => {
    const user = userEvent.setup();
    const { container } = render(<CheckRow result={FAILING} />);

    await user.click(screen.getByText('the challenge transaction decodes as XDR'));

    expect(container.querySelector('details')).toHaveAttribute('open');
    expect(screen.getByText(FAILING.message!)).toBeInTheDocument();
    expect(screen.getByText('SEP-10 §Response (Success)')).toBeInTheDocument();
    expect(screen.getByText('12 ms')).toBeInTheDocument();
  });

  it('shows the request that was actually made', async () => {
    const user = userEvent.setup();
    render(<CheckRow result={FAILING} />);

    await user.click(screen.getByText('the challenge transaction decodes as XDR'));

    const evidence = screen.getByRole('heading', { name: 'Evidence (1)' }).parentElement!;
    expect(within(evidence).getByText('GET')).toBeInTheDocument();
    expect(within(evidence).getByText(FAILING.evidence[0]!.url)).toBeInTheDocument();
    expect(within(evidence).getByText('200')).toBeInTheDocument();
  });

  it('says the stored body is truncated, so a short body is not read as the whole response', async () => {
    const user = userEvent.setup();
    render(<CheckRow result={FAILING} />);

    await user.click(screen.getByText('the challenge transaction decodes as XDR'));

    expect(screen.getByText(/truncates a stored body to 2 KB/)).toBeInTheDocument();
  });

  it('renders a headerless exchange as a normal state, the shape the checks package stores for image fetches', async () => {
    // Fixture copied from the live API (2026-09-15): `sep1.currency-image-reachable`
    // records the exchange with a body but no `headers` field. Before the fix,
    // rendering this row threw `TypeError: Cannot convert undefined or null to
    // object` and took the whole anchor page into the error boundary.
    const HEADERLESS: CheckResult = {
      ...FAILING,
      checkId: 'sep1.currency-image-reachable',
      title: 'every advertised currency image is reachable',
      message: null,
      evidence: [
        {
          method: 'GET',
          url: 'https://static.anclap.com/coin/pen.png',
          statusCode: 200,
          body: 'png bytes',
        } as Evidence,
      ],
    };
    const user = userEvent.setup();
    render(<CheckRow result={HEADERLESS} />);

    await user.click(screen.getByText('every advertised currency image is reachable'));

    expect(
      screen.getByText('No response headers were recorded for this exchange.'),
    ).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('explains a missing evidence list rather than showing an empty block', async () => {
    const user = userEvent.setup();
    render(<CheckRow result={{ ...FAILING, evidence: [], message: null }} />);

    await user.click(screen.getByText('the challenge transaction decodes as XDR'));

    expect(screen.getByText('No HTTP exchange was recorded for this check.')).toBeInTheDocument();
    expect(screen.getByText('This check produced no message.')).toBeInTheDocument();
  });

  it('renders a passing check with its own status', () => {
    render(<CheckRow result={{ ...FAILING, status: 'pass', severity: 'warning' }} />);

    expect(screen.getByText('Pass')).toBeInTheDocument();
    expect(screen.getByText('SHOULD')).toBeInTheDocument();
  });
});
