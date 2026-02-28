'use client'
import { useState } from 'react'
import { SECTIONS, analyzeGaps, getReadinessScore } from '@/lib/questions'

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span style={{fontFamily:'monospace',fontSize:'11px',color:'#64748b',textTransform:'uppercase',letterSpacing:'1.5px'}}>Progress</span>
        <span style={{fontFamily:'monospace',fontSize:'11px',color:'#f59e0b'}}>{pct}% complete</span>
      </div>
      <div style={{height:'3px',background:'rgba(255,255,255,0.08)',borderRadius:'99px',overflow:'hidden'}}>
        <div style={{height:'100%',background:'#f59e0b',borderRadius:'99px',width:`${pct}%`,transition:'width 0.5s ease'}} />
      </div>
    </div>
  )
}

function QuestionField({ q, value, onChange }) {
  const inputStyle = {
    width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)',
    borderRadius:'12px', padding:'12px 16px', color:'white', fontSize:'14px', outline:'none',
    fontFamily:'inherit', transition:'border-color 0.15s',
  }

  if (q.type === 'text') return (
    <input value={value||''} onChange={e=>onChange(q.id,e.target.value)}
      placeholder={q.placeholder||''} style={inputStyle}
      onFocus={e=>e.target.style.borderColor='#f59e0b'}
      onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.12)'}
    />
  )

  if (q.type === 'date') return (
    <input type="date" value={value||''} onChange={e=>onChange(q.id,e.target.value)}
      style={{...inputStyle,width:'auto',colorScheme:'dark'}}
      onFocus={e=>e.target.style.borderColor='#f59e0b'}
      onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.12)'}
    />
  )

  if (q.type === 'radio') return (
    <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
      {q.options.map(opt=>(
        <label key={opt} onClick={()=>onChange(q.id,opt)} style={{
          display:'flex',alignItems:'flex-start',gap:'12px',padding:'12px 16px',
          borderRadius:'12px',border:`1px solid ${value===opt?'#f59e0b':'rgba(255,255,255,0.1)'}`,
          background:value===opt?'rgba(245,158,11,0.08)':'rgba(255,255,255,0.03)',
          cursor:'pointer',transition:'all 0.15s'
        }}>
          <div style={{
            width:'16px',height:'16px',borderRadius:'50%',flexShrink:0,marginTop:'2px',
            border:`2px solid ${value===opt?'#f59e0b':'rgba(255,255,255,0.3)'}`,
            display:'flex',alignItems:'center',justifyContent:'center',
          }}>
            {value===opt&&<div style={{width:'8px',height:'8px',background:'#f59e0b',borderRadius:'50%'}}/>}
          </div>
          <span style={{fontSize:'14px',color:'#e2e8f0',lineHeight:'1.5'}}>{opt}</span>
        </label>
      ))}
    </div>
  )

  if (q.type === 'select') return (
    <select value={value||''} onChange={e=>onChange(q.id,e.target.value)} style={{...inputStyle,colorScheme:'dark',cursor:'pointer'}}>
      <option value="" disabled>Select an option…</option>
      {q.options.map(opt=><option key={opt} value={opt}>{opt}</option>)}
    </select>
  )

  if (q.type === 'upload') return (
    <label style={{
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      border:`2px dashed ${value?'rgba(16,185,129,0.5)':'rgba(255,255,255,0.15)'}`,
      borderRadius:'12px',padding:'32px',cursor:'pointer',transition:'all 0.15s',
      background:value?'rgba(16,185,129,0.05)':'rgba(255,255,255,0.02)'
    }}>
      <input type="file" accept={q.accept} style={{display:'none'}}
        onChange={e=>{const f=e.target.files[0];if(f)onChange(q.id,{name:f.name,size:f.size})}}
      />
      {value ? (
        <div style={{textAlign:'center'}}>
          <div style={{color:'#10b981',fontSize:'20px',marginBottom:'4px'}}>✓</div>
          <div style={{fontSize:'13px',color:'#10b981'}}>{value.name}</div>
          <div style={{fontSize:'11px',color:'#64748b',marginTop:'4px'}}>Click to replace</div>
        </div>
      ) : (
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'24px',marginBottom:'8px'}}>📎</div>
          <div style={{fontSize:'13px',color:'#94a3b8'}}>Click to upload</div>
          <div style={{fontSize:'11px',color:'#475569',marginTop:'4px'}}>{q.accept?.replace(/\./g,'').replace(/,/g,', ').toUpperCase()}</div>
        </div>
      )}
    </label>
  )

  return null
}

