'use client'
import Image from 'next/image'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CartDrawer({ open, onOpenChange }: Props) {
  const { cart, isLoading, updateItem, removeItem } = useCart()

  const isEmpty = !cart || cart.items.length === 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Cart ({cart?.items_count ?? 0})</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 space-y-4 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button asChild onClick={() => onOpenChange(false)}>
              <Link href="/categories">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {cart.items.map((item) => {
                  const image = item.images[0]
                  const price = formatPrice(
                    item.prices.price,
                    item.prices.currency_symbol,
                    item.prices.currency_minor_unit
                  )
                  return (
                    <div key={item.key} className="flex gap-3">
                      {/* Thumbnail */}
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted">
                        {image && (
                          <Image
                            src={image.src}
                            alt={image.alt || item.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-1 flex-col">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.name}
                        </p>
                        {item.variation.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {item.variation
                              .map((v) => `${v.attribute}: ${v.value}`)
                              .join(', ')}
                          </p>
                        )}
                        <p className="text-sm font-semibold">{price}</p>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              updateItem(
                                item.key,
                                Math.max(item.quantity_limits.minimum, item.quantity - 1)
                              )
                            }
                            className="flex h-6 w-6 items-center justify-center rounded border text-xs hover:bg-muted"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateItem(
                                item.key,
                                Math.min(item.quantity_limits.maximum, item.quantity + 1)
                              )
                            }
                            className="flex h-6 w-6 items-center justify-center rounded border text-xs hover:bg-muted"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.key)}
                          className="text-xs text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Footer */}
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-lg font-semibold">
                  {formatPrice(
                    cart.totals.total_price,
                    cart.totals.currency_symbol,
                    cart.totals.currency_minor_unit
                  )}
                </span>
              </div>

              <Button asChild className="w-full" size="lg" onClick={() => onOpenChange(false)}>
                <Link href="/checkout">Checkout</Link>
              </Button>

              <Button
                variant="outline"
                asChild
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                <Link href="/cart">View Cart</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
