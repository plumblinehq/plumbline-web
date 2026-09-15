import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ChecksPage } from './ChecksPage';
import { jsonResponse, renderWithProviders, stubApi } from '../test/renderWithProviders';
import { SEVERITY_EXPLANATIONS } from '../lib/checkCopy';
import type { CheckDefinition } from '../api/types';

const CATALOGUE: CheckDefinition[] = [
  {
    id: 'sep1.toml-reachable',
    sep: 1,
    title: 'the stellar.toml is reachable',
    description: 'Fetches the well-known path for the home domain.',
    severity: 'error',
    specRef: 'SEP-1 §Specification',
    requires: [],
  },
  {
    id: 'sep10.challenge-decodes',
    sep: 10,
    title: 'the challenge transaction decodes as XDR',
    description: 'Decodes the response transaction field.',
    severity: 'error',
    specRef: 'SEP-10 §Response (Success)',
    requires: ['sep10.challenge-json-shape'],
  },
  {
    id: 'sep1.version-present',
    sep: 1,
    title: 'VERSION is declared',
    description: 'Recommends a VERSION field.',
    severity: 'warning',
    specRef: 'SEP-1 §General Information',
    requires: ['sep1.toml-parses'],
  },
];

function renderPage(checks: CheckDefinition[] = CATALOGUE) {
  stubApi({ '/api/checks': () => jsonResponse(checks) });
  return renderWithProviders(<ChecksPage />);
}

describe('ChecksPage', () => {
  it('renders the catalogue grouped by SEP', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: /^SEP-1\b/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^SEP-10\b/ })).toBeInTheDocument();
    expect(screen.getByText('3 checks.')).toBeInTheDocument();
  });

  it('shows the clause each check enforces', async () => {
    renderPage();

    expect(await screen.findByText('SEP-10 §Response (Success)')).toBeInTheDocument();
    expect(screen.getByText('sep10.challenge-decodes')).toBeInTheDocument();
  });

  it('links each clause to its section in the SEP document', async () => {
    renderPage();

    const success = await screen.findByRole('link', { name: 'SEP-10 §Response (Success)' });
    expect(success).toHaveAttribute(
      'href',
      'https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md#success',
    );

    const general = screen.getByRole('link', { name: 'SEP-1 §General Information' });
    expect(general).toHaveAttribute(
      'href',
      'https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md#general-information',
    );
  });

  it('shows severity as the spec wording it was derived from', async () => {
    renderPage();
    await screen.findByText('VERSION is declared');

    // Queried by the tag's own title: the page prose also mentions SHOULD.
    expect(screen.getByTitle(SEVERITY_EXPLANATIONS.warning)).toHaveTextContent('SHOULD');
    expect(screen.getAllByTitle(SEVERITY_EXPLANATIONS.error).length).toBeGreaterThan(0);
  });

  it('names the prerequisites a check depends on', async () => {
    renderPage();

    expect(await screen.findByText('sep10.challenge-json-shape')).toBeInTheDocument();
  });

  it('narrows the list as the reader searches', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('the stellar.toml is reachable');

    await user.type(screen.getByRole('searchbox'), 'challenge');

    expect(screen.getByText('1 check.')).toBeInTheDocument();
    expect(screen.queryByText('the stellar.toml is reachable')).not.toBeInTheDocument();
  });

  it('searches the description and the spec reference too', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('the stellar.toml is reachable');

    await user.type(screen.getByRole('searchbox'), 'General Information');

    expect(screen.getByText('VERSION is declared')).toBeInTheDocument();
    expect(screen.queryByText('the stellar.toml is reachable')).not.toBeInTheDocument();
  });

  it('says when a search matches nothing', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('the stellar.toml is reachable');

    await user.type(screen.getByRole('searchbox'), 'zzz');

    expect(screen.getByText(/No check matches/)).toBeInTheDocument();
  });
});
