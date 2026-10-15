// Selected published reference catalogue for the client preview. Not a live commercial offer.
const residentialSource='https://provisions.ikonectt.com/for-homes';
const businessSource='https://provisions.ikonectt.com/';
const make=(id,audience,displayName,speedMbps,monthlyPriceNGN,displayOrder)=>Object.freeze({
  id,audience,displayName,speedMbps,monthlyPriceNGN,currency:'NGN',billingPeriod:'month',
  verifiedAttributes:Object.freeze([{key:'connection',label:'Connection',value:'Fibre broadband'}].map(Object.freeze)),
  sourceUrl:audience==='residential'?residentialSource:businessSource,
  verificationStatus:'published-reference-awaiting-client-confirmation',
  availabilityStatus:'address-verification-required',displayOrder
});
export const catalogue=Object.freeze([
  make('res-ibasic','residential','iBasic',30,15000,1),
  make('res-isilver','residential','iSilver',40,20000,2),
  make('res-igold','residential','iGold',50,25000,3),
  make('res-iplatinum','residential','iPlatinum',100,50000,4),
  make('res-idiamond','residential','iDiamond',300,75000,5),
  make('biz-100','business',null,100,105000,1),
  make('biz-300','business',null,300,253000,2),
  make('biz-500','business',null,500,359000,3),
  make('biz-1000','business',null,1000,437000,4)
]);
export const previewPricingNote='Preview pricing is subject to client confirmation. Availability and final terms require address verification.';
export const plansFor=audience=>catalogue.filter(plan=>plan.audience===audience).sort((a,b)=>a.displayOrder-b.displayOrder);
export const getPlan=id=>catalogue.find(plan=>plan.id===id)||null;
export const planName=plan=>plan.displayName||`${plan.speedMbps} Mbps`;
export const priceLabel=plan=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(plan.monthlyPriceNGN);
export const planOptions=audience=>plansFor(audience).map(plan=>[plan.id,`${planName(plan)}${plan.displayName?' · '+plan.speedMbps+' Mbps':''} · ${priceLabel(plan)}/month`]);
export function planRoute(route,plan,audience=plan?.audience||'residential'){
  const [path,search='']=route.split('?'),query=new URLSearchParams(search);
  query.set('audience',audience);
  if(plan?.audience===audience)query.set('plan',plan.id);else query.delete('plan');
  return path+'?'+query.toString();
}
export const detailRoute=plan=>planRoute('residential/plans/details',plan,'residential');
