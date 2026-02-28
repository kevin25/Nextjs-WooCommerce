import { cacheGet, cacheSet } from '@/lib/cache/redis'
import type { WCStoreCategory } from '@/types/woocommerce'

const WC_STORE = process.env.WC_STORE_URL!

export async function getCategories(): Promise<{
  categories: WCStoreCategory[]
}> {
  const cacheKey = 'categories:all'

  const cached = await cacheGet<{ categories: WCStoreCategory[] }>(cacheKey)
  if (cached) return cached

  const res = await fetch(
    `${WC_STORE}/products/categories?per_page=100&hide_empty=true&orderby=count&order=desc`,
    {
      next: { revalidate: 3600, tags: ['categories'] },
    }
  )

  if (!res.ok) throw new Error('Categories fetch failed')

  const categories: WCStoreCategory[] = await res.json()
  const result = {
    categories: categories.filter((c) => c.slug !== 'uncategorized'),
  }

  await cacheSet(cacheKey, result, 3600)
  return result
}
