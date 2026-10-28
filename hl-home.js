const slides = [...document.querySelectorAll('[data-slide]')];
const title = document.querySelector('[data-current-title]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let index = 0;
let timer;

function showSlide(next) {
  if (!slides.length) return;
  index = (next + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    const video = slide.querySelector('video');
    const active = i === index;
    slide.classList.toggle('is-active', active);
    if (!video) return;
    if (active) video.play().catch(() => {});
    else video.pause();
  });
  if (index === 0) {
    title.innerHTML = '<img class="hl-home-current-logo" src="assets/urinetown-logo-generated.png" alt="Urinetown, el musical" />';
  } else if (index === 1) {
    title.innerHTML = '<img class="hl-home-current-logo" src="assets/luciernagas-logo-generated.png" alt="La extraña desaparición de las luciérnagas" />';
      } else if (index === 2) {
        title.innerHTML = '<img class="hl-home-current-logo" src="assets/acpt-logo-generated.png" alt="Premios ACPT 2026" />';
      } else if (index === 3) {
        title.innerHTML = '<img class="hl-home-current-logo" src="assets/bluecatz-logo-generated.png" alt="Big Band Blue Catz &amp; Friends" />';
      } else if (index === 4) {
        title.innerHTML = '<img class="hl-home-current-logo" src="assets/lovesick-logo-generated.png" alt="LoveSick / CDMX" />';
  } else {
    title.textContent = slides[index].dataset.title || '';
  }
  window.clearTimeout(timer);
    if (!reduceMotion.matches) timer = window.setTimeout(() => showSlide(index + 1), 10000);
}

document.querySelector('[data-prev]')?.addEventListener('click', () => showSlide(index - 1));
document.querySelector('[data-next]')?.addEventListener('click', () => showSlide(index + 1));
showSlide(0);

function initNativeScrollScene() {
  const hero = document.querySelector('.hl-home');
  const reel = hero?.querySelector('.hl-home-reel');
  const copy = hero?.querySelector('.hl-home-copy');
  const controls = hero?.querySelector('.hl-home-controls');
  const header = hero?.querySelector('.hl-home-header');
  if (!hero || !reel || !copy || reduceMotion.matches) return;

  const startOffset = hero.offsetTop;
  hero.classList.add('hl-native-pin');
  const update = () => {
    const progress = Math.max(0, Math.min(1, (window.scrollY - startOffset) / Math.max(window.innerHeight, 1)));
    reel.style.transform = `scale(${1 + progress * .15})`;
    reel.style.opacity = String(1 - progress);
    copy.style.transform = `translateY(${-progress * 40}px) scale(${1 + progress * .24})`;
    copy.style.opacity = String(1 - progress);
    if (controls) {
      controls.style.transform = `translateX(-50%) translateY(${progress * 28}px)`;
      controls.style.opacity = String(1 - progress);
    }
    if (header) {
      header.style.transform = `translateY(${-progress * 20}px)`;
      header.style.opacity = String(1 - progress * .85);
    }
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

function initScrollScene() {
  const hero = document.querySelector('.hl-home');
  const reel = hero?.querySelector('.hl-home-reel');
  const copy = hero?.querySelector('.hl-home-copy');
  const controls = hero?.querySelector('.hl-home-controls');
  const header = hero?.querySelector('.hl-home-header');
  if (!hero || !reel || !copy || reduceMotion.matches) return;
  if (!window.gsap || !window.ScrollTrigger) {
    initNativeScrollScene();
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);
  window.gsap.set([reel, copy], { willChange: 'transform, opacity' });
  window.gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: '+=100%',
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  })
    .fromTo(reel, { scale: 1, opacity: 1 }, { scale: 1.15, opacity: 0, ease: 'none' }, 0)
    .fromTo(copy, { scale: 1, opacity: 1, y: 0 }, { scale: 1.24, opacity: 0, y: -40, ease: 'none' }, 0)
    .to(controls, { opacity: 0, y: 28, ease: 'none' }, 0.08)
    .to(header, { opacity: 0.15, y: -20, ease: 'none' }, 0);
}

initScrollScene();
window.addEventListener('load', initScrollScene, { once: true });
