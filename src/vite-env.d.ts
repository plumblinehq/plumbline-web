/// <reference types="vite/client" />

/**
 * The only build-time variable the app reads: the base URL of the Plumbline
 * server API. Set on the host; see .env.example.
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
