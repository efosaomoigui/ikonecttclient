export type PageId = 'home' | 'residential' | 'business' | 'coverage' | 'support' | 'about' | 'my-ikonectt';

export interface CoverageQueryState {
  state: string;
  lga: string;
  estate: string;
  streetAddress: string;
  status: 'available' | 'planned' | 'pending';
  planSelected?: string;
  ticketId?: string;
}

export interface PlanItem {
  id: string;
  name: string;
  tagline: string;
  speed: number;
  speedUnit: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  features: string[];
  specs: {
    dataCap: string;
    targetDevices: string;
    hardware: string;
    support: string;
  };
}

export interface BusinessSolution {
  id: string;
  name: string;
  badge: string;
  metric: string;
  metricSub: string;
  description: string;
  features: string[];
  flagship?: boolean;
}
