declare const __IKONECTT_STANDALONE_DEMO__: boolean;
// Undefined in source-level live tests; Vite replaces this with an immutable build choice.
export const STANDALONE_DEMO = typeof __IKONECTT_STANDALONE_DEMO__ !== 'undefined' && __IKONECTT_STANDALONE_DEMO__;
