import http from 'node:http';

const buffer = [];

function getCanonicalType(v) {
  if (v === null) {
    return 'null';
  }
  if (Array.isArray(v)) {
    const el = v.length > 0 ? (v[0] === null ? 'null' : typeof v[0]) : 'any';
    // Captures length: e.g., "number[2]" instead of "number[]"
    return `${el}[${v.length}]`;
  }
  if (typeof v === 'object') {
    return 'object';
  }
  return typeof v;
}

function __typeSpy(symbol, value, location) {
  const type = getCanonicalType(value);
  let shape = type;

  // Preserve the High-Fidelity Legacy Format
  // This serializes the object into a pseudo-interface string
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

  // Immediate flush for reliability
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
