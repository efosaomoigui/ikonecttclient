import { Global, Injectable, Module, ServiceUnavailableException } from '@nestjs/common';
import { Config } from '../core/config';

export type ProviderResult<T> = { data: T; simulated: boolean; provider: string };
export interface PaymentProvider {
  initiate(input: { orderId: string; amountMinor: number; currency: string; idempotencyKey: string }): Promise<ProviderResult<{ reference: string; status: 'PENDING'; redirectUrl: string | null }>>;
  verify(reference: string): Promise<ProviderResult<{ reference: string; status: 'PENDING' | 'CONFIRMED' | 'REJECTED'; amountMinor: number; currency: string }>>;
}
export interface ProvisioningProvider {
  request(input: { requestId: string; customerId: string; planCode: string; buildingId: string }): Promise<ProviderResult<{ reference: string; status: 'PENDING' | 'ACTIVE' | 'FAILED' | 'REQUIRES_REVIEW' }>>;
}
export interface LegacyCrmProvider {
  lookup(accountReference: string): Promise<ProviderResult<{ externalId: string; accountReference: string; name: string } | null>>;
}
export interface CoverageProvider {
  check(buildingId: string, planId?: string): Promise<ProviderResult<{ eligibility: 'AVAILABLE' | 'UNAVAILABLE' | 'PLANNED' | 'REQUIRES_REVIEW' | 'UNKNOWN'; planIds: string[] }>>;
}
export interface MessagingProvider {
  send(input: { idempotencyKey: string; destination: string; template: string; payload: Record<string, unknown> }): Promise<ProviderResult<{ reference: string }>>;
}
export class DisabledProvider {
  async unavailable(): Promise<never> { throw new ServiceUnavailableException('External provider is not connected'); }
}
// Predictable scenarios are test/development only. No credentials, production URLs or network calls.
export class Simulator {
  constructor(private readonly scenario: 'success' | 'failure' | 'timeout') {}
  check() {
    if (this.scenario === 'timeout') throw new ServiceUnavailableException('SIMULATED provider timeout');
    if (this.scenario === 'failure') throw new ServiceUnavailableException('SIMULATED provider failure');
  }
  result<T>(data: T): ProviderResult<T> { this.check(); return { data, simulated: true, provider: 'SIMULATED' }; }
}
export class SimulatedPaymentProvider implements PaymentProvider {
  constructor(private readonly simulator: Simulator) {}
  async initiate(input: Parameters<PaymentProvider['initiate']>[0]) { return this.simulator.result({ reference: `SIMULATED-${input.idempotencyKey}`, status: 'PENDING' as const, redirectUrl: null }); }
  async verify(reference: string) { return this.simulator.result({ reference, status: 'PENDING' as const, amountMinor: 0, currency: 'NGN' }); }
}
export class SimulatedProvisioningProvider implements ProvisioningProvider {
  constructor(private readonly simulator: Simulator) {}
  async request(input: Parameters<ProvisioningProvider['request']>[0]) { return this.simulator.result({ reference: `SIMULATED-${input.requestId}`, status: 'ACTIVE' as const }); }
}
export class ManualProvisioningProvider implements ProvisioningProvider {
  async request(input: Parameters<ProvisioningProvider['request']>[0]): ReturnType<ProvisioningProvider['request']> { return { data: { reference: `MANUAL-${input.requestId}`, status: 'PENDING' }, provider: 'MANUAL', simulated: false }; }
}
export class SimulatedLegacyProvider implements LegacyCrmProvider {
  constructor(private readonly simulator: Simulator) {}
  async lookup(accountReference: string) { return this.simulator.result(accountReference === 'SIMULATED-LEGACY-001' ? { externalId: 'SIMULATED-CUSTOMER-001', accountReference, name: 'SIMULATED Legacy Customer' } : null); }
}
export class SimulatedMessagingProvider implements MessagingProvider {
  constructor(private readonly simulator: Simulator) {}
  async send(input: Parameters<MessagingProvider['send']>[0]) { return this.simulator.result({ reference: `SIMULATED-${input.idempotencyKey}` }); }
}
@Injectable()
export class Adapters {
  readonly payment: PaymentProvider;
  readonly provisioning: ProvisioningProvider;
  readonly legacy: LegacyCrmProvider;
  readonly email: MessagingProvider;
  readonly sms: MessagingProvider;
  constructor(readonly config: Config) {
    const simulator = new Simulator(config.values.SIMULATOR_SCENARIO);
    const disabled = new DisabledProvider();
    this.payment = config.values.PAYMENT_ADAPTER === 'simulated' ? new SimulatedPaymentProvider(simulator) : { initiate: () => disabled.unavailable(), verify: () => disabled.unavailable() };
    this.provisioning = config.values.PROVISIONING_ADAPTER === 'simulated' ? new SimulatedProvisioningProvider(simulator) : config.values.PROVISIONING_ADAPTER === 'manual' ? new ManualProvisioningProvider() : { request: () => disabled.unavailable() };
    this.legacy = config.values.LEGACY_ADAPTER === 'simulated' ? new SimulatedLegacyProvider(simulator) : { lookup: () => disabled.unavailable() };
    this.email = config.values.EMAIL_ADAPTER === 'simulated' ? new SimulatedMessagingProvider(simulator) : { send: () => disabled.unavailable() };
    this.sms = config.values.SMS_ADAPTER === 'simulated' ? new SimulatedMessagingProvider(simulator) : { send: () => disabled.unavailable() };
  }
  capabilities() {
    return { payments: this.config.values.PAYMENT_ADAPTER, provisioning: this.config.values.PROVISIONING_ADAPTER, legacy: this.config.values.LEGACY_ADAPTER, email: this.config.values.EMAIL_ADAPTER, sms: this.config.values.SMS_ADAPTER, coverage: this.config.values.COVERAGE_ADAPTER, ai: 'guidance-only-no-model', usage: 'not-connected' };
  }
}
@Global()
@Module({ providers: [Adapters], exports: [Adapters] })
export class IntegrationsModule {}
