export const pages = {
  home: ['Home',''],
  residential: ['Internet that keeps your home connected.','Find broadband options for the way you live, work and enjoy your home.'],
  'residential/plans': ['Residential Plans','Explore broadband options for your home.'],
  'residential/plans/demo-1': ['Residential Plan Details','Demonstration layout. This is not an available product.'],
  'residential/plans/demo-2': ['Residential Plan Details','Demonstration layout. This is not an available product.'],
  'residential/compare': ['Compare Plans','Review plan attributes when the verified catalogue is available.'],
  'residential/installation': ['Installation Enquiry','Share your location and requirements.'],
  business: ['Connectivity built for business.','Explore broadband solutions for your workplace, team and business operations.'],
  'business/solutions': ['Business Solutions','Tell us what your organisation needs.'],
  'business/solutions/connectivity': ['Business Connectivity','A solution-detail preview awaiting verified product definitions.'],
  'business/solutions/sme': ['SME Connectivity','Explore connectivity requirements for a small or growing business.'],
  'business/solutions/enterprise': ['Enterprise Connectivity','Discuss connectivity requirements for your organisation.'],
  'business/plans': ['Business Plans','Find the right business connection.'],
  'business/quote': ['Request a Quote','Share your requirements with our team.'],
  coverage: ['Check Coverage','Check service availability at your address.'],
  'coverage/results': ['Coverage Results','Review the address-check journey.'],
  'coverage/verification': ['Address Verification','Request an address review.'],
  support: ['How can we help?','Find answers, troubleshoot a problem or contact our support team.'],
  'support/faqs': ['Frequently Asked Questions','Find guidance by topic.'],
  'support/troubleshooting': ['Troubleshooting','Work through a few checks, then choose the right support pathway.'],
  'support/fault': ['Report a Fault','Tell us what is happening with your connection.'],
  'support/service-request': ['Service Request','Choose the assistance you need.'],
  'support/contact': ['Contact Support','Get help without signing in for a general enquiry.'],
  about: ['Connecting people and possibilities.','About Ikonectt.'],
  contact: ["Let’s talk.",'Choose the right enquiry pathway.'],
  privacy: ['Privacy Policy','Approved policy text is awaiting confirmation.'],
  terms: ['Terms and Conditions','Approved terms are awaiting confirmation.'],
  'my-ikonectt/sign-in': ['Welcome to My Ikonectt.','Sign-in interface preview.'],
  'my-ikonectt/forgot-password': ['Forgot Password','Recover access to your account.'],
  'my-ikonectt/preview': ['My Ikonectt','Customer portal preview. No authenticated account is connected.']
};
export const aliases = {'residential/enquire':'residential/installation','coverage/verify':'coverage/verification','my-ikonectt/login':'my-ikonectt/sign-in',plans:'residential/plans',portal:'my-ikonectt/sign-in',top:'home'};
export const menus = [
  {id:'residential',label:'Residential',groups:[['Explore',[['Residential Overview','residential'],['Residential Plans','residential/plans'],['Compare Plans','residential/compare']]],['Get Connected',[['Check Coverage','coverage'],['Installation Enquiry','residential/installation'],['Installation FAQs','support/faqs?category=coverage']]]],promo:['Find internet for your home.','Explore plans and check service availability at your address.','Check Coverage','coverage']},
  {id:'business',label:'Business',groups:[['Solutions',[['Business Overview','business'],['Business Solutions','business/solutions'],['SME Connectivity','business/solutions/sme'],['Enterprise Connectivity','business/solutions/enterprise']]],['Get Started',[['Business Plans','business/plans'],['Request a Quote','business/quote'],['Check Coverage','coverage']]]],promo:['Connectivity for your business.','Tell us what your organisation needs.','Request a Quote','business/quote']},
  {id:'coverage',label:'Coverage',groups:[['Coverage',[['Check Coverage','coverage'],['Address Verification','coverage/verification'],['Coverage FAQs','support/faqs?category=coverage']]]]},
  {id:'support',label:'Support',groups:[['Help',[['Help Centre','support'],['FAQs','support/faqs'],['Troubleshooting','support/troubleshooting']]],['Get Support',[['Report a Fault','support/fault'],['Service Requests','support/service-request'],['Contact Support','support/contact']]]]},
  {id:'about',label:'About Us',groups:[['Company',[['About Ikonectt','about'],['Contact','contact'],['Privacy','privacy'],['Terms','terms']]]]}
];
export function parseRoute(hash='') {
  let value=hash.replace(/^#\/?/,'').replace(/\/$/,'') || 'home';
  const [path,query='']=value.split('?');
  return {path:aliases[path]||path,query:new URLSearchParams(query)};
}
