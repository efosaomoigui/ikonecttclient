/**
 * Ikonectt — Central Content Registry
 * Source of truth: Ikonectt_content.md (Master Website Content & Copy Governance).
 * Do not add marketing copy, prices, statistics or claims that are not in that file.
 */

export const BRAND_CONTENT = {
  name: 'Ikonectt',
  registeredName: 'Ikonectt®',
  legalName: 'Intelivision Technologies Limited',
  parentCompany: 'Intelivision Technologies',
  portalName: 'My Ikonectt',
  primaryHeadline: 'Connectivity without limits.',
  secondarySlogan: 'Unlimited Internet. Unlimited Smiles.',
} as const;

/** §4.1 Homepage [PROPOSED-COPY] */
export const HOMEPAGE_CONTENT = {
  seo: {
    title: 'Ikonectt | Fibre Broadband for Homes and Businesses',
    description:
      'Explore Ikonectt fibre broadband for your home or business. Check availability, compare plans and get in touch.',
  },
  hero: {
    eyebrow: 'Fibre internet for a brighter Nigeria',
    headline: 'Connectivity without limits.',
    body: 'Fibre broadband for homes, businesses and everything you do online.',
    primaryCta: 'Check Coverage',
    secondaryCta: 'Explore Plans',
  },
  coverage: {
    heading: 'Is Ikonectt available in your area?',
    body: 'Check service availability at your address.',
    placeholder: 'Enter your street or estate',
    cta: 'Check Coverage',
    helper: 'Availability is subject to address verification.',
  },
  audiences: {
    residential: {
      label: 'Residential',
      heading: 'Internet for every day.',
      body: 'Stay connected at home for work, learning and entertainment.',
      cta: 'Explore Residential',
    },
    business: {
      label: 'Business',
      heading: 'Connectivity that works for business.',
      body: 'Explore broadband options for your team, office or organisation.',
      cta: 'Explore Business',
    },
  },
  plans: {
    heading: 'Find your connection.',
    body: 'Browse available plans and choose what suits your needs.',
    fallback: 'Explore our plans',
    cta: 'View All Plans',
    footnote:
      'Plan availability and installation are subject to location verification and applicable terms.',
  },
  company: {
    heading: 'Connecting people and possibilities.',
    body: 'Ikonectt is the broadband brand of Intelivision Technologies, serving homes and businesses.',
    cta: 'About Ikonectt',
  },
  portal: {
    heading: 'Manage your services with My Ikonectt.',
    body: 'Access your account, view your services and find support in one place.',
    cta: 'My Ikonectt',
  },
} as const;

export const COVERAGE_MESSAGES = {
  available: 'Service is available at this location.',
  verificationRequired: 'We need to confirm service availability at this address.',
  planned: 'Service is planned for this area.',
  unavailable: 'Service is not currently available at this location.',
  unknown: "We couldn't confirm availability. Request a manual check.",
} as const;
