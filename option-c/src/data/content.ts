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
      description: 'Stream in 4K, work remotely without latency spikes, and connect every smart device across your home.'
    },
    business: {
      title: 'At Work',
      line: 'Connectivity for business.',
      cta: 'Explore Business',
      description: 'Reliable high-throughput optical networks tailored for corporate offices, commercial hubs, and modern teams.'
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
        description: 'High-speed optical fibre connectivity for families, remote professionals, and content creators.',
        features: [
          'Symmetric high-speed upload and download',
          'Unlimited monthly data with zero throttling',
          'Modern Wi-Fi 6 optical terminal equipment',
          '24/7 dedicated customer care support'
        ],
        cta: 'View Residential Plans'
      },
      {
        id: 'business',
        title: 'Business Plans',
        subtitle: 'At Work',
        description: 'Enterprise broadband designed to sustain continuous commercial productivity and cloud workflows.',
        features: [
          'Guaranteed bandwidth capacity & dedicated throughput',
          'Service level agreements (SLA) with priority response',
          'Static IP addressing & multi-office networking options',
          'Dedicated corporate account manager'
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
      'Modern Nigerian households run on constant connectivity. From seamless remote collaboration and cloud backups to high-definition video streaming and competitive online gaming, your broadband must keep pace with everyone under your roof.',
      'Ikonectt optical fibre delivers true symmetrical performance, meaning uploading client presentations is as lightning-fast as streaming your favorite shows.'
    ],
    cta: 'Explore Residential'
  },

  businessEditorial: {
    heading: 'Keep your business connected.',
    supportingLine: 'Explore broadband solutions for your business needs.',
    paragraphs: [
      'In a competitive economy, downtime is costly. Ikonectt provides enterprise optical infrastructure built on redundant routing architectures and proactive line monitoring.',
      'Whether you operate a burgeoning creative agency, a multi-story headquarters, or distributed branches, our business solutions scale effortlessly with your headcount and bandwidth requirements.'
    ],
    cta: 'Explore Business'
  },

  coverageAction: {
    heading: 'Is Ikonectt available at your address?',
    supportingLine: 'Check service availability in your area.',
    cta: 'Check Coverage',
    verifiedHubs: [
      { city: 'Lagos', areas: 'Ikoyi, Victoria Island, Lekki Phase 1, Ikeja GRA, Magodo' },
      { city: 'Abuja (FCT)', areas: 'Maitama, Asokoro, Wuse 2, Jabi, Gwarinpa' },
      { city: 'Port Harcourt', areas: 'Old GRA, Peter Odili Corridor, Trans-Amadi' },
      { city: 'Edo State', areas: 'Benin City Core Commercial & Residential Corridors' }
    ]
  },

  myIkonectt: {
    heading: 'Your connection. Your control.',
    supportingLine: 'Manage your services, payments and support through My Ikonectt.',
    description: 'Designed exclusively for registered Ikonectt subscribers, the My Ikonectt self-service portal provides instant access to billing statements, automated renewals, live line health status, and direct technical escalation.',
    cta: 'Go to My Ikonectt',
    note: 'Protected subscriber portal. Public registration is not required for general enquiries.'
  },

  support: {
    heading: 'Here when you need us.',
    supportingLine: 'Find answers, get help and reach the right team.',
    channels: [
      { title: '24/7 Telephone Care', detail: '+234 (0) 1 888 IKONECTT', sub: 'Instant technical escalation' },
      { title: 'Dedicated Helpdesk Email', detail: 'support@ikonectt.com', sub: 'Guaranteed ticket response' },
      { title: 'WhatsApp Live Concierge', detail: '+234 800 000 0000', sub: 'Fast on-demand messaging' }
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
