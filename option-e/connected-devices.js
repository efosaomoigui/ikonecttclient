// As the pointer or keyboard moves across the row, the imagery follows gently.
const row = document.querySelector('.ik-site[data-template=e] .e-device-row');
if (row) {
 const links = [...row.querySelectorAll('.e-device-link')];
 const select = selected => links.forEach((link, index) => {
  link.dataset.deviceActive = String(index === selected);
  link.style.setProperty('--e-device-shift', selected < 0 || index === selected ? '0px' : index < selected ? '-5px' : '5px');
 });
 links.forEach((link, index) => {
  link.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') select(index); });
  link.addEventListener('focus', () => select(index));
 });
 row.addEventListener('pointerleave', () => select(links.indexOf(document.activeElement)));
 row.addEventListener('focusout', event => { if (!row.contains(event.relatedTarget)) select(-1); });
}
