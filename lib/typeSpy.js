import http from 'node:http';

const buffer = [];
const BATCH_SIZE = 1; // Aggressive: Send every hit immediately to avoid data loss

/**
 * Determines the TS-friendly type string for a value
 */
function getCanonicalType(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) {
    const el = v.length > 0 ? (v[0] === null ? 'null' : typeof v[0]) : 'any';
    return `${el}[]`;
  }
  return typeof v;
}

/**
 * Flushes the buffer to the collector server
 */
function flush() {
  if (buffer.length === 0) return;
  const data = JSON.stringify(buffer);
  buffer.length = 0;

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  });

  req.on('error', () => {
    // Fail silently so we don't crash the simulation if server is busy
  });

  req.write(data);
  req.end();
}

/**
 * Injected spy function called by instrumented code
 */
export function __typeSpy(symbol, value, location) {
  const type = getCanonicalType(value);
  let shape = type;

  // If it's an object, capture a shallow interface signature
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const fields = Object.keys(value)
      .sort()
      .map((k) => `${k}: ${getCanonicalType(value[k])};`)
      .join(' ');
    shape = `{ ${fields} }`;
  }

  buffer.push({
    key: `${location}:${symbol}`,
    symbol,
    location,
    shape,
  });

  if (buffer.length >= BATCH_SIZE) {
    flush();
  }
}

// Ensure final data is sent on process exit
process.on('beforeExit', flush);
process.on('exit', flush);
