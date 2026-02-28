import { cacheGet, cacheSet } from '@/lib/cache/redis'
import type {
  WCStoreProduct,
  WCRestProduct,
  WCRestVariation,
  ProductQueryParams,
  ProductListResult,
  ProductDetailResult,
} from '@/types/woocommerce'

const WC_STORE = process.env.WC_STORE_URL!
const WC_CREDS = Buffer.from(
  `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
).toString('base64')

export async function getProducts(
  params: ProductQueryParams = {}
): Promise<ProductListResult> {
  const cacheKey = `products:${JSON.stringify(params)}`

  const cached = await cacheGet<ProductListResult>(cacheKey)
  if (cached) return cached

  const qs = new URLSearchParams({
    per_page: String(params.perPage ?? 20),
    page: String(params.page ?? 1),
    ...(params.search && { search: params.search }),
    ...(params.category && { category: String(params.category) }),
    ...(params.orderby && { orderby: params.orderby }),
    ...(params.order && { order: params.order }),
  })

  const res = await fetch(`${WC_STORE}/products?${qs}`, {
    next: { tags: ['products'] },
  })

  if (!res.ok) throw new Error(`WC products fetch failed: ${res.status}`)

  const result: ProductListResult = {
    products: (await res.json()) as WCStoreProduct[],
    total: Number(res.headers.get('X-WP-Total') ?? 0),
    totalPages: Number(res.headers.get('X-WP-TotalPages') ?? 1),
  }

  await cacheSet(cacheKey, result, 60)

  return result
}

export async function getProduct(slug: string): Promise<ProductDetailResult> {
  const cacheKey = `product:${slug}`
  const cached = await cacheGet<ProductDetailResult>(cacheKey)
  if (cached) return cached

  const productRes = await fetch(
    `${process.env.WC_REST_URL}/products?slug=${encodeURIComponent(slug)}`,
    {
      headers: { Authorization: `Basic ${WC_CREDS}` },
      next: { tags: [`product:${slug}`] },
    }
  )

  if (!productRes.ok) return { product: null, variations: [] }
  const products: WCRestProduct[] = await productRes.json()
  if (!products.length) return { product: null, variations: [] }

  const product = products[0]
  let variations: WCRestVariation[] = []

  if (product.variations.length > 0) {
    const varRes = await fetch(
      `${process.env.WC_REST_URL}/products/${product.id}/variations?per_page=100`,
      {
        headers: { Authorization: `Basic ${WC_CREDS}` },
        next: { tags: [`product:${slug}`] },
      }
    )
    if (varRes.ok) variations = await varRes.json()
  }

  const result = { product, variations }
  await cacheSet(cacheKey, result, 300)
  return result
}
