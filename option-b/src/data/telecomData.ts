import {plansFor,planName,priceLabel} from '../../../shared/catalogue.js';
export interface Plan {
  id: string;
  name: string;
  speed: string;
  downloadSpeed: number;
  uploadSpeed?: number;
  audience: 'residential' | 'business';
  popular?: boolean;
  tagline: string;
  features: string[];
  price?: string;
  billingPeriod?: string;
  idealFor: string;
}

// Compatibility for retained prototype components; all values come from the shared preview catalogue.
const legacyPlans=(audience:'residential'|'business'):Plan[]=>plansFor(audience).map(plan=>({
  id:plan.id,name:planName(plan),speed:plan.speedMbps+' Mbps',downloadSpeed:plan.speedMbps,
  audience:plan.audience,tagline:'Published preview; pricing and terms require confirmation.',
  features:plan.verifiedAttributes.map(attribute=>attribute.value),price:priceLabel(plan),
  billingPeriod:'/month',idealFor:'Discuss your address and requirements with Ikonectt.'
}));
export const RESIDENTIAL_PLANS:Plan[]=legacyPlans('residential');
export const BUSINESS_PLANS:Plan[]=legacyPlans('business');

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
