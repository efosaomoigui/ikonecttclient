import { BadRequestException, Body, Controller, Get, Module, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import * as C from '../../../contracts';
import { audit, Database } from '../core/database';
import { Contract, paginated, present, ZodPipe } from '../core/http';
import { Actor, CurrentActor, Public, Require } from '../identity/access';
import { CoverageModule } from '../catalogue/catalogue.controller';
import { CoverageService } from '../catalogue/catalogue.service';

@ApiTags('Leads') @Controller('leads')
export class LeadsController {
  constructor(private readonly db: Database, private readonly coverage: CoverageService) {}
  @Public() @Post() @Throttle({ default: { limit: 5, ttl: 60_000 } }) @Contract(z.object({ id: C.Id, status: C.LeadStatus }), C.CreateLeadRequest)
  async create(@Body(new ZodPipe(C.CreateLeadRequest)) input: C.Input<typeof C.CreateLeadRequest>) {
    const lead = await this.db.mutate(async tx => {
      if (input.buildingId) await this.coverage.building(tx, input.buildingId);
      if (input.planId && !await tx.plan.findFirst({ where: { id: input.planId, published: true, kind: input.kind } })) throw new BadRequestException('Published plan for this customer type is required');
      const record = await tx.lead.create({ data: input });
      await audit(tx, null, 'lead.submitted', 'Lead', record.id);
      return record;
    });
    return { id: lead.id, status: lead.status };
  }
}
@ApiTags('Admin leads') @ApiBearerAuth() @Controller('admin/leads')
export class AdminLeadsController {
  constructor(private readonly db: Database) {}
  @Require('leads.read') @Get() @Contract(C.page(C.Lead), undefined, C.ListQuery)
  async list(@Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) { return present(C.page(C.Lead), await paginated(this.db.lead, query)); }
  @Require('leads.read') @Get(':id') @Contract(C.Lead)
  async get(@Param('id', new ZodPipe(C.Id)) id: string) { return present(C.Lead, await this.db.lead.findUniqueOrThrow({ where: { id } })); }
  @Require('leads.write') @Patch(':id') @Contract(C.Lead, C.UpdateLeadRequest)
  async update(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string, @Body(new ZodPipe(C.UpdateLeadRequest)) input: C.Input<typeof C.UpdateLeadRequest>) {
    return present(C.Lead, await this.db.mutate(async tx => { const lead = await tx.lead.update({ where: { id }, data: input }); await audit(tx, actor.id, 'lead.updated', 'Lead', id, { status: input.status }); return lead; }));
  }
}
@Module({ imports: [CoverageModule], controllers: [LeadsController, AdminLeadsController] })
export class LeadsModule {}
