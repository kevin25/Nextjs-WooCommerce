'use client'
import useSWR from 'swr'
import type { WCCart } from '@/types/woocommerce'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useCart() {
  const { data, error, isLoading, mutate } = useSWR<WCCart>(
    '/api/wc/cart',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  const addItem = async (
    productId: number,
    quantity: number = 1,
    variationId?: number,
    variation?: Record<string, string>
  ) => {
    const res = await fetch('/api/wc/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity, variationId, variation }),
    })
    if (!res.ok) throw new Error('Failed to add item')
    const cart: WCCart = await res.json()
    mutate(cart, false)
    return cart
  }

  const updateItem = async (key: string, quantity: number) => {
    const res = await fetch('/api/wc/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, quantity }),
    })
    if (!res.ok) throw new Error('Failed to update item')
    const cart: WCCart = await res.json()
    mutate(cart, false)
    return cart
  }

  const removeItem = async (key: string) => {
    return updateItem(key, 0)
  }

  return {
    cart: data,
    isLoading,
    error,
    addItem,
    updateItem,
    removeItem,
    mutate,
  }
}
