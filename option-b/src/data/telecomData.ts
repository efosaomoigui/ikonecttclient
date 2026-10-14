export interface Plan {
  id: string;
  name: string;
  speed: string;
  downloadSpeed: number;
  uploadSpeed: number;
  audience: 'residential' | 'business';
  popular?: boolean;
  tagline: string;
  features: string[];
  price?: string;
  billingPeriod?: string;
  idealFor: string;
}

export const RESIDENTIAL_PLANS: Plan[] = [
  {
    id: 'res-start',
    name: 'Connect Start',
    speed: '50 Mbps',
    downloadSpeed: 50,
    uploadSpeed: 50,
    audience: 'residential',
    tagline: 'Pure, reliable fibre for everyday streaming and remote study.',
    features: [
      'Truly uncapped & unthrottled bandwidth',
      'Symmetric upload and download rates',
      'Dual-band Wi-Fi 6 router included',
      '24/7 priority network monitoring',
    ],
    price: '₦21,500',
    billingPeriod: '/month',
    idealFor: '1–4 connected devices & HD video streaming',
  },
  {
    id: 'res-home',
    name: 'Connect Home',
    speed: '100 Mbps',
    downloadSpeed: 100,
    uploadSpeed: 100,
    audience: 'residential',
    popular: true,
    tagline: 'High-speed gigabit entertainment for modern households.',
    features: [
      'Truly uncapped & unthrottled bandwidth',
      'Simultaneous 4K Ultra HD streaming',
      'Sub-15ms low-latency gaming priority',
      'Wi-Fi 6 mesh-ready optical terminal',
      'Free standard optical installation',
    ],
    price: '₦32,500',
    billingPeriod: '/month',
    idealFor: '5–10 active devices, multiplayer gaming & home office',
  },
  {
    id: 'res-plus',
    name: 'Connect Plus',
    speed: '200 Mbps',
    downloadSpeed: 200,
    uploadSpeed: 200,
    audience: 'residential',
    tagline: 'Uncompromising speed for heavy downloaders & creators.',
    features: [
      'Truly uncapped & unthrottled bandwidth',
      'Zero buffering across multiple 4K/8K screens',
      'Accelerated cloud backup & uploads',
      'Premium dual-band gigabit router',
      'Priority home technical support',
    ],
    price: '₦54,000',
    billingPeriod: '/month',
    idealFor: 'Smart homes, content creators & intensive workloads',
  },
  {
    id: 'res-extreme',
    name: 'Connect Gigabit',
    speed: '500 Mbps',
    downloadSpeed: 500,
    uploadSpeed: 500,
    audience: 'residential',
    tagline: 'Nigeria’s pinnacle residential optical performance tier.',
    features: [
      'Full uncompressed gigabit backbone pipeline',
      'Zero fair-usage limits or speed throttling',
      'Tri-Band Wi-Fi 6E whole-home optical gateway',
      'Dedicated residential account specialist',
      'Guaranteed SLA latency response',
    ],
    price: '₦98,000',
    billingPeriod: '/month',
    idealFor: 'Power users, digital studios & whole-mansion coverage',
  },
];

export const BUSINESS_PLANS: Plan[] = [
  {
    id: 'biz-essential',
    name: 'Business Essential',
    speed: '100 Mbps',
    downloadSpeed: 100,
    uploadSpeed: 100,
    audience: 'business',
    tagline: 'Dependable, unmetered connectivity for emerging offices.',
    features: [
      'Dedicated symmetric optical pipeline',
      '1 Public Static IPv4 address included',
      '99.5% Service Level Agreement (SLA)',
      'Enterprise business voice support ready',
      'Standard 8-hour restoration guarantee',
    ],
    price: '₦58,000',
    billingPeriod: '/month',
    idealFor: 'Teams up to 15 workstations, SaaS & cloud communications',
  },
  {
    id: 'biz-pro',
    name: 'Business Pro',
    speed: '250 Mbps',
    downloadSpeed: 250,
    uploadSpeed: 250,
    audience: 'business',
    popular: true,
    tagline: 'Mission-critical enterprise bandwidth with high-tier SLA.',
    features: [
      'Dedicated 1:1 contention symmetric pipe',
      '2 Public Static IPv4 addresses',
      '99.9% Network Uptime Guarantee',
      '4-Hour MTTR priority on-site engineering',
      'Dedicated B2B account manager & portal',
      'Redundant fiber ring failover routing',
    ],
    price: '₦125,000',
    billingPeriod: '/month',
    idealFor: 'Growing enterprises, financial tech & media agencies',
  },
  {
    id: 'biz-enterprise',
    name: 'Enterprise Dedicated',
    speed: '500 Mbps – 1 Gbps',
    downloadSpeed: 1000,
    uploadSpeed: 1000,
    audience: 'business',
    tagline: 'Bespoke optical infrastructure with custom dark fiber routing.',
    features: [
      'Direct Point-to-Point dark fiber circuit',
      'Custom IP subnet (/29 or /28 allocations)',
      '99.99% carrier-grade financial SLA',
      '2-Hour emergency resolution protocol',
      'Direct peering with West African internet exchanges',
    ],
    price: 'Custom Quote',
    billingPeriod: 'Tailored',
    idealFor: 'Corporate headquarters, data centres & multi-branch firms',
  },
];

