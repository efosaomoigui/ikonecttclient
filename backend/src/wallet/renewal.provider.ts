import {Injectable,ServiceUnavailableException} from '@nestjs/common';
import {Config} from '../core/config';
export interface RenewalOutcome {status:'PENDING'|'CONFIRMED'|'FAILED'|'REQUIRES_REVIEW';reference:string;confirmedEndsAt:string|null;simulated:boolean}
// Explicit renewal semantics: an acknowledgement is not a confirmed service outcome.
@Injectable()
export class RenewalProvider{
 constructor(private readonly config:Config){}
 async renew(input:{requestId:string;subscriptionId:string;externalServiceId:string;previousEndsAt:string;expectedEndsAt:string;billingDays:number}):Promise<RenewalOutcome>{
  const mode=this.config.values.PROVISIONING_ADAPTER;
  if(mode==='disabled')throw new ServiceUnavailableException('Renewal provider is not configured');
  if(mode==='manual')return{status:'PENDING',reference:'MANUAL-RENEWAL-'+input.requestId,confirmedEndsAt:null,simulated:false};
  const scenario=this.config.values.SIMULATOR_SCENARIO;
  if(scenario==='timeout')throw new ServiceUnavailableException('SIMULATED renewal timeout; authoritative outcome unknown');
  return{status:scenario==='failure'?'FAILED':'CONFIRMED',reference:'SIMULATED-RENEWAL-'+input.requestId,confirmedEndsAt:scenario==='failure'?null:input.expectedEndsAt,simulated:true};
 }
}
