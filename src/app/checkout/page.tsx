'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, isLoading } = useCart()
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'US',
    payment_method: 'cod',
    customer_note: '',
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/wc/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billing_address: {
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            phone: form.phone,
            address_1: form.address_1,
            address_2: form.address_2,
            city: form.city,
            state: form.state,
            postcode: form.postcode,
            country: form.country,
          },
          payment_method: form.payment_method,
          customer_note: form.customer_note,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Checkout failed')
      }

      toast.success('Order placed successfully!')
      router.push('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Your cart is empty</p>
      </div>
    )
  }

  const inputClass =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-2xl font-semibold">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Billing */}
        <section className="space-y-4">
          <h2 className="font-medium">Billing Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              required
              placeholder="First name"
              value={form.first_name}
              onChange={(e) => updateField('first_name', e.target.value)}
              className={inputClass}
            />
            <input
              required
              placeholder="Last name"
              value={form.last_name}
              onChange={(e) => updateField('last_name', e.target.value)}
              className={inputClass}
            />
          </div>
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className={inputClass}
          />
          <input
            required
            placeholder="Address"
            value={form.address_1}
            onChange={(e) => updateField('address_1', e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="Apartment, suite, etc. (optional)"
            value={form.address_2}
            onChange={(e) => updateField('address_2', e.target.value)}
            className={inputClass}
          />
          <div className="grid grid-cols-3 gap-4">
            <input
              required
              placeholder="City"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="State"
              value={form.state}
              onChange={(e) => updateField('state', e.target.value)}
              className={inputClass}
            />
            <input
              required
              placeholder="Postcode"
              value={form.postcode}
              onChange={(e) => updateField('postcode', e.target.value)}
              className={inputClass}
            />
          </div>
        </section>

        <Separator />

        {/* Payment */}
        <section className="space-y-4">
          <h2 className="font-medium">Payment Method</h2>
          <select
            value={form.payment_method}
            onChange={(e) => updateField('payment_method', e.target.value)}
            className={inputClass}
          >
            <option value="cod">Cash on Delivery</option>
            <option value="bacs">Bank Transfer</option>
          </select>
        </section>

        {/* Notes */}
        <section className="space-y-4">
          <h2 className="font-medium">Order Notes (optional)</h2>
          <textarea
            placeholder="Notes about your order..."
            value={form.customer_note}
            onChange={(e) => updateField('customer_note', e.target.value)}
            rows={3}
            className={inputClass}
          />
        </section>

        <Separator />

        {/* Summary */}
        <section className="space-y-3">
          <h2 className="font-medium">Order Summary</h2>
          {cart.items.map((item) => (
            <div key={item.key} className="flex justify-between text-sm">
              <span>
                {item.name} &times; {item.quantity}
              </span>
              <span>
                {formatPrice(
                  item.totals.line_total,
                  item.totals.currency_symbol,
                  item.totals.currency_minor_unit
                )}
              </span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>
              {formatPrice(
                cart.totals.total_price,
                cart.totals.currency_symbol,
                cart.totals.currency_minor_unit
              )}
            </span>
          </div>
        </section>

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing
              Order...
            </>
          ) : (
            'Place Order'
          )}
        </Button>
      </form>
    </div>
  )
}
