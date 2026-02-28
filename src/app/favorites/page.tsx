'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useWishlist } from '@/hooks/useWishlist'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, HeartOff } from 'lucide-react'
import type { WCStoreProduct } from '@/types/woocommerce'

export default function FavoritesPage() {
  const { ids, remove } = useWishlist()
  const [products, setProducts] = useState<WCStoreProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }

    setLoading(true)
    const qs = new URLSearchParams({ include: ids.join(','), per_page: '100' })
    fetch(`/api/wc/products?${qs}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: WCStoreProduct[]) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [ids])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="h-8 w-40" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (ids.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24">
        <HeartOff className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-semibold">
          No favorites yet
        </h1>
        <p className="mt-2 text-muted-foreground">
          Save products you love by tapping the heart icon
        </p>
        <Button asChild className="mt-6">
          <Link href="/categories">Browse Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-2xl font-semibold">
        Favorites ({ids.length})
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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

              <button
                onClick={() => remove(product.id)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-destructive backdrop-blur-sm hover:bg-background"
              >
                <Heart className="h-4 w-4 fill-current" />
              </button>

              <div className="mt-3">
                <h3 className="text-sm font-medium line-clamp-2">
                  <Link href={`/product/${product.slug}`}>{product.name}</Link>
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-sm font-semibold">{price}</p>
                  {regularPrice && (
                    <p className="text-sm text-muted-foreground line-through">
                      {regularPrice}
                    </p>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
