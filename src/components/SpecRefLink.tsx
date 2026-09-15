import { isDocumentLevelLink, specLinkFor } from '../lib/specLink';

/**
 * A spec reference, linked to the clause it came from. Plain text here was
 * the one place the site asked to be trusted rather than checked: every
 * assertion Plumbline makes is supposed to trace to real spec text in one
 * click. A reference that parses but has no curated section anchor still
 * links, to the document itself, and says so in its title.
 */
export function SpecRefLink({ specRef }: { specRef: string | null }) {
  if (specRef === null) {
    return <span>—</span>;
  }

  const link = specLinkFor(specRef);
  if (link === null) {
    // Does not parse as "SEP-n §clause": show the text as stored rather
    // than inventing a URL for it.
    return <span>{specRef}</span>;
  }

  return (
    <a
      className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
      href={link.url}
      target="_blank"
      rel="noreferrer noopener"
      title={
        isDocumentLevelLink(link)
          ? 'Read the SEP on GitHub (no section anchor for this clause)'
          : 'Read this clause in the SEP on GitHub'
      }
    >
      {specRef}
    </a>
  );
}
