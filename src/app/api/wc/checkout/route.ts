import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { wcCart, CART_TOKEN_COOKIE } from '@/lib/woocommerce/client'

const AddressSchema = z.object({
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  address_1: z.string().min(1).max(200),
  address_2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().max(50).optional(),
  postcode: z.string().max(20),
  country: z.string().length(2),
})

const CheckoutSchema = z.object({
  billing_address: AddressSchema.extend({ email: z.string().email() }),
  shipping_address: AddressSchema.optional(),
  payment_method: z.string().min(1),
  customer_note: z.string().max(500).optional(),
  create_account: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CheckoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const cookieStore = await cookies()
  const cartToken = cookieStore.get(CART_TOKEN_COOKIE)?.value ?? ''

  if (!cartToken) {
    return NextResponse.json(
      { error: 'No active cart session' },
      { status: 400 }
    )
  }

  try {
    const { data } = await wcCart(cartToken, '/checkout', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    })

    const response = NextResponse.json(data, { status: 200 })
    // Clear cart token after successful checkout
    response.cookies.set(CART_TOKEN_COOKIE, '', { maxAge: 0, path: '/' })
    return response
  } catch (err: unknown) {
    const error = err as Error & { status?: number }
    return NextResponse.json(
      { error: error.message },
      { status: error.status ?? 500 }
    )
  }
}