function SectionStep({ section, answers, onChange }) {
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'6px'}}>
        <span style={{fontSize:'24px'}}>{section.icon}</span>
        <h2 style={{fontFamily:'"Instrument Serif",Georgia,serif',fontSize:'22px',fontWeight:400,color:'white'}}>{section.title}</h2>
      </div>
      <p style={{fontSize:'13px',color:'#94a3b8',marginBottom:'32px',lineHeight:'1.7'}}>{section.subtitle}</p>

      <div style={{display:'flex',flexDirection:'column',gap:'32px'}}>
        {section.questions.map((q,i)=>{
          const gap = q.gap&&answers[q.id]&&q.gap[answers[q.id]]
          return (
            <div key={q.id}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'16px',marginBottom:'6px'}}>
                <label style={{fontSize:'14px',fontWeight:500,color:'#e2e8f0',lineHeight:'1.5',flex:1}}>
                  {i+1}. {q.label}
                  {q.required&&<span style={{color:'#f59e0b',marginLeft:'4px'}}>*</span>}
                </label>
                <span style={{fontFamily:'monospace',fontSize:'10px',color:'#374151',flexShrink:0,marginTop:'3px'}}>{q.dhs_ref}</span>
              </div>

              {q.hint&&(
                <div style={{
                  fontSize:'12px',marginBottom:'10px',padding:'8px 12px',borderRadius:'8px',lineHeight:'1.6',
                  color:q.hint.startsWith('⚠️')?'#fcd34d':'#64748b',
                  background:q.hint.startsWith('⚠️')?'rgba(245,158,11,0.06)':'rgba(255,255,255,0.03)',
                  border:`1px solid ${q.hint.startsWith('⚠️')?'rgba(245,158,11,0.2)':'rgba(255,255,255,0.07)'}`,
                }}>
                  {q.hint}
                </div>
              )}

              <QuestionField q={q} value={answers[q.id]} onChange={onChange}/>

              {gap&&(
                <div style={{
                  marginTop:'10px',padding:'12px',borderRadius:'10px',fontSize:'12px',lineHeight:'1.65',
                  background:gap.severity==='critical'?'rgba(239,68,68,0.08)':gap.severity==='high'?'rgba(245,158,11,0.08)':'rgba(234,179,8,0.08)',
                  border:`1px solid ${gap.severity==='critical'?'rgba(239,68,68,0.25)':gap.severity==='high'?'rgba(245,158,11,0.25)':'rgba(234,179,8,0.25)'}`,
                  color:gap.severity==='critical'?'#fca5a5':gap.severity==='high'?'#fcd34d':'#fde047',
                }}>
                  <div style={{fontWeight:600,marginBottom:'4px'}}>
                    {gap.severity==='critical'?'🚨 Critical Issue':gap.severity==='high'?'⚠️ Action Required':'📋 Note'}
                  </div>
                  {gap.message}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ReviewStep({ answers }) {
  const gaps = analyzeGaps(answers)
  const { score, color, label } = getReadinessScore(answers)
  const colorHex = {red:'#f87171',amber:'#f59e0b',yellow:'#facc15',green:'#34d399'}[color]

  return (
    <div>
      <h2 style={{fontFamily:'"Instrument Serif",Georgia,serif',fontSize:'22px',fontWeight:400,color:'white',marginBottom:'6px'}}>Your Readiness Review</h2>
      <p style={{fontSize:'13px',color:'#94a3b8',marginBottom:'32px'}}>Here's exactly what we found based on your answers.</p>

      <div style={{textAlign:'center',padding:'32px',border:`1px solid ${colorHex}30`,borderRadius:'20px',background:`${colorHex}08`,marginBottom:'32px'}}>
        <div style={{fontFamily:'"Instrument Serif",Georgia,serif',fontSize:'72px',fontWeight:300,color:colorHex,lineHeight:1,marginBottom:'8px'}}>{score}</div>
        <div style={{fontFamily:'monospace',fontSize:'10px',color:'#64748b',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'4px'}}>Readiness Score out of 100</div>
        <div style={{fontSize:'14px',fontWeight:600,color:colorHex}}>{label}</div>
      </div>

      {gaps.length>0?(
        <div>
          <div style={{fontFamily:'monospace',fontSize:'11px',color:'#64748b',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'16px'}}>
            {gaps.filter(g=>g.severity==='critical').length} critical · {gaps.filter(g=>g.severity==='high').length} high · {gaps.filter(g=>g.severity==='medium').length} medium
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {gaps.map((gap,i)=>{
              const c=gap.severity==='critical'?'#f87171':gap.severity==='high'?'#f59e0b':'#facc15'
              return (
                <div key={i} style={{padding:'16px',borderRadius:'14px',border:`1px solid ${c}22`,background:`${c}07`}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                    <span style={{fontFamily:'monospace',fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:c}}>{gap.severity}</span>
                    <span style={{fontSize:'10px',color:'#374151'}}>· {gap.dhs_ref}</span>
                  </div>
                  <div style={{fontSize:'12px',color:'#94a3b8',marginBottom:'4px'}}>{gap.section}</div>
                  <div style={{fontSize:'12px',color:c==='#f87171'?'#fca5a5':c==='#f59e0b'?'#fcd34d':'#fde047',lineHeight:'1.65'}}>{gap.message}</div>
                </div>
              )
            })}
          </div>
        </div>
      ):(
        <div style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'20px',padding:'32px',textAlign:'center'}}>
          <div style={{color:'#34d399',fontSize:'24px',marginBottom:'8px'}}>✓</div>
          <div style={{color:'#34d399',fontWeight:600,marginBottom:'4px'}}>No critical issues found</div>
          <div style={{color:'#64748b',fontSize:'13px'}}>Your application is ready to proceed to payment.</div>
        </div>
      )}

      <div style={{marginTop:'24px',padding:'16px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',fontSize:'12px',color:'#64748b',lineHeight:'1.75'}}>
        <strong style={{color:'#94a3b8'}}>After payment:</strong> You'll receive a complete, formatted submission package — pre-filled DHS-8818, organized documents, cover letter, and step-by-step submission instructions. Download it and submit directly to DHS.
      </div>
    </div>
  )
}

function PaymentStep({ answers }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (!email || !email.includes('@')) return alert('Please enter a valid email address')
    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, agencyName: answers.legal_name || 'Agency', answers })
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch(err) {
      alert('Checkout error: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{fontFamily:'"Instrument Serif",Georgia,serif',fontSize:'22px',fontWeight:400,color:'white',marginBottom:'6px'}}>Complete Your Purchase</h2>
      <p style={{fontSize:'13px',color:'#94a3b8',marginBottom:'32px'}}>One payment. Immediate download. Your complete DHS submission package.</p>

      <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'20px',padding:'24px',marginBottom:'24px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'20px'}}>
          <div>
            <div style={{fontWeight:600,color:'white',marginBottom:'4px'}}>EIDBI Provisional License Package</div>
            <div style={{fontSize:'12px',color:'#64748b'}}>One-time · Immediate download</div>
          </div>
          <div style={{fontFamily:'"Instrument Serif",Georgia,serif',fontSize:'32px',fontWeight:300,color:'#f59e0b'}}>$697</div>
        </div>
        <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'16px',display:'flex',flexDirection:'column',gap:'8px'}}>
          {['Pre-filled DHS-8818 application','Gap analysis & action report','Organized document package','Cover letter for DHS Licensing','Step-by-step submission guide','Lifetime access to redownload'].map(item=>(
            <div key={item} style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'12px',color:'#94a3b8'}}>
              <span style={{color:'#34d399'}}>✓</span>{item}
            </div>
          ))}
        </div>
      </div>

      <div style={{marginBottom:'20px'}}>
        <label style={{display:'block',fontSize:'13px',color:'#94a3b8',marginBottom:'8px'}}>Email address for your download link</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@youragency.com"
          style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'12px',padding:'12px 16px',color:'white',fontSize:'14px',outline:'none',fontFamily:'inherit'}}
          onFocus={e=>e.target.style.borderColor='#f59e0b'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.12)'}
        />
      </div>

      <button onClick={handleCheckout} disabled={loading} style={{
        width:'100%',background:loading?'rgba(245,158,11,0.5)':'#f59e0b',border:'none',borderRadius:'14px',
        padding:'16px',color:'#000',fontWeight:700,fontSize:'15px',cursor:loading?'not-allowed':'pointer',
        transition:'all 0.15s',fontFamily:'inherit'
      }}>
        {loading ? 'Redirecting to checkout…' : 'Pay $697 and Get Your Package →'}
      </button>

      <p style={{textAlign:'center',fontSize:'11px',color:'#475569',marginTop:'12px'}}>
        Secured by Stripe · Price increases to $897 on May 1, 2026
      </p>
    </div>
  )
}

