import {activeDesigns, activeDesign} from './design-shortlist.js?v=2';
import {pages,parseRoute} from './routes.js';
import {mountBrandSpelling} from './brand-spelling.js';

export function supportedHash(hash) {
  if (typeof hash !== 'string' || !hash.startsWith('#/') || hash.length > 2048) return '#/home';
  return Object.hasOwn(pages,parseRoute(hash).path) ? hash : '#/home';
}

export function mountDesignPreview(doc = document, win = window) {
  const frame = doc.getElementById('preview-frame');
  if (!frame) return;
  mountBrandSpelling(doc.body);
  const params = new URLSearchParams(win.location.search);
  let selected = activeDesign(params.get('design') || params.get('option'));
  let route = supportedHash(params.get('route') || '#/home');
  let childWindow;
  const dev = ['localhost','127.0.0.1'].includes(win.location.hostname) && win.location.port === '3000';
  const baseURL = entry => dev && entry.id === 'a' ? 'http://localhost:3001/' : entry.path;
  const urlFor = (entry, hash=route) => baseURL(entry) + hash;

  function sync() {
    const url = urlFor(selected);
    doc.getElementById('preview-url-display').textContent = url;
    doc.getElementById('preview-external-link').href = url;
    doc.querySelectorAll('[data-option-link]').forEach(link => {
      const entry = activeDesigns.find(item=>item.id===link.dataset.optionLink);
      if (entry) link.href = urlFor(entry);
    });
    const current = new URL(win.location.href);
    current.searchParams.set('design',selected.id);current.searchParams.set('route',route);
    win.history.replaceState(null,'',current);
  }
  function readContext() {
    try {route = supportedHash(frame.contentWindow.location.hash || '#/home');} catch { /* Separate local dev-server origin: retain the last supported host route. */ }
    sync();
  }
  function switchLivePreview(id, preserve=true) {
    const entry = activeDesigns.find(item=>item.id===id);
    if (!entry) return; // Archived B/C/D are never active selector choices.
    if (preserve) readContext();
    selected = entry;
    frame.src = urlFor(entry);
    frame.title = entry.label + ' preview';
    doc.getElementById('active-preview-label').textContent = 'Preview: ' + entry.label;
    for (const item of activeDesigns) {
      const button = doc.getElementById('btn-toggle-' + item.id), active=item.id===id;
      button.className='px-3.5 py-1.5 rounded-lg transition-colors '+(active?item.color+' text-white font-bold shadow-sm':'text-white/70 hover:text-white');
      button.setAttribute('aria-pressed',String(active));
    }
    sync();
  }
  function childChanged() {readContext();}
  // A's optional live source server is a separate local origin. Retain the
  // visitor's page when switching designs after its entrypoint redirects there.
  win.addEventListener('message', event => {
    if (!['localhost','127.0.0.1'].includes(win.location.hostname) || selected.id !== 'a') return;
    if (event.source !== frame.contentWindow || !['http://127.0.0.1:3001','http://localhost:3001'].includes(event.origin)) return;
    if (event.data?.type !== 'ik:local-preview-route') return;
    route = supportedHash(event.data.hash);sync();
  });
  frame.addEventListener('load', () => {
    try {
      childWindow?.removeEventListener('hashchange',childChanged);
      childWindow=frame.contentWindow;
      childWindow.addEventListener('hashchange',childChanged);
      readContext();
    } catch { /* Context preservation is available for the same-origin packaged preview. */ }
  });
  win.switchLivePreview=switchLivePreview;
  win.setViewportWidth=width=>{doc.getElementById('preview-wrapper').style.maxWidth=width;};
  switchLivePreview(selected.id,false);
  return {switchLivePreview, readContext};
}
if (typeof document !== 'undefined') mountDesignPreview();
