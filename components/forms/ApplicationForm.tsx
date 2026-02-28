'use client'
import { useState, useEffect, useCallback } from 'react'
import { SECTIONS, ALL_QUESTIONS, TOTAL_SECTIONS, type Question } from '@/lib/questions'
import { analyzeGaps, type GapAnalysisResult } from '@/lib/gap-analysis'
import { supabase } from '@/lib/supabase'

interface ApplyPageProps {
  agencyId: string
  agencyEmail: string
  isPaid: boolean
}

export default function ApplicationForm({ agencyId, agencyEmail, isPaid }: ApplyPageProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [gapResult, setGapResult] = useState<GapAnalysisResult | null>(null)
  const [phase, setPhase] = useState<'interview' | 'gaps' | 'paywall' | 'download'>('interview')

  const section = SECTIONS[currentSection]
  const totalAnswered = Object.keys(responses).filter(k => responses[k] !== '' && responses[k] !== null && responses[k] !== undefined).length
  const progress = Math.round((totalAnswered / ALL_QUESTIONS.length) * 100)

  // Load saved responses on mount
  useEffect(() => {
    loadResponses()
  }, [agencyId])

  async function loadResponses() {
    const { data } = await supabase
      .from('application_responses')
      .select('responses, current_section, gaps')
      .eq('agency_id', agencyId)
      .single()

    if (data) {
      setResponses(data.responses || {})
      setCurrentSection(data.current_section || 0)
      if (data.gaps && data.gaps.length > 0) {
        // Already ran gap analysis before
        const result = analyzeGaps(data.responses || {})
        setGapResult(result)
      }
    }
  }

  // Autosave every time responses change
  const saveResponses = useCallback(async (newResponses: Record<string, any>, section: number) => {
    setSaving(true)
    await supabase
      .from('application_responses')
      .upsert({
        agency_id: agencyId,
        responses: newResponses,
        current_section: section,
        updated_at: new Date().toISOString()
      }, { onConflict: 'agency_id' })
    setSaving(false)
  }, [agencyId])

  function updateResponse(questionId: string, value: any) {
    const newResponses = { ...responses, [questionId]: value }
    setResponses(newResponses)
    // Clear error when they answer
    if (errors[questionId]) {
      setErrors(prev => { const e = {...prev}; delete e[questionId]; return e })
    }
    // Debounced save
    saveResponses(newResponses, currentSection)
  }

  function validateSection(): boolean {
    const sectionErrors: Record<string, string> = {}
    section.questions.forEach(q => {
      // Skip questions with showIf that don't apply
      if (q.showIf) {
        const depValue = responses[q.showIf.questionId]
        if (q.showIf.value === 'gt0' && (!depValue || parseInt(depValue) === 0)) return
        if (depValue !== q.showIf.value) return
      }
      if (q.required && (responses[q.id] === undefined || responses[q.id] === '' || responses[q.id] === null)) {
        sectionErrors[q.id] = 'This question is required.'
      }
    })
    setErrors(sectionErrors)
    return Object.keys(sectionErrors).length === 0
  }

  function nextSection() {
    if (!validateSection()) return
    
    if (currentSection < SECTIONS.length - 1) {
      const next = currentSection + 1
      setCurrentSection(next)
      saveResponses(responses, next)
      window.scrollTo(0, 0)
    } else {
      // All sections complete — run gap analysis
      const result = analyzeGaps(responses)
      setGapResult(result)
      
      // Save gaps to DB
      supabase.from('application_responses').upsert({
        agency_id: agencyId,
        responses,
        gaps: result.gaps,
        readiness_score: result.score,
        current_section: SECTIONS.length,
        updated_at: new Date().toISOString()
      }, { onConflict: 'agency_id' })

      // Update agency status
      supabase.from('agencies').update({ app_status: 'complete' }).eq('id', agencyId)
      
      setPhase('gaps')
      window.scrollTo(0, 0)
    }
  }

  function prevSection() {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      window.scrollTo(0, 0)
    }
  }

  async function proceedToPayment() {
    if (isPaid) {
      setPhase('download')
      return
    }
    
    // Create Stripe checkout session
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agencyId, email: agencyEmail, plan: 'license_only' })
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  // ── RENDER QUESTION ───────────────────────────────────────
  function renderQuestion(q: Question) {
    // Check conditional visibility
    if (q.showIf) {
      const depValue = responses[q.showIf.questionId]
      if (q.showIf.value === 'gt0' && (!depValue || parseInt(depValue) === 0)) return null
      if (q.showIf.value !== 'gt0' && depValue !== q.showIf.value) return null
    }

    const value = responses[q.id]
    const hasError = !!errors[q.id]

    return (
      <div key={q.id} style={{ marginBottom: '2rem' }}>
        <label style={{ 
          fontSize: '0.95rem', 
          color: 'rgba(255,255,255,0.9)', 
          marginBottom: '0.375rem',
          display: 'block',
          fontWeight: '500',
          lineHeight: '1.5'
        }}>
          {q.label}
          {q.required && <span style={{ color: 'var(--amber)', marginLeft: '0.25rem' }}>*</span>}
        </label>
        
        {q.hint && (
          <p style={{ 
            fontSize: '0.78rem', 
            color: 'var(--fog)', 
            marginBottom: '0.75rem',
            lineHeight: '1.65',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '0.625rem 0.875rem'
          }}>
            💡 {q.hint}
          </p>
        )}

        {q.type === 'text' && (
          <input
            className={`input ${hasError ? 'input-error' : ''}`}
            type="text"
            placeholder={q.placeholder}
            value={value || ''}
            onChange={e => updateResponse(q.id, e.target.value)}
          />
        )}

        {q.type === 'number' && (
          <input
            className={`input ${hasError ? 'input-error' : ''}`}
            type="number"
            placeholder={q.placeholder}
            value={value || ''}
            onChange={e => updateResponse(q.id, e.target.value)}
            min="0"
          />
        )}

        {q.type === 'date' && (
          <input
            className={`input ${hasError ? 'input-error' : ''}`}
            type="date"
            value={value || ''}
            onChange={e => updateResponse(q.id, e.target.value)}
          />
        )}

        {q.type === 'boolean' && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {['Yes', 'No'].map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => updateResponse(q.id, opt === 'Yes')}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  borderRadius: '10px',
                  border: `1px solid ${value === (opt === 'Yes') ? 'var(--amber)' : 'var(--border2)'}`,
                  background: value === (opt === 'Yes') ? 'var(--amber-glow)' : 'var(--surface)',
                  color: value === (opt === 'Yes') ? 'var(--amber)' : 'var(--fog)',
                  fontFamily: 'Geist, sans-serif',
                  fontSize: '0.9rem',
                  fontWeight: value === (opt === 'Yes') ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.14s'
                }}
              >
                {opt === 'Yes' ? '✓ Yes' : '✗ No'}
              </button>
            ))}
          </div>
        )}

        {q.type === 'select' && q.options && (
          <select
            className={`input ${hasError ? 'input-error' : ''}`}
            value={value || ''}
            onChange={e => updateResponse(q.id, e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="">Select an option…</option>
            {q.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )}

        {q.type === 'multiselect' && q.options && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {q.options.map(opt => {
              const selected = Array.isArray(value) && value.includes(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    const current = Array.isArray(value) ? value : []
                    const updated = selected 
                      ? current.filter((v: string) => v !== opt)
                      : [...current, opt]
                    updateResponse(q.id, updated)
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: `1px solid ${selected ? 'var(--amber)' : 'var(--border2)'}`,
                    background: selected ? 'var(--amber-glow)' : 'var(--surface)',
                    color: selected ? 'var(--amber)' : 'var(--fog)',
                    fontFamily: 'Geist, sans-serif',
                    fontSize: '0.83rem',
                    cursor: 'pointer',
                    transition: 'all 0.14s',
                    display: 'flex', alignItems: 'center', gap: '0.625rem'
                  }}
                >
                  <span style={{
                    width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                    border: `1px solid ${selected ? 'var(--amber)' : 'var(--border2)'}`,
                    background: selected ? 'var(--amber)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', color: selected ? 'var(--ink)' : 'transparent'
                  }}>✓</span>
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {hasError && (
          <p style={{ fontSize: '0.75rem', color: 'var(--red)', marginTop: '0.375rem' }}>
            ⚠ {errors[q.id]}
          </p>
        )}

        <p style={{ 
          fontSize: '0.62rem', 
          color: 'rgba(255,255,255,0.2)', 
          marginTop: '0.5rem',
          fontFamily: 'Geist Mono, monospace',
          letterSpacing: '0.3px'
        }}>
          DHS: {q.dhs_requirement}
        </p>
      </div>
    )
  }

  // ── INTERVIEW PHASE ───────────────────────────────────────
  if (phase === 'interview') {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: '0.62rem', color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Section {currentSection + 1} of {TOTAL_SECTIONS}
            </span>
            <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: '0.62rem', color: 'var(--amber)' }}>
              {saving ? 'Saving…' : '✓ Saved'}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((currentSection) / TOTAL_SECTIONS) * 100}%` }} />
          </div>
        </div>

        {/* Section header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{section.icon}</div>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '1.75rem', fontWeight: 400, letterSpacing: '-0.5px', marginBottom: '0.5rem' }}>
            {section.title}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--fog)', lineHeight: '1.65' }}>
            {section.description}
          </p>
        </div>

        {/* Questions */}
        <div>
          {section.questions.map(q => renderQuestion(q))}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          {currentSection > 0 && (
            <button className="btn btn-outline" onClick={prevSection}>
              ← Back
            </button>
          )}
          <button className="btn btn-primary btn-full" onClick={nextSection}>
            {currentSection === SECTIONS.length - 1 ? 'See My Gap Report →' : `Continue to Section ${currentSection + 2} →`}
          </button>
        </div>
      </div>
    )
  }

  // ── GAP ANALYSIS PHASE ────────────────────────────────────
  if (phase === 'gaps' && gapResult) {
    const scoreColor = gapResult.score >= 80 ? 'var(--green)' : gapResult.score >= 50 ? 'var(--amber)' : 'var(--red)'

    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '100px', height: '100px',
            borderRadius: '50%', 
            border: `4px solid ${scoreColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column',
            margin: '0 auto 1.25rem'
          }}>
            <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: '2rem', color: scoreColor, lineHeight: 1 }}>
              {gapResult.score}
            </span>
            <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: '0.55rem', color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              /100
            </span>
          </div>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '1.75rem', fontWeight: 400, marginBottom: '0.5rem' }}>
            Your Readiness Report
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--fog)', maxWidth: '480px', margin: '0 auto', lineHeight: '1.65' }}>
            {gapResult.summary}
          </p>
        </div>

        {/* Summary counts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem' }}>
          {[
            { label: 'Critical', count: gapResult.critical_count, color: 'var(--red)' },
            { label: 'Major', count: gapResult.major_count, color: 'var(--amber)' },
            { label: 'Minor', count: gapResult.minor_count, color: 'var(--fog)' },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--ink)', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '2rem', color: item.color, lineHeight: 1, marginBottom: '0.25rem' }}>
                {item.count}
              </div>
              <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '0.6rem', color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Gaps list */}
        {gapResult.gaps.length === 0 ? (
          <div className="alert alert-success" style={{ marginBottom: '2rem' }}>
            🎉 No gaps found. Your agency appears ready to submit. Proceed to generate your application package.
          </div>
        ) : (
          <div style={{ marginBottom: '2rem' }}>
            {gapResult.gaps.map((gap, i) => (
              <div key={gap.id} style={{
                background: 'var(--surface)',
                border: `1px solid ${gap.severity === 'critical' ? 'rgba(239,68,68,0.3)' : gap.severity === 'major' ? 'rgba(245,158,11,0.25)' : 'var(--border2)'}`,
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '0.875rem'
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className={`badge ${gap.severity === 'critical' ? 'badge-red' : gap.severity === 'major' ? 'badge-amber' : 'badge-fog'}`}>
                    {gap.severity}
                  </span>
                  <h3 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '1rem', fontWeight: 400, lineHeight: '1.3', flex: 1 }}>
                    {gap.title}
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--fog)', lineHeight: '1.65', marginBottom: '0.875rem' }}>
                  {gap.explanation}
                </p>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.875rem', marginBottom: '0.5rem' }}>
                  <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: '0.6rem', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.375rem' }}>
                    How to fix this
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.65' }}>
                    {gap.how_to_fix}
                  </p>
                  <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: '0.62rem', color: 'var(--fog)', marginTop: '0.5rem' }}>
                    ⏱ {gap.time_to_fix}
                  </p>
                </div>
                {gap.blocks_submission && (
                  <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: '0.62rem', color: 'var(--red)', marginTop: '0.5rem' }}>
                    ⛔ Must resolve before submitting to DHS
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ 
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          borderRadius: '14px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '1.5rem', fontWeight: 400, marginBottom: '0.75rem' }}>
            {isPaid ? 'Generate your submission package' : 'Get your complete submission package'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--fog)', lineHeight: '1.65', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
            {isPaid 
              ? 'Your payment is confirmed. Generate your pre-filled DHS-8818, gap remediation guide, and complete submission package.'
              : 'Pre-filled DHS-8818, organized document folder, gap remediation guide, and step-by-step submission instructions. One payment.'}
          </p>
          {!isPaid && (
            <p style={{ fontFamily: 'Instrument Serif, serif', fontSize: '2rem', color: 'var(--amber)', marginBottom: '1.25rem' }}>
              $697
            </p>
          )}
          <button className="btn btn-primary btn-full" onClick={proceedToPayment} style={{ maxWidth: '320px' }}>
            {isPaid ? 'Generate Package →' : 'Pay $697 and Get Package →'}
          </button>
          {!isPaid && (
            <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: '0.6rem', color: 'var(--fog)', marginTop: '0.75rem' }}>
              Secure payment via Stripe. One-time charge. No recurring fees unless you choose a subscription.
            </p>
          )}
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { setPhase('interview'); setCurrentSection(0); }}>
            ← Edit my answers
          </button>
        </div>
      </div>
    )
  }

  // ── DOWNLOAD PHASE (paid users) ───────────────────────────
  if (phase === 'download') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '2rem', fontWeight: 400, marginBottom: '0.75rem' }}>
          Your Package Is Ready
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--fog)', lineHeight: '1.75', maxWidth: '440px', margin: '0 auto 2rem' }}>
          Download your complete DHS provisional license submission package below. Everything is organized exactly as DHS expects to receive it.
        </p>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: '14px', padding: '2rem', marginBottom: '1.5rem' }}>
          {[
            { icon: '📄', title: 'Pre-filled DHS-8818 Application', desc: 'Your agency\'s information filled in' },
            { icon: '⚠️', title: 'Gap Remediation Guide', desc: 'Plain-English fixes for every issue found' },
            { icon: '📁', title: 'Document Checklist', desc: 'What to attach and in what order' },
            { icon: '📬', title: 'Submission Instructions', desc: 'Exactly how to submit to DHS' },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.title}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--fog)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button 
          className="btn btn-primary btn-full"
          style={{ maxWidth: '320px', marginBottom: '1rem' }}
          onClick={() => {
            // TODO: Trigger PDF generation and zip download
            alert('PDF generation coming in Day 5 build. Your answers are saved.')
          }}
        >
          ⬇ Download Submission Package
        </button>

        <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: '0.6rem', color: 'var(--fog)' }}>
          Your answers are saved. Return anytime to update your package.
        </p>
      </div>
    )
  }

  return null
}
