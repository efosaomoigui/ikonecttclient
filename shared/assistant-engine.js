import {getPlan,planName,priceLabel,planRoute,detailRoute,plansFor,previewPricingNote} from './catalogue.js';
import {troubleshooting} from './content.js';

// Provider contract: respond({text, intent?, context:{path,audience,plan}}) ->
// {text, actions:[{label,route?,intent?}]}. Only the local provider is enabled.
// A future backend adapter must receive reviewed, minimal context, never form details.
const go=(label,route)=>({label,route});
const ask=(label,intent)=>({label,intent});
export const initialActions=[
  ask('Explore Residential Plans','residential'),ask('Business Connectivity','business'),
  ask('Check Coverage','coverage'),ask('Installation Help','installation'),
  ask('Troubleshoot Internet','troubleshooting'),ask('Report a Fault','fault'),
  ask('Contact Sales','sales'),ask('Contact Support','support')
];
export function matchIntent(text='') {
  const value=text.toLocaleLowerCase().replace(/[’']/g,'');
  if(/password|recover|forgot/.test(value))return 'recovery';
  if(/sign.?in|log.?in|portal|my ikonectt|account access/.test(value))return 'account';
  if(/bill|renew|invoice|payment|balance/.test(value))return 'billing';
  if(/report.*(fault|issue)|fault report|report a fault/.test(value))return 'fault';
  if(/not working|no internet|not connecting|disconnect|slow|wi.?fi|router|troubleshoot|internet.*down|connection.*(issue|problem)|internet.*problem/.test(value))return 'troubleshooting';
  if(/cover|available|availability|my area|my address|verify.*address/.test(value))return 'coverage';
  if(/install|connect(ed|ion)?\b.*(get|how)|get connected/.test(value))return 'installation';
  if(/office|business|enterprise|company|quote|workplace/.test(value))return 'business';
  if(/sales|buy|subscribe/.test(value))return 'sales';
  if(/home|residential|plan|price|speed|compare|cost|how much/.test(value))return 'residential';
  if(/human|someone|speak|agent|contact|support|help/.test(value))return 'support';
  return 'fallback';
}
export function publicContext(context={}) {
  const plan=getPlan(context.plan);
  const audience=['business','residential'].includes(context.audience)?context.audience:'residential';
  return {path:context.path||'home',audience,plan:plan?.audience===audience?plan.id:''};
}
export function contextActions(raw={}) {
  const context=publicContext(raw),{path,audience}=context,plan=getPlan(context.plan);
  const withPlan=route=>planRoute(route,plan,audience);
  if(path.startsWith('my-ikonectt'))return [ask('Account Access Help','account'),go('Recovery Information','my-ikonectt/forgot-password'),go('Contact Account Support','support/contact')];
  if(path.startsWith('coverage'))return [ask('How Coverage Checking Works','coverage'),go('Request Address Verification',withPlan('coverage/verification')),go('Contact Support','support/contact')];
  if(path.includes('/plans')){
    if(audience==='business')return [go('View Business Plans','business/plans'),go('Request a Quote',withPlan('business/quote')),go('Check Coverage',withPlan('coverage'))];
    return [go('Compare Plans',plan?'residential/compare?first='+plan.id:'residential/compare'),plan?go('View Plan Details',detailRoute(plan)):ask('View Plan Details','residential'),go('Check Coverage',withPlan('coverage'))];
  }
  if(path.startsWith('business'))return [go('Explore Business Solutions','business/solutions'),go('View Business Plans','business/plans'),go('Request a Quote',withPlan('business/quote'))];
  if(path.startsWith('residential'))return [ask('Find a Residential Plan','residential'),go('Compare Plans',plan?'residential/compare?first='+plan.id:'residential/compare'),go('Installation Enquiry',withPlan('residential/installation'))];
  if(path.startsWith('support'))return [go('Browse FAQs','support/faqs'),ask('Troubleshooting','troubleshooting'),go('Report a Fault',withPlan('support/fault')),go('Contact Support','support/contact')];
  return [ask('Explore Plans',audience),go('Check Coverage',withPlan('coverage')),ask('Contact Sales','sales')];
}
export function validateIntroduction({name='',phone=''}) {
  const errors={};
  if(name.trim().length<2||name.trim().length>80||!/^\p{L}[\p{L}\p{M}\s.'’\-]*$/u.test(name.trim()))errors.name='Enter your name with 2 to 80 characters, using letters, spaces, full stops, apostrophes or hyphens.';
  const compact=phone.replace(/[\s().-]/g,'');
  const normalized=compact.startsWith('00')?'+'+compact.slice(2):compact;
  let valid=false;
  if(/^0[789]\d{9}$/.test(normalized))valid=true;
  else if(/^\+?234[789]\d{9}$/.test(normalized))valid=true;
  else if(/^\+[1-9]\d{6,14}$/.test(normalized)&&!/^\+234/.test(normalized))valid=true;
  if(phone.length>32||!valid)errors.phone='Enter a valid phone number, such as 0803 123 4567. For an international number, include the country code with + or 00.';
  return errors;
}
export const demoProvider=Object.freeze({
  id:'local-scripted-demo',
  respond({text='',intent,context:raw={}}) {
    const context=publicContext(raw),{audience}=context,plan=getPlan(context.plan);
    const selected=plan?`Selected plan: ${planName(plan)} · ${plan.speedMbps} Mbps · ${priceLabel(plan)}/month. ${previewPricingNote}`:'';
    const route=(label,path,targetAudience=audience)=>go(label,planRoute(path,plan,targetAudience));
    let topic=intent||matchIntent(text);
    if(!intent&&topic==='residential'&&audience==='business'&&!/home|residential/i.test(text))topic='business';
    switch(topic) {
      case 'residential':return {text:'Compare residential plans by speed and monthly price. Coverage must be confirmed for your address before installation. '+(plan?.audience==='residential'?selected:previewPricingNote),actions:[route('View Residential Plans','residential/plans','residential'),go('Compare Plans',plan?.audience==='residential'?'residential/compare?first='+plan.id:'residential/compare'),route('Check Coverage','coverage','residential')],plans:plansFor('residential').map(p=>p.id)};
      case 'business':return {text:'Compare business plans or discuss your location and requirements with the team. Quote forms do not send enquiries. '+(plan?.audience==='business'?selected:previewPricingNote),actions:[route('View Business Plans','business/plans','business'),go('Business Solutions','business/solutions'),route('Request a Quote','business/quote','business')],plans:plansFor('business').map(p=>p.id)};
      case 'coverage':return {text:'The checker cannot confirm live coverage. Contact the team to review your address. '+selected,actions:[route('Check Coverage','coverage'),route('Request Address Verification','coverage/verification')]};
      case 'installation':return {text:'The team must confirm coverage and installation requirements for your address. Installation fees and times require confirmation. The installation enquiry form does not book a visit or send a request.',actions:[route('Check Coverage','coverage'),route('Installation Enquiry','residential/installation','residential'),go('Installation FAQs','support/faqs?category=coverage')]};
      case 'troubleshooting':return {text:'I cannot diagnose your connection remotely. '+troubleshooting['no-internet'].steps.join(' ')+' Do not factory-reset equipment without support guidance.',actions:[go('Open Troubleshooting','support/troubleshooting'),route('Report a Fault','support/fault'),go('Contact Support','support/contact')]};
      case 'fault':return {text:'The fault form does not create or send a ticket. Visit Contact Support to reach customer care.',actions:[route('Report a Fault','support/fault'),go('Service Request','support/service-request'),go('Contact Support','support/contact')]};
      case 'billing':return {text:'Contact customer care for help with your bill. I cannot access balances or customer records. The linked portal does not process real payments or renewals.',actions:[go('My Ikonectt','my-ikonectt/sign-in'),go('Contact Support','support/contact')]};
      case 'account':return {text:'For access to your real account, contact customer care. The linked portal does not authenticate live customer accounts. Do not share passwords here.',actions:[go('My Ikonectt','my-ikonectt/sign-in'),go('Recovery Information','my-ikonectt/forgot-password'),go('Contact Account Support','support/contact')]};
      case 'recovery':return {text:'Contact customer care for help recovering access to your real account. This website does not look up accounts or send recovery messages. Account recovery is not connected here.',actions:[go('Recovery Information','my-ikonectt/forgot-password'),go('Contact Account Support','support/contact')]};
      case 'sales':return {text:'Choose an installation enquiry for home broadband or a quote request for business connectivity. To send your enquiry, use the contact details on the Contact page.',actions:[route('Installation Enquiry','residential/installation','residential'),route('Request a Quote','business/quote','business'),go('Contact Details','contact')]};
      case 'support':return {text:'Visit Contact Support for customer care details. This assistant provides scripted guidance; no live agent is connected. Public forms do not send requests.',actions:[go('Contact Support','support/contact'),route('Report a Fault','support/fault'),ask('Contact Sales','sales'),go('Help Centre','support')]};
      default:return {text:'Choose a topic below for help with plans, coverage, installation or support. Replies are automated; no live agent is connected.',actions:[ask('Explore Plans',audience),ask('Check Coverage','coverage'),go('Help Centre','support')]};
    }
  }
});
