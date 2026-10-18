const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

// The header has two deliberate states: integrated with the hero at the top,
// then a compact navigation that returns only when scrolling has paused.
let headerRestTimer = null;
let headerExitTimer = null;
let headerFrame = null;
const showCompactHeaderAfterRest = () => {
  header?.classList.add('is-moving');
  header?.classList.remove('is-paused');
  window.clearTimeout(headerRestTimer);
  headerRestTimer = window.setTimeout(() => {
    header?.classList.remove('is-moving');
    header?.classList.add('is-paused');
  }, 260);
};
const updateHeaderState = () => {
  headerFrame = null;
  if (!header) return;

  const hasLeftHeroTop = window.scrollY > 24;

  if (!hasLeftHeroTop) {
    header.classList.remove('is-leaving-hero', 'is-scrolled', 'is-moving', 'is-paused');
    window.clearTimeout(headerRestTimer);
    window.clearTimeout(headerExitTimer);
    return;
  }

  // Let the hero navigation exit before changing layout to the floating menu.
  if (!header.classList.contains('is-scrolled')) {
    if (!header.classList.contains('is-leaving-hero')) {
      header.classList.add('is-leaving-hero');
      window.clearTimeout(headerExitTimer);
      headerExitTimer = window.setTimeout(() => {
        if (window.scrollY <= 24) return;
        header?.classList.remove('is-leaving-hero');
        header?.classList.add('is-scrolled');
        showCompactHeaderAfterRest();
      }, 170);
    }
    return;
  }

  showCompactHeaderAfterRest();
};

window.addEventListener('scroll', () => {
  if (headerFrame === null) headerFrame = window.requestAnimationFrame(updateHeaderState);
}, { passive: true });
updateHeaderState();

const projectReels = document.querySelector('.project-reels');
let lastScrollY = window.scrollY;
let scrollDirectionFrame = null;

const updateReelDirection = () => {
  const currentScrollY = window.scrollY;
  const direction = currentScrollY >= lastScrollY ? 'down' : 'up';
  projectReels?.setAttribute('data-scroll-direction', direction);
  reelScrollDirection = direction;
  lastScrollY = currentScrollY;
  scrollDirectionFrame = null;
};

window.addEventListener('scroll', () => {
  if (scrollDirectionFrame === null) {
    scrollDirectionFrame = window.requestAnimationFrame(updateReelDirection);
  }
}, { passive: true });

// The hero title lines drift in opposite directions as the page scrolls.
const heroTitle = document.querySelector('.hero h1');
const heroPerson = document.querySelector('.hero-person');
const reduceHeroMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let heroTitleFrame = null;
const updateHeroTitleMotion = () => {
  heroTitleFrame = null;
  if (!heroTitle) return;
  const shift = reduceHeroMotion.matches ? 0 : Math.min(window.scrollY * .13, 120);
  heroTitle.style.setProperty('--hero-scroll-shift', `${shift}px`);
  if (heroPerson) {
    const fadeProgress = reduceHeroMotion.matches ? 0 : Math.min(window.scrollY / 420, 1);
    heroPerson.style.setProperty('--hero-person-opacity', String(1 - fadeProgress));
  }
};
window.addEventListener('scroll', () => {
  if (heroTitleFrame === null) heroTitleFrame = window.requestAnimationFrame(updateHeroTitleMotion);
}, { passive: true });
updateHeroTitleMotion();

document.querySelectorAll('.project-reel-track').forEach((track) => {
  [...track.children].forEach((card) => track.appendChild(card.cloneNode(true)));
});

// A pixel-based loop lets each reel reverse from its current frame instead of
// restarting a CSS keyframe cycle. Each track contains two identical sequences.
let reelScrollDirection = 'down';
const reelMotion = [];
const reduceReelMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const measureReels = () => {
  reelMotion.forEach((reel) => {
    const cards = [...reel.track.children];
    const seamCard = cards[Math.floor(cards.length / 2)];
    const nextDistance = seamCard ? seamCard.offsetLeft - cards[0].offsetLeft : 0;
    if (!nextDistance) return;
    const progress = reel.distance ? reel.position / reel.distance : reel.initialProgress;
    reel.distance = nextDistance;
    reel.position = progress * nextDistance;
  });
};

