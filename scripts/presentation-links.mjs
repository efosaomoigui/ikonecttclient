// Loaded only into the built presentation copies of A/E. Their source and
// ordinary website builds keep their existing navigation behavior.
export function installPresentationLinks(doc = document) {
  const win = doc.defaultView;
  const portal = 'https://portal.ikonectt.com';
  function external(anchor, href) {
    anchor.setAttribute('href', href);
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
  }
  function refresh() {
    // Demo-only wording follows the same build boundary as the portal links.
    const intro=doc.querySelector('[data-portal-intro]');
    const copy='Manage your account and subscription through the official My Ikonectt customer portal.';
    if(intro&&intro.textContent!==copy)intro.textContent=copy;
    const cta=doc.querySelector('[data-portal-cta]');
    if(cta&&cta.textContent!=='My ikonectt')cta.textContent='My ikonectt';
    for (const anchor of doc.querySelectorAll('a[href="#/my-ikonectt/sign-in"], a[href="#portal"]')) {
      external(anchor, portal);
      anchor.dataset.ikPresentationCustomer = 'true';
    }

  }
  function capture(event) {
    const target = event.target?.closest?.('a,button');
    if (target?.matches('[data-ik-presentation-customer]')) {
      // Keep the anchor's native new-tab behavior; suppress the template's
      // existing in-page preview handlers that would otherwise intercept it.
      event.stopImmediatePropagation();
    } else if (target?.matches('#home-my-ikonectt')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      win.open(portal, '_blank', 'noopener,noreferrer');
    }
  }
  doc.addEventListener('click', capture, true);
  const observer = new win.MutationObserver(refresh);
  observer.observe(doc.documentElement, {childList:true, subtree:true});
  refresh();
  return () => { observer.disconnect(); doc.removeEventListener('click', capture, true); };
}
if (typeof document !== 'undefined') installPresentationLinks(document);
