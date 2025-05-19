'use client'
import { useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

type DeliveryMethod = 'email' | 'whatsapp'

export default function ReceiptDelivery({ userEmail, userPhone }: { userEmail?: string, userPhone?: string }) {
  const [method, setMethod] = useState<DeliveryMethod>('email')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [customEmail, setCustomEmail] = useState(userEmail || '')
  const [customPhone, setCustomPhone] = useState(userPhone || '')
  const supabase = useSupabaseClient()

  const handleSend = async () => {
    setLoading(true)
    setStatus(null)
    // Example: call API route to trigger delivery (implement /api/receipt-delivery as needed)
    const res = await fetch('/api/receipt-delivery', {
      method: 'POST',
      body: JSON.stringify({
        method,
        email: customEmail,
        phone: customPhone,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.ok) {
      setStatus('Receipt sent successfully!')
    } else {
      setStatus('Failed to send receipt.')
    }
    setLoading(false)
  }

  return (
    <div className="rounded-xl bg-white shadow p-6">
      <h3 className="text-lg font-bold mb-2 text-[#043933]">Receive Donation Receipt</h3>
      <div className="flex gap-3 mb-2">
        <Button
          variant={method === 'email' ? 'default' : 'outline'}
          onClick={() => setMethod('email')}
          aria-pressed={method === 'email'}
        >
          Email
        </Button>
        <Button
          variant={method === 'whatsapp' ? 'default' : 'outline'}
          onClick={() => setMethod('whatsapp')}
          aria-pressed={method === 'whatsapp'}
        >
          WhatsApp
        </Button>
      </div>
      <form
        onSubmit={e => {
          e.preventDefault()
          handleSend()
        }}
        className="flex flex-col gap-3"
      >
        {method === 'email' ? (
          <Input
            type="email"
            placeholder="Your email"
            value={customEmail}
            onChange={e => setCustomEmail(e.target.value)}
            required
          />
        ) : (
          <Input
            type="tel"
            placeholder="WhatsApp number"
            value={customPhone}
            onChange={e => setCustomPhone(e.target.value)}
            pattern="^\\+?[1-9]\\d{1,14}$"
            required
          />
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Sending...' : `Send via ${method === 'email' ? 'Email' : 'WhatsApp'}`}
        </Button>
      </form>
      {status && (
        <div className="mt-2 text-sm text-center text-green-600">{status}</div>
      )}
    </div>
  )
}
