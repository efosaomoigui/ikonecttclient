export const pages = {
  home: ['Home','Fibre broadband for homes and businesses in Nigeria. Compare plans, review coverage options and contact ikonectt.'],
  residential: ['Home Broadband','Compare residential fibre plans for work, learning and entertainment at home.'],
  'residential/plans': ['Residential Plans','Compare home broadband speeds and prices, then confirm service terms with the team.'],
  'residential/plans/demo-1': ['Residential Plan Details','Review the selected plan’s speed, price and connection requirements.'],
  'residential/plans/demo-2': ['Residential Plan Details','Review the selected plan’s speed, price and connection requirements.'],
  'residential/compare': ['Compare Plans','Compare published speeds and prices for your home.'],
  'residential/installation': ['Installation Enquiry','Review the details needed for your installation enquiry.'],
  business: ['Business Broadband','Find business plans and prepare a connectivity enquiry for your workplace.'],
  'business/solutions': ['Business Connectivity Options','Find the information needed to discuss connectivity for your business.'],
  'business/solutions/connectivity': ['Workplace Connectivity','Plan an enquiry for one office, several locations or an existing connection.'],
  'business/solutions/sme': ['Small Business Connectivity','Prepare a broadband enquiry for a small or growing team.'],
  'business/solutions/enterprise': ['Enterprise Connectivity','Outline your sites, users and service requirements for a tailored discussion.'],
  'business/plans': ['Business Plans','Compare business broadband speeds and prices before requesting a quote.'],
  'business/quote': ['Request a Quote','Review your business location, team needs and preferred plan.'],
  coverage: ['Check Coverage','Contact the team to confirm internet availability at your address.'],
  'coverage/results': ['Coverage Results','Review the coverage status and next steps for address confirmation.'],
  'coverage/verification': ['Address Verification','Provide the details needed for the team to review your location.'],
  support: ['How can we help?','Find answers, troubleshoot a problem or contact our support team.'],
  'support/faqs': ['Frequently Asked Questions','Find guidance by topic.'],
  'support/troubleshooting': ['Troubleshooting','Check your devices, Wi-Fi and router before contacting support.'],
  'support/fault': ['Report a Fault','Review a report of your connection problem and the checks you have tried.'],
  'support/service-request': ['Service Request','Prepare an enquiry about installation, account access, renewals or a service change.'],
  'support/contact': ['Contact Support','Email or call customer care for help with your connection.'],
  about: ['About ikonectt','The broadband brand of Intelivision Technologies Limited, a Nigerian internet service provider.'],
  contact: ['Contact ikonectt','Find our office, email address and phone number, or choose help for a specific enquiry.'],
  privacy: ['Privacy Policy','Our privacy policy is awaiting publication. Contact customer care with privacy questions.'],
  terms: ['Terms and Conditions','Service terms are awaiting publication. Confirm applicable conditions with customer care.'],
  'my-ikonectt/sign-in': ['My ikonectt','Contact customer care for account assistance.'],
  'my-ikonectt/forgot-password': ['Account Recovery Help','Contact customer care for help recovering access to your real account.'],
  'my-ikonectt/preview': ['My ikonectt','Find help with account access, services and renewals.']
};
export const aliases = {'residential/plans/details':'residential/plans/demo-1','residential/enquire':'residential/installation','coverage/verify':'coverage/verification','my-ikonectt/login':'my-ikonectt/sign-in',plans:'residential/plans',portal:'my-ikonectt/sign-in',top:'home'};
export const menus = [
  {id:'residential',label:'Residential',groups:[['Explore',[['Residential Overview','residential'],['Residential Plans','residential/plans'],['Compare Plans','residential/compare']]],['Get Connected',[['Check Coverage','coverage'],['Installation Enquiry','residential/installation'],['Installation FAQs','support/faqs?category=coverage']]]],promo:['Find internet for your home.','Compare home plans and ask about coverage at your address.','Check Coverage','coverage']},
  {id:'business',label:'Business',groups:[['Solutions',[['Business Overview','business'],['Business Solutions','business/solutions'],['SME Connectivity','business/solutions/sme'],['Enterprise Connectivity','business/solutions/enterprise']]],['Get Started',[['Business Plans','business/plans'],['Request a Quote','business/quote'],['Check Coverage','coverage']]]],promo:['Connectivity for your business.','Tell us what your organisation needs.','Request a Quote','business/quote']},
  {id:'coverage',label:'Coverage',groups:[['Coverage',[['Check Coverage','coverage'],['Address Verification','coverage/verification'],['Coverage FAQs','support/faqs?category=coverage']]]]},
  {id:'support',label:'Support',groups:[['Help',[['Help Centre','support'],['FAQs','support/faqs'],['Troubleshooting','support/troubleshooting']]],['Get Support',[['Report a Fault','support/fault'],['Service Requests','support/service-request'],['Contact Support','support/contact']]]]},
  {id:'about',label:'Our Company',groups:[['Company',[['About ikonectt','about'],['Contact','contact'],['Privacy','privacy'],['Terms','terms']]]]}
];
export function parseRoute(hash='') {
  let value=hash.replace(/^#\/?/,'').replace(/\/$/,'') || 'home';
  const [path,query='']=value.split('?');
  return {path:aliases[path]||path,query:new URLSearchParams(query)};
}
