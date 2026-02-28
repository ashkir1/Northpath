// ============================================================
// NORTHPATH — THE 40 QUESTIONS
// Every question maps to a specific DHS EIDBI requirement.
// This is the intellectual core of the product.
// Edit questions here without touching any other code.
// ============================================================

export interface Question {
  id: string;
  section: number;
  order: number;
  type: 'text' | 'select' | 'boolean' | 'date' | 'file' | 'number' | 'multiselect';
  label: string;
  hint?: string;           // Plain-English explanation
  placeholder?: string;
  options?: string[];      // For select/multiselect
  required: boolean;
  dhs_requirement: string; // Exact DHS citation
  showIf?: {               // Conditional logic
    questionId: string;
    value: string | boolean;
  };
}

export interface Section {
  id: number;
  title: string;
  description: string;
  icon: string;
  questions: Question[];
}

export const SECTIONS: Section[] = [

  // ══════════════════════════════════════════════
  // SECTION 1: AGENCY BASICS
  // ══════════════════════════════════════════════
  {
    id: 1,
    title: "Agency Information",
    description: "Basic information about your agency that identifies you to DHS.",
    icon: "🏢",
    questions: [
      {
        id: "agency_legal_name",
        section: 1, order: 1,
        type: "text",
        label: "What is the full legal name of your agency?",
        hint: "This must match exactly what is registered with the state — your LLC or corporation name as it appears on your Articles of Organization.",
        placeholder: "e.g. Bright Future Autism Services LLC",
        required: true,
        dhs_requirement: "DHS-8818 Section 1 — Agency identification"
      },
      {
        id: "agency_npi",
        section: 1, order: 2,
        type: "text",
        label: "What is your agency's National Provider Identifier (NPI)?",
        hint: "Your 10-digit NPI number. Find it at nppes.cms.hhs.gov if you don't have it handy. This is required for all MHCP-enrolled providers.",
        placeholder: "1234567890",
        required: true,
        dhs_requirement: "MHCP Provider Enrollment — NPI required"
      },
      {
        id: "agency_mnits_active",
        section: 1, order: 3,
        type: "boolean",
        label: "Does your agency have an active MN-ITS account?",
        hint: "MN-ITS is the Minnesota Information Technology Services portal used to submit claims and receive DHS communications. If you've been billing Medicaid, you have one. Check at mn.gov/mnits if unsure.",
        required: true,
        dhs_requirement: "MHCP enrollment requirement — active MN-ITS account"
      },
      {
        id: "agency_service_address",
        section: 1, order: 4,
        type: "text",
        label: "What is your agency's primary service address?",
        hint: "The physical address where your agency operates. If you provide services in client homes, use your main office address.",
        placeholder: "123 Main Street, Minneapolis MN 55401",
        required: true,
        dhs_requirement: "DHS-8818 Section 1 — Physical location"
      },
      {
        id: "agency_owner_name",
        section: 1, order: 5,
        type: "text",
        label: "What is the full name of the agency owner or primary authorized person?",
        hint: "The person who owns 5% or more of the agency. This person's background study must be completed in NETStudy 2.0.",
        placeholder: "Full legal name",
        required: true,
        dhs_requirement: "DHS-8818 — Ownership disclosure, §245A.04 subd 1"
      },
      {
        id: "owner_background_status",
        section: 1, order: 6,
        type: "select",
        label: "What is the owner's NETStudy 2.0 background study status?",
        hint: "The owner must have a completed background study with an 'Eligible' or 'Set-Aside' result. 'Pending' is no longer acceptable — the owner cannot supervise services until clearance is received.",
        options: ["Eligible", "Set-Aside", "Pending — not yet complete", "Disqualified", "Not started"],
        required: true,
        dhs_requirement: "MN Stat §245C — Background study required for owners; effective Aug 5, 2025"
      },
    ]
  },

  // ══════════════════════════════════════════════
  // SECTION 2: QSP (QUALIFIED SUPERVISING PROFESSIONAL)
  // ══════════════════════════════════════════════
  {
    id: 2,
    title: "Qualified Supervising Professional",
    description: "Your QSP is the licensed clinical supervisor required for every EIDBI agency. This section has the highest number of denial reasons — take it carefully.",
    icon: "👩‍⚕️",
    questions: [
      {
        id: "qsp_name",
        section: 2, order: 1,
        type: "text",
        label: "What is the full name of your agency's QSP?",
        placeholder: "Full legal name",
        required: true,
        dhs_requirement: "DHS-8818 Section 2 — QSP identification"
      },
      {
        id: "qsp_license_type",
        section: 2, order: 2,
        type: "select",
        label: "What type of license does your QSP hold?",
        hint: "QSPs must hold one of these specific license types. An LBA (Licensed Behavior Analyst) became eligible to serve as QSP starting January 1, 2025.",
        options: [
          "Licensed Psychologist (LP)",
          "Licensed Independent Clinical Social Worker (LICSW)",
          "Licensed Marriage and Family Therapist (LMFT)",
          "Licensed Professional Clinical Counselor (LPCC)",
          "Licensed Mental Health Practitioner (LMHP)",
          "Licensed Behavior Analyst (LBA)",
          "Developmental Behavioral Pediatrician",
          "Other / Not sure"
        ],
        required: true,
        dhs_requirement: "DHS-7120C — QSP qualifications, §256B.0949 subd 4"
      },
      {
        id: "qsp_license_number",
        section: 2, order: 3,
        type: "text",
        label: "What is your QSP's license number?",
        hint: "Find this on their license certificate or at the relevant Minnesota licensing board's website.",
        placeholder: "License number",
        required: true,
        dhs_requirement: "DHS-7120C — QSP license verification"
      },
      {
        id: "qsp_license_expiry",
        section: 2, order: 4,
        type: "date",
        label: "When does your QSP's license expire?",
        hint: "The license must be valid at the time you submit your application AND at the time DHS reviews it. We recommend having at least 6 months remaining.",
        required: true,
        dhs_requirement: "DHS-7120C — QSP must hold current, valid license"
      },
      {
        id: "qsp_treatment_modality",
        section: 2, order: 5,
        type: "multiselect",
        label: "Which DHS-approved treatment modalities is your QSP certified in?",
        hint: "Your QSP must hold advanced certification in at least one DHS-approved modality. Note: Play Project and Early Social Interaction (ESI) were removed in 2025 and are no longer approved.",
        options: [
          "Applied Behavior Analysis (ABA)",
          "Early Start Denver Model (ESDM)",
          "Pivotal Response Treatment (PRT)",
          "Verbal Behavior (VB)",
          "Naturalistic Developmental Behavioral Intervention (NDBI)",
          "Developmental, Individual Difference, Relationship-based (DIR/Floortime)",
          "Other DHS-approved modality"
        ],
        required: true,
        dhs_requirement: "§256B.0949 subd 13 — Advanced certification in approved modality"
      },
      {
        id: "qsp_supervised_hours",
        section: 2, order: 6,
        type: "number",
        label: "How many hours of supervised clinical experience does your QSP have working with ASD or related conditions?",
        hint: "QSPs must have at least 2,000 hours of supervised clinical experience in examining or treating people with ASD, OR equivalent documented graduate coursework. Enter the total hours.",
        placeholder: "e.g. 2500",
        required: true,
        dhs_requirement: "DHS-7120C — QSP 2,000 supervised hours requirement"
      },
      {
        id: "qsp_is_w2",
        section: 2, order: 7,
        type: "boolean",
        label: "Is your QSP a W-2 employee of your agency?",
        hint: "As of January 1, 2026, QSPs must be W-2 employees of the agency — not independent contractors or 1099 workers. This is one of the most common compliance gaps we see. If your QSP is a contractor, you need to convert them before submitting.",
        required: true,
        dhs_requirement: "2025 MN Legislature — QSP must be agency employee, effective Jan 1, 2026"
      },
      {
        id: "qsp_assurance_submitted",
        section: 2, order: 8,
        type: "boolean",
        label: "Has your QSP submitted the QSP Assurance Statement (DHS-7120C) to MHCP?",
        hint: "Form DHS-7120C must be on file with MHCP. Your QSP submits it through the MPSE portal. If you're not sure, check with your QSP or call MHCP at 651-431-2700.",
        required: true,
        dhs_requirement: "DHS-7120C — QSP Assurance Statement required for enrollment"
      },
    ]
  },

  // ══════════════════════════════════════════════
  // SECTION 3: STAFF & BACKGROUND STUDIES
  // ══════════════════════════════════════════════
  {
    id: 3,
    title: "Staff & Background Studies",
    description: "Every person who works with clients must have a completed NETStudy 2.0 background study before providing services.",
    icon: "👥",
    questions: [
      {
        id: "staff_total_count",
        section: 3, order: 1,
        type: "number",
        label: "How many total staff members provide direct services to clients?",
        hint: "Count everyone who has contact with clients: Level I, II, and III providers. Do not count admin-only staff who never see clients.",
        placeholder: "e.g. 8",
        required: true,
        dhs_requirement: "DHS-8818 — Staff roster required"
      },
      {
        id: "all_staff_netstudy_complete",
        section: 3, order: 2,
        type: "boolean",
        label: "Do ALL staff members who provide direct services have a completed NETStudy 2.0 background study with an 'Eligible' or 'Set-Aside' result?",
        hint: "As of August 5, 2025, staff cannot provide any services until their background study is complete. 'Pending' status is no longer acceptable. One staff member without clearance can invalidate your entire application.",
        required: true,
        dhs_requirement: "MN Stat §245C — Background study required before service; effective Aug 5, 2025"
      },
      {
        id: "agency_netstudy_id",
        section: 3, order: 3,
        type: "text",
        label: "What is your agency's NETStudy 2.0 Agency ID number?",
        hint: "Every EIDBI agency must have a NETStudy 2.0 Agency ID. You get this by submitting form DHS-3891A. If you have multiple locations, each location needs its own Agency ID. Find this in your DHS correspondence or call DHS Provider Eligibility at 651-431-2700.",
        placeholder: "Agency ID from NETStudy 2.0",
        required: true,
        dhs_requirement: "DHS-3891A — NETStudy 2.0 Agency ID required for all EIDBI agencies"
      },
      {
        id: "level1_count",
        section: 3, order: 4,
        type: "number",
        label: "How many Level I providers does your agency have?",
        hint: "Level I providers deliver most direct therapy services to clients. They must each have submitted a Level I Assurance Statement (DHS-7120D).",
        placeholder: "0 if none",
        required: true,
        dhs_requirement: "DHS-8818 — Provider roster by level"
      },
      {
        id: "level1_assurances_submitted",
        section: 3, order: 5,
        type: "boolean",
        label: "Have all your Level I providers submitted their Assurance Statement (DHS-7120D) to MHCP?",
        hint: "Each Level I provider must submit DHS-7120D through the MPSE portal. Check each provider's enrollment status at mn.gov/dhs.",
        required: true,
        dhs_requirement: "DHS-7120D — Required for all Level I enrollment",
        showIf: { questionId: "level1_count", value: "gt0" }
      },
      {
        id: "qsp_client_ratio",
        section: 3, order: 6,
        type: "number",
        label: "How many active clients is your QSP currently supervising?",
        hint: "Your QSP can supervise a maximum of 16 clients. If you have more than 16 active clients, you need more than one QSP. Enter your current active client count.",
        placeholder: "e.g. 12",
        required: true,
        dhs_requirement: "§256B.0949 — Mandatory 1:16 QSP-to-client supervision ratio, effective Jan 1, 2026"
      },
    ]
  },

  // ══════════════════════════════════════════════
  // SECTION 4: POLICIES & PROCEDURES
  // ══════════════════════════════════════════════
  {
    id: 4,
    title: "Policies & Procedures",
    description: "DHS requires written policies for specific situations. These must exist before you submit — not after.",
    icon: "📋",
    questions: [
      {
        id: "policy_maltreatment",
        section: 4, order: 1,
        type: "boolean",
        label: "Does your agency have a written maltreatment reporting policy?",
        hint: "Required since July 1, 2025 when DHS became the lead maltreatment investigation agency for EIDBI. Your policy must specify: who to call for clients under 18 (DHS Licensing at 651-431-6600) and who to call for clients 18–21 (MAARC at 1-844-880-1574). All staff must be trained on this policy.",
        required: true,
        dhs_requirement: "§256B.0949 subd 16 — Staff maltreatment training required; DHS maltreatment authority July 1, 2025"
      },
      {
        id: "policy_supervision",
        section: 4, order: 2,
        type: "boolean",
        label: "Does your agency have a written clinical supervision policy?",
        hint: "This policy must document how your QSP provides observation and direction to each client, the frequency (at minimum monthly), and how the 1:16 ratio is maintained. The ITP for each client must reference this policy.",
        required: true,
        dhs_requirement: "DHS provisional licensing standards — supervision policy required"
      },
      {
        id: "policy_emergency",
        section: 4, order: 3,
        type: "boolean",
        label: "Does your agency have a written emergency procedures policy?",
        hint: "Must cover what staff do in a medical emergency, fire, or safety situation during a session. Must be shared with all staff.",
        required: true,
        dhs_requirement: "DHS provisional licensing — health and safety standards"
      },
      {
        id: "policy_incident",
        section: 4, order: 4,
        type: "boolean",
        label: "Does your agency have a written incident reporting policy?",
        hint: "Covers how staff report and document incidents involving clients — injuries, behavioral incidents, medication errors, etc.",
        required: true,
        dhs_requirement: "DHS provisional licensing — incident reporting requirement"
      },
      {
        id: "policy_rights",
        section: 4, order: 5,
        type: "boolean",
        label: "Does your agency have a written client rights policy?",
        hint: "Must explain the rights of persons receiving EIDBI services — including the right to confidentiality, right to participate in treatment planning, and right to file a complaint.",
        required: true,
        dhs_requirement: "DHS provisional licensing — rights of persons served"
      },
      {
        id: "staff_policy_training",
        section: 4, order: 6,
        type: "boolean",
        label: "Have all staff been trained on these policies in the last 12 months?",
        hint: "DHS requires documented proof that staff training occurred — not just that policies exist. Training logs with staff signatures and dates are what DHS inspectors look for in an unannounced visit.",
        required: true,
        dhs_requirement: "§256B.0949 subd 16 — Annual staff training requirement"
      },
      {
        id: "telehealth_supervision",
        section: 4, order: 7,
        type: "boolean",
        label: "Does your QSP ever conduct supervision observations via telehealth?",
        hint: "Telehealth observation is allowed, but limited to a maximum of 2 consecutive months per client. After 2 consecutive telehealth months, the next observation must be in person. If your QSP uses telehealth, your supervision policy must document how you track this limit.",
        required: false,
        dhs_requirement: "DHS EIDBI Manual — Telehealth supervision limit, effective Jan 1, 2026"
      },
    ]
  },

  // ══════════════════════════════════════════════
  // SECTION 5: CLIENT DOCUMENTATION
  // ══════════════════════════════════════════════
  {
    id: 5,
    title: "Client Documentation",
    description: "How you document treatment for each client, and whether your current documents meet 2026 requirements.",
    icon: "📂",
    questions: [
      {
        id: "itp_template_current",
        section: 5, order: 1,
        type: "boolean",
        label: "Does your agency use the current DHS ITP template (DHS-7109) with the 2026 supervision section?",
        hint: "The 2026 ITP template includes a new 'EIDBI clinical supervision frequency' section that must confirm 1:16 ratio compliance. ITPs written before 2026 using the old template are non-compliant for 2026 authorizations. You can download the current DHS-7109 from the DHS EIDBI manual.",
        required: true,
        dhs_requirement: "DHS-7109 updated — New clinical supervision section required Jan 1, 2026"
      },
      {
        id: "cmde_current",
        section: 5, order: 2,
        type: "boolean",
        label: "Does every active client have a current Comprehensive Multi-Disciplinary Evaluation (CMDE) on file?",
        hint: "A CMDE is required to establish medical necessity before EIDBI services can be authorized. CMDEs must be renewed at least every 3 years, or sooner if clinically necessary. No CMDE = no valid authorization.",
        required: true,
        dhs_requirement: "§256B.0949 — CMDE required for medical necessity determination"
      },
      {
        id: "progress_monitoring",
        section: 5, order: 3,
        type: "boolean",
        label: "Does your agency document progress monitoring for each client using DHS-7109?",
        hint: "Progress monitoring must be systematic and continuous — tracking whether the client is meeting ITP goals. The DHS-7109 progress monitoring form must be updated regularly. This is one of the most common items inspectors review.",
        required: true,
        dhs_requirement: "§256B.0949 subd 8 — Ongoing progress monitoring required"
      },
      {
        id: "active_client_count",
        section: 5, order: 4,
        type: "number",
        label: "How many active clients does your agency currently serve?",
        hint: "Count only clients with active service authorizations who are currently receiving services.",
        placeholder: "e.g. 15",
        required: true,
        dhs_requirement: "DHS-8818 — Active caseload documentation"
      },
      {
        id: "acentra_portal_access",
        section: 5, order: 5,
        type: "boolean",
        label: "Does your agency have active access to the Acentra Health Atrezzo portal?",
        hint: "Acentra Health (formerly Kepro) manages service authorization reviews for DHS. When they pend an authorization request, you have exactly 10 calendar days to respond through the Atrezzo portal. Missing this window = automatic denial. If you don't have portal access, call Acentra Health at 1-844-385-4594.",
        required: true,
        dhs_requirement: "DHS EIDBI Manual — Authorization managed through Acentra Health Atrezzo portal"
      },
    ]
  },

  // ══════════════════════════════════════════════
  // SECTION 6: BILLING & COMPLIANCE
  // ══════════════════════════════════════════════
  {
    id: 6,
    title: "Billing & Authorization",
    description: "The financial health of your agency depends on clean billing. These questions identify revenue risks.",
    icon: "💰",
    questions: [
      {
        id: "billing_system",
        section: 6, order: 1,
        type: "select",
        label: "How does your agency submit EIDBI claims to MHCP?",
        options: [
          "Directly through MN-ITS",
          "Through a billing company",
          "Through a clearinghouse (e.g. Availity)",
          "We handle all billing in-house",
          "Other"
        ],
        required: true,
        dhs_requirement: "MHCP provider billing compliance"
      },
      {
        id: "mco_credentialed",
        section: 6, order: 2,
        type: "boolean",
        label: "Is your agency credentialed with the relevant Managed Care Organizations (MCOs)?",
        hint: "Many EIDBI clients are enrolled in a Managed Care Organization (UCare, HealthPartners, Blue Plus, Hennepin Health, etc.) rather than fee-for-service Medicaid. You need separate credentialing with each MCO to serve those clients. If any of your clients are MCO-enrolled and you're not credentialed with their MCO, you cannot bill for their services.",
        required: true,
        dhs_requirement: "MCO credentialing — required to serve MCO-enrolled clients"
      },
      {
        id: "prepayment_review_status",
        section: 6, order: 3,
        type: "boolean",
        label: "Has your agency received any payment withhold or prepayment review notice from DHS?",
        hint: "Since October 2025, DHS and Optum have been conducting prepayment reviews on EIDBI claims. If you've received a notice, your claims are being reviewed before payment. This is important for your application — we'll help you document your response.",
        required: true,
        dhs_requirement: "DHS Program Integrity — prepayment review program, Oct 2025"
      },
      {
        id: "revalidation_current",
        section: 6, order: 4,
        type: "boolean",
        label: "Has your agency completed MHCP provider revalidation within the last 3 years?",
        hint: "EIDBI providers must revalidate their Medicaid enrollment every 3 years (reduced from 5 years in 2025). If your last revalidation was more than 3 years ago, you need to complete it before or alongside your provisional license application.",
        required: true,
        dhs_requirement: "2025 MN Legislature — EIDBI revalidation every 3 years"
      },
    ]
  }
];

// Flatten all questions for easy lookup
export const ALL_QUESTIONS: Question[] = SECTIONS.flatMap(s => s.questions);

export const getQuestion = (id: string): Question | undefined => 
  ALL_QUESTIONS.find(q => q.id === id);

export const TOTAL_QUESTIONS = ALL_QUESTIONS.length;
export const TOTAL_SECTIONS = SECTIONS.length;