export interface CoverageArea {
  state: string;
  areas: {
    name: string;
    status: 'Ready Now' | 'Live' | 'Expanding';
    estates: string[];
  }[];
}

export const COVERAGE_AREAS: CoverageArea[] = [
  {
    state: 'Lagos State',
    areas: [
      {
        name: 'Victoria Island & Oniru',
        status: 'Ready Now',
        estates: ['Adeola Odeku', 'Ahmadu Bello Way', 'Kofo Abayomi', 'Water Corporation Drive', 'Oniru Private Estate'],
      },
      {
        name: 'Ikoyi & Banana Island',
        status: 'Ready Now',
        estates: ['Banana Island Zone A-F', 'Parkview Estate', 'Bouridillon Road', 'Alexander Avenue', 'Old Ikoyi Crescent'],
      },
      {
        name: 'Lekki Peninsula (Phases 1 & 2)',
        status: 'Ready Now',
        estates: ['Lekki Phase 1', 'Admiralty Way', 'Richmond Gate', 'Nicon Town', 'Friends Colony', 'Chevron Drive', 'Twin Lakes'],
      },
      {
        name: 'Ikeja & Mainland Hubs',
        status: 'Ready Now',
        estates: ['Ikeja GRA', 'Isaac John Street', 'Opebi Commercial Strip', 'Allen Avenue', 'Maryland Crescent', 'Magodo Shangisha Phase 2'],
      },
      {
        name: 'Surulere & Yaba Tech Cluster',
        status: 'Live',
        estates: ['Herbert Macaulay Way', 'Alagomeji', 'Bode Thomas', 'Adeniran Ogunsanya', 'Shitta Estate'],
      },
    ],
  },
  {
    state: 'Abuja (FCT)',
    areas: [
      {
        name: 'Maitama & Ministers Hill',
        status: 'Ready Now',
        estates: ['Aguiyi Ironsi', 'Gana Street', 'Mississippi Street', 'Osborne Foothills Maitama'],
      },
      {
        name: 'Wuse II & Central District',
        status: 'Ready Now',
        estates: ['Adetokunbo Ademola Crescent', 'Aminu Kano Crescent', 'Cedi Plaza District'],
      },
      {
        name: 'Asokoro & Guzape Hills',
        status: 'Ready Now',
        estates: ['Yakubu Gowon Crescent', 'Asokoro Extension', 'Guzape Diplomatic Enclave'],
      },
    ],
  },
  {
    state: 'Rivers (Port Harcourt)',
    areas: [
      {
        name: 'Old & New GRA',
        status: 'Live',
        estates: ['Tombia Street', 'Forces Avenue', 'Birabi Street', 'Peter Odili Commercial Corridor'],
      },
    ],
  },
];

export const NEWS_EDITORIAL = [
  {
    id: 'news-1',
    category: 'Network Expansion',
    title: 'Ikonectt Accelerates 100% Pure Optical Reach Across Key Lekki & Ikeja Corridors',
    date: 'October 2026',
    readTime: '3 min read',
    excerpt: 'Deepening our underground duct infrastructure to connect over 18,000 new residential and commercial properties with uninterrupted gigabit speeds.',
  },
  {
    id: 'news-2',
    category: 'Customer Experience',
    title: 'Introducing Next-Gen Wi-Fi 6 Optical Gateways for All New Residential Activations',
    date: 'September 2026',
    readTime: '4 min read',
    excerpt: 'Delivering whole-home wall-to-wall signal consistency, sub-15ms gaming response, and seamless multi-device 4K streaming.',
  },
  {
    id: 'news-3',
    category: 'Enterprise Insight',
    title: 'Powering Nigeria’s Digital Creative Economy with Carrier-Grade Dark Fibre Routing',
    date: 'August 2026',
    readTime: '5 min read',
    excerpt: 'How Lagos tech hubs and creative studios rely on symmetrical gigabit connections to collaborate on real-time 3D pipelines.',
  },
];
