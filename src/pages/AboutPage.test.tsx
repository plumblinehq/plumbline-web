import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { AboutPage } from './AboutPage';
import { STATUS_EXPLANATIONS } from '../lib/checkCopy';

function renderPage() {
  return render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>,
  );
}

describe('AboutPage', () => {
  it('states the scoring formula rather than gesturing at one', () => {
    renderPage();

    expect(
      screen.getByText(/sep_score = \(error-severity checks that passed\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/mean of the scores of the SEPs that are applicable/),
    ).toBeInTheDocument();
  });

  it('explains that a skip is excluded rather than counted against an anchor', () => {
    renderPage();

    expect(screen.getByText(/never enters the denominator/)).toBeInTheDocument();
    expect(screen.getByText(STATUS_EXPLANATIONS.skip)).toBeInTheDocument();
  });

  it('distinguishes our own failure from the anchor failing', () => {
    renderPage();

    expect(screen.getByText(/which is our failure rather than the anchor/)).toBeInTheDocument();
  });

  it('names the read-only boundaries', () => {
    renderPage();

    expect(screen.getByText(/never sends a/)).toBeInTheDocument();
    expect(
      screen.getByText(/SEP-10 challenges are verified, never signed and never submitted/),
    ).toBeInTheDocument();
    expect(screen.getByText(/No funded accounts are required/)).toBeInTheDocument();
  });

  it('is honest about the schedule', () => {
    renderPage();

    expect(screen.getByText(/15-minute schedule/)).toBeInTheDocument();
    expect(
      screen.getByText(/It is not continuous monitoring and is not described as such/),
    ).toBeInTheDocument();
    expect(screen.getByText(/disables scheduled workflows after 60 days/)).toBeInTheDocument();
  });

  it('names SDF anchor-tests and states the difference', () => {
    renderPage();

    expect(screen.getByRole('link', { name: '@stellar/anchor-tests' })).toHaveAttribute(
      'href',
      'https://github.com/stellar/stellar-anchor-tests',
    );
    expect(screen.getByText(/Plumbline is not a replacement for it/)).toBeInTheDocument();
  });

  it('says the colours are presentation and not a second scoring rule', () => {
    renderPage();

    expect(screen.getByText(/not a second scoring rule/)).toBeInTheDocument();
  });

  it('explains the opt-out process', () => {
    renderPage();

    expect(screen.getByText(/Any anchor that asks to be removed is removed/)).toBeInTheDocument();
  });
});
