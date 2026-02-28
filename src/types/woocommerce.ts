// ─── WC Store API Types (public, no auth) ─────────────────────────────────

export interface WCStoreProduct {
  id: number
  name: string
  slug: string
  description: string
  short_description: string
  sku: string
  prices: {
    price: string
    regular_price: string
    sale_price: string
    currency_code: string
    currency_symbol: string
    currency_minor_unit: number
    currency_prefix: string
    currency_suffix: string
  }
  images: Array<{
    id: number
    src: string
    thumbnail: string
    srcset: string
    sizes: string
    name: string
    alt: string
  }>
  categories: Array<{
    id: number
    name: string
    slug: string
  }>
  attributes: Array<{
    id: number
    name: string
    taxonomy: string
    has_variations: boolean
    terms: Array<{
      id: number
      name: string
      slug: string
    }>
  }>
  variations: Array<{
    id: number
    attributes: Array<{
      name: string
      value: string
    }>
  }>
  is_in_stock: boolean
  average_rating: string
  review_count: number
  permalink: string
  add_to_cart: {
    text: string
    description: string
    url: string
    minimum: number
    maximum: number
    multiple_of: number
  }
  has_options: boolean
  is_purchasable: boolean
  on_sale: boolean
  type: string
}

// ─── WC REST API v3 Types (server-side, keyed auth) ───────────────────────

export interface WCRestProduct {
  id: number
  name: string
  slug: string
  permalink: string
  date_modified: string
  type: 'simple' | 'variable' | 'grouped' | 'external'
  description: string
  short_description: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  on_sale: boolean
  purchasable: boolean
  stock_status: 'instock' | 'outofstock' | 'onbackorder'
  stock_quantity: number | null
  is_in_stock: boolean
  images: Array<{
    id: number
    src: string
    name: string
    alt: string
  }>
  categories: Array<{
    id: number
    name: string
    slug: string
  }>
  attributes: Array<{
    id: number
    name: string
    slug: string
    position: number
    visible: boolean
    variation: boolean
    options: string[]
  }>
  variations: number[]
  average_rating: string
  review_count: number
}

export interface WCRestVariation {
  id: number
  sku: string
  price: string
  regular_price: string
  sale_price: string
  stock_status: 'instock' | 'outofstock' | 'onbackorder'
  attributes: Array<{
    id: number
    name: string
    slug: string
    option: string
  }>
  image: {
    id: number
    src: string
    name: string
    alt: string
  }
}

// ─── WC Store API Category ───────────────────────────────────────────────

export interface WCStoreCategory {
  id: number
  name: string
  slug: string
  description: string
  parent: number
  count: number
  image: {
    id: number
    src: string
    thumbnail: string
    srcset: string
    sizes: string
    name: string
    alt: string
  } | null
  review_count: number
  permalink: string
}

// ─── Cart Types ──────────────────────────────────────────────────────────

export interface WCCartItem {
  key: string
  id: number
  name: string
  quantity: number
  quantity_limits: {
    minimum: number
    maximum: number
    multiple_of: number
    editable: boolean
  }
  prices: {
    price: string
    regular_price: string
    sale_price: string
    currency_code: string
    currency_symbol: string
    currency_minor_unit: number
  }
  totals: {
    line_subtotal: string
    line_total: string
    currency_code: string
    currency_symbol: string
    currency_minor_unit: number
  }
  images: Array<{
    id: number
    src: string
    thumbnail: string
    name: string
    alt: string
  }>
  variation: Array<{
    attribute: string
    value: string
  }>
  short_description: string
}

export interface WCCart {
  items: WCCartItem[]
  items_count: number
  items_weight: number
  totals: {
    total_items: string
    total_items_tax: string
    total_price: string
    total_tax: string
    currency_code: string
    currency_symbol: string
    currency_minor_unit: number
  }
  coupons: Array<{
    code: string
    discount_type: string
    totals: {
      total_discount: string
      currency_code: string
    }
  }>
  shipping_address: Record<string, string>
  billing_address: Record<string, string>
  needs_payment: boolean
  needs_shipping: boolean
}

// ─── Query Params ────────────────────────────────────────────────────────

export interface ProductQueryParams {
  page?: number
  perPage?: number
  category?: string | number
  search?: string
  orderby?: 'date' | 'price' | 'popularity' | 'rating' | 'title'
  order?: 'asc' | 'desc'
}

// ─── API Results ─────────────────────────────────────────────────────────

export interface ProductListResult {
  products: WCStoreProduct[]
  total: number
  totalPages: number
}

export interface ProductDetailResult {
  product: WCRestProduct | null
  variations: WCRestVariation[]
}
