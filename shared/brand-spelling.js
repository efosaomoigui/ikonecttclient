// Client-approved spelling. Presentation only; never alter user-entered content.
export const brandSpelling=value=>value.replace(/\bikonectt\b/gi,'ikonectt');
const excluded='script,style,textarea,[contenteditable],[data-role="user"]';
const attributes=['aria-label','alt','title','placeholder'];
export function mountBrandSpelling(root){
 const doc=root.ownerDocument,win=doc.defaultView;
 function text(node){if(node.parentElement?.closest(excluded))return;const value=brandSpelling(node.data);if(value!==node.data)node.data=value;}
 function labels(element){if(element.closest(excluded))return;for(const name of attributes){const value=element.getAttribute(name);if(value){const corrected=brandSpelling(value);if(value!==corrected)element.setAttribute(name,corrected);}}}
 function scan(node){
  if(node.nodeType===3){text(node);return;}
  if(node.nodeType!==1||node.closest(excluded))return;
  labels(node);for(const element of node.querySelectorAll('[aria-label],[alt],[title],[placeholder]'))labels(element);
  const walker=doc.createTreeWalker(node,4);while(walker.nextNode())text(walker.currentNode);
 }
 function metadata(){
  const title=brandSpelling(doc.title);if(doc.title!==title)doc.title=title;
  for(const meta of doc.head.querySelectorAll('meta[content]')){const value=meta.content,corrected=brandSpelling(value);if(value!==corrected)meta.content=corrected;}
 }
 scan(root);metadata();
 const observer=new win.MutationObserver(records=>{for(const record of records){if(record.type==='characterData')text(record.target);else if(record.type==='attributes')labels(record.target);else for(const node of record.addedNodes)scan(node);}});
 observer.observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:attributes});
 const headObserver=new win.MutationObserver(metadata);headObserver.observe(doc.head,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['content']});
 return ()=>{observer.disconnect();headObserver.disconnect();};
}
