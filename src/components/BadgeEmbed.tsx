import { useState } from 'react';
import { badgeUrl } from '../api/client';

/**
 * The badge is served by the API and cached there for an hour, so an anchor
 * can put it in its own README and it stays current without the anchor doing
 * anything. The snippet is offered as Markdown because that is what a README
 * is written in.
 */
export function BadgeEmbed({ homeDomain }: { homeDomain: string }) {
  const [copied, setCopied] = useState(false);
  const url = badgeUrl(homeDomain);
  const snippet = `[![Plumbline conformance score](${url})](https://github.com/plumblinehq)`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
    } catch {
      // Clipboard access can be denied; the snippet is on screen to copy by hand.
      setCopied(false);
    }
  }

  return (
    <div className="space-y-3 px-4 py-4">
      <div className="flex items-center gap-3">
        <img src={url} alt={`Plumbline conformance score for ${homeDomain}`} height={20} />
        <span className="text-xs text-ink-faint">Refreshed hourly by the API.</span>
      </div>
      <div className="flex items-start gap-2">
        <pre className="min-w-0 flex-1 overflow-x-auto rounded-md bg-canvas px-3 py-2 text-xs text-ink-soft">
          <code>{snippet}</code>
        </pre>
        <button
          type="button"
          onClick={() => void copy()}
          className="shrink-0 rounded-md border border-line px-2 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-raised hover:text-ink"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
