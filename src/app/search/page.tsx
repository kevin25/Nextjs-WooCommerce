'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Loader2 } from 'lucide-react'
import type { WCStoreProduct } from '@/types/woocommerce'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQuery)
  const [products, setProducts] = useState<WCStoreProduct[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(!!initialQuery)

  const performSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) return
    setLoading(true)
    setSearched(true)

    try {
      const qs = new URLSearchParams({
        search: searchTerm.trim(),
        per_page: '40',
      })
      const res = await fetch(`/api/wc/products?${qs}`)
      if (res.ok) {
        const data: WCStoreProduct[] = await res.json()
        setProducts(data)
        setTotal(Number(res.headers.get('X-WP-Total') ?? data.length))
      } else {
        setProducts([])
        setTotal(0)
      }
    } catch {
      setProducts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialQuery) performSearch(initialQuery)
  }, [initialQuery, performSearch])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query.trim())}`, {
      scroll: false,
    })
    performSearch(query.trim())
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-2xl font-semibold">Search</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Search'
          )}
        </Button>
      </form>

      {loading && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      )}

      {!loading && searched && products.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            No products found for &ldquo;{initialQuery || query}&rdquo;
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/categories">Browse Categories</Link>
          </Button>
        </div>
      )}

      {!loading && products.length > 0 && (
        <>
          <p className="mt-6 text-sm text-muted-foreground">
            {total} result{total !== 1 ? 's' : ''} for &ldquo;
            {initialQuery || query}&rdquo;
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const image = product.images[0]
              const price = formatPrice(
                product.prices.price,
                product.prices.currency_symbol,
                product.prices.currency_minor_unit
              )
              const regularPrice = product.on_sale
                ? formatPrice(
                    product.prices.regular_price,
                    product.prices.currency_symbol,
                    product.prices.currency_minor_unit
                  )
                : null

              return (
                <article key={product.id} className="group relative">
                  <Link
                    href={`/product/${product.slug}`}
                    className="block aspect-square overflow-hidden rounded-lg bg-muted"
                  >
                    {image ? (
                      <Image
                        src={image.src}
                        alt={image.alt || product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <span className="text-sm text-muted-foreground">
                          No image
                        </span>
                      </div>
                    )}
                    {product.on_sale && (
                      <Badge
                        variant="destructive"
                        className="absolute left-2 top-2"
                      >
                        Sale
                      </Badge>
                    )}
                  </Link>
                  <div className="mt-3">
                    <h3 className="text-sm font-medium line-clamp-2">
                      <Link href={`/product/${product.slug}`}>
                        {product.name}
                      </Link>
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-sm font-semibold">{price}</p>
                      {regularPrice && (
                        <p className="text-sm text-muted-foreground line-through">
                          {regularPrice}
                        </p>
                      )}
                    </div>
                    {!product.is_in_stock && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Out of stock
                      </p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
