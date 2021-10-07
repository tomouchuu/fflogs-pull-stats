interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_HISTORIC_START_DATE: number
  readonly VITE_FFLOGS_API_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}