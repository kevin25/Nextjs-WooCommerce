'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

export default function CartPage() {
  const { cart, isLoading, updateItem, removeItem } = useCart()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-32" />
        <div className="mt-8 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-24 w-24 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const isEmpty = !cart || cart.items.length === 0

  if (isEmpty) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24">
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-semibold">
          Your cart is empty
        </h1>
        <p className="mt-2 text-muted-foreground">
          Add some products to get started
        </p>
        <Button asChild className="mt-6">
          <Link href="/categories">Start Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-2xl font-semibold">
        Cart ({cart.items_count})
      </h1>

      <div className="mt-8 space-y-6">
        {cart.items.map((item) => {
          const image = item.images[0]
          const price = formatPrice(
            item.prices.price,
            item.prices.currency_symbol,
            item.prices.currency_minor_unit
          )
          const lineTotal = formatPrice(
            item.totals.line_total,
            item.totals.currency_symbol,
            item.totals.currency_minor_unit
          )

          return (
            <div key={item.key} className="flex gap-4">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                {image && (
                  <Image
                    src={image.src}
                    alt={image.alt || item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-medium">{item.name}</h2>
                    {item.variation.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {item.variation
                          .map((v) => `${v.attribute}: ${v.value}`)
                          .join(', ')}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {price} each
                    </p>
                  </div>
                  <p className="font-semibold">{lineTotal}</p>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateItem(
                          item.key,
                          Math.max(item.quantity_limits.minimum, item.quantity - 1)
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateItem(
                          item.key,
                          Math.min(item.quantity_limits.maximum, item.quantity + 1)
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.key)}
                    className="text-sm text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Separator className="my-8" />

      <div className="space-y-3">
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span>
            {formatPrice(
              cart.totals.total_price,
              cart.totals.currency_symbol,
              cart.totals.currency_minor_unit
            )}
          </span>
        </div>
        <Button asChild className="w-full" size="lg">
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
      </div>
    </div>
  )
}