if (!reduceReelMotion.matches) {
  document.querySelectorAll('.project-reel-track').forEach((track, index) => {
    reelMotion.push({
      track,
      direction: index === 0 ? -1 : 1,
      initialProgress: index === 0 ? 0 : -.5,
      position: 0,
      velocity: index === 0 ? -28 : 28,
      distance: 0,
    });
  });

  measureReels();
  let previousReelFrame = performance.now();
  const animateReels = (now) => {
    const elapsed = Math.min(.05, (now - previousReelFrame) / 1000);
    previousReelFrame = now;
    const isGoingDown = reelScrollDirection === 'down';

    reelMotion.forEach((reel, index) => {
      if (!reel.distance) return;
      const targetVelocity = (index === 0 ? -1 : 1) * (isGoingDown ? 28 : -28);
      reel.velocity += (targetVelocity - reel.velocity) * Math.min(1, elapsed * 6);
      reel.position += reel.velocity * elapsed;
      while (reel.position <= -reel.distance) reel.position += reel.distance;
      while (reel.position > 0) reel.position -= reel.distance;
      reel.track.style.transform = `translate3d(${reel.position}px, 0, 0)`;
    });
    window.requestAnimationFrame(animateReels);
  };
  window.requestAnimationFrame(animateReels);
  window.addEventListener('resize', measureReels, { passive: true });
}

menuToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

// La sección de proceso se anima cada vez que entra o sale del viewport,
// así la transición funciona al desplazarse tanto hacia abajo como hacia arriba.
const scrollRevealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.classList.toggle('is-visible', entry.isIntersecting);
  });
}, { threshold: 0.18 });

document.querySelectorAll('.scroll-reveal').forEach((element) => scrollRevealObserver.observe(element));

const filterButtons = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('[data-category]');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    projects.forEach((project) => {
      project.classList.toggle('is-hidden', filter !== 'all' && project.dataset.category !== filter);
    });
  });
});

const form = document.querySelector('#contact-form');
const formNote = document.querySelector('#form-note');

const getContactBrief = () => {
  const data = new FormData(form);
  return {
    name: data.get('name'),
    company: data.get('company'),
    format: data.get('format'),
    date: data.get('date'),
    city: data.get('city'),
    attendees: data.get('attendees')
  };
};

const buildContactMessage = (brief) => [
  'Hola HL Producciones, quiero hablar sobre una producción.',
  '',
  `Nombre: ${brief.name}`,
  `Institución o empresa: ${brief.company}`,
  `Formato: ${brief.format}`,
  `Fecha tentativa: ${brief.date}`,
  `Ciudad: ${brief.city}`,
  `Asistentes aproximados: ${brief.attendees}`
].join('\n');

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const brief = getContactBrief();
  const body = encodeURIComponent(buildContactMessage(brief));
  formNote.textContent = 'Abriendo WhatsApp con tu solicitud…';
  window.open(`https://wa.me/525611106674?text=${body}`, '_blank', 'noopener,noreferrer');
});

document.querySelector('[data-email-submit]')?.addEventListener('click', () => {
  if (!form?.reportValidity()) return;
  const brief = getContactBrief();
  const subject = encodeURIComponent(`Solicitud de fecha — ${brief.name}`);
  const body = encodeURIComponent(buildContactMessage(brief));
  formNote.textContent = 'Abriendo tu correo para enviar la solicitud…';
  window.location.href = `mailto:hl.producciones@hotmail.com?subject=${subject}&body=${body}`;
});

document.querySelector('[data-year]')?.replaceChildren(String(new Date().getFullYear()));

const copyEmailButtons = [...document.querySelectorAll('[data-copy-email]')];
copyEmailButtons.forEach((control) => {
  control.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = control.dataset.copyEmail;
    const status = control.querySelector('.contact-copy-status');
    let copied = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
        copied = true;
      }
    } catch (error) {
      copied = false;
    }

    if (!copied) {
      const fallback = document.createElement('textarea');
      fallback.value = email;
      fallback.setAttribute('readonly', '');
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.appendChild(fallback);
      fallback.select();
      copied = document.execCommand('copy');
      fallback.remove();
    }

    if (!status) return;
    status.textContent = copied ? 'Correo copiado' : 'Cópialo manualmente';
    control.classList.toggle('is-copied', copied);
    window.clearTimeout(control.copyResetTimer);
    control.copyResetTimer = window.setTimeout(() => {
      status.textContent = '';
      control.classList.remove('is-copied');
    }, 2200);
  });
});

const faqItems = [...document.querySelectorAll('.faq-item')];
const syncFaqIcon = (item) => {
  const icon = item.querySelector('summary span');
  if (icon) icon.textContent = item.open ? '−' : '+';
};
faqItems.forEach((item) => {
  syncFaqIcon(item);
  item.addEventListener('toggle', () => {
    if (item.open) {
      faqItems.forEach((other) => {
        if (other !== item && other.open) other.removeAttribute('open');
      });
    }
    syncFaqIcon(item);
    faqItems.forEach((other) => {
      if (other !== item) syncFaqIcon(other);
    });
  });
});

