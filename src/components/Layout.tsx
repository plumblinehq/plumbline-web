import { Link, NavLink, Outlet } from 'react-router';
import { apiBase } from '../api/client';

const NAV_ITEMS = [
  { to: '/', label: 'Directory', end: true },
  { to: '/checks', label: 'Checks', end: false },
  { to: '/about', label: 'Methodology', end: false },
  { to: '/docs', label: 'Docs', end: false },
];

function navLinkClass({ isActive }: { isActive: boolean }): string {
  const base = 'rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors';
  return isActive ? `${base} bg-slate-900 text-white` : `${base} text-slate-600 hover:bg-slate-100`;
}

/**
 * The plumb line: a weighted line that shows whether something is true and
 * vertical. The same mark as the favicon, drawn inline so the header never
 * depends on an asset request.
 */
function Mark() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 32 32"
      className="h-6 w-6"
      fill="none"
    >
      <line
        x1="16"
        y1="2"
        x2="16"
        y2="20"
        stroke="#0f172a"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M16 18 L22 27 A7 7 0 0 1 10 27 Z" fill="#0f172a" />
    </svg>
  );
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <Mark />
            <span className="text-lg font-semibold tracking-tight">Plumbline</span>
            <span className="hidden text-xs text-slate-500 sm:inline">
              Stellar anchor conformance
            </span>
          </Link>
          <nav aria-label="Main" className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/*
       * A horizon line under the nav: a faint top-light gradient strip that
       * gives the white grade cards something to sit on instead of flat
       * grey. Decorative only — the single <Outlet /> stays in <main>.
       */}
      <div
        aria-hidden="true"
        className="h-10 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50 sm:h-14"
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-slate-600 sm:grid-cols-2 sm:px-6">
        <div>
          <h2 className="text-xs font-semibold tracking-wide text-slate-900 uppercase">
            What this tests, and what it never will
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
            <li>
              Only <code className="font-mono">GET</code>, <code className="font-mono">HEAD</code>{' '}
              and <code className="font-mono">OPTIONS</code> against an anchor. Plumbline never
              sends a <code className="font-mono">POST</code>.
            </li>
            <li>
              SEP-10 challenges are fetched and verified, never signed and never submitted to a
              token endpoint.
            </li>
            <li>No deposit or withdrawal flow against a third-party anchor. Ever.</li>
            <li>No funded accounts: the SEP-10 check makes an ephemeral keypair only.</li>
            <li>
              One request in flight per host, at least two seconds apart, with a documented opt-out.
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <p className="text-xs">
            Plumbline is not a replacement for the Stellar Development Foundation&apos;s{' '}
            <a
              className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
              href="https://github.com/stellar/stellar-anchor-tests"
            >
              @stellar/anchor-tests
            </a>
            , which is the right tool for an anchor operator testing their own anchor, including
            authenticated flows. Plumbline is the scheduled, ecosystem-wide, read-only view.
          </p>
          <p className="text-xs">
            Source:{' '}
            <a
              className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
              href="https://github.com/plumblinehq"
            >
              github.com/plumblinehq
            </a>{' '}
            · Apache-2.0 ·{' '}
            <a
              className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
              href="https://github.com/plumblinehq/plumbline-server/blob/main/seeds/optout.yaml"
            >
              opt-out list
            </a>
          </p>
          <p className="text-xs text-slate-400">
            Reading from <code className="font-mono">{apiBase}</code>. Every score and grade shown
            here is computed by that API; this site derives none of them.
          </p>
        </div>
      </div>
    </footer>
  );
}
