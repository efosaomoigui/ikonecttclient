// Keep page context in the local design selector when A uses its live server.
(()=>{
 if(window.parent===window||!document.referrer)return;
 const referrer=new URL(document.referrer);
 if(!['127.0.0.1','localhost'].includes(location.hostname)||!['127.0.0.1','localhost'].includes(referrer.hostname))return;
 const report=()=>parent.postMessage({type:'ik:local-preview-route',hash:location.hash||'#/home'},referrer.origin);
 addEventListener('hashchange',report);report();
})();
