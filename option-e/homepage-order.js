// Existing testimonials may load asynchronously in local review. Preserve their
// approval rules and content; move their section before About when it arrives.
export function arrangeHomepage(home) {
 if (!home?.closest('.ik-site[data-template=e]')) return () => {};
 const reorder = () => {
  const benefits = home.querySelector('#home-benefits');
  const testimonials = home.querySelector('#home-testimonials');
  const about = home.querySelector('#about');
  const plans = home.querySelector('#plans');
  if (!benefits || !testimonials || !about) return false;
  if (plans && plans.previousElementSibling !== benefits) plans.before(benefits);
  const preceding = plans || benefits;
  if (preceding.nextElementSibling !== testimonials) preceding.after(testimonials);
  if (testimonials.nextElementSibling !== about) testimonials.after(about);
  return true;
 };
 if (reorder()) return () => {};
 const observer = new home.ownerDocument.defaultView.MutationObserver(() => {
  if (reorder()) observer.disconnect();
 });
 observer.observe(home, {childList:true});
 return () => observer.disconnect();
}
if (typeof document !== 'undefined') arrangeHomepage(document.querySelector('.ik-site[data-template=e] .ik-home'));
