declare module 'tiptap-fontsize-extension' {
  import type { Extension } from '@tiptap/core';
  // Minimal typing to satisfy TypeScript. The real module exports a Tiptap extension.
  export const FontSize: Extension;
  export default FontSize;
}
