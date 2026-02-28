import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategories } from '@/lib/api'
import ProductGrid from '@/components/product/ProductGrid'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { categories } = await getCategories()
  const category = categories.find((c) => c.slug === slug)
  if (!category) return {}

  return {
    title: category.name,
    description:
      category.description ||
      `Browse ${category.name} products. ${category.count} items available.`,
    alternates: { canonical: `/categories/${slug}` },
  }
}

export async function generateStaticParams() {
  try {
    const { categories } = await getCategories()
    return categories.map((c) => ({ slug: c.slug }))
  } catch {
    return []
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const { categories } = await getCategories()
  const category = categories.find((c) => c.slug === slug)
  if (!category) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/categories">Categories</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6">
        <h1 className="font-display text-2xl font-semibold lg:text-3xl">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {category.count} {category.count === 1 ? 'product' : 'products'}
        </p>
      </div>

      <div className="mt-8">
        <ProductGrid params={{ category: category.id }} />
      </div>
    </div>
  )
}

export const revalidate = 3600
