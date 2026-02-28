'use client'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import CartDrawer from './CartDrawer'
import { useState } from 'react'

export default function CartButton() {
  const { cart } = useCart()
  const [open, setOpen] = useState(false)
  const count = cart?.items_count ?? 0

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
        aria-label={`Cart (${count} items)`}
      >
        <ShoppingCart className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Button>

      <CartDrawer open={open} onOpenChange={setOpen} />
    </>
  )
}
