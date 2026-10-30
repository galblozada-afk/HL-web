const slides = [...document.querySelectorAll('[data-slide]')];
const title = document.querySelector('[data-current-title]');
const introMedia = document.querySelector('.hl-home-intro-media');
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
    title.innerHTML = '<img class="hl-home-current-logo" src="assets/luciernagas-logo-generated.png" alt="La extraÃ±a desapariciÃ³n de las luciÃ©rnagas" />';
      } else if (index === 2) {
        title.innerHTML = '<img class="hl-home-current-logo" src="assets/acpt-logo-generated.png" alt="Premios ACPT 2026" />';
      } else if (index === 3) {
        title.innerHTML = '<img class="hl-home-current-logo" src="assets/bluecatz-logo-generated.png" alt="Big Band Blue Catz &amp; Friends" />';
      } else if (index === 4) {
        title.innerHTML = '<img class="hl-home-current-logo" src="assets/lovesick-logo-generated.png" alt="LoveSick / CDMX" />';
  } else {
    title.textContent = slides[index].dataset.title || '';
  }
  if (introMedia) {
    const introSlide = slides[index].cloneNode(true);
    introSlide.removeAttribute('data-slide');
    introSlide.classList.add('is-active');
    const introVideo = introSlide.querySelector('video');
    if (introVideo) {
      introVideo.muted = true;
      introVideo.play().catch(() => {});
    }
    introMedia.replaceChildren(introSlide);
  }
  window.clearTimeout(timer);
    if (!reduceMotion.matches) timer = window.setTimeout(() => showSlide(index + 1), 10000);
}

document.querySelector('[data-prev]')?.addEventListener('click', () => showSlide(index - 1));
document.querySelector('[data-next]')?.addEventListener('click', () => showSlide(index + 1));
showSlide(0);

function initNativeScrollScene() {
  const hero = document.querySelector('.hl-home');
  const stage = hero?.querySelector('.hl-home-stage');
  const reel = hero?.querySelector('.hl-home-reel');
  const copy = hero?.querySelector('.hl-home-copy');
  const controls = hero?.querySelector('.hl-home-controls');
  const header = hero?.querySelector('.hl-home-header');
  const follow = document.querySelector('.hl-home-follow');
  if (!hero || !stage || !reel || !copy || reduceMotion.matches || hero.dataset.scrollSceneInitialized) return;

  hero.dataset.scrollSceneInitialized = 'true';
  const startOffset = hero.offsetTop;
  let frame = 0;
  const update = () => {
    frame = 0;
    // The scene uses the actual distance occupied by the sticky hero. This
    // keeps the animation consistent on short laptops and mobile browsers
    // where the viewport height changes while the browser chrome appears.
    const travel = Math.max(hero.offsetHeight - window.innerHeight, 1);
    const progress = Math.max(0, Math.min(1, (window.scrollY - startOffset) / travel));
    const mediaScale = 1 + progress * .04;
    // Let the card settle slightly lower before the first section begins.
    const cardProgress = Math.min(progress / .92, 1);
    const cardDrop = cardProgress * Math.min(window.innerHeight * .30, 280);
    const copyScale = 1 + progress * .08;
    reel.style.setProperty('--reveal-progress', progress.toFixed(4));
    reel.style.transform = `translate3d(0, ${cardDrop.toFixed(2)}px, 0) scale(${mediaScale})`;
    copy.style.transform = `translateY(${-progress * 24}px) scale(${copyScale})`;
    copy.style.opacity = String(1 - progress);
    if (controls) {
      controls.style.transform = `translateX(-50%) translateY(${progress * 8}px)`;
      controls.style.opacity = String(Math.max(0, 1 - progress * 1.2));
    }
    if (header) {
      header.style.transform = `translateY(${-progress * 12}px)`;
      header.style.opacity = String(1 - progress * .5);
    }
    if (follow) {
      follow.style.setProperty('--follow-enter', String(progress));
    }
  };
  const scheduleUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  update();
}

function initScrollScene() {
  initNativeScrollScene();     
}

initScrollScene();
window.addEventListener('load', initScrollScene, { once: true });

const homeRevealItems = document.querySelectorAll('.hl-home-reveal');
if ('IntersectionObserver' in window && homeRevealItems.length) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  homeRevealItems.forEach((item) => revealObserver.observe(item));
} else {
  homeRevealItems.forEach((item) => item.classList.add('is-visible'));
}
