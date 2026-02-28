// ============================================================
// NORTHPATH — GAP ANALYSIS ENGINE
// Takes all form responses, runs them against DHS requirements,
// returns a list of gaps with severity and remediation steps.
// ============================================================

export type GapSeverity = 'critical' | 'major' | 'minor';

export interface Gap {
  id: string;
  severity: GapSeverity;
  title: string;
  explanation: string;       // Why this matters
  what_dhs_wants: string;    // Exact requirement
  how_to_fix: string;        // Plain-English action steps
  time_to_fix: string;       // Realistic estimate
  dhs_citation: string;
  blocks_submission: boolean; // If true, must fix before submitting
}

export interface GapAnalysisResult {
  gaps: Gap[];
  score: number;              // 0–100 readiness score
  critical_count: number;
  major_count: number;
  minor_count: number;
  submission_ready: boolean;
  summary: string;
}

export function analyzeGaps(responses: Record<string, any>): GapAnalysisResult {
  const gaps: Gap[] = [];

  // ── SECTION 1: AGENCY BASICS ──────────────────────────────

  if (!responses.agency_npi || responses.agency_npi.length !== 10) {
    gaps.push({
      id: 'missing_npi',
      severity: 'critical',
      title: 'NPI number missing or invalid',
      explanation: 'Your National Provider Identifier is required for all MHCP enrollment. Without a valid 10-digit NPI, DHS cannot verify your Medicaid enrollment status.',
      what_dhs_wants: 'A valid 10-digit NPI registered with CMS',
      how_to_fix: 'If you don\'t have an NPI, apply at nppes.cms.hhs.gov — it\'s free and takes about 15 minutes. If you have one, double-check you\'re entering all 10 digits.',
      time_to_fix: '1–2 business days (if you need to apply)',
      dhs_citation: 'MHCP Provider Enrollment Requirements',
      blocks_submission: true
    });
  }

  if (!responses.agency_mnits_active) {
    gaps.push({
      id: 'no_mnits',
      severity: 'critical',
      title: 'No active MN-ITS account',
      explanation: 'MN-ITS is how DHS communicates with you and how you receive payments. Without an active account, you cannot receive billing communications or participate in prepayment review.',
      what_dhs_wants: 'Active MN-ITS account linked to your NPI',
      how_to_fix: 'Go to mn.gov/mnits to register or reactivate your account. Call MN-ITS helpdesk at 651-431-2700 if you need assistance.',
      time_to_fix: '1–3 business days',
      dhs_citation: 'MHCP Provider Manual — MN-ITS requirement',
      blocks_submission: true
    });
  }

  if (!responses.owner_background_status || 
      ['Pending — not yet complete', 'Disqualified', 'Not started'].includes(responses.owner_background_status)) {
    const isDisqualified = responses.owner_background_status === 'Disqualified';
    gaps.push({
      id: 'owner_background',
      severity: 'critical',
      title: isDisqualified ? 'Owner is disqualified from NETStudy 2.0' : 'Owner background study not complete',
      explanation: isDisqualified 
        ? 'A disqualified owner cannot operate an EIDBI agency. This is likely grounds for application denial under §245A.05.'
        : 'As of August 5, 2025, all owners must have a completed background study with "Eligible" or "Set-Aside" status before the agency can operate.',
      what_dhs_wants: '"Eligible" or "Set-Aside" NETStudy 2.0 result for all owners',
      how_to_fix: isDisqualified 
        ? 'Consult with a healthcare attorney immediately. A disqualified owner may need to divest their ownership stake.'
        : 'Submit your NETStudy 2.0 background study immediately at mn.gov/netstudy. Allow 2–4 weeks for processing. You cannot submit your license application until this is complete.',
      time_to_fix: isDisqualified ? 'Months (legal process required)' : '2–4 weeks',
      dhs_citation: 'MN Stat §245C — Background study requirement, effective Aug 5, 2025',
      blocks_submission: true
    });
  }

  // ── SECTION 2: QSP ────────────────────────────────────────

  if (!responses.qsp_is_w2) {
    gaps.push({
      id: 'qsp_not_w2',
      severity: 'critical',
      title: 'QSP is not a W-2 employee — immediate compliance violation',
      explanation: 'Since January 1, 2026, QSPs must be W-2 employees of the agency. Using a contractor QSP is now illegal. Every session your contractor QSP has supervised since Jan 1 is potentially unbillable and could trigger a payment withhold.',
      what_dhs_wants: 'QSP on agency payroll as W-2 employee with proper benefits and withholding',
      how_to_fix: 'You have two options: (1) Convert your current QSP to W-2 employment immediately — this requires setting up payroll, withholding, and an employment agreement. (2) If your QSP won\'t convert, find a new QSP who will work as an employee. This is urgent — do not wait.',
      time_to_fix: '1–2 weeks if QSP agrees to convert; 4–8 weeks if you need a new QSP',
      dhs_citation: '2025 MN Legislature — QSP employment requirement, effective Jan 1, 2026',
      blocks_submission: true
    });
  }

  if (!responses.qsp_assurance_submitted) {
    gaps.push({
      id: 'qsp_assurance_missing',
      severity: 'critical',
      title: 'QSP Assurance Statement (DHS-7120C) not submitted',
      explanation: 'Without a submitted DHS-7120C, your QSP is not enrolled as a QSP with MHCP. All supervision they\'ve provided may be considered invalid.',
      what_dhs_wants: 'Submitted and approved DHS-7120C in MPSE portal',
      how_to_fix: 'Have your QSP log into the MPSE portal at mn.gov/mpse and submit DHS-7120C. They\'ll need their license documentation ready. Processing takes 2–4 weeks.',
      time_to_fix: '2–4 weeks',
      dhs_citation: 'DHS-7120C — QSP Assurance Statement requirement',
      blocks_submission: true
    });
  }

  // Check QSP license expiry
  if (responses.qsp_license_expiry) {
    const expiry = new Date(responses.qsp_license_expiry);
    const deadline = new Date('2026-05-31');
    const today = new Date();
    
    if (expiry < today) {
      gaps.push({
        id: 'qsp_license_expired',
        severity: 'critical',
        title: 'QSP license is already expired',
        explanation: 'Your QSP cannot legally provide supervision services with an expired license. All sessions supervised after expiration are invalid.',
        what_dhs_wants: 'Active, valid QSP license with expiration date after submission',
        how_to_fix: 'Your QSP must renew their license immediately through their licensing board before providing any further supervision.',
        time_to_fix: '2–6 weeks depending on licensing board',
        dhs_citation: 'DHS-7120C — Current valid license required',
        blocks_submission: true
      });
    } else if (expiry < deadline) {
      gaps.push({
        id: 'qsp_license_expires_before_deadline',
        severity: 'major',
        title: 'QSP license expires before May 31 deadline',
        explanation: 'Your QSP\'s license expires before the provisional license application deadline. If DHS reviews your application after expiry, it may be denied.',
        what_dhs_wants: 'QSP license valid through at least the application deadline',
        how_to_fix: 'Your QSP should begin their license renewal process now. Most licensing boards allow renewal 90 days before expiration.',
        time_to_fix: '2–6 weeks',
        dhs_citation: 'DHS-7120C — Current valid license required at time of DHS review',
        blocks_submission: false
      });
    }
  }

  if (responses.qsp_supervised_hours && parseInt(responses.qsp_supervised_hours) < 2000) {
    gaps.push({
      id: 'qsp_insufficient_hours',
      severity: 'critical',
      title: `QSP has only ${responses.qsp_supervised_hours} supervised hours — minimum is 2,000`,
      explanation: 'DHS requires QSPs to have at least 2,000 hours of supervised clinical experience with ASD or related conditions. A QSP with fewer hours does not qualify.',
      what_dhs_wants: 'Minimum 2,000 supervised clinical hours documented',
      how_to_fix: 'You need a different QSP who meets the hours requirement, or document equivalent graduate coursework if applicable. Consult with a compliance attorney.',
      time_to_fix: 'Immediate — QSP needs to be replaced',
      dhs_citation: 'DHS-7120C — 2,000 supervised hours requirement',
      blocks_submission: true
    });
  }

  if (!responses.qsp_treatment_modality || (Array.isArray(responses.qsp_treatment_modality) && responses.qsp_treatment_modality.length === 0)) {
    gaps.push({
      id: 'no_treatment_modality',
      severity: 'critical',
      title: 'No DHS-approved treatment modality certification',
      explanation: 'QSPs must hold advanced certification in at least one DHS-approved treatment modality. Without this, your QSP does not qualify.',
      what_dhs_wants: 'Advanced certification in at least one DHS-approved modality',
      how_to_fix: 'Verify your QSP\'s certifications against the current approved modality list on the DHS EIDBI Manual. Note: Play Project and ESI were removed in 2025.',
      time_to_fix: 'Immediate review required',
      dhs_citation: '§256B.0949 subd 13 — Advanced certification required',
      blocks_submission: true
    });
  }

  // ── SECTION 3: STAFF ──────────────────────────────────────

  if (!responses.all_staff_netstudy_complete) {
    gaps.push({
      id: 'staff_background_incomplete',
      severity: 'critical',
      title: 'Not all staff have completed NETStudy 2.0 background studies',
      explanation: 'Since August 5, 2025, every staff member who provides direct client services must have a completed background study before working. One uncleated staff member is enough to cause problems with your application.',
      what_dhs_wants: 'Every direct-service staff member with "Eligible" or "Set-Aside" NETStudy 2.0 status',
      how_to_fix: 'Audit every staff member\'s NETStudy 2.0 status immediately. Submit pending background studies right away. Do not schedule sessions for any staff member without clearance.',
      time_to_fix: '2–4 weeks for each pending study',
      dhs_citation: 'MN Stat §245C — Background study, effective Aug 5, 2025',
      blocks_submission: true
    });
  }

  // QSP ratio check
  if (responses.qsp_client_ratio && responses.active_client_count) {
    const clients = parseInt(responses.active_client_count);
    if (clients > 16) {
      gaps.push({
        id: 'qsp_ratio_exceeded',
        severity: 'critical',
        title: `${clients} clients exceeds the 1:16 QSP-to-client ratio limit`,
        explanation: `One QSP can supervise a maximum of 16 clients. You have ${clients} active clients, which requires ${Math.ceil(clients/16)} QSPs. Operating over the ratio since January 1, 2026 may expose your agency to compliance action.`,
        what_dhs_wants: 'One QSP per 16 clients maximum, documented in every ITP',
        how_to_fix: `You need at least ${Math.ceil(clients/16)} QSPs. Hire or contract (as W-2) additional QSPs, or reduce your active caseload until you have enough supervision capacity.`,
        time_to_fix: '4–8 weeks to hire another QSP',
        dhs_citation: '§256B.0949 — Mandatory 1:16 ratio, effective Jan 1, 2026',
        blocks_submission: false
      });
    }
  }

  // ── SECTION 4: POLICIES ───────────────────────────────────

  const policyChecks = [
    { key: 'policy_maltreatment', title: 'Maltreatment reporting policy', citation: '§256B.0949 subd 16' },
    { key: 'policy_supervision', title: 'Clinical supervision policy', citation: 'DHS provisional licensing standards' },
    { key: 'policy_emergency', title: 'Emergency procedures policy', citation: 'DHS provisional licensing — health and safety' },
    { key: 'policy_incident', title: 'Incident reporting policy', citation: 'DHS provisional licensing standards' },
    { key: 'policy_rights', title: 'Client rights policy', citation: 'DHS provisional licensing — rights of persons served' },
  ];

  policyChecks.forEach(p => {
    if (!responses[p.key]) {
      gaps.push({
        id: `missing_${p.key}`,
        severity: 'major',
        title: `Missing written ${p.title.toLowerCase()}`,
        explanation: `DHS provisional licensing requires a written ${p.title.toLowerCase()}. Inspectors look for these documents during unannounced visits.`,
        what_dhs_wants: `Written, signed, dated ${p.title.toLowerCase()} on file, with evidence of staff training`,
        how_to_fix: `Create a written ${p.title.toLowerCase()} immediately. It must be in writing, available to all staff, and you must document that you trained staff on it. Template policies are available through ARRM and disability services consultants.`,
        time_to_fix: '1–3 days to write; plus training time',
        dhs_citation: p.citation,
        blocks_submission: false
      });
    }
  });

  if (!responses.staff_policy_training) {
    gaps.push({
      id: 'no_staff_training_docs',
      severity: 'major',
      title: 'No documented staff policy training',
      explanation: 'Having policies isn\'t enough — DHS inspectors look for training logs proving staff were trained. Without training documentation, your policies are considered unimplemented.',
      what_dhs_wants: 'Signed training logs with staff names, dates, and topics covered',
      how_to_fix: 'Create a training sign-in log. Conduct a staff training session on all policies. Have every staff member sign and date the log. Keep it on file.',
      time_to_fix: '1–2 days',
      dhs_citation: '§256B.0949 subd 16 — Annual staff training documentation',
      blocks_submission: false
    });
  }

  // ── SECTION 5: CLIENT DOCS ────────────────────────────────

  if (!responses.itp_template_current) {
    gaps.push({
      id: 'outdated_itp_template',
      severity: 'major',
      title: 'ITP template missing 2026 supervision section',
      explanation: 'The 2026 DHS ITP form (DHS-7109) includes a new clinical supervision frequency section. ITPs on the old template are non-compliant for 2026 authorizations — which means your current authorizations may be at risk.',
      what_dhs_wants: 'Current DHS-7109 with supervision section for all active clients',
      how_to_fix: 'Download the current DHS-7109 from the DHS EIDBI Manual. Update all active client ITPs to the new template before your next authorization renewal.',
      time_to_fix: '1–2 weeks depending on number of clients',
      dhs_citation: 'DHS-7109 updated — supervision section required Jan 1, 2026',
      blocks_submission: false
    });
  }

  if (!responses.cmde_current) {
    gaps.push({
      id: 'cmde_missing_or_expired',
      severity: 'critical',
      title: 'One or more clients missing a current CMDE',
      explanation: 'Without a current CMDE, a client\'s services are not medically necessary according to DHS. Billing for services without a valid CMDE is a billing compliance violation.',
      what_dhs_wants: 'Current CMDE on file for every active client, renewed every 3 years',
      how_to_fix: 'Audit every client\'s CMDE date. Schedule renewals for any CMDE older than 3 years. Services cannot continue billing without a valid CMDE.',
      time_to_fix: '2–6 weeks to schedule and complete new CMDEs',
      dhs_citation: '§256B.0949 — CMDE required; renewed every 3 years',
      blocks_submission: false
    });
  }

  if (!responses.acentra_portal_access) {
    gaps.push({
      id: 'no_acentra_access',
      severity: 'major',
      title: 'No Acentra Health Atrezzo portal access',
      explanation: 'Without Atrezzo portal access, you cannot respond to authorization pends within the 10-day window. Missed pends = automatic denials. You are losing money right now.',
      what_dhs_wants: 'Active Acentra Health Atrezzo portal account',
      how_to_fix: 'Call Acentra Health at 1-844-385-4594 to register for portal access. This should be set up immediately — do not wait.',
      time_to_fix: '1–5 business days',
      dhs_citation: 'DHS EIDBI Manual — Authorization process through Acentra Health',
      blocks_submission: false
    });
  }

  // ── SECTION 6: BILLING ────────────────────────────────────

  if (responses.prepayment_review_status) {
    gaps.push({
      id: 'under_prepayment_review',
      severity: 'major',
      title: 'Agency is under active prepayment review',
      explanation: 'A prepayment review means DHS and Optum are manually reviewing your claims before payment. This can cause significant payment delays and signals elevated scrutiny of your agency.',
      what_dhs_wants: 'Full documentation for every reviewed claim',
      how_to_fix: 'Respond to every DHS/Optum request with complete documentation within the required timeframe. Consider consulting with a healthcare compliance attorney to ensure your responses are adequate.',
      time_to_fix: 'Ongoing — resolve each reviewed claim promptly',
      dhs_citation: 'DHS Program Integrity — prepayment review program',
      blocks_submission: false
    });
  }

  if (!responses.revalidation_current) {
    gaps.push({
      id: 'revalidation_overdue',
      severity: 'major',
      title: 'MHCP provider revalidation may be overdue',
      explanation: 'EIDBI providers must revalidate their Medicaid enrollment every 3 years. Failure to revalidate results in disenrollment from Medicaid.',
      what_dhs_wants: 'Completed revalidation within the past 3 years',
      how_to_fix: 'Check your revalidation date in the MPSE portal. If it\'s due, complete it immediately through mn.gov/mpse.',
      time_to_fix: '1–2 weeks',
      dhs_citation: '2025 MN Legislature — 3-year revalidation cycle',
      blocks_submission: false
    });
  }

  // ── CALCULATE SCORE ───────────────────────────────────────

  const critical = gaps.filter(g => g.severity === 'critical').length;
  const major = gaps.filter(g => g.severity === 'major').length;
  const minor = gaps.filter(g => g.severity === 'minor').length;

  // Score: start at 100, deduct per gap severity
  let score = 100;
  score -= critical * 20;
  score -= major * 7;
  score -= minor * 2;
  score = Math.max(0, Math.min(100, score));

  const blockers = gaps.filter(g => g.blocks_submission);
  const submissionReady = blockers.length === 0;

  let summary = '';
  if (score >= 85 && submissionReady) {
    summary = 'Your agency looks ready to submit. Review the minor items and prepare your documents.';
  } else if (score >= 60) {
    summary = `You have ${critical > 0 ? critical + ' critical issues' : major + ' items'} to resolve before submitting. Most can be fixed within a few weeks.`;
  } else {
    summary = `Your agency has significant compliance gaps that need attention before applying. Start with the critical items — these are the ones most likely to cause DHS to deny your application.`;
  }

  return {
    gaps: gaps.sort((a, b) => {
      const order = { critical: 0, major: 1, minor: 2 };
      return order[a.severity] - order[b.severity];
    }),
    score,
    critical_count: critical,
    major_count: major,
    minor_count: minor,
    submission_ready: submissionReady,
    summary
  };
}
