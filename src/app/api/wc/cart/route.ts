import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { wcCart, CART_TOKEN_COOKIE } from '@/lib/woocommerce/client'

export async function GET() {
  const cookieStore = await cookies()
  const cartToken = cookieStore.get(CART_TOKEN_COOKIE)?.value ?? ''

  if (!cartToken) {
    return NextResponse.json({
      items: [],
      items_count: 0,
      totals: { total_price: '0', currency_code: 'USD', currency_symbol: '$', currency_minor_unit: 2 },
    })
  }

  try {
    const { data, newToken } = await wcCart(cartToken, '/cart', {
      method: 'GET',
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
