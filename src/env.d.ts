// Ambient declarations for virtual modules referenced inside third-party `.astro`
// files in `node_modules` (Starlight & Expressive Code) when type-checking with
// TypeScript 7.1 content mappers (`@astrojs/ts-content-mapper`).
declare module 'virtual:starlight/*';
declare module 'virtual:astro-expressive-code/*';
