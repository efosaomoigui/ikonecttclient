import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import * as C from '../../../contracts';
import { audit, Database, Tx } from '../core/database';
import { Actor } from '../identity/access';
import { CoverageProvider, ProviderResult, Simulator } from '../integrations/adapters';
import { Config } from '../core/config';

const levels = C.CoverageLevel.options;
@Injectable()
export class CoverageService implements CoverageProvider {
  constructor(private readonly db: Database, private readonly config: Config) {}
  async building(tx: Tx, id: string) {
    const building = await tx.coverageLocation.findUnique({ where: { id }, include: { plans: true } });
    if (!building || building.level !== 'BUILDING_ADDRESS') throw new BadRequestException('A building/address location is required');
    return building;
  }
  async check(buildingId: string, planId?: string): Promise<ProviderResult<{ eligibility: C.Input<typeof C.Eligibility>; planIds: string[] }>> {
    if (this.config.values.COVERAGE_ADAPTER === 'disabled') throw new ServiceUnavailableException('Coverage provider is not connected');
    if (this.config.values.COVERAGE_ADAPTER === 'simulated') new Simulator(this.config.values.SIMULATOR_SCENARIO).check();
    const location = await this.db.coverageLocation.findUnique({ where: { id: buildingId }, include: { plans: { include: { plan: true } } } });
    if (!location || location.level !== 'BUILDING_ADDRESS') throw new NotFoundException('Building/address not found');
    const planIds = location.plans.filter(link => link.plan.published).map(link => link.planId);
    const eligibility = location.eligibility === 'AVAILABLE' && planId && !planIds.includes(planId) ? 'REQUIRES_REVIEW' : location.eligibility;
    const simulated = location.simulated || this.config.values.COVERAGE_ADAPTER === 'simulated';
    return { data: { eligibility, planIds }, simulated, provider: simulated ? 'SIMULATED' : 'NATIVE' };
  }
  async create(actor: Actor, input: C.Input<typeof C.CoverageInput>) {
    return this.db.mutate(async tx => {
      if (input.level === 'COUNTRY') { if (input.parentId) throw new BadRequestException('Country cannot have a parent'); }
      else {
        const parent = input.parentId ? await tx.coverageLocation.findUnique({ where: { id: input.parentId } }) : null;
        if (!parent || levels.indexOf(parent.level) !== levels.indexOf(input.level) - 1) throw new BadRequestException('Parent must be the preceding coverage level');
      }
      if (input.level !== 'BUILDING_ADDRESS' && (input.eligibility !== 'UNKNOWN' || input.planIds.length)) throw new BadRequestException('Eligibility and plans are assigned only at building/address level');
      if (input.eligibility !== 'UNKNOWN' && !input.evidence?.trim()) throw new BadRequestException('Coverage verification evidence is required');
      const { planIds, ...data } = input;
      const location = await tx.coverageLocation.create({ data: { ...data, verifiedAt: input.eligibility !== 'UNKNOWN' ? new Date() : null, plans: { create: planIds.map(planId => ({ planId })) } }, include: { plans: true } });
      await audit(tx, actor.id, 'coverage.created', 'CoverageLocation', location.id);
      return this.view(location);
    });
  }
  async update(actor: Actor, id: string, input: C.Input<typeof C.CoverageUpdate>) {
    return this.db.mutate(async tx => {
      await this.building(tx, id);
      await tx.coveragePlan.deleteMany({ where: { locationId: id } });
      const { planIds, ...data } = input;
      const location = await tx.coverageLocation.update({ where: { id }, data: { ...data, verifiedAt: new Date(), plans: { create: planIds.map(planId => ({ planId })) } }, include: { plans: true } });
      await audit(tx, actor.id, 'coverage.verified', 'CoverageLocation', id, { eligibility: input.eligibility });
      return this.view(location);
    });
  }
  view(location: any, staff = true) { const { plans, ...data } = location; return { ...data, evidence: staff ? data.evidence : null, planIds: plans.map((link: any) => link.planId) }; }
}
@Injectable()
export class PlansService {
  constructor(private readonly db: Database) {}
  create(actor: Actor, input: C.Input<typeof C.PlanInput>) {
    return this.db.mutate(async tx => {
      const plan = await tx.plan.create({ data: { ...input, priceMinor: BigInt(input.priceMinor) } });
      await audit(tx, actor.id, 'plan.created', 'Plan', plan.id);
      return plan;
    });
  }
  update(actor: Actor, id: string, input: C.Input<typeof C.PlanUpdate>) {
    return this.db.mutate(async tx => {
      const plan = await tx.plan.update({ where: { id }, data: { ...input, priceMinor: input.priceMinor === undefined ? undefined : BigInt(input.priceMinor) } });
      await audit(tx, actor.id, 'plan.updated', 'Plan', id, { fields: Object.keys(input) });
      return plan;
    });
  }
}
