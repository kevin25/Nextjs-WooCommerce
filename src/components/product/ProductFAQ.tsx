import type { WCRestProduct } from '@/types/woocommerce'
import { stripHtml } from '@/lib/utils'

interface Props {
  product: WCRestProduct
}

export default function ProductFAQ({ product }: Props) {
  const price = `$${product.price}`

  const faqs = [
    {
      question: `What is ${product.name}?`,
      answer: stripHtml(product.short_description || product.description).slice(
        0,
        500
      ),
    },
    {
      question: `How much does ${product.name} cost?`,
      answer: `${product.name} is priced at ${price}.${product.is_in_stock ? ' Currently in stock.' : ' Currently out of stock.'}`,
    },
  ]

  if (product.attributes.length > 0) {
    faqs.push({
      question: `What options are available for ${product.name}?`,
      answer: `${product.name} is available in the following options: ${product.attributes.map((a) => `${a.name}: ${a.options.join(', ')}`).join('; ')}.`,
    })
  }

  // Filter out FAQs with empty answers
  const validFaqs = faqs.filter((f) => f.answer.length > 0)
  if (validFaqs.length === 0) return null

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold">
        Frequently Asked Questions
      </h2>
      <dl className="divide-y divide-border">
        {validFaqs.map((faq) => (
          <div key={faq.question} className="py-4">
            <dt className="text-sm font-medium">{faq.question}</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
