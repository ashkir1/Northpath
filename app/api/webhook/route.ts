import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = supabaseAdmin()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession
    const agencyId = session.metadata?.agency_id

    if (!agencyId) {
      console.error('No agency_id in session metadata')
      return NextResponse.json({ received: true })
    }

    // Mark agency as paid
    await db
      .from('agencies')
      .update({
        paid: true,
        stripe_customer_id: session.customer as string,
        stripe_payment_intent: session.payment_intent as string,
        paid_at: new Date().toISOString()
      })
      .eq('id', agencyId)

    console.log(`Agency ${agencyId} marked as paid`)

    // TODO: Send confirmation email via Resend
    // await sendPaymentConfirmationEmail(session.customer_email, agencyId)
  }

  return NextResponse.json({ received: true })
}

// Required: tell Next.js not to parse the body (Stripe needs raw body)
export const runtime = 'nodejs'
