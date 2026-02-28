import Redis from 'ioredis'
import { createLogger } from '@/lib/logger'

const log = createLogger('redis')

let redis: Redis | null = null

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
      enableReadyCheck: false,
      retryStrategy: (times) => {
        if (times > 3) return null
        return Math.min(times * 100, 3000)
      },
    })
    redis.on('error', (err) => {
      log.error({ err: err.message }, 'Connection error')
    })
  }
  return redis
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await getRedis().get(key)
    return val ? (JSON.parse(val) as T) : null
  } catch {
    return null
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  try {
    await getRedis().set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch {
    // Non-fatal
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  try {
    const keys = await getRedis().keys(pattern)
    if (keys.length > 0) await getRedis().del(...keys)
  } catch {
    // Non-fatal
  }
}

export async function cacheHealth(): Promise<{
  ok: boolean
  latencyMs?: number
}> {
  try {
    const start = Date.now()
    await getRedis().ping()
    return { ok: true, latencyMs: Date.now() - start }
  } catch {
    return { ok: false }
  }
}
