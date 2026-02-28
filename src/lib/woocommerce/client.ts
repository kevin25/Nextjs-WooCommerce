const WC_STORE = process.env.WC_STORE_URL!
const WC_CREDS = Buffer.from(
  `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
).toString('base64')

export const CART_TOKEN_COOKIE = 'woo-cart-token'

// ─── Store API (public) ────────────────────────────────────────────────────
export async function wcStore<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; total: number; totalPages: number; headers: Headers }> {
  const res = await fetch(`${WC_STORE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> ?? {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string }
    throw Object.assign(
      new Error(err.message ?? `WC Store API ${res.status}`),
      { status: res.status }
    )
  }
  return {
    data: await res.json() as T,
    total: Number(res.headers.get('X-WP-Total') ?? 0),
    totalPages: Number(res.headers.get('X-WP-TotalPages') ?? 1),
    headers: res.headers,
  }
}

// ─── REST API v3 (keyed — server only) ────────────────────────────────────
export async function wcRest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${process.env.WC_REST_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${WC_CREDS}`,
      ...(options.headers as Record<string, string> ?? {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string }
    throw Object.assign(
      new Error(err.message ?? `WC REST API ${res.status}`),
      { status: res.status }
    )
  }
  return res.json() as Promise<T>
}

// ─── Cart API (Cart-Token) ─────────────────────────────────────────────────
export async function wcCart<T>(
  cartToken: string,
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; newToken: string | null }> {
  const res = await fetch(`${WC_STORE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(cartToken ? { 'Cart-Token': cartToken } : {}),
      ...(options.headers as Record<string, string> ?? {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string }
    throw Object.assign(
      new Error(err.message ?? `Cart API ${res.status}`),
      { status: res.status }
    )
  }
  return {
    data: await res.json() as T,
    newToken: res.headers.get('Cart-Token'),
  }
}
