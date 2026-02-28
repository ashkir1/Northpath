import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { sendApplicationConfirmation } from '@/lib/email'
import { getAdminClient } from '@/lib/supabase'

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { email, agencyName } = session.metadata

    // Save to Supabase
    try {
      const supabase = getAdminClient()
      await supabase.from('applications').insert({
        email,
        agency_name: agencyName,
        stripe_session_id: session.id,
        amount_paid: session.amount_total,
        status: 'paid',
        created_at: new Date().toISOString(),
      })
    } catch (dbErr) {
      console.error('DB save error:', dbErr)
      // Don't fail the webhook — payment was successful
    }

    // Send confirmation email with download link
    const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/apply/success?session_id=${session.id}`
    try {
      await sendApplicationConfirmation(email, agencyName, downloadUrl)
    } catch (emailErr) {
      console.error('Email error:', emailErr)
    }
  }

  return NextResponse.json({ received: true })
}
