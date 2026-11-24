/** Native-scroll narrative. One scheduled frame per scroll; no perpetual render loop. */
document.addEventListener('DOMContentLoaded', () => {
  const journey = document.querySelector('#journey');
  if (!journey) return;
  const chapters = [...document.querySelectorAll('.story-chapter')];
  const links = [...document.querySelectorAll('.chapter-nav a')];
  const bottle = document.querySelector('.bottle-motion');
  const rings = document.querySelector('.water-rings');
  const word = document.querySelector('.stage-word');
  const label = document.querySelector('#bottle-label-container');
  const intro = document.querySelector('.story-intro');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 769px)');
  const progress = document.createElement('div');
  progress.className = 'story-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  const words = ['PURE', 'FORM', 'YOURS'];
  let geometry, frame = 0, active = -1;
  const clamp = value => Math.max(0, Math.min(1, value));
  function measure() {
    const scroll = window.scrollY;
    geometry = {
      top:journey.getBoundingClientRect().top + scroll,
      bottom:journey.getBoundingClientRect().bottom + scroll,
      centers:chapters.map(chapter => {const rect = chapter.getBoundingClientRect();return rect.top + scroll + rect.height / 2;}),
      maxScroll:Math.max(1, document.documentElement.scrollHeight - innerHeight)
    };
    schedule();
  }
  function render() {
    frame = 0;
    if (document.hidden || !geometry) return;
    const y = scrollY;
    progress.style.transform = `scaleX(${clamp(y / geometry.maxScroll)})`;
    const focusLine = y + innerHeight * (desktop.matches ? .52 : .66);
    let nearest = 0;
    geometry.centers.forEach((center, index) => {
      if (Math.abs(center - focusLine) < Math.abs(geometry.centers[nearest] - focusLine)) nearest = index;
    });
    if (nearest !== active) {
      active = nearest;
      links.forEach((link, index) => {
        link.classList.toggle('is-active', index === active);
        if (index === active) link.setAttribute('aria-current','step');
        else link.removeAttribute('aria-current');
      });
      word.textContent = words[active];
    }
    if (motion.matches) {
      bottle.style.removeProperty('transform');rings.style.removeProperty('transform');label.style.opacity = '1';
      return;
    }
    if (y + innerHeight < geometry.top || y > geometry.bottom) return;
    const phase = clamp((focusLine - geometry.centers[0]) / (geometry.centers[2] - geometry.centers[0]));
    if (desktop.matches) {
      const rotation = -9 + Math.sin(phase * Math.PI) * 16;
      const lift = Math.sin(phase * Math.PI) * -22;
      const scale = .92 + Math.sin(phase * Math.PI) * .08;
      bottle.style.transform = `translateY(${lift.toFixed(2)}px) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      rings.style.transform = `scaleY(.35) scale(${(.8 + phase * .35).toFixed(3)})`;
      label.style.opacity = String(.2 + clamp((phase - .25) / .55) * .8);
    } else {
      bottle.style.removeProperty('transform');rings.style.removeProperty('transform');label.style.opacity = '1';
    }
  }
  function schedule() {if (!frame && !document.hidden) frame = requestAnimationFrame(render);}
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', measure, {passive:true});
  addEventListener('pageshow', measure);
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => {intro.classList.remove('intro-ready');measure();});
  desktop.addEventListener('change', measure);
  document.fonts?.ready.then(measure);
  document.querySelectorAll('img').forEach(image => {if (!image.complete) image.addEventListener('load', measure, {once:true});});
  if (!motion.matches) intro.classList.add('intro-ready');
  const storyName = document.querySelector('#story-name');
  const orderName = document.querySelector('#order-label-name');
  const text = document.querySelector('#label-custom-text');
  function updateName(value) {
    text.textContent = value.trim() || 'YOUR STORY';
    if (value.length > 12) {text.setAttribute('textLength', '245');text.setAttribute('lengthAdjust','spacingAndGlyphs');}
    else {text.removeAttribute('textLength');text.removeAttribute('lengthAdjust');}
  }
  storyName.addEventListener('input', () => {
    orderName.value = storyName.value.trim() || 'YOUR NAME';
    orderName.dispatchEvent(new Event('input', {bubbles:true}));
    updateName(storyName.value);
  });
  orderName.addEventListener('input', () => {
    storyName.value = orderName.value === 'YOUR NAME' ? '' : orderName.value;
    updateName(storyName.value);
  });
  measure();
});
