import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { RootErrorBoundary } from './components/RootErrorBoundary';
import { DirectoryPage } from './pages/DirectoryPage';

/**
 * The URL is the state. Filters and sorting live in the query string so a
 * filtered view is a link someone can paste, and the anchor and run pages are
 * real permalinks rather than client-side views over one page.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <RootErrorBoundary />,
    children: [{ index: true, element: <DirectoryPage /> }],
  },
]);
