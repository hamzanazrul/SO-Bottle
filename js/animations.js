/** One-shot, compositor-only reveals. Content stays available without JavaScript. */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.nav-links');
  const closeMenu = () => {navigation.classList.remove('is-open'); toggle.setAttribute('aria-expanded','false');};
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  navigation?.addEventListener('click', event => {if (event.target.closest('a')) closeMenu();});
  document.addEventListener('keydown', event => {if(event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {closeMenu();toggle.focus();}});
  document.addEventListener('click', event => {if(!event.target.closest('.nav-wrapper') && toggle) closeMenu();});
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('reveal-enter');
      observer.unobserve(entry.target);
    });
  }, {threshold:.08});
  document.querySelectorAll('.feature-card,.section-header,.order-preview-card,.order-form-card,.trust-banner').forEach(element => observer.observe(element));
  motion.addEventListener('change', event => {if(event.matches) {observer.disconnect();document.querySelectorAll('.reveal-enter').forEach(element => element.classList.remove('reveal-enter'));}});
});
