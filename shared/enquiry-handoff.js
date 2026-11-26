// One-use, short-lived handoff in this document only. Never persisted or put in URLs.
let pending=null;
export function prepareEnquiryHandoff(route,details={}) {
  pending={route,expires:Date.now()+5*60*1000,name:String(details.name||'').slice(0,250),phone:String(details.phone||'').slice(0,30),message:String(details.message||'').slice(0,4000)};
}
export function consumeEnquiryHandoff(route) {
  if(!pending)return null;
  if(pending.expires<Date.now()){pending=null;return null;}
  if(pending.route!==route)return null;
  const value=pending;pending=null;return value;
}
export function clearEnquiryHandoff(){pending=null;}
