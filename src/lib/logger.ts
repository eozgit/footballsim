/**
 * Internal logger to satisfy no-console and provide
 * a single toggle for engine debugging.
 */
export const logger = {
  info: (...args: unknown[]) => {
    if (process.env.DEBUG) console.info('[Sim:Info]', ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn('[Sim:Warn]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[Sim:Error]', ...args);
  },
};
