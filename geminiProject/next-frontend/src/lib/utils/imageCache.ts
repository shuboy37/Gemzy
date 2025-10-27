declare global {
  var imageCache: Map<string, string> | undefined;
}

// Create or reuse existing cache from globalThis
const globalImageCache = globalThis.imageCache ?? new Map<string, string>();

// Store in globalThis to persist across module reloads
globalThis.imageCache = globalImageCache;

export { globalImageCache as imageCache };
