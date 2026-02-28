import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function POST(req: NextRequest) {
  try {
    const { agencyId, email, plan } = await req.json()

    // Determine price based on plan
    // plan: 'license_only' ($697) or 'license_plus' ($697 + $199/mo subscription)
    const basePrice = 697_00 // $697 in cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'NorthPath — EIDBI Provisional License Builder',
              description: 'Complete DHS provisional license application package. One-time payment.',
            },
            unit_amount: basePrice,
          },
          quantity: 1,
        }
      ],
      metadata: {
        agency_id: agencyId,
        plan: plan || 'license_only',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/apply/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/apply`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Payment setup failed' }, { status: 500 })
  }
}
