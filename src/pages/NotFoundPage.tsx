import { Link } from 'react-router';
import { Panel } from '../components/Panel';

export function NotFoundPage() {
  return (
    <Panel className="p-8">
      <h1 className="text-base font-semibold text-slate-900">That page does not exist</h1>
      <p className="mt-1 text-sm text-slate-600">
        Plumbline has a directory of anchors, a page per anchor, a page per run, the check catalogue
        and this methodology page. If you followed a link from somewhere else expecting a Plumbline
        page and landed here, the link is wrong rather than you.
      </p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link
          to="/"
          className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-700"
        >
          The directory
        </Link>
        <Link
          to="/checks"
          className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
        >
          The check catalogue
        </Link>
        <Link
          to="/about"
          className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
        >
          Methodology
        </Link>
      </div>
    </Panel>
  );
}
