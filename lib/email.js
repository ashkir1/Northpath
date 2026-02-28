import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWaitlistConfirmation(email) {
  return resend.emails.send({
    from: 'NorthPath <hello@northpathmn.com>',
    to: email,
    subject: 'You\'re on the NorthPath waitlist — we launch within days',
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a1a;">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:32px;">NorthPath · Minnesota EIDBI</div>
        <h1 style="font-size:28px;font-weight:400;margin:0 0 16px;line-height:1.2;">You're on the list.</h1>
        <p style="font-size:16px;color:#444;line-height:1.7;margin:0 0 24px;">
          We're putting the final touches on the NorthPath application builder. 
          You'll get an email the moment it's live — typically within 3–5 days.
        </p>
        <div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:10px;padding:20px;margin:0 0 24px;">
          <div style="font-size:12px;font-weight:600;color:#b45309;margin-bottom:8px;">⚠️ REMINDER: MAY 31, 2026 DEADLINE</div>
          <div style="font-size:14px;color:#78350f;line-height:1.6;">
            Every EIDBI agency must submit a provisional license application by May 31, 2026 
            or permanently close. Don't wait until the last minute — DHS application review 
            takes time and problems can delay your submission.
          </div>
        </div>
        <p style="font-size:14px;color:#888;line-height:1.7;">
          Questions? Reply to this email — we read every one.
        </p>
        <div style="margin-top:40px;padding-top:24px;border-top:1px solid #eee;font-size:11px;color:#aaa;">
          NorthPath is a compliance preparation tool, not a law firm.<br>
          <a href="#" style="color:#aaa;">Unsubscribe</a>
        </div>
      </div>
    `
  })
}

export async function sendApplicationConfirmation(email, agencyName, downloadUrl) {
  return resend.emails.send({
    from: 'NorthPath <hello@northpathmn.com>',
    to: email,
    subject: `Your EIDBI license application package is ready — ${agencyName}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a1a;">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:32px;">NorthPath · Minnesota EIDBI</div>
        <h1 style="font-size:28px;font-weight:400;margin:0 0 16px;line-height:1.2;">Your package is ready.</h1>
        <p style="font-size:16px;color:#444;line-height:1.7;margin:0 0 24px;">
          Your provisional license application package for <strong>${agencyName}</strong> has been generated. 
          Download it now and review it carefully before submitting to DHS.
        </p>
        <a href="${downloadUrl}" style="display:inline-block;background:#f59e0b;color:#000;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;margin:0 0 32px;">
          Download Your Package →
        </a>
        <div style="background:#f8f8f8;border-radius:10px;padding:20px;margin:0 0 24px;">
          <div style="font-size:13px;font-weight:600;margin-bottom:12px;">Your package includes:</div>
          <ul style="font-size:13px;color:#555;line-height:2;margin:0;padding-left:20px;">
            <li>Pre-filled DHS-8818 provisional license application</li>
            <li>Gap analysis report with action items</li>
            <li>Organized document checklist</li>
            <li>Cover letter for DHS Licensing Division</li>
            <li>Step-by-step submission instructions</li>
          </ul>
        </div>
        <p style="font-size:14px;color:#888;line-height:1.7;">
          This download link expires in 72 hours. Log into your NorthPath account at any time to re-download.
        </p>
      </div>
    `
  })
}
