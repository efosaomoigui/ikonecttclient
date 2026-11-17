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
export const faqs = [
  ['coverage', 'How do I confirm coverage at my address?', 'Contact customer care with your full address for confirmation. The website checker cannot confirm live coverage.'],
  ['payments', 'How do I choose a plan?', 'Compare the listed speeds and monthly prices, then discuss your household or business needs with the team. Prices and final service terms require confirmation.'],
  ['coverage', 'How do I arrange installation?', 'Ask the team to confirm coverage, equipment and installation costs for your address. Email or call customer care with the details in the installation enquiry form.'],
  ['payments', 'Where can I confirm plan conditions?', 'Ask customer care about installation, equipment, usage conditions and any applicable charges before subscribing.'],
  ['internet', 'Can I connect several devices?', 'Yes, compatible devices can share your home network. Your experience depends on your plan, Wi-Fi setup and the activities running at the same time.'],
  ['payments', 'How do I get help with payments and renewals?', 'Contact customer care about your existing account. Payments and renewals are not processed on this website.'],
  ['technical', 'How can I improve Wi-Fi coverage at home?', 'Try your device nearer the router and note whether the connection improves. Building layout, equipment and interference can affect Wi-Fi coverage. Contact support if you need help.'],
  ['account', 'How do I access My ikonectt?', 'Contact customer care for account access or password recovery. Live customer account access is not connected here.'],
  ['requests', 'How do I contact support?', `Email ${publicContacts.emails[0].address} or call ${publicContacts.phones[0].label}. Website enquiry forms do not send messages.`]
];
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
