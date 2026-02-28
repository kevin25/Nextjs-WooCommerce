import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getCategories } from '@/lib/api'

export const metadata: Metadata = {
  title: 'All Categories',
  description: 'Browse our complete product catalog organized by category.',
  alternates: { canonical: '/categories' },
}

export const revalidate = 3600

export default async function CategoriesPage() {
  const { categories } = await getCategories()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-2xl font-semibold lg:text-3xl">
        All Categories
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative overflow-hidden rounded-lg bg-muted"
          >
            <div className="aspect-square">
              {category.image ? (
                <Image
                  src={category.image.src}
                  alt={category.image.alt || category.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-3xl text-muted-foreground">
                    {category.name[0]}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h2 className="text-sm font-semibold text-white">
                {category.name}
              </h2>
              <p className="text-xs text-white/80">
                {category.count} {category.count === 1 ? 'product' : 'products'}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          No categories found.
        </p>
      )}
    </div>
  )
}
