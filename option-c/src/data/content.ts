export interface MegaMenuItem {
  title: string;
  description: string;
  id: string;
}

export const OPTION_03_CONTENT = {
  brand: {
    name: 'Ikonectt',
    company: 'Intelivision Technologies Limited',
    portal: 'My Ikonectt',
    tagline: 'Connecting homes, businesses and possibilities.',
  },

  navigation: {
    utilityAudience: [
      { label: 'Residential', id: 'residential', active: true },
      { label: 'Business', id: 'business', active: false },
    ],
    mainLinks: [
      { label: 'Residential', id: 'residential', hasMegaMenu: true },
      { label: 'Business', id: 'business', hasMegaMenu: true },
      { label: 'Coverage', id: 'coverage', hasMegaMenu: false },
      { label: 'Support', id: 'support', hasMegaMenu: false },
      { label: 'About Us', id: 'about', hasMegaMenu: false },
    ],
    megaMenus: {
      residential: {
        title: 'Residential Broadband',
        description: 'Uncapped, symmetrical optical fibre connectivity engineered for Nigerian modern homes.',
        columns: [
          {
            heading: 'Discover',
            items: [
              { title: 'Overview', description: 'Experience the Ikonectt home fibre standard', id: 'res-overview' },
              { title: 'Plans', description: 'Flexible tiers for apartments, duplexes & estates', id: 'res-plans' },
              { title: 'Compare Plans', description: 'Find the ideal bandwidth for your household', id: 'res-compare' },
            ]
          },
          {
            heading: 'Get Started',
            items: [
              { title: 'Check Coverage', description: 'Instant feasibility checker for your address', id: 'res-coverage' },
              { title: 'Installation Enquiry', description: 'Schedule site survey and installation', id: 'res-installation' },
            ]
          }
        ],
        ctaPanel: {
          badge: 'Home Fibre',
          title: 'Upgrade your home connection today',
          description: 'Experience symmetric speeds and zero data throttling.',
          buttonText: 'Check Address Availability',
          actionId: 'coverage'
        }
      },
      business: {
        title: 'Enterprise & Business Connectivity',
        description: 'Mission-critical optical infrastructure with tailored SLAs and priority enterprise support.',
        columns: [
          {
            heading: 'Solutions',
            items: [
              { title: 'Overview', description: 'Enterprise infrastructure and network architecture', id: 'biz-overview' },
              { title: 'Business Solutions', description: 'Dedicated internet access, branch VPNs & cloud peering', id: 'biz-solutions' },
              { title: 'Business Plans', description: 'Commercial bandwidth options with guaranteed capacity', id: 'biz-plans' },
            ]
          },
          {
            heading: 'Direct Engagement',
            items: [
              { title: 'Request a Quote', description: 'Custom enterprise quotes and multi-site feasibility', id: 'biz-quote' },
              { title: 'Check Coverage', description: 'Commercial corridor and office park readiness', id: 'biz-coverage' },
            ]
          }
        ],
        ctaPanel: {
          badge: 'Enterprise Tier',
          title: 'Dedicated connectivity for your team',
          description: 'Speak with our enterprise infrastructure specialists.',
          buttonText: 'Request Enterprise Proposal',
          actionId: 'biz-quote'
        }
      }
    }
  },

  hero: {
    eyebrow: 'FIBRE BROADBAND',
    headline: 'Connectivity without limits.',
    supportingLine: 'Reliable fibre broadband for homes, businesses and everything you do online.',
    primaryCta: 'Explore Residential',
    secondaryCta: 'Explore Business',
  },

  chooseConnection: {
    heading: 'Internet for every possibility.',
    residential: {
      title: 'At Home',
      line: 'Internet for the way you live.',
      cta: 'Explore Residential',
      description: 'Stay connected at home for work, learning and entertainment.'
    },
    business: {
      title: 'At Work',
      line: 'Connectivity for business.',
      cta: 'Explore Business',
      description: 'Explore broadband options for your team, office or organisation.'
    }
  },

  plans: {
    heading: 'Find your connection.',
    supportingLine: 'Explore available plans for your home or business.',
    cards: [
      {
        id: 'residential',
        title: 'Residential Plans',
        subtitle: 'At Home',
        description: 'Explore home broadband options and check your address.',
        features: [
          'Plan specifications awaiting verification',
          'Data conditions awaiting approved terms',
          'Equipment details to be confirmed',
          'Public support and enquiry pathways'
        ],
        cta: 'View Residential Plans'
      },
      {
        id: 'business',
        title: 'Business Plans',
        subtitle: 'At Work',
        description: 'Discuss your workplace and connectivity requirements.',
        features: [
          'Service requirements discussed individually',
          'Commercial terms awaiting confirmation',
          'Technical features awaiting verification',
          'Request a business quotation'
        ],
        cta: 'View Business Plans'
      }
    ],
    allPlansCta: 'View All Plans'
  },

  residentialEditorial: {
    heading: 'Made for the moments that matter.',
    supportingLine: 'From workdays to downtime, discover connectivity that fits into everyday life.',
    paragraphs: [
      'From workdays to downtime, discover connectivity that fits into everyday life.',
      'Your experience will depend on your plan, Wi-Fi setup and the devices in use.'
    ],
    cta: 'Explore Residential'
  },

  businessEditorial: {
    heading: 'Keep your business connected.',
    supportingLine: 'Explore broadband solutions for your business needs.',
    paragraphs: [
      'From households and estates to offices and organisations, Ikonectt supports different connectivity requirements.',
      'Tell us what your organisation needs. Service options depend on the address and technical requirements.'
    ],
    cta: 'Explore Business'
  },

  coverageAction: {
    heading: 'Is Ikonectt available at your address?',
    supportingLine: 'Check service availability in your area.',
    cta: 'Check Coverage',
    verifiedHubs: [
      { city: 'Country', areas: 'Nigeria' },
      { city: 'State', areas: 'Enter your service location' },
      { city: 'City / LGA', areas: 'District and area details' },
      { city: 'Street / Address', areas: 'Subject to verification' }
    ]
  },

  myIkonectt: {
    heading: 'Your connection. Your control.',
    supportingLine: 'Manage your services, payments and support through My Ikonectt.',
    description: 'Explore the My Ikonectt interface. Authentication, billing, renewals and private account data are not connected in this preview.',
    cta: 'Go to My Ikonectt',
    note: 'Customer onboarding is staff-managed. General enquiries do not require login.'
  },

  support: {
    heading: 'Here when you need us.',
    supportingLine: 'Find answers, get help and reach the right team.',
    channels: [
      { title: 'Help Centre', detail: 'Browse help topics', sub: 'Public information and guidance' },
      { title: 'Contact Support', detail: 'Preview a support request', sub: 'Live contact details awaiting confirmation' },
      { title: 'My Ikonectt', detail: 'Sign-in interface preview', sub: 'No production authentication' }
    ],
    cta: 'Visit Support'
  },

  footer: {
    brandLine: 'Connecting homes, businesses and possibilities.',
    company: 'Intelivision Technologies Limited',
    address: 'Victoria Island & Ikeja, Lagos, Nigeria',
    email: 'info@ikonectt.com',
    supportEmail: 'support@ikonectt.com',
    phone: '+234 (0) 1 888 4566',
    groups: [
      {
        title: 'Residential',
        links: [
          { label: 'Overview', id: 'res-overview' },
          { label: 'Home Plans', id: 'res-plans' },
          { label: 'Compare Options', id: 'res-compare' },
          { label: 'Installation Process', id: 'res-installation' }
        ]
      },
      {
        title: 'Business',
        links: [
          { label: 'Overview', id: 'biz-overview' },
          { label: 'Enterprise Solutions', id: 'biz-solutions' },
          { label: 'Business Plans', id: 'biz-plans' },
          { label: 'Request a Quote', id: 'biz-quote' }
        ]
      },
      {
        title: 'Coverage',
        links: [
          { label: 'Check Availability', id: 'coverage' },
          { label: 'Lagos Fibre Map', id: 'cov-lagos' },
          { label: 'Abuja Corridor', id: 'cov-abuja' },
          { label: 'Network Feasibility', id: 'cov-feasibility' }
        ]
      },
      {
        title: 'Support',
        links: [
          { label: 'Customer Care', id: 'support' },
          { label: 'Technical Helpdesk', id: 'support-helpdesk' },
          { label: 'Report a Fault', id: 'support-fault' },
          { label: 'My Ikonectt Login', id: 'my-ikonectt' }
        ]
      },
      {
        title: 'Company',
        links: [
          { label: 'About Ikonectt', id: 'about' },
          { label: 'Intelivision Technologies', id: 'about-intelivision' },
          { label: 'Careers', id: 'careers' },
          { label: 'Contact Us', id: 'contact' }
        ]
      }
    ],
    legal: [
      { label: 'Privacy Policy', id: 'privacy' },
      { label: 'Terms of Service', id: 'terms' },
      { label: 'Acceptable Use Policy', id: 'aup' },
      { label: 'Service Level Agreement', id: 'sla' }
    ],
    copyright: '© 2026 Intelivision Technologies Limited. All rights reserved. Ikonectt is a registered trademark of Intelivision Technologies Limited.'
  }
};
