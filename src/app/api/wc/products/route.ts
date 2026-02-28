import { NextRequest, NextResponse } from 'next/server'

const WC_STORE = process.env.WC_STORE_URL!

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const qs = new URLSearchParams()

  const include = searchParams.get('include')
  const search = searchParams.get('search')
  const category = searchParams.get('category')
  const perPage = searchParams.get('per_page') ?? '20'
  const page = searchParams.get('page') ?? '1'
  const orderby = searchParams.get('orderby')
  const order = searchParams.get('order')

  qs.set('per_page', perPage)
  qs.set('page', page)
  if (include) qs.set('include', include)
  if (search) qs.set('search', search)
  if (category) qs.set('category', category)
  if (orderby) qs.set('orderby', orderby)
  if (order) qs.set('order', order)

  const res = await fetch(`${WC_STORE}/products?${qs}`, {
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    return NextResponse.json([], { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data, {
    headers: {
      'X-WP-Total': res.headers.get('X-WP-Total') ?? '0',
      'X-WP-TotalPages': res.headers.get('X-WP-TotalPages') ?? '1',
    },
  })
}
