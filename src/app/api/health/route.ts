import { NextResponse } from 'next/server'
import { cacheHealth } from '@/lib/cache/redis'

export const dynamic = 'force-dynamic'

export async function GET() {
  const redis = await cacheHealth()

  let woocommerce: { ok: boolean; latencyMs?: number } = { ok: false }
  try {
    const start = Date.now()
    const res = await fetch(
      `${process.env.WC_STORE_URL}/products?per_page=1`,
      { cache: 'no-store', signal: AbortSignal.timeout(3_000) }
    )
    woocommerce = { ok: res.ok, latencyMs: Date.now() - start }
  } catch {
    woocommerce = { ok: false }
  }

  const allOk = redis.ok

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used:
          Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total:
          Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
      },
      services: {
        redis,
        woocommerce,
      },
    },
    { status: allOk ? 200 : 207 }
  )
}
