import { getProducts } from '@/lib/api'
import type { ProductQueryParams } from '@/types/woocommerce'
import ProductCard from './ProductCard'

interface Props {
  params?: ProductQueryParams
}

export default async function ProductGrid({ params }: Props) {
  const { products } = await getProducts(params)

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No products found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
        />
      ))}
    </div>
  )
}
