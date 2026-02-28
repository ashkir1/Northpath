import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const { error } = await db
      .from('waitlist')
      .insert({ email: email.toLowerCase().trim(), source: source || 'landing_page' })

    if (error) {
      // Duplicate email — not an error, just already on the list
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'already_on_list' })
      }
      throw error
    }

    // Send welcome email via Resend (add when you have the key)
    // await sendWaitlistEmail(email)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
