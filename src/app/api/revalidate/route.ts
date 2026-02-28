import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { cacheDel } from '@/lib/cache/redis'
import { createHmac } from 'crypto'
import { createLogger } from '@/lib/logger'

const log = createLogger('revalidate-webhook')

function verifyWooCommerceSignature(
  body: string,
  signature: string
): boolean {
  const secret = process.env.WC_WEBHOOK_SECRET!
  const computed = createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64')
  return computed === signature
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-wc-webhook-signature') ?? ''
  const topic = request.headers.get('x-wc-webhook-topic') ?? ''

  if (!verifyWooCommerceSignature(body, signature)) {
    log.warn({ topic }, 'Webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    const payload = JSON.parse(body)
    const slug = payload?.slug as string | undefined

    revalidateTag('products')
    revalidateTag('categories')
    await cacheDel('products:*')
    await cacheDel('categories:*')

    if (slug) {
      revalidateTag(`product:${slug}`)
      await cacheDel(`product:${slug}`)
    }

    log.info({ topic, slug }, 'Invalidation complete')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Parse error' }, { status: 400 })
  }
}
