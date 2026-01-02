import http from 'node:http';

const buffer = [];

function getCanonicalType(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) {
    const el = v.length > 0 ? (v[0] === null ? 'null' : typeof v[0]) : 'any';
    return `${el}[]`;
  }
  // Ensure we don't just return "object" for everything
  if (typeof v === 'object') return 'object';
  return typeof v;
}

export function __typeSpy(symbol, value, location) {
  const type = getCanonicalType(value);
  let shape = type;

  // For objects, we capture keys to help the "Agnostic" script detect usage/conflicts
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const fields = Object.keys(value).sort();
    if (fields.length > 0) {
      shape = `{${fields.join(',')}}`;
    }
  }

  // Send symbol and shape to the collector
  buffer.push({
    key: `${location}:${symbol}`,
    symbol,
    location,
    shape,
  });

  // Simple flush logic
  if (buffer.length >= 1) {
    const data = JSON.stringify(buffer);
    buffer.length = 0;

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    req.on('error', () => {});
    req.write(data);
    req.end();
  }
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
