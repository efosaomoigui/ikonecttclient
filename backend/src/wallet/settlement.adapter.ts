import {Injectable,ServiceUnavailableException} from '@nestjs/common';
import {z} from 'zod';

// No provider-specific webhook format or credentials have been supplied. A future approved
// adapter MUST authenticate the raw envelope and independently fetch authoritative status
// with server credentials. Never return callback metadata as if it were settlement proof.
export type SettlementEnvelope={body:Buffer;headers:Readonly<Record<string,string|undefined>>};
export const SettlementIdentity=z.object({provider:z.string().min(1).max(80),account:z.string().min(1).max(150),simulated:z.boolean()}).strict();
export const VerifiedSettlement=z.object({
 provider:z.string().min(1).max(80),account:z.string().min(1).max(150),eventId:z.string().min(1).max(150),
 paymentId:z.string().uuid(),providerPaymentId:z.string().trim().min(3).max(150),merchantReference:z.string().trim().min(3).max(150),
 amountMinor:z.number().int().positive().max(1_000_000_000_000),currency:z.literal('NGN'),
 status:z.enum(['INITIATED','PENDING','FAILED','SETTLED']),settledAt:z.string().datetime().nullable(),settlementReference:z.string().min(3).max(150).nullable(),
 authenticated:z.literal(true),authoritativeLookup:z.literal(true),simulated:z.boolean(),
}).strict().superRefine((v,c)=>{if(v.status==='SETTLED'&&(!v.settledAt||!v.settlementReference))c.addIssue({code:'custom',message:'Settled date and settlement reference required'})});
export abstract class SettlementAdapter{
 abstract identity():z.infer<typeof SettlementIdentity>;
 abstract verifyAndFetch(envelope:SettlementEnvelope):Promise<unknown>;
}
@Injectable()
export class DisabledSettlementAdapter extends SettlementAdapter{
 identity():never{throw new ServiceUnavailableException('Approved settlement provider is not connected')}
 async verifyAndFetch(_envelope:SettlementEnvelope):Promise<never>{return this.identity()}
}
