import { summaryView } from "./live.js";
// SIMULATED development fixture. Wire records follow Agent 1 contracts v1.0.0.
export const demoCredentials = {
  accountNumber: "10000001",
  password: "IkonecttDemo!2026",
};
const customerId = "11111111-1111-4111-8111-111111111111",
  planId = "22222222-2222-4222-8222-222222222222",
  buildingId = "33333333-3333-4333-8333-333333333333",
  orderId = "44444444-4444-4444-8444-444444444444",
  paymentId = "55555555-5555-4555-8555-555555555555",
  ticketId = "66666666-6666-4666-8666-666666666666",
  subscriptionId = "77777777-7777-4777-8777-777777777777";
const payment = {
  id: paymentId,
  orderId,
  customerId,
  amountMinor: 3500000,
  currency: "NGN",
  method: "BANK_TRANSFER",
  reference: "TRF-DEMO-OCT-2026",
  status: "CONFIRMED",
  verifiedAt: "2026-10-01T10:00:00Z",
  createdAt: "2026-10-01T09:00:00Z",
};
export const rawFixture = {
  customer: {
    id: customerId,
    accountNumber: "10000001",
    accountNumberSimulated: true,
    kind: "RESIDENTIAL",
    name: "Amara Okafor",
    email: "amara@example.com",
    phone: "+234 800 000 0000",
    status: "ACTIVE",
    buildingId,
    createdAt: "2026-09-01T10:00:00Z",
  },
  plans: [
    {
      id: planId,
      code: "home-connect-100-demo",
      name: "Home Connect 100",
      kind: "RESIDENTIAL",
      priceMinor: 3500000,
      currency: "NGN",
      speedMbps: 100,
      billingDays: 30,
      features: ["Simulated development plan"],
      published: true,
      simulated: true,
      createdAt: "2026-09-01T10:00:00Z",
      updatedAt: "2026-09-01T10:00:00Z",
    },
  ],
  subscriptions: [
    {
      id: subscriptionId,
      customerId,
      planId,
      buildingId,
      status: "ACTIVE",
      startsAt: "2026-10-01T00:00:00Z",
      endsAt: "2026-11-01T00:00:00Z",
      externalServiceId: null,
      simulated: true,
    },
  ],
  orders: [
    {
      id: orderId,
      customerId,
      planId,
      buildingId,
      type: "RENEWAL",
      subscriptionId,
      status: "COMPLETED",
      amountMinor: 3500000,
      currency: "NGN",
      planName: "Home Connect 100",
      billingDays: 30,
      createdAt: "2026-10-01T08:00:00Z",
    },
  ],
  payments: [payment],
  receipts: [
    {
      receiptNumber: "RCT-DEMO-2026-1001",
      payment,
      issuedAt: "2026-10-01T10:00:00Z",
    },
  ],
  tickets: [
    {
      id: ticketId,
      customerId,
      subscriptionId,
      subject: "Evening connection speeds",
      status: "IN_PROGRESS",
      assignedToId: null,
      createdAt: "2026-10-17T10:30:00Z",
      messages: [
        {
          id: "88888888-8888-4888-8888-888888888888",
          ticketId,
          authorId: customerId,
          message:
            "My connection slows down in the evenings. Please help me check the service.",
          createdAt: "2026-10-17T10:30:00Z",
        },
        {
          id: "99999999-9999-4999-8999-999999999999",
          ticketId,
          authorId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          message: "Our support team is reviewing your connection.",
          createdAt: "2026-10-18T09:00:00Z",
        },
      ],
    },
  ],
  notifications: [],
};
export const fixture = summaryView(rawFixture);
