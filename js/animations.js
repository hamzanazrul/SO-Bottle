/**
 * SO BOTTOL - GSAP & ScrollTrigger Animations
 * Pure Static Front-end Animation Suite (Zero Three.js Dependencies)
 */

document.addEventListener('DOMContentLoaded', () => {
  initSiteAnimations();
});

function initSiteAnimations() {
  if (typeof gsap === 'undefined') return;

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // 1. Initial Page Load Reveal
  const loadTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  loadTl
    .from('.site-header', {
      y: -50,
      opacity: 0,
      duration: 0.8
    })
    .from('.hero-badge', {
      scale: 0.85,
      opacity: 0,
      duration: 0.5
    }, '-=0.4')
    .from('.hero-title .title-line', {
      y: 50,
      opacity: 0,
      stagger: 0.12,
      duration: 0.8
    }, '-=0.3')
    .from('.hero-subtitle', {
      y: 25,
      opacity: 0,
      duration: 0.7
    }, '-=0.5')
    .from('.hero-actions .btn', {
      scale: 0.9,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6
    }, '-=0.4')
    .from('.hero-stats .stat-box', {
      y: 20,
      opacity: 0,
      stagger: 0.08,
      duration: 0.6
    }, '-=0.3')
    .from('.hero-showcase-frame', {
      scale: 0.92,
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'back.out(1.4)'
    }, '-=0.7')
    .from('.glass-tag', {
      scale: 0.8,
      opacity: 0,
      stagger: 0.15,
      duration: 0.6,
      ease: 'back.out(1.5)'
    }, '-=0.5');

  // 2. Interactive 3D Card Hover Tilt on Hero Photo
  const heroStage = document.querySelector('.hero-showcase-frame');
  if (heroStage) {
    heroStage.addEventListener('mousemove', (e) => {
      const rect = heroStage.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(heroStage, {
        rotationY: x * 0.04,
        rotationX: -y * 0.04,
        transformPerspective: 900,
        duration: 0.4,
        ease: 'power1.out'
      });
    });

    heroStage.addEventListener('mouseleave', () => {
      gsap.to(heroStage, {
        rotationY: 0,
        rotationX: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
  }

  // 3. ScrollTrigger Reveals (Plays once smoothly & clears props)
  if (typeof ScrollTrigger !== 'undefined') {
    // Feature Cards
    gsap.fromTo('.feature-card', 
      { y: 35, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '#features-section',
          start: 'top 85%',
          once: true
        }
      }
    );

    // Collection Section
    gsap.fromTo('.bottle-coverflow-swiper',
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '#collection-section',
          start: 'top 85%',
          once: true
        }
      }
    );

    // Order Section Cards
    gsap.fromTo('.order-preview-card',
      { x: -35, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '#order-section',
          start: 'top 85%',
          once: true
        }
      }
    );

    gsap.fromTo('.order-form-card',
      { x: 35, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '#order-section',
          start: 'top 85%',
          once: true
        }
      }
    );

    // Trust Banner
    gsap.fromTo('.trust-banner',
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.trust-banner',
          start: 'top 90%',
          once: true
        }
      }
    );
  }

  // 4. Magnetic Button Micro-interaction
  const magneticButtons = document.querySelectorAll('.magnetic-btn');
  magneticButtons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.25,
        y: y * 0.25,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)'
      });
    });
  });
}
