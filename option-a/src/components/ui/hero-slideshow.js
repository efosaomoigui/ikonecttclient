// Template A only. The image and progress ring share one elapsed-time clock.
export function mountHeroSlideshow(root, slides, {dwell = 5500, fade = 900, clock = root.ownerDocument.defaultView} = {}) {
  const doc = root.ownerDocument, win = doc.defaultView;
  const stage = root.querySelector('[data-hero-images]');
  const toggle = root.querySelector('[data-hero-toggle]');
  const announcement = root.querySelector('[data-hero-announcement]');
  const motion = win.matchMedia('(prefers-reduced-motion: reduce)');
  const abort = new win.AbortController(), options = {signal: abort.signal};
  let reduced = motion.matches, playing = !reduced && !win.navigator.connection?.saveData;
  let index = 0, elapsed = 0, last = null, frame = 0, transition = null;
  let busy = true, destroyed = false, hovered = false, focused = false, inView = true;
  const failed = new Set();
  const home = root.closest('main');
  const intro = root.querySelector('[data-hero-city-intro]');
  let introActive=Boolean(intro&&!reduced&&!win.navigator.connection?.saveData),introElapsed=0;
  if(!introActive)intro?.remove();
  root.dataset.heroIntro=introActive?'city':'complete';
  function endIntro(){introActive=false;intro?.remove();root.dataset.heroIntro='complete';elapsed=0;}
  function paintIntro(){
    const fadeProgress=Math.max(0,Math.min(1,(introElapsed-1800)/800));
    intro.style.opacity=String(1-fadeProgress*fadeProgress*(3-2*fadeProgress));
    intro.querySelectorAll('[data-city-route]').forEach((path,i)=>{
      const travel=Math.max(0,Math.min(1,(introElapsed-i*300)/1300));path.style.strokeDashoffset=String(1-travel);
    });
    intro.querySelectorAll('[data-city-node]').forEach((node,i)=>node.style.opacity=String(.15+.85*Math.max(0,Math.min(1,(introElapsed-900-i*300)/400))));
  }

  function pictureFor(i) {
    const picture = doc.createElement('picture');
    picture.className = 'ik-hero-picture'; picture.dataset.slide = String(i);
    for (const [key, media, sizes] of [['desktop','(min-width: 1024px)','100vw'],['medium','(min-width: 768px)','66vw']]) {
      const source = doc.createElement('source'), item = slides[i][key];
      source.media = media; source.srcset = item.srcSet; source.sizes = sizes;
      source.width = item.width; source.height = item.height; picture.append(source);
    }
    const item = slides[i].mobile, image = doc.createElement('img');
    image.alt = ''; image.width = item.width; image.height = item.height;
    image.srcset = item.srcSet; image.sizes = '100vw'; image.src = item.src;
    image.decoding = 'async'; image.loading = 'eager'; image.fetchPriority = 'low';
    picture.append(image); return picture;
  }

  function ready(picture) {
    const image = picture.querySelector('img');
    return new Promise((resolve, reject) => {
      const decode = () => {
        if (image.naturalWidth === 0) {reject(new Error('Hero image unavailable')); return;}
        (image.decode ? image.decode() : Promise.resolve()).then(resolve, reject);
      };
      if (image.complete) decode();
      else { image.addEventListener('load', decode, {once:true, signal:abort.signal}); image.addEventListener('error', reject, {once:true, signal:abort.signal}); }
    });
  }

  function blocked() { return !playing || reduced || doc.hidden || home?.hidden || !inView || hovered || focused; }
  function finishTransition() {
    transition.incoming.style.clipPath = '';
    transition.incoming.style.removeProperty('will-change');
    transition.outgoing?.remove(); transition.roll.remove();
    transition = null; busy = false; elapsed = 0;
  }
  function paint() {
    root.dataset.heroPlaying = String(playing && !reduced);
    root.dataset.heroState = busy ? 'loading' : blocked() ? 'paused' : 'playing';
    root.style.setProperty('--hero-progress', String(elapsed / dwell));
    toggle.setAttribute('aria-label', playing && !reduced ? 'Pause slideshow' : 'Play slideshow');
    toggle.setAttribute('aria-pressed', String(playing && !reduced));
    toggle.disabled = reduced || slides.length - failed.size < 2;
    toggle.title = reduced ? 'Automatic slideshow disabled by reduced-motion preference' : '';
    root.querySelectorAll('[data-hero-step]').forEach(button => button.disabled = busy || slides.length - failed.size < 2);
  }
  function wake() {
    if (frame) clock.cancelAnimationFrame(frame);
    frame = 0; last = null; paint();
    if (!destroyed && !doc.hidden && !home?.hidden && inView && (transition || (!blocked() && (!busy||introActive)))) frame = clock.requestAnimationFrame(tick);
  }
  function tick(now) {
    frame = 0;
    const delta = last === null ? 0 : Math.min(now - last, 100); last = now;
    if (introActive&&!blocked()) {
      introElapsed+=delta;paintIntro();if(introElapsed>=2600)endIntro();
    } else if (transition) {
      transition.elapsed += delta;
      const progress = reduced ? 1 : Math.min(1, transition.elapsed / fade);
      // Unroll the new photograph without stretching or moving its approved crop.
      const eased = progress * progress * (3 - 2 * progress);
      const edge = transition.direction > 0 ? eased * 100 : (1 - eased) * 100;
      transition.incoming.style.clipPath = transition.direction > 0
        ? `inset(0 ${100 - edge}% 0 0)` : `inset(0 0 0 ${edge}%)`;
      transition.roll.style.left = `${edge}%`;
      transition.roll.style.opacity = String(Math.sin(Math.PI * progress) * .65);
      // The outgoing image stays opaque underneath; there is no blank frame.
      if (progress === 1) finishTransition();
    } else if (!blocked() && !busy) {
      elapsed += delta;
      if (elapsed >= dwell) {elapsed = dwell; void select(1, false);}
    }
    paint();
    if (!destroyed && !doc.hidden && !home?.hidden && inView && (transition || (!blocked() && (!busy||introActive)))) frame = clock.requestAnimationFrame(tick);
    else last = null;
  }
  async function select(direction, manual = true) {
    if (destroyed || busy) return;
    if(introActive)endIntro();
    if (manual) {playing = false; elapsed = 0;}
    busy = true; wake();
    for (let offset = 1; offset < slides.length; offset++) {
      const next = (index + direction * offset + slides.length * 2) % slides.length;
      if (failed.has(next)) continue;
      const picture = pictureFor(next); stage.append(picture);
      try {
        await ready(picture);
        if (destroyed) {picture.remove(); return;}
        const outgoing = stage.querySelector('[data-current]');
        outgoing?.removeAttribute('data-current'); picture.dataset.current = '';
        index = next; elapsed = 0;
        if (manual) announcement.textContent = `${slides[next].name}, slide ${next + 1} of ${slides.length}`;
        if (reduced || !outgoing) {outgoing?.remove(); picture.style.opacity = '1'; busy = false;}
        else {
          picture.style.opacity = '1';
          picture.style.clipPath = direction > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
          picture.style.willChange = 'clip-path';
          const roll = doc.createElement('span'); roll.className = 'ik-hero-carpet-roll';
          roll.setAttribute('aria-hidden', 'true'); roll.dataset.direction = String(direction);
          roll.style.left = direction > 0 ? '0%' : '100%'; roll.style.opacity = '0'; stage.append(roll);
          transition = {incoming:picture, outgoing, roll, direction, elapsed:0};
        }
        wake(); return;
      } catch {
        picture.remove(); if (destroyed) return; failed.add(next);
      }
    }
    busy = false; playing = false; elapsed = 0; wake();
  }

  root.querySelectorAll('[data-hero-step]').forEach(button => button.addEventListener('click', () => void select(Number(button.dataset.heroStep)), options));
  toggle.addEventListener('click', () => {if (!reduced) playing = !playing; wake();}, options);
  const controls = root.querySelector('[data-hero-controls]');
  controls.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {event.preventDefault(); void select(event.key === 'ArrowLeft' ? -1 : 1);}
  }, options);
  root.addEventListener('pointerenter', event => {if (event.pointerType === 'mouse') {hovered = true; wake();}}, options);
  root.addEventListener('pointerleave', () => {hovered = false; wake();}, options);
  root.addEventListener('focusin', () => {focused = true; wake();}, options);
  root.addEventListener('focusout', event => {focused = root.contains(event.relatedTarget); wake();}, options);
  root.addEventListener('pointerdown', event => {if (event.pointerType === 'touch' && !event.target.closest('[data-hero-toggle]')) {playing = false; wake();}}, options);
  doc.addEventListener('visibilitychange', wake, options);
  function motionChanged() {reduced = motion.matches; playing = false; if(reduced&&introActive)endIntro(); if (reduced && transition) finishTransition(); elapsed = 0; wake();}
  motion.addEventListener('change', motionChanged);
  const observer = new win.MutationObserver(wake);
  if (home) observer.observe(home, {attributes:true, attributeFilter:['hidden']});
  const intersection = win.IntersectionObserver ? new win.IntersectionObserver(entries => {inView = entries[0].isIntersecting; wake();}) : null;
  intersection?.observe(root);

  const first = stage.querySelector('[data-current]');
  ready(first).then(() => {if (!destroyed) {busy = false; wake();}}, () => {
    if (destroyed) return;
    first.remove(); failed.add(0); busy = false; void select(1, false);
  });
  wake();
  return () => {
    destroyed = true; abort.abort(); if (frame) clock.cancelAnimationFrame(frame);
    if (transition) finishTransition();
    if(introActive)endIntro();
    observer.disconnect(); intersection?.disconnect(); motion.removeEventListener('change', motionChanged);
  };
}
