/**
 * Hook that lets `scripts/bundle.mjs` embed every prompt in the single-file
 * build (`dist/plugins/remote-code.js`).
 *
 * The bundler replaces this module with a generated one that exports the full
 * text of every `*.txt` prompt, so the drop-in file has no runtime file
 * dependencies. The normal `tsc` build keeps this map empty and falls back to
 * reading the sibling `*.txt` files from disk.
 */
export const INLINE_PROMPTS: Record<string, string> = {}
