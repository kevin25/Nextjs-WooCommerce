'use client'
import { useState, useMemo } from 'react'
import type { WCRestProduct, WCRestVariation } from '@/types/woocommerce'
import { formatPrice } from '@/lib/utils'
import { matchVariation, buildVariationPayload } from '@/lib/utils/variations'
import AddToCartButton from './AddToCartButton'

interface Props {
  product: WCRestProduct
  variations: WCRestVariation[]
}

export default function ProductForm({ product, variations }: Props) {
  const variationAttributes = product.attributes.filter((a) => a.variation)

  const [selectedValues, setSelectedValues] = useState<
    Record<string, string>
  >(() => {
    const initial: Record<string, string> = {}
    variationAttributes.forEach((attr) => {
      if (attr.options.length === 1) {
        initial[attr.slug] = attr.options[0]
      }
    })
    return initial
  })

  const [quantity, setQuantity] = useState(1)

  const matchedVariation = useMemo(
    () =>
      variations.length > 0
        ? matchVariation(
            variations.map((v) => ({
              ...v,
              stock_status: v.stock_status,
              image: v.image ? { src: v.image.src, alt: v.image.alt } : null,
            })),
            selectedValues
          )
        : null,
    [variations, selectedValues]
  )

  const allSelected =
    variationAttributes.length === 0 ||
    variationAttributes.every((attr) => selectedValues[attr.slug])

  const currentPrice = matchedVariation
    ? formatPrice(matchedVariation.price, product.prices.currency_symbol, product.prices.currency_minor_unit)
    : formatPrice(product.prices.price, product.prices.currency_symbol, product.prices.currency_minor_unit)

  const inStock = matchedVariation
    ? matchedVariation.stock_status === 'instock'
    : product.is_in_stock

  const variationPayload =
    variationAttributes.length > 0
      ? buildVariationPayload(
          variationAttributes.map((a) => ({
            id: a.id,
            name: a.name,
            slug: a.slug,
            variation: a.variation,
            options: a.options,
          })),
          selectedValues
        )
      : undefined

  return (
    <div className="space-y-6">
      {/* Price */}
      <p className="text-2xl font-semibold">{currentPrice}</p>

      {/* Variation selectors */}
      {variationAttributes.map((attr) => (
        <div key={attr.id} className="space-y-2">
          <label className="text-sm font-medium">{attr.name}</label>
          <div className="flex flex-wrap gap-2">
            {attr.options.map((option) => (
              <button
                key={option}
                onClick={() =>
                  setSelectedValues((prev) => ({
                    ...prev,
                    [attr.slug]: option,
                  }))
                }
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  selectedValues[attr.slug] === option
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Quantity */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Quantity</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-md border text-sm hover:bg-muted"
          >
            -
          </button>
          <span className="w-12 text-center text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-md border text-sm hover:bg-muted"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to cart */}
      <AddToCartButton
        productId={product.id}
        variationId={matchedVariation?.id}
        variation={variationPayload}
        inStock={inStock && allSelected}
        quantity={quantity}
      />

      {!allSelected && variationAttributes.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Please select all options above
        </p>
      )}
    </div>
  )
}
