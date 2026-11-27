// Public catalogue state is populated from the configured authoritative API. No commercial
// prices are inferred from reference websites or supplied as a network fallback.
export const catalogue=[];
export const catalogueStatus={state:'loading',message:'Loading service plans…'};
export const previewPricingNote='Installation, equipment and service terms require confirmation. Availability is subject to address feasibility.';
export function replaceCatalogue(records){
  if(!Array.isArray(records))throw new Error('Invalid plans response.');
  const mapped=records.filter(p=>p.published!==false).map((p,index)=>{
    if(typeof p.id!=='string'||typeof p.name!=='string'||!['RESIDENTIAL','BUSINESS'].includes(p.kind)||!Number.isFinite(p.speedMbps)||p.speedMbps<=0||!(p.priceMinor===null||(Number.isSafeInteger(p.priceMinor)&&p.priceMinor>=0)))throw new Error('Invalid published plan.');
    if(!(p.billingDays==null||(Number.isInteger(p.billingDays)&&p.billingDays>0))||!(p.uploadMbps==null||(Number.isFinite(p.uploadMbps)&&p.uploadMbps>0)))throw new Error('Invalid plan details.');
    return Object.freeze({id:p.id,code:p.code,audience:p.kind==='BUSINESS'?'business':'residential',displayName:p.name,speedMbps:p.speedMbps,uploadMbps:p.uploadMbps??null,priceMinor:p.priceMinor,billingDays:p.billingDays??null,billingPeriod:p.billingPeriod==='MONTH'?'MONTH':null,description:typeof p.description==='string'?p.description.trim():'',descriptionSource:p.descriptionSource||null,source:p.source||'INTERNAL',externalId:p.externalId||null,currency:p.currency||'NGN',displayOrder:index+1,verifiedAttributes:[],simulated:p.simulated===true});
  });
  catalogue.splice(0,catalogue.length,...mapped);
  Object.assign(catalogueStatus,{state:'ready',message:mapped.length?'':'No published plans are currently available. Contact customer care.'});
}
export const plansFor=audience=>catalogue.filter(p=>p.audience===audience).sort((a,b)=>a.speedMbps-b.speedMbps);
export const getPlan=id=>catalogue.find(p=>p.id===id||p.code===id)||null;
export const planName=plan=>plan?.displayName||'Plan information unavailable';
export const priceLabel=plan=>!plan||plan.priceMinor==null||(plan.source!=='CLIENT'&&plan.audience==='business'&&plan.priceMinor===0)?'Request a Quote':new Intl.NumberFormat('en-NG',{style:'currency',currency:plan.currency,maximumFractionDigits:2}).format(plan.priceMinor/100);
export const billingLabel=plan=>plan?.billingPeriod==='MONTH'?'Monthly':plan?.billingDays?`${plan.billingDays} days`:'Billing period to be confirmed';
export const pricePeriod=plan=>plan?.billingPeriod==='MONTH'?' / month':plan?.billingDays?` / ${plan.billingDays} days`:'';
export const planOptions=audience=>plansFor(audience).map(p=>[p.id,`${planName(p)} · ${p.speedMbps} Mbps · ${priceLabel(p)}`]);
export function planRoute(route,plan,audience=plan?.audience||'residential'){
  const [path,search='']=route.split('?'),query=new URLSearchParams(search);query.set('audience',audience);
  if(plan?.audience===audience)query.set('plan',plan.id);else query.delete('plan');
  return path+'?'+query.toString();
}
export const detailRoute=plan=>planRoute('residential/plans/details',plan,'residential');