export default function ApplyPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const totalSteps = SECTIONS.length + 2

  const handleAnswer = (id, val) => setAnswers(prev => ({...prev, [id]: val}))

  const canNext = () => {
    if (step < SECTIONS.length) {
      return SECTIONS[step].questions.filter(q=>q.required).every(q=>answers[q.id])
    }
    return true
  }

  const stepLabels = [...SECTIONS.map(s=>s.title), 'Review', 'Payment']

  return (
    <div style={{minHeight:'100vh',background:'#0a0f1a',fontFamily:'Geist,system-ui,sans-serif'}}>
      {/* Nav */}
      <div style={{borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,background:'rgba(10,15,26,0.95)',backdropFilter:'blur(12px)',zIndex:50}}>
        <a href="/" style={{display:'flex',alignItems:'center',gap:'8px',textDecoration:'none',color:'white',fontSize:'14px',fontWeight:500}}>
          <span style={{color:'#f59e0b'}}>◆</span> NorthPath
        </a>
        <span style={{fontFamily:'monospace',fontSize:'11px',color:'#64748b'}}>Step {step+1} of {totalSteps}</span>
        <div style={{fontFamily:'monospace',fontSize:'11px',color:'#f59e0b',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'99px',padding:'4px 12px'}}>
          May 31 deadline
        </div>
      </div>

      <div style={{maxWidth:'680px',margin:'0 auto',padding:'40px 20px'}}>
        <ProgressBar current={step+1} total={totalSteps}/>

        {/* Step tabs */}
        <div style={{display:'flex',gap:'6px',marginBottom:'32px',overflowX:'auto',paddingBottom:'4px'}}>
          {stepLabels.map((label,i)=>(
            <button key={i} onClick={()=>i<step&&setStep(i)} style={{
              fontFamily:'monospace',fontSize:'10px',padding:'4px 10px',borderRadius:'8px',
              whiteSpace:'nowrap',flexShrink:0,border:'none',cursor:i<step?'pointer':'default',
              background:i===step?'rgba(245,158,11,0.15)':i<step?'rgba(52,211,153,0.1)':'rgba(255,255,255,0.04)',
              color:i===step?'#f59e0b':i<step?'#34d399':'#374151',
              outline:i===step?'1px solid rgba(245,158,11,0.3)':'none',
            }}>
              {i<step?'✓ ':''}{label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'24px',padding:'32px',marginBottom:'20px'}}>
          {step < SECTIONS.length && <SectionStep section={SECTIONS[step]} answers={answers} onChange={handleAnswer}/>}
          {step === SECTIONS.length && <ReviewStep answers={answers}/>}
          {step === SECTIONS.length + 1 && <PaymentStep answers={answers}/>}
        </div>

        {/* Nav buttons */}
        <div style={{display:'flex',gap:'12px'}}>
          {step>0&&(
            <button onClick={()=>setStep(p=>p-1)} style={{
              padding:'12px 24px',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'12px',
              background:'transparent',color:'#94a3b8',fontSize:'14px',cursor:'pointer',fontFamily:'inherit'
            }}>
              ← Back
            </button>
          )}
          {step < totalSteps-1 && (
            <button onClick={()=>setStep(p=>p+1)} disabled={!canNext()} style={{
              flex:1,background:canNext()?'#f59e0b':'rgba(245,158,11,0.3)',border:'none',borderRadius:'12px',
              padding:'14px',color:'#000',fontWeight:700,fontSize:'14px',
              cursor:canNext()?'pointer':'not-allowed',fontFamily:'inherit',transition:'all 0.15s'
            }}>
              {step===SECTIONS.length-1?'See My Gap Report →':'Continue →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
