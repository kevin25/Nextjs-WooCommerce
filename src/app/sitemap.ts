import type { MetadataRoute } from 'next'
import { getProducts, getCategories } from '@/lib/api'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!

  let products: Awaited<ReturnType<typeof getProducts>>['products'] = []
  let categories: Awaited<ReturnType<typeof getCategories>>['categories'] = []

  try {
    const [prodResult, catResult] = await Promise.all([
      getProducts({ perPage: 100 }),
      getCategories(),
    ])
    products = prodResult.products
    categories = catResult.categories
  } catch {
    // WC API unreachable at build time — return static entries only
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/categories`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...categories.map((c) => ({
      url: `${baseUrl}/categories/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: p.review_count > 0 ? 0.9 : 0.8,
    })),
  ]
}
