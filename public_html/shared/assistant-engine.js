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
  if(path.startsWith('my-ikonectt'))return [ask('Sign-in Help','account'),go('Password Recovery','my-ikonectt/forgot-password'),go('Contact Account Support','support/contact')];
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
  if(name.trim().length<2||name.trim().length>80||!/^\p{L}[\p{L}\p{M}\s.'’\-]*$/u.test(name.trim()))errors.name='Enter your full name using letters, spaces, apostrophes or hyphens.';
  const compact=phone.replace(/[\s().-]/g,'');
  const normalized=compact.startsWith('00')?'+'+compact.slice(2):compact;
  let valid=false;
  if(/^0[789]\d{9}$/.test(normalized))valid=true;
  else if(/^\+?234[789]\d{9}$/.test(normalized))valid=true;
  else if(/^\+[1-9]\d{6,14}$/.test(normalized)&&!/^\+234/.test(normalized))valid=true;
  if(phone.length>32||!valid)errors.phone='Enter a valid number, such as 0803 123 4567 or +234 803 123 4567. International prefixes are accepted.';
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
      case 'residential':return {text:'I can help you explore Ikonectt’s residential plans. Compare the published speeds and monthly prices, then check your address. '+(plan?.audience==='residential'?selected:previewPricingNote),actions:[route('View Residential Plans','residential/plans','residential'),go('Compare Plans',plan?.audience==='residential'?'residential/compare?first='+plan.id:'residential/compare'),route('Check Coverage','coverage','residential')],plans:plansFor('residential').map(p=>p.id)};
      case 'business':return {text:'Ikonectt offers business connectivity options. You can explore the available plans or tell the team about your requirements. '+(plan?.audience==='business'?selected:previewPricingNote),actions:[route('Business Plans','business/plans','business'),go('Business Solutions','business/solutions'),route('Request a Quote','business/quote','business')],plans:plansFor('business').map(p=>p.id)};
      case 'coverage':return {text:'You can check your address using the coverage checker. It demonstrates the address-check journey; no geographic lookup is running and this assistant cannot confirm coverage. Request address verification when you need a review. '+selected,actions:[route('Check Coverage','coverage'),route('Request Address Verification','coverage/verification')]};
      case 'installation':return {text:'Start by checking coverage and choosing a plan. The team would then confirm eligibility, installation requirements and next steps for your address. Installation fees and times require confirmation; this preview does not book an installation.',actions:[route('Check Coverage','coverage'),route('Installation Enquiry','residential/installation','residential'),go('Installation FAQs','support/faqs?category=coverage')]};
      case 'troubleshooting':return {text:'Let’s start with a few basic checks. '+troubleshooting['no-internet'].steps.join(' ')+' Check that ordinary power and Ethernet cables are secure; do not remove fibre connectors or factory-reset equipment. I cannot diagnose your connection remotely.',actions:[go('Open Troubleshooting','support/troubleshooting'),route('Report a Fault','support/fault'),go('Contact Support','support/contact')]};
      case 'fault':return {text:'Use Report a Fault to describe the problem and your observations. The existing form is a demonstration: no ticket is created or sent. For another kind of help, choose Service Request or Contact Support.',actions:[route('Report a Fault','support/fault'),go('Service Request','support/service-request'),go('Contact Support','support/contact')]};
      case 'billing':return {text:'For account-specific billing information, please use My Ikonectt when the customer portal is available, or contact the support team. The current portal is a preview. I cannot access balances, invoices, payments or customer records. Please do not share payment details or one-time codes.',actions:[go('My Ikonectt','my-ikonectt/sign-in'),go('Contact Support','support/contact')]};
      case 'account':return {text:'My Ikonectt currently demonstrates sign-in and account journeys. You are not authenticated here and no customer records are connected. Use Password Recovery for the preview recovery flow, or contact account support. Do not enter passwords in this conversation.',actions:[go('My Ikonectt','my-ikonectt/sign-in'),go('Password Recovery','my-ikonectt/forgot-password'),go('Contact Account Support','support/contact')]};
      case 'recovery':return {text:'Open Password Recovery to explore the account recovery journey. This is a demonstration: no account lookup or recovery message is sent. Do not share your password or verification codes here.',actions:[go('Password Recovery','my-ikonectt/forgot-password'),go('Contact Account Support','support/contact')]};
      case 'sales':return {text:'For home broadband, start an installation enquiry. For business requirements, request a quote. Both forms are previews and do not send an enquiry yet.',actions:[route('Installation Enquiry','residential/installation','residential'),route('Request a Quote','business/quote','business'),go('General Enquiry','contact')]};
      case 'support':return {text:'You can contact support, describe a fault or explore sales enquiries using the website. These are demonstration pathways; no live agent is connected and no request has been sent.',actions:[go('Contact Support','support/contact'),route('Report a Fault','support/fault'),ask('Contact Sales','sales'),go('Help Centre','support')]};
      default:return {text:'I can help with plans, coverage, installation and support. You can choose one of the options below or visit our Help Centre. This demonstration uses scripted responses; no AI model is connected.',actions:[ask('Explore Plans',audience),ask('Check Coverage','coverage'),go('Help Centre','support')]};
    }
  }
});
