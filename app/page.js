'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({d:0,h:0,m:0,s:0})
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(()=>{
    const tick=()=>{
      const diff=new Date('2026-05-31T23:59:59')-new Date()
      if(diff<=0){setTimeLeft({d:0,h:0,m:0,s:0});return}
      setTimeLeft({
        d:Math.floor(diff/86400000),
        h:Math.floor((diff%86400000)/3600000),
        m:Math.floor((diff%3600000)/60000),
        s:Math.floor((diff%60000)/1000)
      })
    }
    tick()
    const t=setInterval(tick,1000)
    return()=>clearInterval(t)
  },[])

  const handleWaitlist=async(e)=>{
    e.preventDefault()
    setSubmitting(true)
    try{
      await fetch('/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})})
      setSubmitted(true)
    }catch(err){
      alert('Something went wrong. Email us directly at hello@northpathmn.com')
    }finally{setSubmitting(false)}
  }

  const pad=n=>String(n).padStart(2,'0')

  return (
    <div style={{minHeight:'100vh',background:'#0a0f1a',fontFamily:'Geist,system-ui,sans-serif',color:'white'}}>

      {/* Nav */}
      <nav style={{borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 24px',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,background:'rgba(10,15,26,0.92)',backdropFilter:'blur(12px)',zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <div style={{width:'28px',height:'28px',background:'linear-gradient(135deg,#f59e0b,#d97706)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>◆</div>
          <div>
            <div style={{fontFamily:'Georgia,serif',fontSize:'15px',fontWeight:400}}>NorthPath</div>
            <div style={{fontFamily:'monospace',fontSize:'9px',color:'#64748b',letterSpacing:'1px',textTransform:'uppercase'}}>Minnesota · EIDBI</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{fontFamily:'monospace',fontSize:'11px',color:'#f59e0b',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'99px',padding:'4px 12px',display:'flex',alignItems:'center',gap:'6px'}}>
            <span style={{width:'5px',height:'5px',background:'#f59e0b',borderRadius:'50%',animation:'pulse 1.5s infinite'}}/>
            May 31, 2026
          </div>
          <a href="/apply" style={{background:'#f59e0b',color:'#000',textDecoration:'none',borderRadius:'8px',padding:'7px 16px',fontSize:'13px',fontWeight:600}}>
            Start Application →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{minHeight:'calc(100vh - 56px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 24px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        {/* BG glow */}
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 70% 50% at 50% 0%,rgba(245,158,11,0.07) 0%,transparent 60%)',pointerEvents:'none'}}/>
        {/* Grid */}
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)',backgroundSize:'60px 60px',maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 70%)',pointerEvents:'none'}}/>

        <div style={{position:'relative',maxWidth:'780px'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',fontFamily:'monospace',fontSize:'11px',color:'#f59e0b',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'99px',padding:'5px 14px',marginBottom:'28px',letterSpacing:'1px',textTransform:'uppercase'}}>
            Minnesota EIDBI · Provisional License Deadline
          </div>

          <h1 style={{fontFamily:'"Instrument Serif",Georgia,serif',fontSize:'clamp(2.2rem,6vw,3.8rem)',fontWeight:400,lineHeight:'1.1',letterSpacing:'-1.5px',marginBottom:'20px'}}>
            Get licensed by May 31.<br/>
            <em style={{color:'#f59e0b',fontStyle:'italic'}}>Without a lawyer.</em>
          </h1>

          <p style={{fontSize:'17px',color:'#94a3b8',maxWidth:'520px',margin:'0 auto 40px',lineHeight:'1.75',fontWeight:300}}>
            Every EIDBI agency in Minnesota must apply for a provisional license or permanently close. 
            NorthPath walks you through the entire application and generates your complete DHS submission package.
          </p>

          {/* Countdown */}
          <div style={{marginBottom:'40px'}}>
            <div style={{fontFamily:'monospace',fontSize:'11px',color:'#64748b',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'14px'}}>Time until the May 31 deadline</div>
            <div style={{display:'inline-flex',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'16px',overflow:'hidden',padding:'2px'}}>
              {[['Days',timeLeft.d],['Hours',timeLeft.h],['Min',timeLeft.m],['Sec',timeLeft.s]].map(([label,val],i)=>(
                <div key={label} style={{display:'flex'}}>
                  {i>0&&<div style={{display:'flex',alignItems:'center',padding:'0 4px',color:'rgba(255,255,255,0.15)',fontSize:'20px'}}>·</div>}
                  <div style={{padding:'16px 20px',textAlign:'center'}}>
                    <div style={{fontFamily:'Georgia,serif',fontSize:'clamp(1.8rem,4vw,2.8rem)',fontWeight:400,letterSpacing:'-1px',lineHeight:1,color:timeLeft.d<30?'#f59e0b':'white'}}>{pad(val)}</div>
                    <div style={{fontFamily:'monospace',fontSize:'9px',color:'#64748b',textTransform:'uppercase',letterSpacing:'1.5px',marginTop:'4px'}}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap',marginBottom:'48px'}}>
            <a href="/apply" style={{background:'#f59e0b',color:'#000',textDecoration:'none',borderRadius:'12px',padding:'14px 32px',fontWeight:700,fontSize:'15px',transition:'all 0.15s'}}>
              Start My Application — $697 →
            </a>
            <a href="#how" style={{background:'rgba(255,255,255,0.06)',color:'white',textDecoration:'none',borderRadius:'12px',padding:'14px 24px',fontSize:'15px',border:'1px solid rgba(255,255,255,0.1)'}}>
              See how it works
            </a>
          </div>

          {/* Trust bar */}
          <div style={{display:'flex',gap:'24px',justifyContent:'center',flexWrap:'wrap',paddingTop:'28px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
            {[['📋','Built on DHS-8818'],['⚖️','Replaces a $15,000 lawyer'],['⚡','Ready in 90 minutes'],['🔒','Your data is yours']].map(([icon,text])=>(
              <div key={text} style={{display:'flex',alignItems:'center',gap:'8px',fontFamily:'monospace',fontSize:'11px',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.5px'}}>
                <span style={{fontSize:'14px'}}>{icon}</span>{text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div id="how" style={{padding:'80px 24px',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{maxWidth:'1000px',margin:'0 auto'}}>
          <div style={{fontFamily:'monospace',fontSize:'11px',color:'#f59e0b',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'16px',display:'flex',alignItems:'center',gap:'8px'}}>
            <span style={{width:'16px',height:'1px',background:'rgba(245,158,11,0.5)',display:'inline-block'}}/>
            How it works
          </div>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:'clamp(1.6rem,3.5vw,2.6rem)',fontWeight:400,letterSpacing:'-0.75px',marginBottom:'48px',color:'white'}}>
            From confused to submission-ready in one afternoon.
          </h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'1px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',overflow:'hidden'}}>
            {[
              ['01','Answer 40 questions','Plain-language questions anyone can answer. No clinical or legal background required. ~60 minutes.'],
              ['02','See your gap report','We flag every issue in real time — with plain-English explanations and exactly what to do to fix each one.'],
              ['03','Download your package','Pre-filled DHS-8818, cover letter, organized documents, and submission instructions. Instant download.'],
              ['04','Submit to DHS','Follow our step-by-step instructions to submit. Then subscribe to stay compliant year-round.'],
            ].map(([n,title,desc])=>(
              <div key={n} style={{background:'#0a0f1a',padding:'28px 24px'}}>
                <div style={{fontFamily:'Georgia,serif',fontSize:'48px',fontWeight:300,color:'rgba(255,255,255,0.05)',lineHeight:1,marginBottom:'16px'}}>{n}</div>
                <div style={{fontSize:'15px',fontWeight:500,color:'white',marginBottom:'8px',letterSpacing:'-0.3px'}}>{title}</div>
                <div style={{fontSize:'13px',color:'#64748b',lineHeight:'1.65',fontWeight:300}}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Waitlist / CTA */}
      <div style={{padding:'80px 24px',borderTop:'1px solid rgba(255,255,255,0.08)',background:'radial-gradient(ellipse 60% 60% at 50% 50%,rgba(245,158,11,0.05) 0%,transparent 70%)',textAlign:'center'}}>
        <div style={{maxWidth:'480px',margin:'0 auto'}}>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:400,letterSpacing:'-1.5px',marginBottom:'16px',lineHeight:'1.15'}}>
            Don't let a deadline<br/>end your agency.
          </h2>
          <p style={{fontSize:'15px',color:'#94a3b8',lineHeight:'1.75',marginBottom:'32px',fontWeight:300}}>
            Get notified the moment the full application builder is live. We launch within days.
          </p>
          {submitted?(
            <div style={{background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.3)',borderRadius:'14px',padding:'16px 24px',color:'#34d399',fontSize:'14px'}}>
              ✓ You're on the list. Check your email for confirmation.
            </div>
          ):(
            <form onSubmit={handleWaitlist} style={{display:'flex',gap:'8px',flexWrap:'wrap',justifyContent:'center'}}>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email address" required
                style={{flex:'1',minWidth:'240px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.14)',borderRadius:'12px',padding:'13px 16px',color:'white',fontSize:'14px',outline:'none',fontFamily:'inherit'}}
              />
              <button type="submit" disabled={submitting} style={{background:'#f59e0b',border:'none',borderRadius:'12px',padding:'13px 24px',color:'#000',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>
                {submitting?'Sending…':'Get Early Access →'}
              </button>
            </form>
          )}
          <p style={{fontSize:'11px',color:'#374151',marginTop:'12px',fontFamily:'monospace'}}>
            No spam. Unsubscribe anytime. Full launch within days.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'24px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
        <div style={{fontFamily:'monospace',fontSize:'10px',color:'rgba(255,255,255,0.2)',textTransform:'uppercase',letterSpacing:'0.5px',lineHeight:'1.8'}}>
          NorthPath MN · Built for Minnesota EIDBI Providers<br/>
          Not a law firm. Not legal advice. Information current as of January 2026.
        </div>
        <div style={{display:'flex',gap:'20px'}}>
          {['Privacy','Terms','Contact'].map(l=>(
            <a key={l} href={l==='Contact'?'mailto:hello@northpathmn.com':'#'} style={{fontFamily:'monospace',fontSize:'10px',color:'#374151',textDecoration:'none',textTransform:'uppercase',letterSpacing:'0.5px'}}>
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
