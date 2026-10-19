import { existsSync, readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { developmentFixtures as F } from '../../contracts/fixtures';
import { Database, audit } from '../src/core/database';
import { hashPassword } from '../src/core/crypto';
import { IdentityService } from '../src/identity/identity.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { Adapters } from '../src/integrations/adapters';
import { DevelopmentAccounts, developmentContext, saveAccounts } from './development-context';

async function main() {
  const context = developmentContext();
  const db = new Database(context.config);
  const notifications = new NotificationsService(db, context.config, new Adapters(context.config));
  const identity = new IdentityService(db, context.config, notifications);
  const accounts: DevelopmentAccounts = existsSync(context.accountsFile) ? JSON.parse(readFileSync(context.accountsFile,'utf8')) : {
    dataset: F.dataset, database: context.database,
    staff: F.staff.map(staff => ({ ...staff, password: randomUUID() + randomUUID(), mustChangePassword: true })),
    customers: F.customers.map(customer => ({ id: customer.id, accountNumber: customer.accountNumber })),
  };
  if (accounts.dataset !== F.dataset || accounts.database !== context.database) throw new Error('Fixture account manifest does not match the development database');
  // Persist unique generated fixture credentials before writing hashes; never print passwords/tokens.
  saveAccounts(context.accountsFile,accounts);
  try {
    const hashes = new Map(await Promise.all(accounts.staff.map(async staff => [staff.id,await hashPassword(staff.password)] as const)));
    await db.$transaction(async tx => {
      for (const staff of F.staff) {
        const account = accounts.staff.find(account => account.id === staff.id)!;
        await tx.user.upsert({ where: { id: staff.id }, update: {}, create: { id: staff.id, kind: 'STAFF', name: staff.name, email: staff.email, roles: [staff.role], passwordHash: hashes.get(staff.id), mustChangePassword: account.mustChangePassword } });
      }
      const actorId = F.staff.find(staff => staff.role === 'ADMIN')!.id;
      for (const plan of F.plans) await tx.plan.upsert({ where: { id: plan.id }, update: {}, create: { ...plan, priceMinor: BigInt(plan.priceMinor), simulated: true } });
      for (const location of F.locations) {
        const { planIds, ...data } = location;
        await tx.coverageLocation.upsert({ where: { id: location.id }, update: {}, create: { ...data, simulated: true, plans: { create: planIds.map(planId => ({ planId })) } } });
      }
      for (const customer of F.customers) {
        const record = await tx.customer.upsert({ where: { id: customer.id }, update: {}, create: customer });
        const account = accounts.customers.find(account => account.id === customer.id)!;
        account.accountNumber = record.accountNumber;
        const user = await tx.user.upsert({ where: { customerId: customer.id }, update: {}, create: { name: customer.name, kind: 'CUSTOMER', customerId: customer.id, mustChangePassword: true } });
        if (!user.passwordHash && (!account.setupToken || !account.setupExpiresAt || new Date(account.setupExpiresAt) <= new Date())) {
          account.setupToken = await identity.createSetup(tx,user.id);
          account.setupExpiresAt = new Date(Date.now()+30*60_000).toISOString();
          await notifications.enqueue(tx, { customerId: customer.id, destination: customer.email, template: 'SIMULATED_ACCOUNT_SETUP', payload: { token: account.setupToken, accountNumber: record.accountNumber, expiresInMinutes: 30, simulated: true } });
        }
      }
      for (const scenario of F.scenarios) {
        if (scenario.subscription) await tx.subscription.upsert({ where: { id: scenario.subscription.id }, update: {}, create: scenario.subscription });
        await tx.order.upsert({ where: { id: scenario.order.id }, update: {}, create: { ...scenario.order, amountMinor: BigInt(scenario.order.amountMinor) } });
        await tx.payment.upsert({ where: { id: scenario.payment.id }, update: {}, create: { ...scenario.payment, method: 'BANK_TRANSFER', amountMinor: BigInt(scenario.payment.amountMinor) } });
        if (scenario.provisioning) await tx.provisioningRequest.upsert({ where: { id: scenario.provisioning.id }, update: {}, create: { ...scenario.provisioning, evidence: 'SIMULATED scenario history, not a live provider result', verifiedById: scenario.provisioning.status === 'PENDING' ? null : F.staff.find(staff => staff.role === 'PROVISIONER')!.id, verifiedAt: scenario.provisioning.status === 'PENDING' ? null : new Date(F.createdAt) } });
      }
      for (const ticket of F.tickets) {
        await tx.ticket.upsert({ where: { id: ticket.id }, update: {}, create: ticket });
        if (!await tx.ticketMessage.count({ where: { ticketId: ticket.id } })) await tx.ticketMessage.create({ data: { ticketId: ticket.id, authorId: actorId, message: 'SIMULATED development conversation. No real support request was submitted.' } });
      }
      for (const lead of F.leads) await tx.lead.upsert({ where: { id: lead.id }, update: {}, create: lead });
      if (!await tx.auditLog.findFirst({ where: { action: 'development.fixtures_initialized', entityId: F.dataset } })) await audit(tx,actorId,'development.fixtures_initialized','DevelopmentDataset',F.dataset,{ simulated: true, fixtureVersion: 1 });
    }, { timeout: 30_000 });
    saveAccounts(context.accountsFile,accounts);
    console.log(JSON.stringify({ dataset: F.dataset, simulated: true, plans: F.plans.length, customers: F.customers.length, staffRoles: F.staff.length, locations: F.locations.length, scenarios: F.scenarios.length, accountInstructions: 'Open the ignored .local/development/accounts-<database>.json locally; never commit or message credentials. Staff must change initial passwords. Customer setup tokens expire in 30 minutes.' }));
  } finally { await db.$disconnect(); }
}
main().catch(error => { console.error(error instanceof Error ? `${error.name}: development fixture initialization failed; check owned environment, migrations and manifest` : 'Fixture initialization failed'); process.exitCode = 1; });
