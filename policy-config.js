// ==========================================================================
// KnockoutNotes — Policy & Public Information Configuration (policy-config.js)
// Centralized configuration for brand details, contact methods, and support links.
// Editable by the site administrator without exposing personal information.
// ==========================================================================

const KNOCKOUT_POLICY_CONFIG = {
  brandName: "Knockout Notes",
  tagline: "Anaesthesia • Critical Care • Viva",
  brandDescription: "An independent digital medical education and revision resource for anaesthesia trainees, critical care clinicians, and post-graduate viva candidates.",
  brandLegalNotice: "Knockout Notes is an independent educational website authored for clinicians and post-graduate trainees. It is not a registered corporate entity, commercial hospital, degree-granting institution, or non-profit/charitable organization.",
  
  // Public Brand Contact Channels
  contactEmail: "knockoutnotes.anaesthesia@gmail.com",
  instagramUrl: "https://www.instagram.com/knock.out.notes?igsi=djNyZWxpd2NwMWFy",
  websiteUrl: "https://knockoutnotes.pages.dev",
  
  // Policy Effective & Revision Dates
  effectiveDate: "March 15, 2026",
  lastUpdated: "March 15, 2026",
  
  // Voluntary Support ("Buy Me a Coffee") Public Destination Link
  supportUrl: "https://bondin.io/@knockoutnotes/support",
  supportNote: "Voluntary peer-to-peer contributions help support hosting, 3D modeling, and educational authoring. Contributions are entirely optional and do not purchase a commercial service or constitute tax-deductible charitable donations.",
  
  // Commercial Status
  currency: "INR",
  hasPaidProducts: false, // Core website modules are 100% free of charge. Future digital lecture decks/study aids will be clearly listed if and when launched.
  
  // Legal & Dispute Jurisdiction (Subject to formal legal verification)
  governingJurisdiction: "Competent courts having jurisdiction in India"
};

// Expose globally for browser environments and CommonJS for test runners
if (typeof window !== "undefined") {
  window.KnockoutPolicyConfig = KNOCKOUT_POLICY_CONFIG;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = KNOCKOUT_POLICY_CONFIG;
}
