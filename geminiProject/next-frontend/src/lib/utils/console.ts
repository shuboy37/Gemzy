// Production-safe console utilities
export const safeConsole = {
  log: process.env.NODE_ENV === "development" ? console.log : () => {},
  warn: process.env.NODE_ENV === "development" ? console.warn : () => {},
  error: console.error, // Always keep errors
  info: process.env.NODE_ENV === "development" ? console.info : () => {},
  debug: process.env.NODE_ENV === "development" ? console.debug : () => {},
};

// Alternative: Use this instead of console.log in your code
export const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};
