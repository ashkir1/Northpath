/**
 * NorthPath — DHS EIDBI Pre-Licensing Application Questions
 * Every question maps to a specific DHS-8818 checklist requirement.
 * Edit this file to update questions without touching component code.
 */

export const SECTIONS = [
  {
    id: 'agency',
    title: 'Agency Basics',
    subtitle: 'Basic information about your agency as registered with DHS.',
    icon: '🏢',
    questions: [
      {
        id: 'legal_name',
        dhs_ref: 'DHS-8818 §1.1',
        label: 'What is the full legal name of your agency?',
        hint: 'Exactly as it appears on your DHS enrollment.',
        type: 'text',
        required: true,
        validate: v => v?.trim().length > 2 ? null : 'Required'
      },
      {
        id: 'npi',
        dhs_ref: 'DHS-8818 §1.2',
        label: 'What is your agency\'s National Provider Identifier (NPI)?',
        hint: 'Your 10-digit NPI from NPPES. Find it at nppes.cms.hhs.gov',
        type: 'text',
        placeholder: '1234567890',
        required: true,
        validate: v => /^\d{10}$/.test(v?.trim()) ? null : 'Must be exactly 10 digits'
      },
      {
        id: 'mnits_active',
        dhs_ref: 'DHS-8818 §1.3',
        label: 'Do you have an active MN-ITS mailbox and portal access?',
        hint: 'MN-ITS is how DHS sends you authorization decisions and policy updates. Required to receive payments.',
        type: 'radio',
        options: ['Yes', 'No — I need to set this up'],
        required: true,
        gap: { 'No — I need to set this up': { severity: 'critical', message: 'You must have an active MN-ITS mailbox before submitting. Go to mn-its.org and complete enrollment. This takes 3–5 business days.' } }
      },
      {
        id: 'physical_address',
        dhs_ref: 'DHS-8818 §1.4',
        label: 'What is your primary service address?',
        hint: 'Street address, city, state, ZIP. Must match your DHS enrollment.',
        type: 'text',
        required: true,
        validate: v => v?.trim().length > 10 ? null : 'Enter a full address'
      },
      {
        id: 'medicaid_enrolled',
        dhs_ref: 'DHS-8818 §1.5',
        label: 'Is your agency currently enrolled as an active MHCP (Medicaid) provider for EIDBI services?',
        hint: 'You must have been enrolled before November 1, 2025 to be eligible for provisional licensing.',
        type: 'radio',
        options: ['Yes — enrolled and active', 'No — not currently enrolled'],
        required: true,
        gap: { 'No — not currently enrolled': { severity: 'critical', message: 'Provisional licensing is only available to agencies enrolled before the November 1, 2025 moratorium. You are not eligible to apply.' } }
      },
    ]
  },
  {
    id: 'qsp',
    title: 'Qualified Supervising Professional',
    subtitle: 'Your QSP is the most scrutinized part of your application. This must be right.',
    icon: '👩‍⚕️',
    questions: [
      {
        id: 'qsp_name',
        dhs_ref: 'DHS-7120C §A',
        label: 'What is your QSP\'s full legal name?',
        type: 'text',
        required: true,
        validate: v => v?.trim().length > 3 ? null : 'Required'
      },
      {
        id: 'qsp_license_type',
        dhs_ref: 'DHS-7120C §B.1',
        label: 'What type of license does your QSP hold?',
        hint: 'DHS accepts specific license types only. Select all that apply.',
        type: 'select',
        options: [
          'Licensed Behavior Analyst (LBA) — Minnesota Board of Psychology',
          'Licensed Psychologist (LP)',
          'Licensed Independent Clinical Social Worker (LICSW)',
          'Licensed Marriage and Family Therapist (LMFT)',
          'Licensed Professional Clinical Counselor (LPCC)',
          'Licensed Mental Health Professional (LMHP)',
          'Developmental/Behavioral Pediatrician',
          'None of the above',
        ],
        required: true,
        gap: { 'None of the above': { severity: 'critical', message: 'Your QSP does not hold a DHS-recognized license type. You must replace your QSP with a qualified individual before applying. See MN Stat. §256B.0949 Subd. 15.' } }
      },
      {
        id: 'qsp_license_number',
        dhs_ref: 'DHS-7120C §B.2',
        label: 'What is your QSP\'s license number?',
        hint: 'Found on their license card or on the Minnesota license lookup at mn.gov',
        type: 'text',
        required: true,
        validate: v => v?.trim().length > 3 ? null : 'Required'
      },
      {
        id: 'qsp_license_expiry',
        dhs_ref: 'DHS-7120C §B.3',
        label: 'When does your QSP\'s license expire?',
        hint: 'Must be valid at time of application AND for at least 6 months after.',
        type: 'date',
        required: true,
        validate: v => {
          if (!v) return 'Required'
          const exp = new Date(v)
          const sixMonths = new Date()
          sixMonths.setMonth(sixMonths.getMonth() + 6)
          return exp > sixMonths ? null : 'License expires too soon — must be valid for at least 6 months'
        }
      },
      {
        id: 'qsp_modality',
        dhs_ref: 'DHS-7120C §C',
        label: 'What DHS-approved treatment modality is your QSP certified in?',
        type: 'select',
        options: [
          'Applied Behavior Analysis (ABA)',
          'Developmental Individual Difference Relationship-based (DIR/Floortime)',
          'Naturalistic Developmental Behavioral Intervention (NDBI)',
          'Pivotal Response Treatment (PRT)',
          'Verbal Behavior Milestones Assessment and Placement Program (VB-MAPP)',
          'SCERTS Model',
          'Other DHS-approved modality',
          'Not certified in any approved modality',
        ],
        required: true,
        gap: { 'Not certified in any approved modality': { severity: 'critical', message: 'Your QSP must hold advanced certification in at least one DHS-approved treatment modality. Note: The Play Project and Early Social Interaction (ESI) were removed from the approved list in 2025.' } }
      },
      {
        id: 'qsp_hours',
        dhs_ref: 'DHS-7120C §D',
        label: 'How many supervised clinical hours does your QSP have in ASD treatment?',
        hint: 'DHS requires at least 2,000 hours of supervised clinical experience with ASD populations.',
        type: 'select',
        options: [
          'Less than 2,000 hours',
          '2,000 – 5,000 hours',
          '5,000+ hours',
        ],
        required: true,
        gap: { 'Less than 2,000 hours': { severity: 'critical', message: 'Your QSP does not meet the minimum 2,000 supervised clinical hours requirement under MN Stat. §256B.0949.' } }
      },
      {
        id: 'qsp_employment_status',
        dhs_ref: 'DHS-7120C §E — New Jan 1 2026',
        label: 'Is your QSP a W-2 employee of your agency?',
        hint: '⚠️ As of January 1, 2026, QSPs MUST be W-2 employees. Independent contractors and 1099 arrangements are no longer compliant.',
        type: 'radio',
        options: [
          'Yes — W-2 employee, payroll taxes withheld',
          'No — independent contractor / 1099',
          'No — not yet determined',
        ],
        required: true,
        gap: {
          'No — independent contractor / 1099': { severity: 'critical', message: 'Your agency is out of compliance as of January 1, 2026. QSPs must be W-2 employees. You must convert this arrangement before submitting your application. Talk to your accountant immediately.' },
          'No — not yet determined': { severity: 'critical', message: 'This must be resolved before applying. W-2 employment is mandatory as of January 1, 2026.' }
        }
      },
      {
        id: 'qsp_assurance_submitted',
        dhs_ref: 'DHS-7120C submission',
        label: 'Has your QSP submitted the QSP Assurance Statement (DHS-7120C) to DHS?',
        hint: 'This form must be on file with DHS as part of your application package.',
        type: 'radio',
        options: ['Yes — submitted and confirmed', 'No — not yet submitted', 'Not sure'],
        required: true,
        gap: {
          'No — not yet submitted': { severity: 'high', message: 'DHS-7120C must be submitted before or with your license application. Download it at mn.gov/dhs/eidbi and have your QSP complete and submit it.' },
          'Not sure': { severity: 'high', message: 'Confirm with your QSP whether DHS-7120C has been submitted. Call DHS MHCP Provider Resource Center at 651-431-2700 to verify.' }
        }
      },
    ]
  },
  {
    id: 'staff',
    title: 'Staff & Background Studies',
    subtitle: 'Every person who works with clients must have a completed NETStudy 2.0 background study.',
    icon: '👥',
    questions: [
      {
        id: 'staff_count',
        dhs_ref: 'DHS-8818 §3.1',
        label: 'How many direct service providers (Level I, II, III) work for your agency?',
        type: 'select',
        options: ['1–5', '6–10', '11–20', '21–50', '50+'],
        required: true,
      },
      {
        id: 'all_background_studies',
        dhs_ref: 'MN Stat. §245C — Effective Aug 5 2025',
        label: 'Do ALL staff members (including owners with 5%+ stake) have a completed NETStudy 2.0 background study with an "eligible" or "set-aside" result?',
        hint: '⚠️ As of August 5, 2025 — no one can provide services until their background study is complete. There is no grace period.',
        type: 'radio',
        options: [
          'Yes — all staff have completed studies with eligible/set-aside results',
          'Some staff have pending or incomplete studies',
          'No — we have not completed NETStudy 2.0 for all staff',
        ],
        required: true,
        gap: {
          'Some staff have pending or incomplete studies': { severity: 'critical', message: 'Staff with incomplete background studies cannot provide services or be included in your application. Remove them from client caseloads immediately and do not bill for their services until studies are complete. Log into NETStudy 2.0 to check status.' },
          'No — we have not completed NETStudy 2.0 for all staff': { severity: 'critical', message: 'This is an immediate compliance violation. All staff and owners must complete NETStudy 2.0 fingerprint-based background studies before your application can be submitted. Begin this process today — it takes 1–2 weeks.' }
        }
      },
      {
        id: 'owner_background',
        dhs_ref: 'DHS-8818 §3.3',
        label: 'Does every person who owns 5% or more of the agency have a completed background study?',
        type: 'radio',
        options: ['Yes', 'No', 'Not sure'],
        required: true,
        gap: {
          'No': { severity: 'critical', message: 'All owners with 5%+ stake must have background studies. This includes silent partners and family members with ownership interest.' },
          'Not sure': { severity: 'high', message: 'Review your ownership documentation and confirm all 5%+ owners have submitted NETStudy 2.0 background studies.' }
        }
      },
      {
        id: 'assurance_statements',
        dhs_ref: 'DHS-7120D/E/F submission',
        label: 'Have all enrolled individual providers submitted their Level I, II, or III assurance statements?',
        hint: 'DHS-7120D (Level I), DHS-7120E (Level II), DHS-7120F (Level III)',
        type: 'radio',
        options: ['Yes — all submitted', 'Partially — some are missing', 'No'],
        required: true,
        gap: {
          'Partially — some are missing': { severity: 'high', message: 'All individual providers must have current assurance statements on file. Identify who is missing and have them submit through MPSE portal immediately.' },
          'No': { severity: 'critical', message: 'No assurance statements submitted. Every enrolled Level I, II, and III provider must complete their assurance statement before you can apply.' }
        }
      },
    ]
  },
  {
    id: 'supervision',
    title: 'Supervision & Client Ratios',
    subtitle: 'DHS now mandates a maximum 1:16 QSP-to-client ratio. This must be documented in every ITP.',
    icon: '📊',
    questions: [
      {
        id: 'client_count',
        dhs_ref: 'DHS-8818 §4.1',
        label: 'How many active clients does your agency currently serve?',
        type: 'select',
        options: ['1–10', '11–16', '17–32', '33–48', '49–64', '65+'],
        required: true,
      },
      {
        id: 'qsp_ratio_compliant',
        dhs_ref: 'MN Stat. §256B.0949 Subd. 15 — Effective Jan 1 2026',
        label: 'Is your current QSP-to-client ratio at or below 1:16 (one QSP per maximum 16 clients)?',
        hint: '⚠️ New requirement effective January 1, 2026. If you have 17+ clients you need more than one QSP.',
        type: 'radio',
        options: [
          'Yes — at or below 1:16',
          'No — we exceed 1:16',
          'Not sure — I need to calculate this',
        ],
        required: true,
        gap: {
          'No — we exceed 1:16': { severity: 'critical', message: 'You must hire additional QSPs or reduce your client caseload before applying. Each QSP can supervise a maximum of 16 clients. Divide your client count by 16 and round up to determine how many QSPs you need.' },
          'Not sure — I need to calculate this': { severity: 'high', message: 'Count your active clients and divide by 16. If the result is more than 1, you need additional QSPs. Example: 20 clients ÷ 16 = 1.25, meaning you need 2 QSPs.' }
        }
      },
      {
        id: 'itp_supervision_section',
        dhs_ref: 'DHS-7109 2026 update',
        label: 'Have you updated all Individual Treatment Plans (ITPs) to include the new clinical supervision frequency section?',
        hint: 'DHS updated form DHS-7109 in January 2026 to require a supervision documentation section with a 1:16 ratio compliance checkbox.',
        type: 'radio',
        options: [
          'Yes — all ITPs have been updated',
          'Some ITPs have been updated',
          'No — our ITPs use the old format',
        ],
        required: true,
        gap: {
          'Some ITPs have been updated': { severity: 'high', message: 'All active ITPs must use the 2026 DHS-7109 format for new authorizations. Download the updated form at mn.gov/dhs/eidbi and update all remaining ITPs immediately.' },
          'No — our ITPs use the old format': { severity: 'critical', message: 'Old ITP formats will be rejected for 2026 authorizations. You must update every active client\'s ITP before applying. Download the current DHS-7109 at mn.gov/dhs/eidbi.' }
        }
      },
      {
        id: 'supervision_frequency',
        dhs_ref: 'DHS-8818 §4.4',
        label: 'How often does your QSP conduct observation and direction for each client?',
        type: 'radio',
        options: [
          'At least monthly for every client',
          'Every 2–3 months',
          'Less frequently than every 3 months',
          'Not consistently tracked',
        ],
        required: true,
        gap: {
          'Every 2–3 months': { severity: 'medium', message: 'DHS requires at minimum monthly observation and direction per client. Adjust your supervision schedule and document it in each client\'s ITP.' },
          'Less frequently than every 3 months': { severity: 'critical', message: 'Monthly supervision is required under MN Stat. §256B.0949. This is a serious compliance violation. Establish and document monthly supervision for every client immediately.' },
          'Not consistently tracked': { severity: 'critical', message: 'You must track and document supervision frequency per client. Unannounced DHS visits will specifically check this. Start logging supervision dates in each client\'s file today.' }
        }
      },
      {
        id: 'telehealth_supervision',
        dhs_ref: 'DHS-8818 §4.5 — 2026 rule',
        label: 'Do you use telehealth for any QSP supervision observations?',
        type: 'radio',
        options: [
          'No — all supervision is in-person',
          'Yes — occasionally',
          'Yes — as our primary supervision method',
        ],
        required: false,
        gap: {
          'Yes — as our primary supervision method': { severity: 'high', message: 'Telehealth supervision is limited to a maximum of 2 consecutive months per client under the 2026 rules. You cannot use telehealth as your primary supervision method. Plan in-person observations accordingly.' }
        }
      },
    ]
  },
  {
    id: 'policies',
    title: 'Policies & Procedures',
    subtitle: 'DHS requires written policies covering specific operational areas. These must exist and be accessible to all staff.',
    icon: '📋',
    questions: [
      {
        id: 'maltreatment_policy',
        dhs_ref: 'DHS-8818 §5.1 — Effective Jul 1 2025',
        label: 'Do you have a written maltreatment reporting policy that identifies DHS Licensing (651-431-6600) for clients under 18 and MAARC (1-844-880-1574) for ages 18–21?',
        hint: '⚠️ DHS Licensing became the lead investigative agency on July 1, 2025. Old policies that don\'t reflect this change are non-compliant.',
        type: 'radio',
        options: [
          'Yes — updated policy with correct 2025 reporting lines',
          'Yes — but not updated since before July 2025',
          'No written policy',
        ],
        required: true,
        gap: {
          'Yes — but not updated since before July 2025': { severity: 'high', message: 'Update your policy to reflect the July 2025 change: maltreatment in EIDBI settings is now reported to DHS Licensing (651-431-6600) for under-18, and MAARC (1-844-880-1574) for ages 18–21. Train all staff on this change.' },
          'No written policy': { severity: 'critical', message: 'A written maltreatment reporting policy is required. You must create one before applying. It must identify the correct reporting lines and include staff training documentation.' }
        }
      },
      {
        id: 'emergency_policy',
        dhs_ref: 'DHS-8818 §5.2',
        label: 'Do you have written emergency/crisis intervention procedures for client safety incidents?',
        type: 'radio',
        options: ['Yes — written and distributed to all staff', 'Yes — written but not distributed', 'No'],
        required: true,
        gap: {
          'Yes — written but not distributed': { severity: 'medium', message: 'Your emergency procedures must be distributed to and reviewed by all staff. Document that this training occurred.' },
          'No': { severity: 'critical', message: 'Written emergency procedures are required. Create and distribute procedures covering: medical emergencies, behavioral crises, and evacuation procedures.' }
        }
      },
      {
        id: 'incident_policy',
        dhs_ref: 'DHS-8818 §5.3',
        label: 'Do you have a written incident reporting policy and an incident log?',
        type: 'radio',
        options: ['Yes — policy and active log in place', 'Policy only, no log', 'No'],
        required: true,
        gap: {
          'Policy only, no log': { severity: 'medium', message: 'You need an active incident log in addition to the policy. Create a log and begin documenting all incidents immediately.' },
          'No': { severity: 'critical', message: 'An incident reporting policy and log are required. DHS will look for these during unannounced visits.' }
        }
      },
      {
        id: 'client_rights_policy',
        dhs_ref: 'DHS-8818 §5.4',
        label: 'Do you have a written policy on the rights of persons served, and do clients/families receive a copy?',
        type: 'radio',
        options: ['Yes — documented and provided to families', 'Yes — policy exists but not given to families', 'No'],
        required: true,
        gap: {
          'Yes — policy exists but not given to families': { severity: 'medium', message: 'Families must receive a copy of the rights policy and sign acknowledgment. Add this to your intake process.' },
          'No': { severity: 'critical', message: 'A client rights policy is required. Create one and add it to your intake documentation.' }
        }
      },
      {
        id: 'supervision_policy',
        dhs_ref: 'DHS-8818 §5.5',
        label: 'Do you have a written clinical supervision policy documenting your QSP supervision process, frequency, and documentation requirements?',
        type: 'radio',
        options: ['Yes — written and current', 'Informal process only, not written', 'No'],
        required: true,
        gap: {
          'Informal process only, not written': { severity: 'high', message: 'Your supervision process must be documented in a written policy. This is reviewed during every DHS inspection.' },
          'No': { severity: 'critical', message: 'A written supervision policy is required for licensing. It must specify: QSP-to-client ratio, observation frequency, documentation method, and how the 1:16 ratio is maintained.' }
        }
      },
    ]
  },
  {
    id: 'billing',
    title: 'Authorization & Billing',
    subtitle: 'Authorization management is where most agencies lose money. Confirm your systems are in place.',
    icon: '💰',
    questions: [
      {
        id: 'acentra_access',
        dhs_ref: 'DHS-8818 §6.1',
        label: 'Does your agency have active access to the Acentra Health Atrezzo portal?',
        hint: 'This is where DHS sends authorization decisions. You must be able to respond to pends within 10 calendar days.',
        type: 'radio',
        options: [
          'Yes — we have active access and check it regularly',
          'Yes — we have access but rarely check it',
          'No — we do not have access',
        ],
        required: true,
        gap: {
          'Yes — we have access but rarely check it': { severity: 'high', message: 'You are likely missing authorization pends. When Acentra Health pends an authorization, you have exactly 10 calendar days to respond — after that it is automatically denied. Set up daily portal checks and alerts.' },
          'No — we do not have access': { severity: 'critical', message: 'You must set up Atrezzo portal access immediately. Without it, you cannot respond to pend requests and your authorizations will be auto-denied. Contact Acentra Health at 1-866-923-3633.' }
        }
      },
      {
        id: 'pend_tracking',
        dhs_ref: 'DHS-8818 §6.2',
        label: 'How does your agency track authorization pends and the 10-day response window?',
        type: 'radio',
        options: [
          'We have a system — alerts and tracked deadlines',
          'We check the portal manually but have no tracking system',
          'We do not actively track pends',
        ],
        required: true,
        gap: {
          'We check the portal manually but have no tracking system': { severity: 'medium', message: 'Manual checking without a tracking system leads to missed deadlines and lost revenue. NorthPath\'s compliance subscription includes authorization pend alerts with 10-day countdown timers.' },
          'We do not actively track pends': { severity: 'high', message: 'This is likely costing your agency thousands of dollars per month in automatic denials. You need an active tracking system immediately.' }
        }
      },
      {
        id: 'mco_credentialing',
        dhs_ref: 'DHS-8818 §6.3',
        label: 'Is your agency credentialed with the Managed Care Organizations (MCOs) your clients are enrolled in?',
        hint: 'UCare, HealthPartners, Medica, Blue Plus, etc. Required to bill for MCO-enrolled clients.',
        type: 'radio',
        options: [
          'Yes — credentialed with all relevant MCOs',
          'Partially — credentialed with some MCOs',
          'No — only serving fee-for-service clients',
          'Not sure',
        ],
        required: true,
        gap: {
          'Partially — credentialed with some MCOs': { severity: 'medium', message: 'You cannot bill for clients enrolled in MCOs where you are not credentialed. Contact each MCO directly to complete credentialing. Process takes 45–90 days.' },
          'Not sure': { severity: 'medium', message: 'Check your client roster and compare each client\'s insurance plan against your credentialing status. Contact MCOs where gaps exist.' }
        }
      },
      {
        id: 'cmde_process',
        dhs_ref: 'DHS-8818 §6.4',
        label: 'Does every current client have a valid CMDE (Comprehensive Multidisciplinary Evaluation) on file?',
        hint: 'CMDE establishes medical necessity. Must be completed before services begin and renewed at least every 3 years.',
        type: 'radio',
        options: [
          'Yes — every client has a current CMDE',
          'Some clients have expired CMDEs',
          'Not sure — not tracking CMDE expiration dates',
        ],
        required: true,
        gap: {
          'Some clients have expired CMDEs': { severity: 'high', message: 'Billing for clients without a valid CMDE is a compliance violation. Identify clients with expired CMDEs and initiate renewal immediately. CMDE must be completed every 3 years or as clinically necessary.' },
          'Not sure — not tracking CMDE expiration dates': { severity: 'high', message: 'You must track CMDE expiration for every client. Create a tracking spreadsheet or use NorthPath\'s compliance dashboard. Check each client\'s file now.' }
        }
      },
    ]
  },
  {
    id: 'documents',
    title: 'Document Uploads',
    subtitle: 'Upload the key documents DHS will verify. These become part of your submission package.',
    icon: '📎',
    questions: [
      {
        id: 'upload_qsp_license',
        dhs_ref: 'DHS-8818 Attachment A',
        label: 'Upload your QSP\'s current professional license',
        hint: 'PDF, JPG, or PNG. Must show license number, type, and expiration date clearly.',
        type: 'upload',
        required: true,
        accept: '.pdf,.jpg,.jpeg,.png',
      },
      {
        id: 'upload_qsp_modality',
        dhs_ref: 'DHS-8818 Attachment B',
        label: 'Upload your QSP\'s treatment modality certification',
        hint: 'BACB certificate, Floortime certificate, or other approved modality certification.',
        type: 'upload',
        required: true,
        accept: '.pdf,.jpg,.jpeg,.png',
      },
      {
        id: 'upload_background_study',
        dhs_ref: 'DHS-8818 Attachment C',
        label: 'Upload NETStudy 2.0 confirmation for your primary QSP',
        hint: 'The email or printout showing "Eligible" or "Set-Aside" status from NETStudy 2.0.',
        type: 'upload',
        required: true,
        accept: '.pdf,.jpg,.jpeg,.png',
      },
      {
        id: 'upload_maltreatment_policy',
        dhs_ref: 'DHS-8818 Attachment D',
        label: 'Upload your written maltreatment reporting policy',
        hint: 'Must include the July 2025 updated reporting lines: DHS Licensing and MAARC.',
        type: 'upload',
        required: true,
        accept: '.pdf,.docx,.doc',
      },
      {
        id: 'upload_supervision_policy',
        dhs_ref: 'DHS-8818 Attachment E',
        label: 'Upload your written clinical supervision policy',
        hint: 'Must document your 1:16 ratio compliance and monthly supervision frequency.',
        type: 'upload',
        required: false,
        accept: '.pdf,.docx,.doc',
      },
    ]
  },
]

