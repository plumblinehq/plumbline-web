import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Vitest runs without globals, so React Testing Library cannot register its
// own auto-cleanup; each rendered tree is unmounted explicitly instead.
afterEach(() => {
  cleanup();
});
