// lib/core/redact.ts
export function redactPII(s: string) {
  let red = s || '';
  red = red.replace(/\b(?:\+?\d[\d\-\s]{7,}\d)\b/g, '[phone]');
  red = red.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email]');
  red = red.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4,}\b/g, '[id]');
  red = red.replace(/\b\d{1,3}\s+[A-Za-z]+\s+(Street|St|Ave|Avenue|Rd|Road|Blvd|Lane|Ln|Dr|Drive)\b/gi, '[address]');
  red = red.replace(/\b[A-Z]{2,3}-?\d{2,4}-?[A-Z]{0,2}\b/g, '[license_plate]');
  return { text: red, redacted: red !== s };
}


