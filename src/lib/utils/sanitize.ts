/**
 * Strip Flatsome/WooCommerce builder HTML to clean content.
 * Used for meta descriptions and AI-readable text.
 */
export function sanitizeWCHtml(html: string, maxLength = 160): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[[\w\s="'/]+\]/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

/**
 * For rendering HTML in the product page — sanitize dangerous tags,
 * preserve Flatsome's visual structure.
 */
export function sanitizeProductHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
}
