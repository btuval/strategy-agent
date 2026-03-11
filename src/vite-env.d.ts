/// <reference types="vite/client" />

// Allow untyped postcss internals (used when IDE type-checks node_modules)
declare module "postcss/lib/terminal-highlight" {
  const m: unknown;
  export = m;
}
declare module "postcss/lib/previous-map" {
  const m: unknown;
  export = m;
}
declare module "postcss/lib/css-syntax-error" {
  const m: unknown;
  export = m;
}
