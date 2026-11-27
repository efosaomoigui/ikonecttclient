import {ClientCatalogue} from '../catalogue/client-catalogue.service';
import { createHash } from 'node:crypto';
import { BadRequestException, ConflictException, Body, Controller, Get, Module, Param, Patch, Post, Query } from '@nestjs/common';
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
  constructor(private readonly db: Database, private readonly coverage: CoverageService,private readonly client:ClientCatalogue) {}
  @Public() @Post() @Throttle({ default: { limit: 5, ttl: 60_000 } }) @Contract(z.object({ id: C.Id, status: C.LeadStatus }), C.CreateLeadRequest)
  async create(@Body(new ZodPipe(C.CreateLeadRequest)) input: C.Input<typeof C.CreateLeadRequest>) {
    const {website,idempotencyKey,...data}=input;
    const requestHash=createHash('sha256').update(JSON.stringify(data)).digest('hex');
    if(idempotencyKey){const existing=await this.db.lead.findUnique({where:{idempotencyKey}});if(existing){if(existing.requestHash!==requestHash)throw new ConflictException('Submission reference is already used for different details');return {id:existing.id,status:existing.status};}}
    const clientPlan=this.client.enabled&&input.planId?await this.client.plan(input.planId):null;
    if(clientPlan&&clientPlan.kind!==input.kind)throw new BadRequestException('Selected plan does not match the customer type');
    const lead = await this.db.mutate(async tx => {
      if (idempotencyKey) {
        const previous = await tx.lead.findUnique({where:{idempotencyKey}});
        if (previous) {
          if (previous.requestHash !== requestHash) throw new ConflictException('Submission reference is already used for different details');
          return previous;
        }
      }
      if (input.buildingId) {this.client.requireInternal();await this.coverage.building(tx, input.buildingId);}
      if (input.planId && !clientPlan && !await tx.plan.findFirst({ where: { id: input.planId, published: true, kind: input.kind } })) throw new BadRequestException('Published plan for this customer type is required');
      const record = await tx.lead.create({ data: {...data,...(clientPlan?{planId:null,clientPlanReference:clientPlan.externalId,clientPlanName:clientPlan.name}:{}), idempotencyKey, requestHash, activity:{create:{action:'SUBMITTED'}}} });
      await audit(tx, null, 'lead.submitted', 'Lead', record.id);
      return record;
    });
    return { id: lead.id, status: lead.status };
  }
}
@ApiTags('Admin leads') @ApiBearerAuth() @Controller('admin/leads')
export class AdminLeadsController {
  constructor(private readonly db: Database) {}
  @Require('leads.read') @Get() @Contract(C.page(C.Lead), undefined, C.LeadQuery)
  async list(@Query(new ZodPipe(C.LeadQuery)) query: C.Input<typeof C.LeadQuery>) {
    const {search, category, status, kind, sourceChannel, assignedToId, sort, direction, offset, limit} = query;
    const where = {category,status,kind,sourceChannel,assignedToId,...(search?{OR:['name','email','phone','message','sourcePage'].map(key=>({[key]:{contains:search,mode:'insensitive'}}))}:{})};
    return present(C.page(C.Lead), await paginated(this.db.lead, {offset,limit}, where, {orderBy:[{[sort]:direction},{id:'asc'}]}));
  }
  @Require('leads.read') @Get('assignees') @Contract(z.array(z.object({id:C.Id,name:z.string()})))
  async assignees(){return this.db.user.findMany({where:{kind:'STAFF',enabled:true,roles:{hasSome:['ADMIN','SALES','SUPPORT']}},select:{id:true,name:true},orderBy:{name:'asc'},take:500});}
  @Require('leads.read') @Get(':id') @Contract(C.LeadDetail)
  async get(@Param('id', new ZodPipe(C.Id)) id: string) { return present(C.LeadDetail, await this.db.lead.findUniqueOrThrow({ where: { id }, include:{activity:{orderBy:{createdAt:'asc'}}} })); }
  @Require('leads.write') @Patch(':id') @Contract(C.Lead, C.UpdateLeadRequest)
  async update(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string, @Body(new ZodPipe(C.UpdateLeadRequest)) input: C.Input<typeof C.UpdateLeadRequest>) {
    return present(C.Lead, await this.db.mutate(async tx => {
      const {internalNote,...data}=input;
      if(data.assignedToId && !await tx.user.findFirst({where:{id:data.assignedToId,kind:'STAFF',enabled:true,roles:{hasSome:['ADMIN','SALES','SUPPORT']}}})) throw new BadRequestException('Assignee must be an enabled staff member');
      const lead=await tx.lead.update({where:{id},data:{...data,activity:{create:{actorId:actor.id,action:Object.entries(data).map(([key,value])=>`${key}: ${value ?? 'Unassigned'}`).join('; ') || 'NOTE_ADDED',note:internalNote}}}});
      await audit(tx, actor.id, 'lead.updated', 'Lead', id, {fields:Object.keys(input)});
      return lead;
    }));
  }
}
@Module({ imports: [CoverageModule], controllers: [LeadsController, AdminLeadsController] })
export class LeadsModule {}
