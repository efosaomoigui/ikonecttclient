import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/core/crypto';
import { CreateStaffRequest } from '../../contracts';
import { Config } from '../src/core/config';

async function main() {
  new Config();
  const input = CreateStaffRequest.parse({ name: 'Initial Administrator', email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD, roles: ['ADMIN'] });
  const db = new PrismaClient();
  try {
    const existing = await db.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) {
      if (existing.kind !== 'STAFF' || !existing.enabled || !existing.roles.includes('ADMIN')) throw new Error('Configured bootstrap email belongs to a non-administrator or disabled account; review it without overwriting credentials');
      console.log('Administrator already exists; credentials were not overwritten'); return;
    }
    await db.$transaction(async tx => {
      const user = await tx.user.create({ data: { kind: 'STAFF', name: input.name, email: input.email.toLowerCase(), roles: ['ADMIN'], passwordHash: await hashPassword(input.password), mustChangePassword: true } });
      await tx.auditLog.create({ data: { actorId: user.id, action: 'staff.bootstrap', entityType: 'User', entityId: user.id } });
    });
    console.log('Administrator created; password change required at first login. No customer, catalogue or coverage data was seeded.');
  } finally { await db.$disconnect(); }
}
main().catch(error => { console.error(error instanceof Error ? error.name + ': seed failed; verify explicit seed variables and database configuration' : 'Seed failed'); process.exitCode = 1; });
