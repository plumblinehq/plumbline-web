import { createBrowserRouter, type RouteObject } from 'react-router';
import { AboutPage } from './pages/AboutPage';
import { DocsPage } from './pages/DocsPage';
import { AnchorPage } from './pages/AnchorPage';
import { ChecksPage } from './pages/ChecksPage';
import { DirectoryPage } from './pages/DirectoryPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RunPage } from './pages/RunPage';
import { Layout } from './components/Layout';
import { RootErrorBoundary } from './components/RootErrorBoundary';

/**
 * The URL is the state. Filters and sorting live in the query string so a
 * filtered view is a link someone can paste, and the anchor and run pages are
 * real permalinks rather than client-side views over one page.
 *
 * Exported separately from the router so tests can build a memory router from
 * this exact table instead of a copy of it.
 */
export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <RootErrorBoundary />,
    children: [
      { index: true, element: <DirectoryPage /> },
      { path: 'anchor/:homeDomain', element: <AnchorPage /> },
      { path: 'run/:runId', element: <RunPage /> },
      { path: 'checks', element: <ChecksPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'docs', element: <DocsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(appRoutes);
