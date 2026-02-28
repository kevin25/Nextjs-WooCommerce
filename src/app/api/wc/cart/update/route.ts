import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { wcCart, CART_TOKEN_COOKIE } from '@/lib/woocommerce/client'

const UpdateItemSchema = z.object({
  key: z.string().min(1),
  quantity: z.number().int().min(0).max(999),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = UpdateItemSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { key, quantity } = parsed.data

  const cookieStore = await cookies()
  const cartToken = cookieStore.get(CART_TOKEN_COOKIE)?.value ?? ''

  if (!cartToken) {
    return NextResponse.json({ error: 'No active cart' }, { status: 400 })
  }

  try {
    const endpoint =
      quantity === 0
        ? `/cart/remove-item?key=${key}`
        : '/cart/update-item'

    const { data, newToken } = await wcCart(
      cartToken,
      endpoint,
      quantity === 0
        ? { method: 'POST' }
        : { method: 'POST', body: JSON.stringify({ key, quantity }) }
    )

    const response = NextResponse.json(data)
    if (newToken) {
      response.cookies.set(CART_TOKEN_COOKIE, newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    }
    return response
  } catch (err: unknown) {
    const error = err as Error & { status?: number }
    return NextResponse.json(
      { error: error.message },
      { status: error.status ?? 500 }
    )
  }
}
