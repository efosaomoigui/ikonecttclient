import {config} from './config.js';
import {fixture,demoCredentials} from './fixtures.js';
import {createLiveAdapter} from './live.js';
/** @typedef {import('./types').PortalAdapter} PortalAdapter */
export class ApiError extends Error {constructor(message,status=400){super(message);this.status=status;}}
/** @returns {PortalAdapter} */
export function createMockAdapter(storage=globalThis.sessionStorage){
 let authenticated=false, password=demoCredentials.password, resetUsed=false;
 let tickets=structuredClone(fixture.tickets);
 const guard=()=>{if(!authenticated)throw new ApiError('Your session has ended. Please sign in again.',401);};
 return {
  async session(){guard();return structuredClone(fixture.profile);},
  async login(accountNumber,value){await new Promise(r=>setTimeout(r,350));if(accountNumber!==demoCredentials.accountNumber||value!==password)throw new ApiError('The account number or password is incorrect.',401);authenticated=true;storage?.setItem('ikonectt-demo-session','active');return structuredClone(fixture.profile);},
  async resume(){authenticated=storage?.getItem('ikonectt-demo-session')==='active';return this.session();},
  async logout(){authenticated=false;storage?.removeItem('ikonectt-demo-session');},
  async recover(){return {message:'If the account is eligible, recovery instructions will be sent to its registered contact.'};},
  async resetPassword(token,next){if(resetUsed||token!=='DEMO-RESET-TOKEN')throw new ApiError('This recovery code is invalid or expired. Request a new one.');if(next.length<12)throw new ApiError('Use at least 12 characters.');password=next;resetUsed=true;await this.logout();},
  async summary(){guard();return structuredClone({...fixture,tickets});},
  async createTicket(input){guard();const t={...input,id:crypto.randomUUID(),reference:`SUP-${Date.now().toString().slice(-6)}`,status:'Open',createdAt:new Date().toISOString(),updates:[{at:new Date().toISOString(),message:'Your request has been received.'}]};tickets.unshift(t);return structuredClone(t);},
  async changePassword(current,next){guard();if(current!==password)throw new ApiError('The current password is incorrect.');if(next.length<12)throw new ApiError('Use at least 12 characters.');password=next;await this.logout();},
  capabilities:{notifications:false,chat:false}
 };
}
export {createLiveAdapter} from './live.js';
export const api=config.mode==='mock'?createMockAdapter():createLiveAdapter();
