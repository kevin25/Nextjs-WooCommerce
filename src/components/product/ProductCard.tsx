import Image from 'next/image'
import Link from 'next/link'
import type { WCStoreProduct } from '@/types/woocommerce'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface Props {
  product: WCStoreProduct
  priority: boolean
}

export default function ProductCard({ product, priority }: Props) {
  const image = product.images[0]
  const price = formatPrice(
    product.prices.price,
    product.prices.currency_symbol,
    product.prices.currency_minor_unit
  )
  const regularPrice =
    product.on_sale
      ? formatPrice(
          product.prices.regular_price,
          product.prices.currency_symbol,
          product.prices.currency_minor_unit
        )
      : null

  return (
    <article className="group relative">
      <Link
        href={`/product/${product.slug}`}
        className="block overflow-hidden rounded-lg bg-muted aspect-square"
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt || product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">No image</span>
          </div>
        )}
        {product.on_sale && (
          <Badge variant="destructive" className="absolute left-2 top-2">
            Sale
          </Badge>
        )}
      </Link>

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
        {!product.is_in_stock && (
          <p className="mt-1 text-xs text-muted-foreground">Out of stock</p>
        )}
      </div>
    </article>
  )
}
