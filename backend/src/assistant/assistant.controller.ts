import { Body, Controller, Get, Module, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import * as C from '../../../contracts';
import { Contract, ZodPipe } from '../core/http';
import { Public } from '../identity/access';
import { Adapters } from '../integrations/adapters';

// This initial boundary never receives credentials or invokes write services.
// Adding account read tools later requires an authenticated, customer-scoped handler.
export interface AssistantProvider { guide(message: string): Promise<C.Input<typeof C.AssistantResponse>>; }
@ApiTags('Assistant and capabilities') @Controller()
export class AssistantController {
  constructor(private readonly adapters: Adapters) {}
  @Public() @Get('capabilities') @Contract(z.record(z.string()))
  capabilities() { return this.adapters.capabilities(); }
  @Public() @Post('assistant/guidance') @Throttle({ default: { limit: 10, ttl: 60_000 } }) @Contract(C.AssistantResponse, C.AssistantRequest)
  guidance(@Body(new ZodPipe(C.AssistantRequest)) input: C.Input<typeof C.AssistantRequest>): C.Input<typeof C.AssistantResponse> {
    const message = input.message.toLowerCase();
    const payment = /pay|refund|renew|activat/.test(message);
    const coverage = /cover|address|location/.test(message);
    return {
      answer: payment ? 'Payment reports need verification by authorized staff. Service activation is confirmed separately. Sign in to review your order or contact support.' : coverage ? 'Check eligibility for your building/address. An unknown result needs staff verification before placing an order.' : 'Explore published plans, check your building coverage, or contact support. Customer accounts are issued by Ikonectt staff.',
      links: payment ? [{ label: 'My payments', path: '/me/payments' }, { label: 'Contact support', path: '/me/tickets' }] : coverage ? [{ label: 'Check coverage', path: '/coverage/check' }] : [{ label: 'Plans', path: '/plans' }, { label: 'Contact support', path: '/me/tickets' }],
      escalationAvailable: true, sensitiveActionsAllowed: false, simulated: false,
    };
  }
}
@Module({ controllers: [AssistantController] })
export class AssistantModule {}
