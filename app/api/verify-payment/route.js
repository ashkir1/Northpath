import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ paid: false, error: 'No session ID' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status === 'paid') {
      return NextResponse.json({
        paid: true,
        agencyName: session.metadata?.agencyName || 'Your Agency',
        email: session.customer_email,
        sessionId: session.id,
      })
    } else {
      return NextResponse.json({ paid: false, error: 'Payment not completed' })
    }
  } catch (err) {
    console.error('Verify payment error:', err)
    return NextResponse.json({ paid: false, error: err.message }, { status: 500 })
  }
}
