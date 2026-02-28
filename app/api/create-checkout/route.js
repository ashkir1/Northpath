import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAdminClient } from '@/lib/supabase'
import { analyzeGaps } from '@/lib/questions'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  try {
    const { email, agencyName, answers } = await req.json()

    // Analyze gaps
    const gaps = analyzeGaps ? analyzeGaps(answers) : []
    const criticalCount = gaps.filter(g => g.severity === 'critical').length
    const highCount = gaps.filter(g => g.severity === 'high').length
    const readinessScore = criticalCount > 0 ? Math.max(10, 60 - criticalCount * 10)
                         : highCount > 0 ? Math.max(60, 80 - highCount * 5)
                         : gaps.length === 0 ? 98 : 88

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [{
        price: 'price_1T5fOEGY8VMImVQgZ7n1JUvu',
        quantity: 1,
      }],
      metadata: {
        agencyName: (agencyName || '').slice(0, 100),
        email: email.slice(0, 100),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/apply/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/apply`,
    })

    // Save answers to Supabase (non-blocking)
    try {
      const supabase = getAdminClient()
      await supabase.from('applications').upsert({
        email,
        agency_name: agencyName,
        stripe_session_id: session.id,
        amount_paid: 69700,
        status: 'pending',
        answers,
        gaps,
        readiness_score: readinessScore,
      }, { onConflict: 'stripe_session_id' })
    } catch (dbErr) {
      console.error('DB save error (non-fatal):', dbErr)
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
