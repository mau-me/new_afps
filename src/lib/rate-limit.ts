/**
 * Limitador de tentativas simples, em memória (janela fixa).
 *
 * Atenção: o estado é por instância do servidor. Em deploy com várias
 * instâncias/serverless, troque por um armazenamento compartilhado
 * (ex.: Redis/Upstash) mantendo a mesma interface.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();

  // Limpeza oportunista para não crescer indefinidamente.
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count++;
  return { ok: true, retryAfterMs: 0 };
}

/** Extrai o IP do cliente a partir dos headers comuns de proxy. */
export function getClientIp(headers: Headers | Record<string, unknown>): string {
  const get = (name: string): string | undefined => {
    if (headers instanceof Headers) return headers.get(name) ?? undefined;
    const value = headers[name];
    return Array.isArray(value) ? String(value[0]) : (value as string | undefined);
  };

  return (
    get('x-forwarded-for')?.split(',')[0]?.trim() ||
    get('x-real-ip') ||
    'unknown'
  );
}
