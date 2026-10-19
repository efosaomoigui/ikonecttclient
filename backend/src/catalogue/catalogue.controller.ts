import { Body, Controller, Get, Module, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as C from '../../../contracts';
import { Contract, paginated, present, ZodPipe } from '../core/http';
import { Database } from '../core/database';
import { Actor, CurrentActor, Public, Require } from '../identity/access';
import { CoverageService, PlansService } from './catalogue.service';

@ApiTags('Plans') @Controller('plans')
export class PublicPlansController {
  constructor(private readonly db: Database) {}
  @Public() @Get() @Contract(C.page(C.Plan), undefined, C.ListQuery)
  async list(@Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) { return present(C.page(C.Plan), await paginated(this.db.plan, query, { published: true })); }
  @Public() @Get(':id') @Contract(C.Plan)
  async get(@Param('id', new ZodPipe(C.Id)) id: string) { return present(C.Plan, await this.db.plan.findFirstOrThrow({ where: { id, published: true } })); }
}
@ApiTags('Coverage') @Controller('coverage')
export class PublicCoverageController {
  constructor(private readonly db: Database, private readonly coverage: CoverageService) {}
  @Public() @Get('locations') @Contract(C.page(C.CoverageLocation), undefined, C.CoverageQuery)
  async list(@Query(new ZodPipe(C.CoverageQuery)) query: C.Input<typeof C.CoverageQuery>) {
    const { offset, limit, ...where } = query;
    const [items, total] = await Promise.all([this.db.coverageLocation.findMany({ where, skip: offset, take: limit, orderBy: { name: 'asc' }, include: { plans: true } }), this.db.coverageLocation.count({ where })]);
    return present(C.page(C.CoverageLocation), { items: items.map(item => this.coverage.view(item, false)), total, offset, limit });
  }
  @Public() @Post('check') @Contract(C.CoverageResult, C.CoverageCheckRequest)
  async check(@Body(new ZodPipe(C.CoverageCheckRequest)) input: C.Input<typeof C.CoverageCheckRequest>) {
    const result = await this.coverage.check(input.buildingId, input.planId);
    return present(C.CoverageResult, { ...result.data, buildingId: input.buildingId, source: result.provider, simulated: result.simulated, checkedAt: new Date() });
  }
}
@ApiTags('Admin plans') @ApiBearerAuth() @Controller('admin/plans')
export class AdminPlansController {
  constructor(private readonly db: Database, private readonly plans: PlansService) {}
  @Require('catalogue.write') @Get() @Contract(C.page(C.Plan), undefined, C.ListQuery)
  async list(@Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) { return present(C.page(C.Plan), await paginated(this.db.plan, query)); }
  @Require('catalogue.write') @Post() @Contract(C.Plan, C.PlanInput)
  async create(@CurrentActor() actor: Actor, @Body(new ZodPipe(C.PlanInput)) input: C.Input<typeof C.PlanInput>) { return present(C.Plan, await this.plans.create(actor, input)); }
  @Require('catalogue.write') @Patch(':id') @Contract(C.Plan, C.PlanUpdate)
  async update(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string, @Body(new ZodPipe(C.PlanUpdate)) input: C.Input<typeof C.PlanUpdate>) { return present(C.Plan, await this.plans.update(actor, id, input)); }
}
@ApiTags('Admin coverage') @ApiBearerAuth() @Controller('admin/coverage')
export class AdminCoverageController {
  constructor(private readonly db: Database, private readonly coverage: CoverageService) {}
  @Require('coverage.write') @Get() @Contract(C.page(C.CoverageLocation), undefined, C.CoverageQuery)
  async list(@Query(new ZodPipe(C.CoverageQuery)) query: C.Input<typeof C.CoverageQuery>) {
    const { offset, limit, ...where } = query;
    const [items, total] = await Promise.all([this.db.coverageLocation.findMany({ where, skip: offset, take: limit, orderBy: { name: 'asc' }, include: { plans: true } }), this.db.coverageLocation.count({ where })]);
    return present(C.page(C.CoverageLocation), { items: items.map(item => this.coverage.view(item)), total, offset, limit });
  }
  @Require('coverage.write') @Post() @Contract(C.CoverageLocation, C.CoverageInput)
  async create(@CurrentActor() actor: Actor, @Body(new ZodPipe(C.CoverageInput)) input: C.Input<typeof C.CoverageInput>) { return present(C.CoverageLocation, await this.coverage.create(actor, input)); }
  @Require('coverage.write') @Patch(':id') @Contract(C.CoverageLocation, C.CoverageUpdate)
  async update(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string, @Body(new ZodPipe(C.CoverageUpdate)) input: C.Input<typeof C.CoverageUpdate>) { return present(C.CoverageLocation, await this.coverage.update(actor, id, input)); }
}
@Module({ controllers: [PublicPlansController, AdminPlansController], providers: [PlansService] })
export class PlansModule {}
@Module({ controllers: [PublicCoverageController, AdminCoverageController], providers: [CoverageService], exports: [CoverageService] })
export class CoverageModule {}
