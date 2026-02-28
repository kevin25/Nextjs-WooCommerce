'use server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { createSafeActionClient } from 'next-safe-action'
import { wcCart, CART_TOKEN_COOKIE } from '@/lib/woocommerce/client'
import type { WCCart } from '@/types/woocommerce'

const action = createSafeActionClient()

// ── Add to cart ──────────────────────────────────────────────────────────────
const AddItemSchema = z.object({
  productId: z.number().int().positive(),
  variationId: z.number().int().positive().optional(),
  quantity: z.number().int().min(1).max(99).default(1),
  variation: z.record(z.string(), z.string()).optional(),
})

export const addToCart = action
  .schema(AddItemSchema)
  .action(async ({ parsedInput }) => {
    const cookieStore = await cookies()
    const cartToken = cookieStore.get(CART_TOKEN_COOKIE)?.value ?? ''

    const { data, newToken } = await wcCart<WCCart>(cartToken, '/cart/add-item', {
      method: 'POST',
      body: JSON.stringify({
        id: parsedInput.variationId ?? parsedInput.productId,
        quantity: parsedInput.quantity,
        ...(parsedInput.variation ? { variation: parsedInput.variation } : {}),
      }),
    })

    if (newToken) {
      cookieStore.set(CART_TOKEN_COOKIE, newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    }

    return data
  })

// ── Update quantity ───────────────────────────────────────────────────────
const UpdateItemSchema = z.object({
  key: z.string().min(1),
  quantity: z.number().int().min(0).max(99),
})

export const updateCartItem = action
  .schema(UpdateItemSchema)
  .action(async ({ parsedInput }) => {
    const cookieStore = await cookies()
    const cartToken = cookieStore.get(CART_TOKEN_COOKIE)?.value ?? ''

    const endpoint =
      parsedInput.quantity === 0
        ? `/cart/remove-item?key=${parsedInput.key}`
        : '/cart/update-item'

    const { data, newToken } = await wcCart<WCCart>(
      cartToken,
      endpoint,
      parsedInput.quantity === 0
        ? { method: 'POST' }
        : {
            method: 'POST',
            body: JSON.stringify({
              key: parsedInput.key,
              quantity: parsedInput.quantity,
            }),
          }
    )

    if (newToken) {
      cookieStore.set(CART_TOKEN_COOKIE, newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    }

    return data
  })
