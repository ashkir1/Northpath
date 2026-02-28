import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getAdminClient } from '@/lib/supabase'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'No session ID' }, { status: 400 })
  }

  try {
    // Verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 403 })
    }

    // Get application from Supabase
    const supabase = getAdminClient()
    const { data: application } = await supabase
      .from('applications')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single()

    const answers = application?.answers || {}
    const gaps = application?.gaps || []
    const score = application?.readiness_score || 0
    const agencyName = answers.legal_name || session.metadata?.agencyName || 'Your Agency'
    const email = session.customer_email || ''

    // Generate PDF as HTML string, then convert to buffer
    const pdfContent = generatePDFContent(agencyName, email, answers, gaps, score)

    // Return as downloadable HTML file (works without native dependencies)
    const buffer = Buffer.from(pdfContent, 'utf8')

    return new Response(buffer, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="NorthPath-DHS-Package-${agencyName.replace(/\s+/g, '-')}.html"`,
        'Content-Length': buffer.length.toString(),
      }
    })

  } catch (err) {
    console.error('Download package error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function generatePDFContent(agencyName, email, answers, gaps, score) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  
  const criticalGaps = gaps.filter(g => g.severity === 'critical')
  const highGaps = gaps.filter(g => g.severity === 'high')
  const mediumGaps = gaps.filter(g => g.severity === 'medium')

  const scoreColor = score >= 85 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'

  const gapRows = gaps.map(g => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 16px; font-size: 13px; color: #111827;">${g.questionLabel || g.questionId}</td>
      <td style="padding: 12px 16px; font-size: 12px; color: #6b7280; font-family: monospace;">${g.dhs_ref || ''}</td>
      <td style="padding: 12px 16px;">
        <span style="display:inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; font-family: monospace; text-transform: uppercase;
          background: ${g.severity === 'critical' ? '#fef2f2' : g.severity === 'high' ? '#fffbeb' : '#f0fdf4'};
          color: ${g.severity === 'critical' ? '#dc2626' : g.severity === 'high' ? '#d97706' : '#16a34a'};">
          ${g.severity}
        </span>
      </td>
      <td style="padding: 12px 16px; font-size: 13px; color: #374151; line-height: 1.5;">${g.message || ''}</td>
    </tr>
  `).join('')

  const answerRows = Object.entries(answers).map(([key, value]) => `
    <tr style="border-bottom: 1px solid #f3f4f6;">
      <td style="padding: 10px 16px; font-size: 12px; color: #6b7280; font-family: monospace; width: 200px;">${key}</td>
      <td style="padding: 10px 16px; font-size: 13px; color: #111827;">${Array.isArray(value) ? value.join(', ') : (value || '—')}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>NorthPath — DHS EIDBI Submission Package — ${agencyName}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, serif; color: #111827; background: white; }
  @media print {
    .no-print { display: none; }
    .page-break { page-break-before: always; }
  }
</style>
</head>
<body>

<!-- Print bar -->
<div class="no-print" style="background: #1e293b; color: white; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100;">
  <div style="font-family: monospace; font-size: 13px;">◆ NorthPath — DHS Submission Package</div>
  <button onclick="window.print()" style="background: #f59e0b; border: none; padding: 8px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px;">🖨 Print / Save as PDF</button>
</div>

<!-- Cover Page -->
<div style="min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 80px 80px; border-bottom: 4px solid #f59e0b;">
  <div style="font-family: monospace; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 40px;">
    Minnesota Department of Human Services · EIDBI Provider Licensing
  </div>
  
  <h1 style="font-size: 48px; font-weight: 400; letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 16px;">
    DHS-8818 Provisional<br>License Package
  </h1>
  
  <div style="font-size: 20px; color: #6b7280; margin-bottom: 60px; font-style: italic;">
    Prepared for ${agencyName}
  </div>

  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 600px; margin-bottom: 60px;">
    <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <div style="font-family: monospace; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Readiness Score</div>
      <div style="font-size: 36px; font-weight: 400; color: ${scoreColor};">${score}</div>
      <div style="font-size: 11px; color: #9ca3af;">out of 100</div>
    </div>
    <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <div style="font-family: monospace; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Issues Found</div>
      <div style="font-size: 36px; font-weight: 400; color: ${gaps.length > 0 ? '#ef4444' : '#10b981'};">${gaps.length}</div>
      <div style="font-size: 11px; color: #9ca3af;">${criticalGaps.length} critical</div>
    </div>
    <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <div style="font-family: monospace; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Deadline</div>
      <div style="font-size: 28px; font-weight: 400; color: #f59e0b;">May 31</div>
      <div style="font-size: 11px; color: #9ca3af;">2026</div>
    </div>
  </div>

  <div style="font-family: monospace; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 24px;">
    Generated ${date} · ${email} · NorthPath MN (northpath.vercel.app)<br>
    This document is not legal advice. Verify all information with a qualified attorney before submitting to DHS.
  </div>
</div>

<!-- Section 1: Gap Analysis Report -->
<div class="page-break" style="padding: 60px 80px; border-bottom: 1px solid #e5e7eb;">
  <div style="font-family: monospace; font-size: 11px; color: #f59e0b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">Section 1 of 3</div>
  <h2 style="font-size: 32px; font-weight: 400; letter-spacing: -0.75px; margin-bottom: 8px;">Gap Analysis Report</h2>
  <p style="font-size: 14px; color: #6b7280; margin-bottom: 40px;">
    Every issue that could prevent your provisional license approval, in order of severity. 
    Fix all Critical and High items before submitting.
  </p>

  ${gaps.length === 0 ? `
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 32px; text-align: center;">
      <div style="font-size: 32px; margin-bottom: 12px;">✓</div>
      <div style="font-size: 18px; color: #16a34a; font-weight: 600;">No gaps detected</div>
      <div style="font-size: 14px; color: #6b7280; margin-top: 8px;">Your application appears complete. Review all answers before submitting.</div>
    </div>
  ` : `
    <!-- Summary -->
    <div style="display: flex; gap: 12px; margin-bottom: 32px; flex-wrap: wrap;">
      ${criticalGaps.length > 0 ? `<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 12px 20px; font-size: 13px; color: #dc2626; font-weight: 600;">⛔ ${criticalGaps.length} Critical</div>` : ''}
      ${highGaps.length > 0 ? `<div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 20px; font-size: 13px; color: #d97706; font-weight: 600;">⚠️ ${highGaps.length} High</div>` : ''}
      ${mediumGaps.length > 0 ? `<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 20px; font-size: 13px; color: #16a34a; font-weight: 600;">📝 ${mediumGaps.length} Medium</div>` : ''}
    </div>

    <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <thead>
        <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
          <th style="padding: 12px 16px; text-align: left; font-family: monospace; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Item</th>
          <th style="padding: 12px 16px; text-align: left; font-family: monospace; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">DHS Ref</th>
          <th style="padding: 12px 16px; text-align: left; font-family: monospace; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Severity</th>
          <th style="padding: 12px 16px; text-align: left; font-family: monospace; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">What to do</th>
        </tr>
      </thead>
      <tbody>${gapRows}</tbody>
    </table>
  `}
</div>

<!-- Section 2: Your Answers -->
<div class="page-break" style="padding: 60px 80px; border-bottom: 1px solid #e5e7eb;">
  <div style="font-family: monospace; font-size: 11px; color: #f59e0b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">Section 2 of 3</div>
  <h2 style="font-size: 32px; font-weight: 400; letter-spacing: -0.75px; margin-bottom: 8px;">Your Application Answers</h2>
  <p style="font-size: 14px; color: #6b7280; margin-bottom: 40px;">
    All responses recorded during your NorthPath session. Use these to fill in your DHS-8818 form.
  </p>

  <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
    <thead>
      <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
        <th style="padding: 12px 16px; text-align: left; font-family: monospace; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; width: 220px;">Field</th>
        <th style="padding: 12px 16px; text-align: left; font-family: monospace; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Your Answer</th>
      </tr>
    </thead>
    <tbody>${answerRows}</tbody>
  </table>
</div>

<!-- Section 3: Submission Instructions -->
<div class="page-break" style="padding: 60px 80px;">
  <div style="font-family: monospace; font-size: 11px; color: #f59e0b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">Section 3 of 3</div>
  <h2 style="font-size: 32px; font-weight: 400; letter-spacing: -0.75px; margin-bottom: 8px;">Submission Instructions</h2>
  <p style="font-size: 14px; color: #6b7280; margin-bottom: 40px;">
    Follow these steps exactly to submit your provisional license application to DHS.
  </p>

  ${[
    ['1', 'Fix all Critical gaps first', 'Review Section 1 of this document. Every item marked Critical must be resolved before you submit. High items should also be resolved if possible.'],
    ['2', 'Download the official DHS-8818 form', 'Go to mn.gov/dhs and search for "DHS-8818 EIDBI provisional license application". Download the current version of the form.'],
    ['3', 'Fill in the DHS-8818 using your answers', 'Use Section 2 of this document to fill in every field of the official form. Your answers are recorded in the order the DHS form expects them.'],
    ['4', 'Gather your required documents', 'You need: NPI letter, W-9, QSP credentials (degree + license), staff background study results from NETStudy 2.0, supervision policy, ITP template, and billing policy.'],
    ['5', 'Submit to DHS Licensing', 'Email your completed DHS-8818 and all documents to: DHS.EIDBI.Licensing@state.mn.us with subject line: "EIDBI Provisional License Application — [Your Agency Name]"'],
    ['6', 'Follow up after 5 business days', 'If you do not receive a confirmation email within 5 business days, call the DHS EIDBI licensing line at (651) 431-3850.'],
  ].map(([num, title, desc]) => `
    <div style="display: flex; gap: 20px; margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid #f3f4f6;">
      <div style="font-family: Georgia, serif; font-size: 48px; font-weight: 300; color: #f3f4f6; line-height: 1; flex-shrink: 0; width: 60px;">${num}</div>
      <div>
        <div style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 8px; letter-spacing: -0.3px;">${title}</div>
        <div style="font-size: 14px; color: #6b7280; line-height: 1.7;">${desc}</div>
      </div>
    </div>
  `).join('')}

  <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 16px; padding: 24px; margin-top: 40px;">
    <div style="font-size: 14px; font-weight: 600; color: #92400e; margin-bottom: 8px;">⚠️ Important: Deadline is May 31, 2026</div>
    <div style="font-size: 13px; color: #92400e; line-height: 1.65;">
      DHS must receive your complete application by May 31, 2026. Incomplete applications will not be accepted. 
      Do not wait until the last day — submission volume will be high and DHS processing may be slow.
      Submit at least 2 weeks before the deadline.
    </div>
  </div>

  <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f3f4f6; font-family: monospace; font-size: 11px; color: #d1d5db; line-height: 1.8;">
    NorthPath MN · northpath.vercel.app · hello@northpathmn.com<br>
    Generated ${date} for ${agencyName}<br>
    This document does not constitute legal advice. Information is current as of January 2026. 
    Requirements may change — verify all information at mn.gov/dhs before submitting.
  </div>
</div>

</body>
</html>`
}
