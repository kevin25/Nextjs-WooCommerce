export function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME!

  const content = `# ${siteName}
> ${process.env.NEXT_PUBLIC_SITE_DESCRIPTION}

${siteName} is a curated online store offering quality products.
We provide detailed product information, sizing guides, and expert recommendations.

## Key Pages

- [Homepage](${siteUrl}/): Featured products and current promotions
- [All Products](${siteUrl}/categories): Complete product catalog organized by category
- [About Us](${siteUrl}/about): Our story, mission, and expertise
- [FAQ](${siteUrl}/faq): Common questions about products, shipping, and returns

## Optional Extended Content

- [Sitemap](${siteUrl}/sitemap.xml): Full XML sitemap for all products and categories
`

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
