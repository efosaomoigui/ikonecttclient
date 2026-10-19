// Paths and wire shapes from Agent 1 contracts v1.0.0, contracts/index.ts + README.md.
// This frontend view model deliberately keeps internal customer IDs off customer screens.
import {config} from './config.js';
const title=value=>String(value??'Unknown').toLowerCase().replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());
export function profileView(c){return {...c,customerType:title(c.kind),address:null};}
export function ticketView(t){const messages=t.messages||[];return {id:t.id,reference:`Request ${t.id.slice(0,8)}`,subject:t.subject,category:null,status:title(t.status),createdAt:t.createdAt,description:messages[0]?.message||'No request message is available.',updates:messages.map(m=>({at:m.createdAt,message:m.message}))};}
export function summaryView({customer,subscriptions,plans,orders,payments,tickets,receipts,notifications=[]}){
 return {profile:profileView(customer),services:subscriptions.map(s=>{const p=plans.find(p=>p.id===s.planId);return {id:s.id,name:title(customer.kind)+' internet',plan:p?.name||'Your subscribed plan',speedMbps:p?.speedMbps??null,status:title(s.status),address:null,renewalDate:s.endsAt,monthlyAmount:p?p.priceMinor/100:null,billingDays:p?.billingDays??null,currency:p?.currency||'NGN',usage:null,simulated:s.simulated};}),bills:[],orders,payments:payments.map(p=>({...p,amount:p.amountMinor/100,status:title(p.status),receiptAvailable:p.status==='CONFIRMED'})),receipts:receipts.map(r=>({id:r.payment.id,reference:r.receiptNumber,billReference:r.payment.orderId,description:orders.find(o=>o.id===r.payment.orderId)?.planName||'Service payment',amount:r.payment.amountMinor/100,currency:r.payment.currency,status:'Verified',paidAt:r.issuedAt,method:title(r.payment.method)})),tickets:tickets.map(ticketView),notifications,simulated:customer.accountNumberSimulated||subscriptions.some(s=>s.simulated)};
}
export function createLiveAdapter({base=config.apiBase,fetcher=globalThis.fetch}={}){
 let token,principal;
 async function request(path,{method='GET',body}={}){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),config.timeoutMs);try{const response=await fetcher(base.replace(/\/$/,'')+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:controller.signal,cache:'no-store'});const result=await response.json();if(!response.ok){const error=Object.assign(new Error(result.message||'Your request could not be completed.'),{status:response.status});if(response.status===401){token=undefined;principal=undefined;}throw error;}return result;}catch(e){if(e.name==='AbortError')throw new Error('The request timed out. Please try again.');throw e;}finally{clearTimeout(timer);}}
 async function all(path){const items=[];let offset=0;while(true){const p=await request(`${path}?offset=${offset}&limit=100`);items.push(...p.items);offset+=p.items.length;if(offset>=p.total||!p.items.length)break;}return items;}
 return {
  capabilities:{notifications:true,chat:false},
  async login(accountNumber,password){const session=await request('/auth/login',{method:'POST',body:{accountNumber,password}});if(session.principal.kind!=='CUSTOMER'){throw new Error('Please use a customer account to access My Ikonectt.');}token=session.accessToken;principal=session.principal;if(principal.mustChangePassword)return {name:'Your account',accountNumber,mustChangePassword:true};return profileView(await request('/me/profile'));},
  async session(){await request('/auth/session');return profileView(await request('/me/profile'));},
  async resume(){if(!token)throw Object.assign(new Error('Please sign in to continue.'),{status:401});return this.session();},
  async logout(){try{await request('/auth/logout',{method:'POST'});}finally{token=undefined;principal=undefined;}},
  async recover(accountNumber){await request('/auth/recovery',{method:'POST',body:{accountNumber}});return {message:'If the account is eligible, recovery instructions will be sent to its registered contact.'};},
  async resetPassword(resetToken,password){await request('/auth/reset-password',{method:'POST',body:{token:resetToken,password}});},
  async changePassword(currentPassword,password){await request('/auth/change-password',{method:'POST',body:{currentPassword,password}});token=undefined;principal=undefined;},
  async summary(){const [dashboard,plans,orders,payments,tickets,notifications]=await Promise.all([request('/me/dashboard'),all('/plans'),all('/me/orders'),all('/me/payments'),all('/me/tickets'),all('/me/notifications')]);const [details,receipts]=await Promise.all([Promise.all(tickets.map(t=>request('/me/tickets/'+encodeURIComponent(t.id)))),Promise.all(payments.filter(p=>p.status==='CONFIRMED').map(p=>request('/me/payments/'+encodeURIComponent(p.id)+'/receipt')))]);return summaryView({customer:dashboard.customer,subscriptions:dashboard.subscriptions,plans,orders,payments,tickets:details,receipts,notifications});},
  async createTicket(input){return ticketView(await request('/me/tickets',{method:'POST',body:{subject:input.subject,message:input.description}}));}
 };
}
