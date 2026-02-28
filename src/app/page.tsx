import { Suspense } from 'react'
import Link from 'next/link'
import ProductGrid from '@/components/product/ProductGrid'
import ProductGridSkeleton from '@/components/product/ProductGridSkeleton'

export default function HomePage() {
  return (
    <main>
      {/* ─── STATIC SHELL ─── Served instantly ─── */}
      <section className="mx-auto max-w-7xl px-4 py-12 text-center">
        <h1 className="font-display text-3xl font-semibold lg:text-4xl">
          Our Collection
        </h1>
        <p className="mt-3 text-muted-foreground">
          Discover quality products curated for you
        </p>
        <div className="mt-6">
          <Link
            href="/categories"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Browse all categories
          </Link>
        </div>
      </section>

      {/* ─── STREAMING ─── Product grid streams in after shell ─── */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <Suspense fallback={<ProductGridSkeleton count={20} />}>
          <ProductGrid />
        </Suspense>
      </section>
    </main>
  )
}
