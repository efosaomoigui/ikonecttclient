declare const __IKONECTT_STANDALONE_DEMO__: boolean;
// Undefined in source-level live tests; Vite replaces this with an immutable build choice.
export const STANDALONE_DEMO = typeof __IKONECTT_STANDALONE_DEMO__ !== 'undefined' && __IKONECTT_STANDALONE_DEMO__;

declare const __IKONECTT_CATALOGUE_PROVIDER__:string;
export const CLIENT_CATALOGUE=typeof __IKONECTT_CATALOGUE_PROVIDER__==='undefined'||__IKONECTT_CATALOGUE_PROVIDER__!=='internal';