// Flatten all questions with section context
export const ALL_QUESTIONS = SECTIONS.flatMap(section =>
  section.questions.map(q => ({ ...q, section: section.id, sectionTitle: section.title }))
)

// Run gap analysis on completed answers
export function analyzeGaps(answers) {
  const gaps = []
  for (const q of ALL_QUESTIONS) {
    if (!q.gap) continue
    const answer = answers[q.id]
    if (answer && q.gap[answer]) {
      gaps.push({
        questionId: q.id,
        questionLabel: q.label,
        section: q.sectionTitle,
        dhs_ref: q.dhs_ref,
        answer,
        ...q.gap[answer],
      })
    }
    // Check date validation
    if (q.type === 'date' && q.validate && answer) {
      const err = q.validate(answer)
      if (err) {
        gaps.push({
          questionId: q.id,
          questionLabel: q.label,
          section: q.sectionTitle,
          dhs_ref: q.dhs_ref,
          answer,
          severity: 'critical',
          message: err,
        })
      }
    }
  }
  // Sort: critical first, then high, then medium
  const order = { critical: 0, high: 1, medium: 2 }
  return gaps.sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3))
}

export function getReadinessScore(answers) {
  const gaps = analyzeGaps(answers)
  const criticalCount = gaps.filter(g => g.severity === 'critical').length
  const highCount = gaps.filter(g => g.severity === 'high').length
  const medCount = gaps.filter(g => g.severity === 'medium').length
  if (criticalCount > 0) return { score: Math.max(10, 60 - criticalCount * 15), color: 'red', label: 'Not Ready' }
  if (highCount > 0) return { score: Math.max(60, 80 - highCount * 5), color: 'amber', label: 'Needs Work' }
  if (medCount > 0) return { score: 85 + (5 - Math.min(medCount, 5)) * 2, color: 'yellow', label: 'Almost Ready' }
  return { score: 98, color: 'green', label: 'Ready to Submit' }
}
