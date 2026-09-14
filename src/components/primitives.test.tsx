import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScoreBadge, ScoreBar } from './ScoreBadge';
import { StatusPill } from './StatusPill';
import { SeverityTag } from './SeverityTag';
import { SEVERITY_EXPLANATIONS, STATUS_EXPLANATIONS } from '../lib/checkCopy';
import { EmptyPanel, ErrorPanel, LoadingPanel } from './StatePanels';
import { ApiError } from '../api/client';

describe('ScoreBadge', () => {
  it('renders the score as a percentage', () => {
    render(<ScoreBadge score={0.941} />);
    expect(screen.getByText('94.1%')).toBeInTheDocument();
  });

  it('colours by tone so a column can be scanned', () => {
    const { rerender } = render(<ScoreBadge score={0.95} />);
    expect(screen.getByText('95.0%')).toHaveClass('bg-emerald-50');

    rerender(<ScoreBadge score={0.8} />);
    expect(screen.getByText('80.0%')).toHaveClass('bg-amber-50');

    rerender(<ScoreBadge score={0.2} />);
    expect(screen.getByText('20.0%')).toHaveClass('bg-rose-50');
  });

  it('renders a missing score as a dash and not as zero', () => {
    render(<ScoreBadge score={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('ScoreBar', () => {
  it('sizes the fill to the score', () => {
    render(<ScoreBar score={0.5} />);
    expect(screen.getByRole('img', { name: 'Score 50.0%' }).firstElementChild).toHaveStyle({
      width: '50%',
    });
  });

  it('labels an absent score rather than drawing a zero bar', () => {
    render(<ScoreBar score={null} />);
    expect(screen.getByRole('img', { name: 'No score recorded' })).toBeInTheDocument();
  });
});

describe('StatusPill', () => {
  it('renders each status with its own label', () => {
    const { rerender } = render(<StatusPill status="pass" />);
    expect(screen.getByText('Pass')).toBeInTheDocument();

    rerender(<StatusPill status="fail" />);
    expect(screen.getByText('Fail')).toBeInTheDocument();

    rerender(<StatusPill status="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('explains what skip means, since it is excluded from the score', () => {
    render(<StatusPill status="skip" />);
    expect(screen.getByText('Skip')).toHaveAttribute('title', STATUS_EXPLANATIONS.skip);
    expect(STATUS_EXPLANATIONS.skip).toMatch(/excluded/i);
  });

  it('distinguishes an error from a failure', () => {
    expect(STATUS_EXPLANATIONS.error).toMatch(/not the anchor/i);
    expect(STATUS_EXPLANATIONS.fail).toMatch(/counts against the score/i);
  });
});

describe('SeverityTag', () => {
  it('shows the spec word behind the severity instead of a made-up scale', () => {
    const { rerender } = render(<SeverityTag severity="error" />);
    expect(screen.getByText('MUST')).toHaveAttribute('title', SEVERITY_EXPLANATIONS.error);

    rerender(<SeverityTag severity="warning" />);
    expect(screen.getByText('SHOULD')).toBeInTheDocument();

    rerender(<SeverityTag severity="info" />);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });
});

describe('StatePanels', () => {
  it('renders a loading status', () => {
    render(<LoadingPanel label="Loading anchors" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading anchors');
  });

  it('renders an empty message', () => {
    render(<EmptyPanel message="No anchors match these filters." />);
    expect(screen.getByText('No anchors match these filters.')).toBeInTheDocument();
  });

  it('explains the free-tier cold start rather than blaming the reader', () => {
    render(<ErrorPanel error={new Error('Failed to fetch')} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load this data');
    expect(screen.getByText(/sleeps when idle/i)).toBeInTheDocument();
  });

  it('distinguishes a 404 from a failure to load', () => {
    render(
      <ErrorPanel
        error={new ApiError('https://api.example.com/api/anchors/x', 404, 'Not Found')}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Not found');
  });

  it('offers a retry when the caller can refetch', () => {
    const onRetry = vi.fn();
    render(<ErrorPanel error={new Error('nope')} onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
