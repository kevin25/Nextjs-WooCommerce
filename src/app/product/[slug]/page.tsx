import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProduct, getProducts } from '@/lib/api'
import { stripHtml } from '@/lib/utils'
import ProductGallery from '@/components/product/ProductGallery'
import ProductForm from '@/components/product/ProductForm'
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb'
import ProductFAQ from '@/components/product/ProductFAQ'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME!

interface Props {
  params: Promise<{ slug: string }>
}

// ── Dynamic Metadata ───────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { product } = await getProduct(slug)
  if (!product) return {}

  const title = product.name
  const description = stripHtml(product.short_description || product.description).slice(0, 155)
  const canonical = `/product/${slug}`
  const ogImage = product.images[0]?.src ?? `${SITE_URL}/og-default.jpg`
  const price = product.price
  const currency = 'USD'

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { title, description, images: [ogImage] },
    other: {
      'product:price:amount': price,
      'product:price:currency': currency,
    },
  }
}

// ── Static Path Generation ─────────────────────────────────────────────────
export async function generateStaticParams() {
  try {
    const { products } = await getProducts({ perPage: 100 })
    return products.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

// ── JSON-LD Builder ────────────────────────────────────────────────────────
function buildJsonLd(product: NonNullable<Awaited<ReturnType<typeof getProduct>>['product']>, slug: string) {
  const price = product.price

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/product/${slug}#product`,
    name: product.name,
    description: stripHtml(product.description).slice(0, 5000),
    sku: product.sku || `WC-${product.id}`,
    mpn: product.sku,
    brand: { '@type': 'Brand', name: SITE_NAME },
    image: product.images.map((img) => ({
      '@type': 'ImageObject',
      url: img.src,
      name: img.alt || product.name,
    })),
    category: product.categories.map((c) => c.name).join(' > '),
    offers: {
      '@type': 'Offer',
      '@id': `${SITE_URL}/product/${slug}#offer`,
      url: `${SITE_URL}/product/${slug}`,
      price,
      priceCurrency: 'USD',
      priceValidUntil: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      availability: product.is_in_stock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    },
    ...(Number(product.average_rating) > 0 && product.review_count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.average_rating,
        bestRating: '5',
        worstRating: '1',
        reviewCount: product.review_count,
      },
    }),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.categories[0]?.name ?? 'Products',
        item: `${SITE_URL}/categories/${product.categories[0]?.slug ?? 'all'}`,
      },
      { '@type': 'ListItem', position: 3, name: product.name, item: `${SITE_URL}/product/${slug}` },
    ],
  }

  const faqLd = product.short_description
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is ${product.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: stripHtml(product.short_description).slice(0, 500),
            },
          },
          {
            '@type': 'Question',
            name: `How much does ${product.name} cost?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${product.name} is priced at $${price}.${product.is_in_stock ? ' Currently in stock.' : ' Currently out of stock.'}`,
            },
          },
          ...(product.attributes.length > 0
            ? [
                {
                  '@type': 'Question',
                  name: `What options are available for ${product.name}?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `${product.name} is available in: ${product.attributes.map((a) => `${a.name}: ${a.options.join(', ')}`).join('; ')}.`,
                  },
                },
              ]
            : []),
        ],
      }
    : null

  return { productLd, breadcrumbLd, faqLd }
}

// ── Page Component ─────────────────────────────────────────────────────────
export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const { product, variations } = await getProduct(slug)
  if (!product) notFound()

  const { productLd, breadcrumbLd, faqLd } = buildJsonLd(product, slug)
  const price = `$${product.price}`

  return (
    <>
      {/* JSON-LD — server-rendered, visible to all crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      <article itemScope itemType="https://schema.org/Product">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 py-4">
          <ProductBreadcrumb product={product} />
        </nav>

        <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 pb-12 lg:grid-cols-2 lg:gap-12">
          {/* Gallery — Server Component, zero JS */}
          <ProductGallery images={product.images} />

          <div className="space-y-6">
            {/* Product info — in initial HTML for AI crawlers */}
            <section aria-label="Product details">
              <h1 itemProp="name" className="font-display text-2xl font-semibold lg:text-3xl">
                {product.name}
              </h1>
              <div itemProp="offers" itemScope itemType="https://schema.org/Offer" className="mt-2">
                <span
                  itemProp="price"
                  content={product.price}
                  className="text-2xl font-semibold"
                >
                  {price}
                </span>
                <meta itemProp="priceCurrency" content="USD" />
              </div>
              {product.short_description && (
                <div
                  itemProp="description"
                  className="prose prose-sm mt-4 text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              )}
            </section>

            {/* Client Component — interactivity for variations + cart */}
            <ProductForm product={product} variations={variations} />
          </div>
        </main>

        {/* Full description */}
        {product.description && (
          <section className="mx-auto max-w-7xl border-t px-4 py-8">
            <h2 className="font-display text-xl font-semibold">Description</h2>
            <div
              className="prose mt-4 max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </section>
        )}

        {/* FAQ — for AI citation + People Also Ask */}
        {product.short_description && (
          <aside aria-label="Frequently asked questions" className="mx-auto max-w-7xl border-t px-4 py-8">
            <ProductFAQ product={product} />
          </aside>
        )}
      </article>
    </>
  )
}

export const revalidate = 300
