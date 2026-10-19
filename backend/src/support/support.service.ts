import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as C from '../../../contracts';
import { audit, Database } from '../core/database';
import { Actor } from '../identity/access';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SupportService {
  constructor(private readonly db: Database, private readonly notifications: NotificationsService) {}
  create(actor: Actor, customerId: string, input: C.Input<typeof C.CreateTicketRequest>) {
    return this.db.mutate(async tx => {
      const customer = await tx.customer.findUniqueOrThrow({ where: { id: customerId } });
      if (input.subscriptionId && !await tx.subscription.findFirst({ where: { id: input.subscriptionId, customerId } })) throw new NotFoundException('Subscription not found');
      const { message, ...data } = input;
      const ticket = await tx.ticket.create({ data: { ...data, customerId, messages: { create: { authorId: actor.id, message } } }, include: { messages: true } });
      await this.notifications.enqueue(tx, { customerId, destination: customer.email, template: 'TICKET_OPENED', payload: { ticketId: ticket.id } });
      await audit(tx, actor.id, 'ticket.created', 'Ticket', ticket.id);
      return ticket;
    });
  }
  async detail(id: string, customerId?: string) {
    const ticket = await this.db.ticket.findFirst({ where: { id, ...(customerId ? { customerId } : {}) }, include: { messages: { orderBy: { createdAt: 'asc' }, take: 500 } } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }
  message(actor: Actor, id: string, input: C.Input<typeof C.TicketMessageRequest>, customerId?: string) {
    return this.db.mutate(async tx => {
      const ticket = await tx.ticket.findFirst({ where: { id, ...(customerId ? { customerId } : {}) }, include: { customer: true } });
      if (!ticket) throw new NotFoundException('Ticket not found');
      if (ticket.status === 'CLOSED') throw new ConflictException('Ticket is closed');
      const message = await tx.ticketMessage.create({ data: { ticketId: id, authorId: actor.id, message: input.message } });
      await audit(tx, actor.id, 'ticket.message_added', 'Ticket', id);
      if (actor.kind === 'STAFF') await this.notifications.enqueue(tx, { customerId: ticket.customerId, destination: ticket.customer.email, template: 'TICKET_REPLY', payload: { ticketId: id } });
      return message;
    });
  }
  update(actor: Actor, id: string, input: C.Input<typeof C.UpdateTicketRequest>) {
    return this.db.mutate(async tx => {
      if (input.assignedToId) {
        const staff = await tx.user.findFirst({ where: { id: input.assignedToId, kind: 'STAFF', enabled: true, roles: { hasSome: ['ADMIN', 'SUPPORT'] } } });
        if (!staff) throw new BadRequestException('Assignee must be enabled support staff');
      }
      const ticket = await tx.ticket.update({ where: { id }, data: input });
      await audit(tx, actor.id, 'ticket.updated', 'Ticket', id, { status: input.status, ...(input.assignedToId ? { assignedToId: input.assignedToId } : {}) });
      return ticket;
    });
  }
}