const stackCards = [...document.querySelectorAll('[data-stack-card]')];
let stackFrame = null;
const updateStackCards = () => {
  stackFrame = null;
  if (!stackCards.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const takeoverLine = window.innerHeight * .3;
  stackCards.forEach((card, index) => {
    const nextCard = stackCards[index + 1];
    const nextTop = nextCard ? nextCard.getBoundingClientRect().top : Infinity;
    const progress = nextCard ? Math.min(1, Math.max(0, (takeoverLine - nextTop) / (window.innerHeight * .34))) : 0;
    card.style.setProperty('--stack-scale', (1 - progress * .055).toFixed(3));
    card.style.setProperty('--stack-lift', `${(-progress * 10).toFixed(1)}px`);
  });
};
const requestStackCards = () => { if (stackFrame === null) stackFrame = window.requestAnimationFrame(updateStackCards); };
window.addEventListener('scroll', requestStackCards, { passive: true });
window.addEventListener('resize', requestStackCards);
requestStackCards();

const metricCounters = document.querySelectorAll('[data-counter]');
metricCounters.forEach((element) => {
  const target = Number(element.dataset.counter);
  if (!Number.isFinite(target)) return;
  const prefix = element.dataset.prefix || '';
  const suffix = element.dataset.suffix || '';
  const pad = Number(element.dataset.pad || 0);
  const render = (value) => `${prefix}${String(value).padStart(pad, '0')}${suffix}`;
  element.textContent = render(target);
});

// Theatre image parallax: entering the section zooms in, returning upward eases it back out.
const impactHero = document.querySelector('.impact-hero');
let impactFrame = null;
const updateImpactParallax = () => {
  impactFrame = null;
  if (!impactHero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const bounds = impactHero.getBoundingClientRect();
  const travel = window.innerHeight + bounds.height;
  const progress = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / travel));
  const scale = 1.015 + progress * .125;
  impactHero.style.setProperty('--impact-scale', scale.toFixed(3));
};
const requestImpactParallax = () => {
  if (impactFrame === null) impactFrame = window.requestAnimationFrame(updateImpactParallax);
};
window.addEventListener('scroll', requestImpactParallax, { passive: true });
window.addEventListener('resize', requestImpactParallax);
requestImpactParallax();

// The illustration marquee follows the supplied SVG curve rather than a straight row.
const portraitMarquee = document.querySelector('.project-portrait-marquee');
const portraitPath = portraitMarquee?.querySelector('[data-portrait-path]');
const portraitItems = portraitMarquee ? [...portraitMarquee.querySelectorAll('.project-portrait-marquee-group img')] : [];

if (portraitMarquee && portraitPath && portraitItems.length) {
  const pathLength = portraitPath.getTotalLength();
  const portraitDuration = 58000;
  let portraitFrame = null;
  let portraitStart = null;

  const placePortraits = (timestamp = 0) => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (portraitStart === null) portraitStart = timestamp;
    const progress = reducedMotion ? 0 : ((timestamp - portraitStart) % portraitDuration) / portraitDuration;
    const scaleX = portraitMarquee.clientWidth / 996;
    const scaleY = portraitMarquee.clientHeight / 330;

    portraitItems.forEach((item, index) => {
      const distance = ((progress + index / portraitItems.length) % 1) * pathLength;
      const point = portraitPath.getPointAtLength(distance);
      const next = portraitPath.getPointAtLength(Math.min(pathLength, distance + 1));
      const rawAngle = Math.atan2((next.y - point.y) * scaleY, (next.x - point.x) * scaleX) * 180 / Math.PI;
      const angle = Math.max(-18, Math.min(18, rawAngle));
      const width = item.offsetWidth;
      const height = item.offsetHeight;
      item.style.translate = `${point.x * scaleX - width / 2}px ${point.y * scaleY - height}px`;
      item.style.rotate = `${angle}deg`;
      item.style.zIndex = String(10 + Math.round(point.y));
    });

    if (!reducedMotion) portraitFrame = window.requestAnimationFrame(placePortraits);
  };

  const restartPortraits = () => {
    if (portraitFrame !== null) window.cancelAnimationFrame(portraitFrame);
    portraitStart = null;
    portraitFrame = window.requestAnimationFrame(placePortraits);
  };

  window.addEventListener('resize', restartPortraits);
  restartPortraits();
}
