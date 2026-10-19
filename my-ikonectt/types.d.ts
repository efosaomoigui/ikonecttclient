// Customer-facing view models. Agent 1 wire contracts remain authoritative.
export interface Profile {
  id: string;
  accountNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  customerType: string;
  mustChangePassword?: boolean;
}
export interface Service {
  id: string;
  name: string;
  plan: string;
  speedMbps: number | null;
  status: string;
  address: string | null;
  renewalDate: string | null;
  monthlyAmount: number | null;
  currency: string;
  usage: number | null;
}
export interface Bill {
  id: string;
  reference: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
}
export interface Receipt {
  id: string;
  reference: string;
  billReference: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string;
  method: string;
}
export interface TicketInput {
  subject: string;
  description: string;
}
export interface Ticket extends TicketInput {
  id: string;
  reference: string;
  category?: string | null;
  status: string;
  createdAt: string;
  updates: { at: string; message: string }[];
}
export interface Summary {
  profile: Profile;
  services: Service[];
  bills: Bill[];
  receipts: Receipt[];
  tickets: Ticket[];
  simulated?: boolean;
  notifications?: {
    id: string;
    channel: string;
    createdAt: string;
    simulated: boolean;
    status: string;
  }[];
}
export interface PortalAdapter {
  session(): Promise<Profile>;
  resume(): Promise<Profile>;
  login(accountNumber: string, password: string): Promise<Profile>;
  logout(): Promise<void>;
  recover(accountNumber: string): Promise<{ message: string }>;
  resetPassword(token: string, password: string): Promise<void>;
  summary(): Promise<Summary>;
  createTicket(input: TicketInput): Promise<Ticket>;
  changePassword(current: string, next: string): Promise<void>;
  capabilities: { notifications: boolean; chat: boolean };
}
