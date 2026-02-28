import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'
import { sendWaitlistConfirmation } from '@/lib/email'

export async function POST(req) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    // Save to Supabase
    const supabase = getAdminClient()
    const { error } = await supabase.from('waitlist').upsert(
      { email, created_at: new Date().toISOString() },
      { onConflict: 'email' }
    )
    if (error) console.error('Supabase waitlist error:', error)

    // Send confirmation email
    await sendWaitlistConfirmation(email)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
