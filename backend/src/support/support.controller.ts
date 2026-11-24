import { Body, Controller, Get, Module, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as C from '../../../contracts';
import { z } from 'zod';
import { Database } from '../core/database';
import { Contract, paginated, present, ZodPipe } from '../core/http';
import { Actor, CurrentActor, CustomerOnly, Require } from '../identity/access';
import { SupportService } from './support.service';

@ApiTags('Customer support') @ApiBearerAuth() @CustomerOnly() @Controller('me/tickets')
export class CustomerSupportController {
  constructor(private readonly db: Database, private readonly support: SupportService) {}
  @Get() @Contract(C.page(C.Ticket), undefined, C.ListQuery)
  async list(@CurrentActor() actor: Actor, @Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) { return present(C.page(C.Ticket), await paginated(this.db.ticket, query, { customerId: actor.customerId })); }
  @Get(':id') @Contract(C.TicketDetail)
  async detail(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string) { return present(C.TicketDetail, await this.support.detail(id, actor.customerId!)); }
  @Post() @Contract(C.TicketDetail, C.CreateTicketRequest)
  async create(@CurrentActor() actor: Actor, @Body(new ZodPipe(C.CreateTicketRequest)) input: C.Input<typeof C.CreateTicketRequest>) { return present(C.TicketDetail, await this.support.create(actor, actor.customerId!, input)); }
  @Post(':id/messages') @Contract(C.TicketMessage, C.TicketMessageRequest)
  async message(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string, @Body(new ZodPipe(C.TicketMessageRequest)) input: C.Input<typeof C.TicketMessageRequest>) { return present(C.TicketMessage, await this.support.message(actor, id, input, actor.customerId!)); }
}
const StaffTicketInput = C.CreateTicketRequest.extend({ customerId: C.Id }).strict();
@ApiTags('Admin support') @ApiBearerAuth() @Controller('admin/tickets')
export class AdminSupportController {
  constructor(private readonly db: Database, private readonly support: SupportService) {}
  @Require('support.read') @Get() @Contract(C.page(C.Ticket), undefined, C.ListQuery)
  async list(@Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) { return present(C.page(C.Ticket), await paginated(this.db.ticket, query)); }
  @Require('support.read') @Get(':id') @Contract(C.TicketDetail)
  async detail(@Param('id', new ZodPipe(C.Id)) id: string) { return present(C.TicketDetail, await this.support.detail(id)); }
  @Require('support.write') @Post() @Contract(C.TicketDetail, StaffTicketInput)
  async create(@CurrentActor() actor: Actor, @Body(new ZodPipe(StaffTicketInput)) input: C.Input<typeof StaffTicketInput>) { return present(C.TicketDetail, await this.support.create(actor, input.customerId, input)); }
  @Require('support.write') @Patch(':id') @Contract(C.Ticket, C.UpdateTicketRequest)
  async update(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string, @Body(new ZodPipe(C.UpdateTicketRequest)) input: C.Input<typeof C.UpdateTicketRequest>) { return present(C.Ticket, await this.support.update(actor, id, input)); }
  @Require('support.write') @Post(':id/messages') @Contract(C.TicketMessage, C.TicketMessageRequest)
  async message(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string, @Body(new ZodPipe(C.TicketMessageRequest)) input: C.Input<typeof C.TicketMessageRequest>) { return present(C.TicketMessage, await this.support.message(actor, id, input)); }
}
@Module({ controllers: [CustomerSupportController, AdminSupportController], providers: [SupportService] })
export class SupportModule {}
