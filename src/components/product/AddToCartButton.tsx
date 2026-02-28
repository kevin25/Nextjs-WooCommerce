'use client'
import { useOptimistic, startTransition, useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { addToCart } from '@/actions/cart'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  productId: number
  variationId?: number
  variation?: Record<string, string>
  inStock: boolean
  quantity: number
}

export default function AddToCartButton({
  productId,
  variationId,
  variation,
  inStock,
  quantity,
}: Props) {
  const [justAdded, setJustAdded] = useState(false)

  const { execute, status } = useAction(addToCart, {
    onSuccess: () => {
      toast.success('Added to cart')
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? 'Failed to add to cart')
    },
  })

  function handleAdd() {
    execute({ productId, variationId, variation, quantity })
  }

  if (!inStock) {
    return (
      <Button disabled variant="outline" className="w-full">
        Out of Stock
      </Button>
    )
  }

  const isExecuting = status === 'executing'

  return (
    <Button
      onClick={handleAdd}
      disabled={isExecuting}
      className="w-full"
      size="lg"
    >
      {isExecuting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
        </>
      ) : justAdded ? (
        <>
          <Check className="mr-2 h-4 w-4" /> Added!
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </>
      )}
    </Button>
  )
}
