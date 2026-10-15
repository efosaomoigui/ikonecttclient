// Editorial draft copy. Selected published preview pricing is centralised in catalogue.js.
export const company = {
  name: 'Ikonectt', legalName: 'Intelivision Technologies Limited',
  description: 'Ikonectt is the broadband brand of Intelivision Technologies, serving homes and businesses.'
};
export const categories = [
  ['internet', 'Internet and Wi-Fi'], ['payments', 'Plans and Payments'],
  ['coverage', 'Coverage and Installation'], ['account', 'My Ikonectt Account'],
  ['technical', 'Technical Troubleshooting'], ['requests', 'Service Requests and Complaints']
];
export const faqs = [
  ['coverage', 'How do I check coverage?', 'Availability depends on your address. Use our coverage checker or request verification from our team. The Phase 1 checker demonstrates the journey; it does not check a live network.'],
  ['payments', 'How do I select a plan?', 'Explore available plans and choose what suits your needs. Compare the published preview speeds and monthly prices. Pricing and final terms remain subject to client confirmation.'],
  ['coverage', 'How do I request installation?', 'Start by checking coverage and selecting a suitable plan. Our team will confirm eligibility, installation requirements and the next steps.'],
  ['payments', 'Where can I find plan conditions?', 'Service availability and final terms are confirmed for your address. Approved plan terms are required before a subscription can be offered.'],
  ['internet', 'Can I connect several devices?', 'You can connect multiple compatible devices through your home network. Your experience will depend on your plan, Wi-Fi setup and the devices in use.'],
  ['payments', 'How do I renew or manage my service?', 'Contact support if you need assistance. My Ikonectt is a visual preview in Phase 1; payments and renewals are not connected.'],
  ['technical', 'Can I improve Wi-Fi coverage around my home?', 'Wi-Fi coverage depends on your equipment, building layout and interference. Contact support if you need help improving coverage.'],
  ['account', 'How do I access my customer account?', 'Use your account number to access My Ikonectt. Customer accounts are created through internal onboarding. The current sign-in interface is a preview only.'],
  ['requests', 'How do I contact support?', 'Use the Contact Support page. Verified support contact details and live request handling are still required; demonstration forms do not send messages.']
];
export const coverageStates = {
  available: {title:'Available', text:'This demonstration represents an address with service availability confirmed. A real service check and installation conditions would still be required.', route:'residential/installation', action:'Installation Enquiry'},
  verification: {title:'Verification Required', text:'This demonstration represents an address needing a manual check before service can be confirmed.', route:'coverage/verification', action:'Request Address Verification'},
  planned: {title:'Planned', text:'This demonstration represents planned service. No rollout date or availability commitment is implied.', route:'coverage/verification', action:'Register an Enquiry'},
  unavailable: {title:'Unavailable', text:'This demonstration represents an address without a confirmed service option. Ask for an address review; no alternative service is promised.', route:'coverage/verification', action:'Request an Address Review'},
  unknown: {title:'Unknown', text:'Service availability has not been established. A location name alone cannot confirm coverage.', route:'coverage/verification', action:'Request Address Verification'}
};
export const troubleshooting = {
  'no-internet': {title:'No internet connection', steps:['Check whether the issue affects one device or several.','Check the router power and note any indicator lights. Do not disconnect or look into a fibre connector.','Record what you observed and contact support if you still need help.']},
  slow: {title:'Slow connection', steps:['Note when the issue occurs and which devices are affected.','Check whether other devices or background downloads are using the connection.','Share the observations with support. No automated diagnostic test is running.']},
  wifi: {title:'Wi-Fi connection problems', steps:['Check that your device is connected to the intended Wi-Fi network.','Try a position nearer the router and note whether the experience changes.','Ask support for help with equipment, building layout or interference.']},
  router: {title:'Router issues', steps:['Check the power supply and note the router model and indicator lights.','Avoid a factory reset or changing service settings without support guidance.','Describe the issue in a fault report. Do not share router passwords.']},
  payment: {title:'Payment or renewal questions', steps:['Review your own payment reference or renewal information.','Use Contact Support for assistance. Do not share card details or one-time codes.','Private billing information requires authenticated access; this preview cannot retrieve it.']}
};
