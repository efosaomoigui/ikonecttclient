// Editorial draft copy. Selected published preview pricing is centralised in catalogue.js.
export const company = {
  name: 'Ikonectt', legalName: 'Intelivision Technologies Limited',
  description: 'Ikonectt is the broadband brand of Intelivision Technologies, serving homes and businesses.'
};
// Published contact details supplied by the client for the redesigned website.
// Source checked 17 November 2026: https://ikonectt.com/contact/
export const publicContacts = Object.freeze({
 source:'https://ikonectt.com/contact/',
 address:{
  lines:['22B Fatai Idowu Arobieke','Lekki Phase 1, Lagos, Nigeria'],
  mapUrl:'https://maps.google.com/maps?q=22B+FATAI+IDOWU+AROBIEKE+LEKKI+PHASE+1',
  verified:true,
 },
 emails:[{address:'customercare@ikonectt.com',label:'Customer care',verified:true}],
 phones:[{number:'+2342013301220',label:'02013301220',verified:true}],
 socials:[
  {platform:'facebook',url:'https://www.facebook.com/profile.php?id=61562480475552',verified:true},
  {platform:'x',url:'https://x.com/ikonectt',verified:true},
  {platform:'instagram',url:'https://www.instagram.com/ikonecttng/',verified:true},
  {platform:'linkedin',url:'https://www.linkedin.com/company/ikonect-nigeria/?viewAsMember=true',verified:true},
 ],
});
export const categories = [
  ['internet', 'Internet and Wi-Fi'], ['payments', 'Plans and Payments'],
  ['coverage', 'Coverage and Installation'], ['account', 'My Ikonectt Account'],
  ['technical', 'Technical Troubleshooting'], ['requests', 'Service Requests and Complaints']
];
// The published knowledge API is the one source for FAQ answers. Do not copy
// approved articles into an unrelated frontend-only knowledge collection.
export const faqs=[];
const publishedKnowledge=new Map();
export const approvedAnswer=key=>publishedKnowledge.get(key)?.answer||null;
export function replacePublishedKnowledge(records){
  if(!Array.isArray(records))throw new Error('Invalid published knowledge response.');
  const mapped=records.filter(record=>record.published!==false).map(record=>{
    if(typeof record.question!=='string'||typeof record.answer!=='string'||typeof record.category!=='string')throw new Error('Invalid published article.');
    const key=record.category.toLowerCase();
    const category=categories.some(([id])=>id===key)?key:/install|cover/.test(key)?'coverage':/payment|plan|subscription|renew/.test(key)?'payments':/account|portal/.test(key)?'account':/router|technical|troubleshoot/.test(key)?'technical':/support|complaint/.test(key)?'requests':'internet';
    return [category,record.question,record.answer];
  });
  publishedKnowledge.clear();
  for(const record of records)if(record.published!==false&&typeof record.key==='string')publishedKnowledge.set(record.key,{answer:record.answer});
  faqs.splice(0,faqs.length,...mapped);
}
export const coverageStates = {
  available: {title:'Available', text:'An available status requires confirmation from the team. Contact customer care to check coverage and installation requirements for your address.', route:'residential/installation', action:'Installation Enquiry'},
  verification: {title:'Verification Required', text:'For a manual address review, contact the team with your location and a nearby landmark.', route:'coverage/verification', action:'Request Address Verification'},
  planned: {title:'Planned', text:'Planned service requires confirmation from the team. No rollout date or coverage is confirmed for your address.', route:'coverage/verification', action:'Request an Address Review'},
  unavailable: {title:'Unavailable', text:'If service is unavailable, ask the team to review your address and discuss the next steps.', route:'coverage/verification', action:'Request an Address Review'},
  unknown: {title:'Unknown', text:'Coverage has not been confirmed. Contact the team for an address review; a location name alone cannot establish availability.', route:'coverage/verification', action:'Request Address Verification'}
};
export const troubleshooting = {
  'no-internet': {title:'No internet connection', steps:['Check whether the issue affects one device or several.','Check the router power and note any indicator lights. Do not disconnect or look into a fibre connector.','Record what you observed and contact support if you still need help.']},
  slow: {title:'Slow connection', steps:['Note when the issue occurs and which devices are affected.','Check whether other devices or background downloads are using the connection.','Share your observations with support if the problem continues.']},
  wifi: {title:'Wi-Fi connection problems', steps:['Check that your device is connected to the intended Wi-Fi network.','Try a position nearer the router and note whether the experience changes.','Ask support for help with equipment, building layout or interference.']},
  router: {title:'Router issues', steps:['Check the power supply and note the router model and indicator lights.','Avoid a factory reset or changing service settings without support guidance.','Describe the issue in a fault report. Do not share router passwords.']},
  payment: {title:'Payment or renewal questions', steps:['Review your own payment reference or renewal information.','Use Contact Support for assistance. Do not share card details or one-time codes.','Contact customer care to check a payment or renewal. No live billing information is available here.']}
};
