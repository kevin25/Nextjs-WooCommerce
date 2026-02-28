import Link from 'next/link'
import { Suspense } from 'react'
import CartButton from '@/components/cart/CartButton'

export default function Header() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME!

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="font-display text-xl font-semibold">
          {siteName}
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/categories"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Shop
          </Link>
          <Link
            href="/search"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Search
          </Link>
          <Link
            href="/favorites"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Favorites
          </Link>
        </nav>

        {/* Cart */}
        <Suspense
          fallback={
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          }
        >
          <CartButton />
        </Suspense>
      </div>
    </header>
  )
}
