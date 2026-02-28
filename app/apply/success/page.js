'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function SuccessContent() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')
  const [status, setStatus] = useState('loading')
  const [agencyName, setAgencyName] = useState('')

  useEffect(() => {
    if (sessionId) {
      // Verify payment and get details
      fetch(`/api/verify-payment?session_id=${sessionId}`)
        .then(r => r.json())
        .then(data => {
          if (data.paid) {
            setAgencyName(data.agencyName || 'Your Agency')
            setStatus('success')
          } else {
            setStatus('error')
          }
        })
        .catch(() => setStatus('error'))
    }
  }, [sessionId])

  if (status === 'loading') return (
    <div style={{textAlign:'center',padding:'80px 20px',color:'#94a3b8'}}>
      <div style={{fontSize:'32px',marginBottom:'16px',animation:'spin 1s linear infinite',display:'inline-block'}}>◆</div>
      <div>Verifying your payment…</div>
    </div>
  )

  if (status === 'error') return (
    <div style={{textAlign:'center',padding:'80px 20px'}}>
      <div style={{fontSize:'32px',marginBottom:'16px'}}>❌</div>
      <div style={{color:'#f87171',marginBottom:'8px'}}>Payment verification failed</div>
      <div style={{color:'#64748b',fontSize:'14px'}}>Email hello@northpathmn.com with your receipt and we'll send your package manually.</div>
    </div>
  )

  return (
    <div style={{maxWidth:'560px',margin:'0 auto',padding:'60px 20px',textAlign:'center'}}>
      {/* Success icon */}
      <div style={{width:'72px',height:'72px',background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.3)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',fontSize:'28px'}}>
        ✓
      </div>

      <h1 style={{fontFamily:'"Instrument Serif",Georgia,serif',fontSize:'32px',fontWeight:400,color:'white',marginBottom:'12px',lineHeight:'1.2'}}>
        Your package is ready.
      </h1>
      <p style={{fontSize:'15px',color:'#94a3b8',marginBottom:'40px',lineHeight:'1.7'}}>
        Payment confirmed for <strong style={{color:'white'}}>{agencyName}</strong>. 
        Your DHS submission package has been generated and a download link sent to your email.
      </p>

      {/* Download button */}
      <a href={`/api/download-package?session_id=${sessionId}`}
        style={{
          display:'inline-block',background:'#f59e0b',color:'#000',textDecoration:'none',
          padding:'16px 40px',borderRadius:'14px',fontWeight:700,fontSize:'16px',marginBottom:'32px'
        }}
      >
        Download Your Package →
      </a>

      {/* What's inside */}
      <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',padding:'24px',textAlign:'left',marginBottom:'32px'}}>
        <div style={{fontFamily:'monospace',fontSize:'11px',color:'#64748b',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'16px'}}>Your package includes</div>
        {[
          ['📄','Pre-filled DHS-8818','Your provisional license application with all your information filled in'],
          ['⚠️','Gap analysis report','Every issue flagged, with plain-English instructions to fix each one'],
          ['📁','Document package','All your uploads organized exactly as DHS expects to receive them'],
          ['📬','Submission instructions','Exactly where to send it, what to include, and what to expect'],
        ].map(([icon,title,desc])=>(
          <div key={title} style={{display:'flex',gap:'12px',marginBottom:'16px'}}>
            <span style={{fontSize:'18px',flexShrink:0}}>{icon}</span>
            <div>
              <div style={{fontSize:'13px',fontWeight:600,color:'white',marginBottom:'2px'}}>{title}</div>
              <div style={{fontSize:'12px',color:'#64748b',lineHeight:'1.5'}}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Upsell */}
      <div style={{background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'20px',padding:'24px',textAlign:'left'}}>
        <div style={{fontFamily:'monospace',fontSize:'11px',color:'#f59e0b',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'12px'}}>Stay protected after licensing</div>
        <p style={{fontSize:'13px',color:'#94a3b8',lineHeight:'1.65',marginBottom:'16px'}}>
          Getting licensed is just the beginning. DHS is conducting unannounced visits to every EIDBI agency. 
          NorthPath's $199/month compliance subscription keeps you ready year-round — authorization alerts, 
          staff credential tracking, ITP renewal deadlines, and DHS policy updates.
        </p>
        <a href="/subscribe" style={{
          display:'inline-block',background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.35)',
          color:'#f59e0b',textDecoration:'none',padding:'10px 20px',borderRadius:'10px',fontSize:'13px',fontWeight:600
        }}>
          Learn about the subscription →
        </a>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <div style={{minHeight:'100vh',background:'#0a0f1a',fontFamily:'Geist,system-ui,sans-serif'}}>
      <div style={{borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'12px 20px',display:'flex',alignItems:'center',gap:'8px'}}>
        <a href="/" style={{display:'flex',alignItems:'center',gap:'8px',textDecoration:'none',color:'white',fontSize:'14px',fontWeight:500}}>
          <span style={{color:'#f59e0b'}}>◆</span> NorthPath
        </a>
      </div>
      <Suspense fallback={<div style={{textAlign:'center',padding:'80px',color:'#94a3b8'}}>Loading…</div>}>
        <SuccessContent/>
      </Suspense>
    </div>
  )
}
