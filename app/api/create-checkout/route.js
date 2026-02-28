import { NextResponse } from 'next/server'
import { stripe, PRICE_CENTS } from '@/lib/stripe'

export async function POST(req) {
  try {
    const { email, agencyName, answers } = await req.json()

    // Store answers in Stripe metadata (compressed)
    const metadataStr = JSON.stringify(answers)
    const truncated = metadataStr.length > 400 ? metadataStr.slice(0, 400) : metadataStr

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: PRICE_CENTS,
          product_data: {
            name: 'EIDBI Provisional License Application Package',
            description: 'Complete DHS submission package for ' + (agencyName || 'your agency') + ' · NorthPath MN',
          },
        },
        quantity: 1,
      }],
      metadata: {
        agencyName: agencyName || '',
        email,
        answersSnapshot: truncated,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/apply/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/apply`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
