// Add only client-confirmed public contact details here. Entries are displayed
// only when explicitly marked verified. Conflicting historical drafts are not
// a contact configuration. The review sample is defined separately in the UI.
export const footerContacts = Object.freeze({
 address:null, // {lines:[...], mapUrl:'https://...', verified:true}
 emails:[],   // {address:'...', label:'Customer support', verified:true}
 phones:[],   // {number:'+...', label:'...', verified:true}
 socials:[],  // {platform:'facebook'|'x'|'instagram'|'linkedin', url:'https://...', verified:true}
});
