import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { wcCart, CART_TOKEN_COOKIE } from '@/lib/woocommerce/client'

const AddItemSchema = z.object({
  productId: z.number().int().positive(),
  variationId: z.number().int().positive().optional(),
  quantity: z.number().int().min(1).max(999).default(1),
  variation: z.record(z.string().max(100), z.string().max(200)).optional(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = AddItemSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { productId, variationId, quantity, variation } = parsed.data

  const cookieStore = await cookies()
  const cartToken = cookieStore.get(CART_TOKEN_COOKIE)?.value ?? ''

  try {
    const { data, newToken } = await wcCart(cartToken, '/cart/add-item', {
      method: 'POST',
      body: JSON.stringify({
        id: variationId ?? productId,
        quantity,
        ...(variation ? { variation } : {}),
      }),
    })

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
