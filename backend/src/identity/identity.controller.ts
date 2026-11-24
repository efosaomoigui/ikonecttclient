import { Body, Controller, Get, Module, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import * as C from '../../../contracts';
import { Contract, present, ZodPipe } from '../core/http';
import { Actor, AllowPasswordSetup, CurrentActor, Public } from './access';
import { IdentityService } from './identity.service';
import { z } from 'zod';

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('auth')
export class IdentityController {
  constructor(private readonly identity: IdentityService) {}
  @Public() @Post('login') @Throttle({ default: { limit: 8, ttl: 60_000 } }) @Contract(C.Session, C.LoginRequest)
  async login(@Body(new ZodPipe(C.LoginRequest)) input: C.Input<typeof C.LoginRequest>) { return present(C.Session, await this.identity.login(input.accountNumber, input.password)); }
  @Public() @Post('staff/login') @Throttle({ default: { limit: 8, ttl: 60_000 } }) @Contract(C.Session, C.StaffLoginRequest)
  async staffLogin(@Body(new ZodPipe(C.StaffLoginRequest)) input: C.Input<typeof C.StaffLoginRequest>) { return present(C.Session, await this.identity.login(input.email, input.password, true)); }
  @AllowPasswordSetup() @Post('logout') @Contract(C.Ok)
  logout(@CurrentActor() actor: Actor) { return this.identity.logout(actor); }
  @AllowPasswordSetup() @Get('session') @Contract(C.Session.shape.principal)
  session(@CurrentActor() actor: Actor) { return this.identity.principal(actor); }
  @Public() @Post('recovery') @Throttle({ default: { limit: 4, ttl: 60_000 } }) @Contract(C.Ok, C.RecoveryRequest)
  recovery(@Body(new ZodPipe(C.RecoveryRequest)) input: C.Input<typeof C.RecoveryRequest>) { return this.identity.recover(input.accountNumber); }
  @Public() @Post('staff/recovery') @Throttle({ default: { limit: 4, ttl: 60_000 } }) @Contract(C.Ok, C.StaffRecoveryRequest)
  staffRecovery(@Body(new ZodPipe(C.StaffRecoveryRequest)) input: C.Input<typeof C.StaffRecoveryRequest>) { return this.identity.recoverStaff(input.email); }
  @Public() @Post('reset-password') @Throttle({ default: { limit: 8, ttl: 60_000 } }) @Contract(C.Ok, C.ResetPasswordRequest)
  reset(@Body(new ZodPipe(C.ResetPasswordRequest)) input: C.Input<typeof C.ResetPasswordRequest>) { return this.identity.reset(input.token, input.password); }
  @AllowPasswordSetup() @Post('change-password') @Contract(C.Ok, C.ChangePasswordRequest)
  change(@CurrentActor() actor: Actor, @Body(new ZodPipe(C.ChangePasswordRequest)) input: C.Input<typeof C.ChangePasswordRequest>) { return this.identity.change(actor, input.currentPassword, input.password); }
}
@Module({ controllers: [IdentityController], providers: [IdentityService], exports: [IdentityService] })
export class IdentityModule {}
