export default function OrganizationSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME!

  const schema = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'OnlineStore'],
    '@id': `${siteUrl}/#organization`,
    name: siteName,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo.png`,
      width: 200,
      height: 60,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'Vietnamese'],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
