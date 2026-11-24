// Test-only protocol fixture, NOT an implementation of any real payment provider.
import {createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import {ServiceUnavailableException,UnauthorizedException} from '@nestjs/common';
import {z} from 'zod';
import {SettlementAdapter,SettlementEnvelope,VerifiedSettlement} from '../../src/wallet/settlement.adapter';
type Proof=z.infer<typeof VerifiedSettlement>;
export class SettlementFixtureAdapter extends SettlementAdapter{
 readonly secret=randomBytes(32);
 readonly remote=new Map<string,Proof>();
 lookupFails=false;
 identity(){return{provider:'SIMULATED-SETTLEMENT',account:'SIMULATED-MERCHANT',simulated:true}}
 envelope(payment:{id:string;providerPaymentId:string;merchantReference:string},eventId:string,extra:Record<string,unknown>={}){
  const body=Buffer.from(JSON.stringify({paymentId:payment.id,providerPaymentId:payment.providerPaymentId,merchantReference:payment.merchantReference,eventId,...extra}));
  const timestamp=String(Math.floor(Date.now()/1000));
  return{body,headers:{timestamp,signature:createHmac('sha256',this.secret).update(timestamp+'.').update(body).digest('hex')}};
 }
 async verifyAndFetch(e:SettlementEnvelope){
  if(process.env.NODE_ENV!=='test')throw new Error('Test fixture unavailable outside test');
  const timestamp=e.headers.timestamp||'',signature=e.headers.signature||'';
  if(!/^\d+$/.test(timestamp)||Math.abs(Date.now()/1000-Number(timestamp))>300||!/^[a-f0-9]{64}$/.test(signature))throw new UnauthorizedException('Invalid SIMULATED signature');
  const expected=createHmac('sha256',this.secret).update(timestamp+'.').update(e.body).digest();
  if(!timingSafeEqual(expected,Buffer.from(signature,'hex')))throw new UnauthorizedException('Invalid SIMULATED signature');
  const body=JSON.parse(e.body.toString());
  if(this.lookupFails)throw new ServiceUnavailableException('SIMULATED authoritative lookup unavailable');
  // Server-side fixture store, deliberately independent of the callback's claimed status.
  const remote=this.remote.get(body.providerPaymentId);
  if(!remote||remote.paymentId!==body.paymentId||remote.merchantReference!==body.merchantReference)throw new UnauthorizedException('SIMULATED provider payment mismatch');
  return{...remote,eventId:body.eventId};
 }
}
