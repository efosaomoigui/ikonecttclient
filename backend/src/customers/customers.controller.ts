import { Body, Controller, Get, Module, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import * as C from '../../../contracts';
import { Database } from '../core/database';
import { Contract, paginated, present, ZodPipe } from '../core/http';
import { Actor, CurrentActor, CustomerOnly, Require } from '../identity/access';
import { IdentityModule } from '../identity/identity.controller';
import { CoverageModule } from '../catalogue/catalogue.controller';
import { CustomersService } from './customers.service';

@ApiTags('Customer profile') @ApiBearerAuth() @CustomerOnly() @Controller('me')
export class ProfileController {
  constructor(private readonly customers: CustomersService) {}
  @Get('profile') @Contract(C.Customer)
  async get(@CurrentActor() actor: Actor) { return present(C.Customer, await this.customers.profile(actor.customerId!)); }
  @Patch('profile') @Contract(C.Customer, C.UpdateProfileRequest)
  async update(@CurrentActor() actor: Actor, @Body(new ZodPipe(C.UpdateProfileRequest)) input: C.Input<typeof C.UpdateProfileRequest>) { return present(C.Customer, await this.customers.updateProfile(actor, input)); }
  @Get('dashboard') @Contract(C.Dashboard)
  async dashboard(@CurrentActor() actor: Actor) { return present(C.Dashboard, await this.customers.dashboard(actor.customerId!)); }
}
const CreatedCustomer = z.object({ customer: C.Customer, setupToken: z.string(), setupExpiresInMinutes: z.number().int() });
@ApiTags('Admin customers') @ApiBearerAuth() @Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly db: Database, private readonly customers: CustomersService) {}
  @Require('customers.read') @Get() @Contract(C.page(C.Customer), undefined, C.ListQuery)
  async list(@Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) { return present(C.page(C.Customer), await paginated(this.db.customer, query)); }
  @Require('customers.read') @Get(':id') @Contract(C.Customer)
  async get(@Param('id', new ZodPipe(C.Id)) id: string) { return present(C.Customer, await this.customers.profile(id)); }
  @Require('customers.write') @Post() @Contract(CreatedCustomer, C.CreateCustomerRequest)
  async create(@CurrentActor() actor: Actor, @Body(new ZodPipe(C.CreateCustomerRequest)) input: C.Input<typeof C.CreateCustomerRequest>) { return present(CreatedCustomer, await this.customers.create(actor, input)); }
  @Require('customers.write') @Patch(':id') @Contract(C.Customer, C.UpdateCustomerRequest)
  async update(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string, @Body(new ZodPipe(C.UpdateCustomerRequest)) input: C.Input<typeof C.UpdateCustomerRequest>) { return present(C.Customer, await this.customers.update(actor, id, input)); }
  @Require('customers.write') @Post(':id/credentials') @Contract(z.object({ setupToken: z.string(), setupExpiresInMinutes: z.number().int() }))
  setup(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string) { return this.customers.setup(actor, id); }
}
@Module({ imports: [IdentityModule, CoverageModule], controllers: [ProfileController, AdminCustomersController], providers: [CustomersService], exports: [CustomersService] })
export class CustomersModule {}
