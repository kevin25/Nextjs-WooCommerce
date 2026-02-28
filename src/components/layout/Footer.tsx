import Link from 'next/link'

export default function Footer() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME!
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="font-display text-lg font-semibold">{siteName}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {process.env.NEXT_PUBLIC_SITE_DESCRIPTION}
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold">Shop</h4>
            <ul className="mt-2 space-y-1">
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  All Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold">Support</h4>
            <ul className="mt-2 space-y-1">
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-4">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {year} {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
