import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted variable fonts: the interface face and the mono face for
// machine identifiers. No third-party request is made to render the page.
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import { App } from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('index.html is missing the #root element');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
