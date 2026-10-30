// Loaded only into the built presentation copies of A/E. Their source and
// ordinary website builds keep their existing navigation behavior.
export function installPresentationLinks(doc = document) {
  const win = doc.defaultView;
  const portal = '/my-ikonectt/#/';
  function external(anchor, href) {
    anchor.setAttribute('href', href);
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
  }
  function refresh() {
    for (const anchor of doc.querySelectorAll('a[href="#/my-ikonectt/sign-in"], a[href="#portal"]')) {
      external(anchor, portal);
      anchor.dataset.ikPresentationCustomer = 'true';
    }
    for (const header of doc.querySelectorAll('.ik-header')) {
      for (const [selector, mobile] of [['.ik-nav-actions', false], ['.ik-desktop-nav', true]]) {
        const host = header.querySelector(selector);
        if (!host || host.querySelector('[data-ik-presentation-admin]')) continue;
        const anchor = doc.createElement('a');
        anchor.textContent = 'Admin';
        anchor.title = 'Temporary Admin/CRM demonstration · opens in a new tab';
        anchor.className = 'ik-button ik-presentation-admin' + (mobile ? ' ik-mobile-portal' : '');
        anchor.dataset.ikPresentationAdmin = 'true';
        external(anchor, '/admin/');
        if (mobile) host.append(anchor); else host.prepend(anchor);
      }
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
