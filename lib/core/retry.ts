// lib/core/retry.ts
export async function withRetry<T>(fn: () => Promise<T>, opts?: {
  retries?: number;
  min?: number;
  max?: number;
  jitter?: boolean;
}) {
  const retries = opts?.retries ?? 3;
  const min = opts?.min ?? 250;
  const max = opts?.max ?? 4000;
  const jitter = opts?.jitter ?? true;
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt > retries) throw err;
      const backoff = Math.min(max, min * Math.pow(2, attempt - 1));
      const wait = jitter ? backoff * (0.5 + Math.random() / 2) : backoff;
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}


