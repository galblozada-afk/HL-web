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
  const stage = hero?.querySelector('.hl-home-stage');
  const reel = hero?.querySelector('.hl-home-reel');
  const copy = hero?.querySelector('.hl-home-copy');
  const controls = hero?.querySelector('.hl-home-controls');
  const header = hero?.querySelector('.hl-home-header');
  if (!hero || !stage || !reel || !copy || reduceMotion.matches || hero.dataset.scrollSceneInitialized) return;

  hero.dataset.scrollSceneInitialized = 'true';
  const startOffset = hero.offsetTop;
  let frame = 0;
  const update = () => {
    frame = 0;
    const progress = Math.max(0, Math.min(1, (window.scrollY - startOffset) / Math.max(window.innerHeight, 1)));
    reel.style.setProperty('--reveal-progress', progress.toFixed(4));
    reel.style.transform = `scale(${1 + progress * .15})`;
    reel.style.opacity = String(1 - progress * .18);
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
