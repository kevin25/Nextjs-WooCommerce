export interface WCAttribute {
  id: number
  name: string
  slug: string
  variation: boolean
  options: string[]
}

export interface WCVariation {
  id: number
  attributes: Array<{ id: number; name: string; option: string }>
  price: string
  stock_status: string
  image: { src: string; alt: string } | null
}

/**
 * Build the cart variation payload from selected attribute values.
 * WC Store API requires `attribute_pa_color` format for global attributes,
 * `attribute_color` for local attributes (no ID means local).
 */
export function buildVariationPayload(
  productAttributes: WCAttribute[],
  selectedValues: Record<string, string>
): Record<string, string> {
  return productAttributes
    .filter((attr) => attr.variation)
    .reduce(
      (acc, attr) => {
        const value = selectedValues[attr.slug] ?? selectedValues[attr.name]
        if (!value) return acc
        const key =
          attr.id > 0
            ? `attribute_${attr.slug}`
            : `attribute_${attr.name.toLowerCase().replace(/[\s_]+/g, '-')}`
        return { ...acc, [key]: value }
      },
      {} as Record<string, string>
    )
}

/**
 * Find the matching variation from selected values.
 * Handles 'any' option (empty string).
 */
export function matchVariation(
  variations: WCVariation[],
  selectedValues: Record<string, string>
): WCVariation | null {
  return (
    variations.find((variant) =>
      variant.attributes.every((attr) => {
        const userSelected =
          selectedValues[attr.name] ??
          selectedValues[attr.name.toLowerCase()]
        return !userSelected || attr.option === '' || attr.option === userSelected
      })
    ) ?? null
  )
}
