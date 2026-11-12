// Extend E's existing disclosures without changing routes or shared templates.
const header = document.querySelector('.ik-site[data-template=e] .ik-header');
if (header) {
 const nav = header.querySelector('.ik-desktop-nav');
 const mobile = header.querySelector('.ik-mobile-button');
 const close = () => {
  header.querySelectorAll('.ik-nav-trigger').forEach(button => button.setAttribute('aria-expanded', 'false'));
  header.querySelectorAll('.ik-mega').forEach(panel => panel.hidden = true);
 };
 // A keyboard user can tab out naturally without leaving a disclosure open.
 header.addEventListener('focusout', event => {
  if (!header.contains(event.relatedTarget)) {
   close();
   nav.classList.remove('is-open');
   mobile.setAttribute('aria-expanded', 'false');
  }
 });
 header.querySelectorAll('.ik-mega').forEach(panel => {
  panel.addEventListener('keydown', event => {
   if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
   const links = [...panel.querySelectorAll('a')].filter(link => link.getClientRects().length);
   const index = links.indexOf(document.activeElement);
   if (index < 0) return;
   event.preventDefault();
   const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 :
    (index + (event.key === 'ArrowDown' ? 1 : links.length - 1)) % links.length;
   links[next].focus();
  });
 });
 // Clear mobile disclosure state when crossing the existing desktop breakpoint.
 window.matchMedia('(min-width:1024px)').addEventListener('change', () => {
  close();nav.classList.remove('is-open');mobile.setAttribute('aria-expanded', 'false');
 });
}
