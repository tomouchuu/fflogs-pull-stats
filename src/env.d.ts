/// <reference types="vite/client" />

interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_HISTORIC_START_DATE: string
  readonly VITE_FFLOGS_API_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}