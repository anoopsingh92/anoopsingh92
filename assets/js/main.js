/** @format */
const $ = s => document.querySelector(s),
  $$ = s => [...document.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
if (location.hash === '#me') location.replace('/about');

/* ===================================================
   SMOOTH SCROLLING ENGINE (Eased Anchors + Wheel Inertia)
=================================================== */
let sTarget = window.scrollY,
  sCur = window.scrollY,
  sRaf = 0;

const sMax = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

function sStep() {
  sCur += (sTarget - sCur) * 0.12;
  if (Math.abs(sTarget - sCur) < 0.5) {
    sCur = sTarget;
    window.scrollTo(0, sCur);
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
    sRaf = 0;
    return;
  }
  window.scrollTo(0, sCur);
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
  sRaf = requestAnimationFrame(sStep);
}

function goTo(y) {
  y = Math.max(0, Math.min(y, sMax()));
  if (reduce) {
    window.scrollTo(0, y);
    sTarget = sCur = y;
    return;
  }
  if (!sRaf) sCur = window.scrollY;
  sTarget = y;
  if (!sRaf) sRaf = requestAnimationFrame(sStep);
}

window.addEventListener(
  'scroll',
  () => {
    if (!sRaf) sTarget = sCur = window.scrollY;
  },
  { passive: true }
);

const canScroll = (el, dy) => {
  for (; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    const o = getComputedStyle(el).overflowY;
    if (
      (o === 'auto' || o === 'scroll') &&
      el.scrollHeight > el.clientHeight + 1 &&
      (dy < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1)
    )
      return true;
  }
  return false;
};

window.addEventListener(
  'wheel',
  e => {
    if (
      reduce ||
      e.ctrlKey ||
      e.shiftKey ||
      e.defaultPrevented ||
      Math.abs(e.deltaX) > Math.abs(e.deltaY) ||
      canScroll(e.target, e.deltaY)
    )
      return;
    e.preventDefault();
    const dy =
      e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
    if (!sRaf) sCur = sTarget = window.scrollY;
    sTarget = Math.max(0, Math.min(sTarget + dy, sMax()));
    if (!sRaf) sRaf = requestAnimationFrame(sStep);
  },
  { passive: false }
);

/* ===================================================
   HERO ANIMATIONS & LETTER REVEALS
=================================================== */
$$('h1 .ln').forEach((l, r) => {
  l.innerHTML = [...l.dataset.s]
    .map((c, i) => `<span class="ch" style="--i:${i + r * 5}">${c}</span>`)
    .join('');
});

/* Typewriter */
const words = [
  'custom Drupal themes',
  'pixel-perfect interfaces',
  'silky animations',
  'fast responsive sites'
];
let wi = 0,
  ci = 0,
  del = false;
const w = $('#word');
(function type() {
  if (!w) return;
  const t = words[wi];
  w.textContent = t.slice(0, ci);
  if (!del && ci === t.length) {
    del = true;
    return setTimeout(type, 1400);
  }
  if (del && ci === 0) {
    del = false;
    wi = (wi + 1) % words.length;
  }
  ci += del ? -1 : 1;
  setTimeout(type, del ? 35 : 70);
})();

/* ===================================================
   INTERSECTION OBSERVER (Reveals & Counters)
=================================================== */
const io = new IntersectionObserver(
  es =>
    es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-n]').forEach(c => {
        const n = +c.dataset.n,
          p = c.dataset.p || '';
        let s = null;
        const f = t => {
          s = s || t;
          const k = Math.min((t - s) / 1400, 1);
          c.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))) + p;
          if (k < 1) requestAnimationFrame(f);
        };
        reduce ? (c.textContent = n + p) : requestAnimationFrame(f);
      });
      io.unobserve(e.target);
    }),
  { threshold: 0.15 }
);
$$('.rv').forEach(e => io.observe(e));

/* Scroll Progress & Active Nav */
const links = $$('nav ul a');
window.addEventListener(
  'scroll',
  () => {
    const h = document.documentElement;
    const bar = $('#bar');
    const max = Math.max(1, h.scrollHeight - h.clientHeight);
    if (bar) bar.style.width = (h.scrollTop / max) * 100 + '%';
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (href === '#me') {
        a.classList.toggle('on', location.hash === '#me');
        return;
      }
      const s = $(href);
      if (s && !s.closest('[hidden]')) {
        const r = s.getBoundingClientRect();
        a.classList.toggle('on', r.top < window.innerHeight * 0.45 && r.bottom > window.innerHeight * 0.45);
      } else {
        a.classList.remove('on');
      }
    });
  },
  { passive: true }
);

/* Theme Toggle */
const themeBtn = $('#theme');
if (themeBtn) {
  themeBtn.onclick = () => {
    const r = document.documentElement;
    const dark = getComputedStyle(r).getPropertyValue('--bg').trim() === '#0a0e17';
    r.dataset.theme = dark ? 'light' : 'dark';
  };
}

/* Background Canvas Particles */
const cv = $('#bg');
if (cv) {
  const x = cv.getContext('2d');
  let W,
    H,
    pts = [],
    m = { x: -999, y: -999 };
  const gl = $('#glow');
  function size() {
    W = cv.width = window.innerWidth;
    H = cv.height = window.innerHeight;
    pts = [];
    const g = Math.max(36, Math.round(W / 28));
    for (let i = g / 2; i < W; i += g) {
      for (let j = g / 2; j < H; j += g) {
        pts.push({ ox: i, oy: j, x: i, y: j });
      }
    }
  }
  size();
  window.addEventListener('resize', size);
  window.addEventListener(
    'pointermove',
    e => {
      m.x = e.clientX;
      m.y = e.clientY;
      if (gl) {
        gl.style.left = m.x + 'px';
        gl.style.top = m.y + 'px';
      }
    },
    { passive: true }
  );
  function draw() {
    x.clearRect(0, 0, W, H);
    const col = getComputedStyle(document.documentElement).getPropertyValue('--ac').trim();
    x.fillStyle = col;
    for (const p of pts) {
      const dx = p.x - m.x,
        dy = p.y - m.y,
        d = Math.hypot(dx, dy),
        R = 150;
      if (d < R && d > 0) {
        const f = ((R - d) / R) * 26;
        p.x += (dx / d) * f * 0.15;
        p.y += (dy / d) * f * 0.15;
      }
      p.x += (p.ox - p.x) * 0.08;
      p.y += (p.oy - p.y) * 0.08;
      const s = d < R ? 2.6 : 1.2;
      x.globalAlpha = d < R ? 0.9 : 0.28;
      x.beginPath();
      x.arc(p.x, p.y, s, 0, 6.283);
      x.fill();
    }
    x.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  reduce
    ? (() => {
      x.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ac').trim();
      x.globalAlpha = 0.25;
      pts.forEach(p => x.fillRect(p.x, p.y, 2, 2));
    })()
    : draw();
}

/* ===================================================
   RECOMMENDATIONS (With LinkedIn Recommendation Badge)
=================================================== */
const av = f => (f.startsWith('assets/') ? f : `assets/img/${f}`);
const R = [
  {
    t: 'He is a very good at what he does. Enjoyed working with you.',
    n: 'Chandraveer Singh Rathore',
    r: 'Technical Lead | Helping Businesses Build, Modernise & Scale Drupal and Custom Web Platforms | Drupal 10/11 · PHP · Symfony · APIs · Next.js',
    a: av('chandraveer.webp')
  },
  {
    t: 'I have worked with Anoop this past fall putting together a website. Anoop was professional, a great communicator, timely, helpful and has built a wonderful website for me. Anoop is easy to work with and I highly recommend him. I have another website I have to redo soon and will use Anoop again without question.',
    n: 'Tom Fierst',
    r: 'President at Thomas Fierst Ins Agency',
    a: av('tom.webp')
  },
  {
    t: 'Anoop has been our lifeline for the redesign of website in Drupal 8 for a large national nonprofit. He has been particularly attentive to detail and has provided clean, mobile-responsive, beautiful results for our team. We are very happy with the themeing work he has completed for us and look forward to engaging with him for additional website work in the future.',
    n: 'Monica F.',
    r: 'Accessibility-focused enterprise-level technical project manager and Certified ScrumMaster',
    a: av('monica.webp')
  },
  {
    t: 'Anoop has worked on my Drupal website for more than a year and has done an outstanding job improving its appearance. He is immediately responsive to my requests and finishes each task quickly.',
    n: 'Barry Koren, AIA, PhD',
    r: 'Founder at TimeExchanges',
    a: av('barry.webp')
  },
  {
    t: 'Anoop is very proficient and skilled web designer with very good knowledge of html and css.He is master in creating websites responsive.He is specialist in drupal theming.',
    n: 'Deepesh Arora',
    r: 'Drupal Consultant | PHP | Laravel | NEXT JS | TypeScript',
    a: av('dipesh.webp')
  },
  {
    t: 'Anoop is a sincere web designer knows the issues and designing very well. He knows what he is going to do and what will be its impact. As well as he worked according to the standards to maintain the quality.',
    n: 'Shubham Agrawal',
    r: 'Technical Project Manager @ Xceedance | Technology Management, People Management',
    a: av('shubham.webp')
  },
  {
    t: 'Anoop having deep knowledge of web designing and solve all the designing related points patiently by following proper drupal standard.',
    n: 'Bhuvaneshwar Sharma',
    r: 'Sr. Software Engineer | Developing with Drupal, AngularJS',
    a: av('bhuv.webp')
  },
  {
    t: 'Anoop have deep knowledge in css and very energetic person. He takes every challenge and complete them by his superb and very effective design. He is mastered in Drupal design, css, and responsive css. It is a great experience with working with anoop.',
    n: 'Shubham Agrawal',
    r: 'Technical Project Manager @ Xceedance | Technology Management, People Management',
    a: av('shubham.webp')
  }
];

(function renderRecommendations() {
  const tr = $('#tr');
  if (!tr || !R.length) return;
  tr.innerHTML = R.map(
    (r, i) => `
    <div class="tc rv" style="--d:${(i % 3) * 0.1}s">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="t-badge">
          <svg viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
          LinkedIn recommendation
        </span>
        <div class="trate">★★★★★</div>
      </div>
      <p>${r.t}</p>
      <div class="who">
      <picture class="t-avatar-pic" style="flex-shrink:0;">
        <source srcset="${r.a.replace(/\.(jpg|png)$/, '.webp')}" type="image/webp">
        <img class="t-avatar" src="assets/img/${r.a.replace(/\.(jpg|png)$/, '.webp')}" srcset="assets/img/${r.a.replace(/\.(jpg|png)$/, '-small.webp')} 50w, assets/img/${r.a.replace(/\.(jpg|png)$/, '.webp')} 100w" 
        sizes="50px" alt="${r.n}" width="50" height="50" loading="lazy">
      </picture>
        <div class="who-meta">
          <b>${r.n}</b>
          <span>${r.r}</span>
        </div>
      </div>
    </div>`
  ).join('');
  $$('#tr .rv').forEach(e => io.observe(e));
})();

/* ===================================================
   EARLIER PROJECTS DATA & RENDERING
=================================================== */
const EARLIER_PROJECTS = [
  {
    title: "Dr. Reddy's Betapharm",
    url: 'https://betapharm.drreddys.acsitefactory.com/',
    cat: 'Enterprise Acquia',
    summary: 'High-scale multi-market pharmaceutical portal deployed across Acquia Site Factory with customized theming.',
    highlights: [
      'Multi-region custom Drupal theming & global asset reuse',
      'Strict compliance & WCAG accessibility standards',
      'Optimized cache headers & Varnish reverse-proxy'
    ],
    tech: ['Drupal 10', 'Acquia Site Factory', 'Bootstrap', 'Enterprise Twig']
  },
  {
    title: 'GRL Content Migration',
    url: 'https://www.grlcontent.com',
    cat: 'Theme Migration (D7 → D10)',
    summary: 'Full-scale upgrade of custom higher-education courseware platform from legacy Drupal 7 to modern Drupal 10.',
    highlights: [
      'Zero content downtime migration architecture',
      'Modernized Twig components from legacy PHPTemplate',
      'Mobile-first responsive Bootstrap Barrio layout'
    ],
    tech: ['Drupal 10', 'Bootstrap Barrio', 'Twig Engine', 'Drush / Composer']
  },
  {
    title: 'Kendall Hunt Higher Education',
    url: 'https://he.kendallhunt.com',
    cat: 'Drupal 9 Theming',
    summary: 'Higher Education digital textbook & curriculum platform connecting university professors and academic departments.',
    highlights: [
      'Custom theme based on bootstrap_sass with Gulp compiler',
      'Interactive department discovery & preview book tools',
      'Refactored CSS bundle size reduced by 40%'
    ],
    tech: ['Drupal 9', 'Bootstrap SASS', 'Gulp Compiler', 'REST API']
  },
  {
    title: 'Valuebound Corporate Portal',
    url: 'https://valuebound.com',
    cat: 'Decoupled Drupal + React',
    summary: 'Corporate platform redesign featuring Decoupled Drupal with REST API and Progressive Web App (PWA) offline capabilities.',
    highlights: [
      'Headless Drupal 10 backend exposing secure endpoints',
      'Dynamic ReactJS components with state management',
      'Near-perfect 98+ PageSpeed & Lighthouse scores'
    ],
    tech: ['Decoupled Drupal 10', 'ReactJS', 'REST API', 'PWA']
  },
  {
    title: 'GRL Engagement Multisite',
    url: 'https://grlengagement.com',
    cat: 'Multisite Theming',
    summary: 'A multi-brand digital student engagement platform powering multiple university learning portals under one codebase.',
    highlights: [
      'Unified single-codebase multisite architecture (KHP, PES, RCLB)',
      'Custom theme created from scratch in Bootstrap 4 SASS',
      'Dynamic branding tokens supporting seamless theming'
    ],
    tech: ['Drupal 10', 'Multisite', 'SASS / SCSS', 'Barrio']
  },
  {
    title: 'Green America',
    url: 'https://greenamerica.org/',
    cat: 'Non-Profit Theming',
    summary: 'Digital platform for prominent national 501(c)(3) environmental and economic justice organization operating on Pantheon.',
    highlights: [
      'Accessible, clean UI designed for advocacy campaigns',
      'Pantheon automated CI/CD deployment workflow',
      'Optimized media delivery and responsive layout system'
    ],
    tech: ['Drupal', 'Bootstrap', 'Pantheon', 'Accessible UI']
  }
];

(function renderEarlierProjects() {
  const track = $('#pinned-track');
  if (!track) return;
  track.innerHTML =
    EARLIER_PROJECTS.map(
      (p, i) => `
    <div class="detailed-proj-card">
      <div class="proj-info-col">
        <div>
          <div class="proj-top-meta">
            <span class="proj-num">#${String(i + 1).padStart(2, '0')}</span>
            <span class="proj-badge-cat">${p.cat}</span>
          </div>
          <h3>${p.title}</h3>
          <p class="proj-desc">${p.summary}</p>
        </div>
        <div class="proj-actions">
          <a class="proj-visit-btn" href="${p.url}" target="_blank" rel="noopener">
            Explore Site ↗
          </a>
        </div>
      </div>
      <div class="proj-specs-col">
        <div>
          <span class="proj-specs-title">Architectural Highlights</span>
          <ul class="proj-highlights-list">
            ${p.highlights.map(h => `<li>${h}</li>`).join('')}
          </ul>
        </div>
        <div class="proj-tech-stack">
          ${p.tech.map(t => `<span>${t}</span>`).join('')}
        </div>
      </div>
    </div>`
    ).join('') + '<div class="track-end-spacer" aria-hidden="true"></div>';
})();

/* ===================================================
   PINNED SCROLLTRIGGER: ABOUT SECTION
=================================================== */
function initAboutPinnedScroll() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector('.about-pinned-section');
  if (!section) return;

  ScrollTrigger.getAll().forEach(st => {
    if (st.trigger === section) st.kill();
  });

  const items = [...section.querySelectorAll('.about-item')];
  const stats = [...section.querySelectorAll('.stat')];
  const hudBar = document.getElementById('about-hud-bar');
  const stepNum = document.getElementById('about-step-num');
  const portraitImg = section.querySelector('.pic-inner img');
  const actions = section.querySelector('.about-actions');

  if (window.innerWidth <= 980 || reduce || document.body.classList.contains('pg-me')) {
    gsap.set([items, stats, portraitImg, actions], { clearProps: 'all' });
    items.forEach(el => el.classList.add('is-active'));
    return;
  }

  const triggerAboutCounters = () => {
    section.querySelectorAll('[data-n]').forEach(c => {
      if (c.dataset.counted) return;
      c.dataset.counted = 'true';
      const n = +c.dataset.n,
        p = c.dataset.p || '';
      let s = null;
      const f = t => {
        s = s || t;
        const k = Math.min((t - s) / 1400, 1);
        c.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))) + p;
        if (k < 1) requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    });
  };

  // Initial states: Card 1 visible, Cards 2 & 3 tucked below
  gsap.set(items[0], { opacity: 1, y: 0, scale: 1 });
  gsap.set(items.slice(1), { opacity: 0.15, y: 36, scale: 0.96 });
  gsap.set(actions, { opacity: 0.25, y: 16 });
  gsap.set(stats, { opacity: 0.2, y: 24 });
  gsap.set(portraitImg, { scale: 1.08, yPercent: -3 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top+=65',
      end: '+=1400',
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onEnter: triggerAboutCounters,
      onUpdate: self => {
        const p = self.progress;
        if (hudBar) hudBar.style.width = `${Math.max(15, p * 100).toFixed(1)}%`;
        const activeIdx = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
        if (stepNum) stepNum.textContent = `0${activeIdx + 1}`;
        items.forEach((el, idx) => el.classList.toggle('is-active', idx === activeIdx));
      }
    }
  });

  // Smooth portrait pan/scale across the entire pinned scroll
  tl.to(portraitImg, { scale: 1, yPercent: 0, duration: 3, ease: 'none' }, 0);

  // Step 1 -> 2: Slide in Pillar 02
  tl.to(items[0], { opacity: 0.55, scale: 0.98, duration: 1, ease: 'power2.out' }, 0)
    .to(items[1], { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' }, 0);

  // Step 2 -> 3: Slide in Pillar 03 & Actions
  tl.to(items[1], { opacity: 0.55, scale: 0.98, duration: 1, ease: 'power2.out' }, 1)
    .to(items[2], { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' }, 1)
    .to(actions, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 1.2);

  // Step 3 -> Finale: Illuminate all 3 cards + Stagger in Stats Row
  tl.to(items, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 2)
    .to(stats, { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'power2.out' }, 2);
}

/* ===================================================
   PINNED SCROLLTRIGGER: EARLIER WORK
=================================================== */
function initPinnedScroll() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector('#work.work-pinned-section');
  const track = document.getElementById('pinned-track');
  if (!section || !track) return;

  ScrollTrigger.getAll().forEach(st => {
    if (st.trigger === section) st.kill();
  });

  if (document.body.classList.contains('pg-me')) return;

  const getScrollDist = () => {
    gsap.set(track, { clearProps: 'transform' });
    const cards = track.querySelectorAll('.detailed-proj-card');
    if (!cards.length) return 0;
    const lastCard = cards[cards.length - 1];
    const trackRect = track.getBoundingClientRect();
    const lastCardRect = lastCard.getBoundingClientRect();
    const lastCardRightOffset = lastCardRect.right - trackRect.left;
    const targetRightEdge = window.innerWidth - window.innerWidth * 0.08;
    return Math.ceil(Math.max(0, lastCardRightOffset - targetRightEdge));
  };

  if (window.innerWidth > 720 && !reduce) {
    gsap.to(track, {
      x: () => -getScrollDist(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${getScrollDist() + 350}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        anticipatePin: 1
      }
    });
  }
}

window.addEventListener('load', () => {
  initAboutPinnedScroll();
  initPinnedScroll();
  setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }, 400);
});

window.addEventListener('resize', () => {
  if (typeof ScrollTrigger !== 'undefined') {
    initAboutPinnedScroll();
    initPinnedScroll();
    ScrollTrigger.refresh();
  }
});

/* ===================================================
   MASTER-DETAIL EXPLORERS (Browse List Mode)
=================================================== */
$$('.xp').forEach(x => {
  const v = x.querySelector('.xv'),
    bs = [...x.querySelectorAll('.xi')],
    sec = x.parentElement;
  const show = b => {
    bs.forEach(o => o.setAttribute('aria-pressed', String(o === b)));
    v.innerHTML = b.parentElement.querySelector('.det').innerHTML;
    v.classList.remove('flash');
    void v.offsetWidth;
    v.classList.add('flash');
  };
  bs.forEach(b =>
    b.addEventListener('click', () => {
      show(b);
      if (matchMedia('(max-width:860px)').matches)
        goTo(v.getBoundingClientRect().top + window.scrollY - 90);
    })
  );
  v.addEventListener('click', e => {
    const b = e.target.closest('[data-live]');
    if (!b) return;
    const f = v.querySelector('.fr');
    if (!f.firstChild) {
      const i = document.createElement('iframe');
      i.src = b.dataset.live;
      i.title = 'Live preview';
      i.loading = 'lazy';
      i.referrerPolicy = 'no-referrer';
      i.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      f.appendChild(i);
      f.hidden = false;
      b.textContent = 'Hide live preview';
    } else {
      f.innerHTML = '';
      f.hidden = true;
      b.textContent = 'Load live preview';
    }
  });
  sec.querySelectorAll('.xf button').forEach(fb =>
    fb.addEventListener('click', () => {
      sec.querySelectorAll('.xf button').forEach(o => o.setAttribute('aria-pressed', String(o === fb)));
      bs.forEach(b => {
        const li = b.parentElement;
        li.hidden = !li.dataset.c.split(' ').includes(fb.dataset.f);
      });
      const cur =
        bs.find(b => b.getAttribute('aria-pressed') === 'true' && !b.parentElement.hidden) ||
        bs.find(b => !b.parentElement.hidden);
      if (cur) show(cur);
    })
  );
  if (bs[0]) show(bs[0]);
});

/* ===================================================
   PINNED SCROLL STORIES (#me Projects & Certifications)
=================================================== */
const pinRenderers = [];
(function initPinStories() {
  if (reduce) return;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)),
    hue = n => ([...n].reduce((a, c) => a + c.charCodeAt(0), 0) * 37) % 360;
  const esc = s =>
    String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const host = u => {
    try {
      return new URL(u).hostname.replace(/^www\./, '');
    } catch (e) {
      return '';
    }
  };
  const mono = b => {
    const m = b.replace(/^(www\.|dev-)/, '').replace(/[^a-z0-9]/gi, '');
    return (m[0] || '').toUpperCase() + (m[1] || '').toLowerCase();
  };

  $$('.xp').forEach(x => {
    try {
      const sec = x.parentElement,
        isProj = /project/i.test(sec.querySelector('h2 small').textContent),
        lis = [...x.querySelectorAll('.xl>li')],
        N = lis.length;
      if (N < 2) return;
      const step = isProj ? '40vh' : '50vh';
      const items = lis.map(li => {
        const det = li.querySelector('.det'),
          cl = det.cloneNode(true);
        cl.querySelectorAll('.fr,p.k,.bdg').forEach(e => e.remove());
        const k = (det.querySelector('.k') || {}).textContent || '';
        return {
          b: li.querySelector('.xi b').textContent,
          html: cl.innerHTML,
          href: (det.querySelector('a.btn.p') || {}).href || '',
          kind: k,
          id: (det.querySelector('.id') || {}).textContent || '',
          bdg: (det.querySelector('.bdg') || {}).textContent || ''
        };
      });
      const left = items
        .map((it, i) => `<div class="t" data-i="${i}"><div class="idx">${String(i + 1).padStart(2, '0')}</div>${it.html}</div>`)
        .join('');
      const right = items
        .map(it =>
          isProj
            ? `<div class="c"><div class="dev" style="--h:${hue(it.b)}"><div class="bar2"><i></i><i></i><i></i><span class="url">${esc(host(it.href) || it.b)}</span></div><div class="scr"><span class="blob b1"></span><span class="blob b2"></span><span class="mono">${esc(mono(it.b))}</span><span class="badge">${esc(it.kind.split(' \u00b7 ')[0])}</span></div></div></div>`
            : `<div class="c"><div class="crt" style="--h:${hue(it.kind)}"><span class="iss">${esc(it.kind)}</span><span class="big">${esc(it.bdg)}</span><div><span class="iss">${esc(it.b)}</span></div>${it.id ? `<span class="cid">ID \u00b7 ${esc(it.id)}</span>` : ''}</div></div>`
        )
        .join('');

      const pin = document.createElement('div');
      pin.className = 'pin';
      pin.style.height = `calc(100vh + ${N - 1} * ${step})`;
      pin.innerHTML = `<div class="stage"><div class="st-l">${left}</div><div class="st-r">${right}</div><div class="st-f"><button type="button" data-a="prev" aria-label="Previous">\u2191</button><button type="button" data-a="next" aria-label="Next">\u2193</button><div class="bar"><i></i></div><span class="ct"><b>01</b> / ${String(N).padStart(2, '0')}</span><button type="button" data-a="skip">Skip \u2193</button></div></div>`;

      const vt = document.createElement('div');
      vt.className = 'vt';
      vt.innerHTML =
        '<button type="button" data-v="pin" aria-pressed="true">Scroll story</button><button type="button" data-v="list" aria-pressed="false">Browse list</button>';

      (sec.querySelector('.xf') || x).before(vt);
      x.after(pin);
      sec.classList.add('has-pin');

      const T = [...pin.querySelectorAll('.t')],
        C = [...pin.querySelectorAll('.c')],
        bar = pin.querySelector('.bar i'),
        ct = pin.querySelector('.ct b');
      let tick = false,
        last = -1;

      const top = () => pin.getBoundingClientRect().top + window.scrollY;
      const total = () => Math.max(1, pin.offsetHeight - window.innerHeight);
      const curIndex = () => {
        const raw = clamp(-pin.getBoundingClientRect().top / total(), 0, 1) * (N - 1);
        return Math.round(raw);
      };

      function render() {
        tick = false;
        if (sec.classList.contains('as-list') || !pin.offsetParent) return;
        const r = pin.getBoundingClientRect();
        if (r.bottom < -300 || r.top > window.innerHeight + 300) return;
        const raw = clamp(-r.top / total(), 0, 1) * (N - 1),
          fl = Math.floor(raw),
          tt = raw - fl,
          ee = clamp((tt - 0.22) / 0.56, 0, 1),
          p = fl + ee * ee * (3 - 2 * ee);
        for (let i = 0; i < N; i++) {
          const d = i - p,
            ad = Math.abs(d),
            t = T[i],
            c = C[i];
          if (ad > 1.05) {
            t.style.visibility = 'hidden'; 
            t.style.pointerEvents = 'none';
          } else {
            t.style.visibility = 'visible';
            t.style.opacity = Math.max(0, 1 - ad * 1.5);
            t.style.transform = `translate3d(0,calc(-50% + ${(d * 70).toFixed(1)}px),0)`;
            t.style.filter = `blur(${(Math.min(ad, 1) * 7).toFixed(1)}px)`;
            t.style.pointerEvents = ad < 0.5 ? 'auto' : 'none';
          }
          if (d < -1.05 || d > 5) {
            c.style.visibility = 'hidden';
            continue;
          }
          c.style.visibility = 'visible';
          let y, s, o, rot;
          if (d < 0) {
            const q = Math.max(d, -1);
            y = q * 120;
            s = 1 + q * 0.08;
            o = Math.max(0, 1 + q * 1.3);
            rot = q * 7;
          } else {
            const q = Math.min(d, 4);
            y = q * 28;
            s = 1 - q * 0.055;
            o = Math.max(0, 1 - q * 0.26);
            rot = 0;
          }
          c.style.opacity = o.toFixed(3);
          c.style.transform = `translate3d(0,${y.toFixed(1)}px,0) scale(${s.toFixed(3)}) rotate(${rot.toFixed(2)}deg)`;
          c.style.zIndex = String(N - i);
        }
        bar.style.width = ((raw / (N - 1)) * 100).toFixed(2) + '%';
        const n = Math.round(p) + 1;
        if (n !== last) {
          last = n;
          ct.textContent = String(n).padStart(2, '0');
        }
      }

      const req = () => {
        if (!tick) {
          tick = true;
          requestAnimationFrame(render);
        }
      };

      vt.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        sec.classList.toggle('as-list', b.dataset.v === 'list');
        vt.querySelectorAll('button').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
        req();
      });

      window.addEventListener('scroll', req, { passive: true });
      window.addEventListener('resize', req);
      pinRenderers.push(req);
      req();

      const toStep = i => {
        const targetIdx = clamp(i, 0, N - 1);
        const targetY = top() + (targetIdx / (N - 1)) * total();
        goTo(Math.round(targetY));
      };

      pin.addEventListener('click', e => {
        const lb = e.target.closest('[data-live]');
        if (lb) {
          const i = +lb.closest('.t').dataset.i,
            scr = C[i].querySelector('.scr'),
            f = scr.querySelector('iframe');
          if (f) {
            f.remove();
            lb.textContent = 'Load live preview';
          } else {
            const fr = document.createElement('iframe');
            fr.src = lb.dataset.live;
            fr.title = 'Live preview';
            fr.loading = 'lazy';
            fr.referrerPolicy = 'no-referrer';
            fr.setAttribute('sandbox', 'allow-scripts allow-same-origin');
            scr.appendChild(fr);
            lb.textContent = 'Hide live preview';
          }
          return;
        }
        const b = e.target.closest('[data-a]');
        if (!b) return;
        e.preventDefault();
        const a = b.dataset.a;
        if (a === 'prev') toStep(curIndex() - 1);
        else if (a === 'next') toStep(curIndex() + 1);
        else if (a === 'skip') goTo(top() + pin.offsetHeight - 60);
      });
    } catch (err) {
      console.warn('pin', err);
    }
  });
})();

/* ===================================================
   UNIFIED ROUTING & NAVIGATION ANCHOR HANDLER
=================================================== */
function setView(isMe, targetHash = '') {
  const homeEl = $('.home');
  const meEl = $('#me');
  if (!homeEl || !meEl) return;

  homeEl.style.display = isMe ? 'none' : 'block';
  meEl.style.display = isMe ? 'block' : 'none';
  document.body.classList.toggle('pg-me', isMe);

  $$('.rv:not(.in)').forEach(el => io.observe(el));

  if (isMe) {
    sTarget = sCur = 0;
    window.scrollTo(0, 0);
    requestAnimationFrame(() => pinRenderers.forEach(fn => fn()));
  } else {
    requestAnimationFrame(() => {
      initAboutPinnedScroll();
      initPinnedScroll();
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      if (targetHash && targetHash !== '#top') {
        const t = $(targetHash);
        if (t) goTo(t.getBoundingClientRect().top + window.scrollY - 70);
      } else {
        goTo(0);
      }
    });
  }
}

document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;

  const href = a.getAttribute('href');
  if (!href || !href.startsWith('#') || href === '#') return;

  e.preventDefault();

  if (href === '#me') {
    if (location.hash !== '#me') history.pushState(null, '', '#me');
    setView(true);
    return;
  }

  const wasMe = document.body.classList.contains('pg-me') || location.hash === '#me';
  history.pushState(null, '', href);

  if (wasMe) {
    setView(false, href);
  } else {
    if (href === '#top') {
      goTo(0);
    } else {
      const target = $(href);
      if (target) goTo(target.getBoundingClientRect().top + window.scrollY - 70);
    }
  }
});

window.addEventListener('popstate', () => {
  const isMe = location.hash === '#me';
  setView(isMe, location.hash);
});

if (location.hash === '#me') {
  setView(true);
}

/* ===================================================
   BACK TO TOP, COPY EMAIL, WATERMARK & IST CLOCK
=================================================== */
const upBtn = $('#up');
const ring = $('#ring');
window.addEventListener(
  'scroll',
  () => {
    const h = document.documentElement;
    const s = h.scrollTop || window.scrollY;
    const maxScroll = Math.max(1, h.scrollHeight - h.clientHeight);
    const p = Math.min(1, Math.max(0, s / maxScroll));
    if (ring) ring.style.strokeDashoffset = 125.7 * (1 - p);
    if (upBtn) upBtn.classList.toggle('show', s > 400);
  },
  { passive: true }
);

if (upBtn) {
  upBtn.addEventListener('click', () => goTo(0));
}

const copyBtn = $('#copy');
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('k.anoopsingh92@gmail.com').then(() => {
      const prev = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = prev), 2000);
    });
  });
}

const fw = $('.fwm');
const footer = $('footer');
if (fw && footer) {
  footer.addEventListener('pointermove', e => {
    const r = fw.getBoundingClientRect();
    fw.style.setProperty('--fx', e.clientX - r.left + 'px');
    fw.style.setProperty('--fy', e.clientY - r.top + 'px');
  });
}

(function updateClock() {
  const clk = $('#clock');
  if (!clk) return;
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  clk.textContent = ist.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  setTimeout(updateClock, 1000);
})();

/* ===================================================
   SECTION PARALLAX, HEADING REVEALS & MAGNETIC CURSOR
=================================================== */
(function () {
  if (reduce) return;
  $$('h2.rv').forEach(h =>
    [...h.childNodes].forEach(n => {
      if (n.nodeType === 3 && n.textContent.trim()) {
        const f = document.createDocumentFragment();
        let k = 0;
        n.textContent.split(/(\s+)/).forEach(w => {
          if (!w.trim()) {
            f.append(w);
            return;
          }
          const o = document.createElement('span');
          o.className = 'w';
          const s = document.createElement('span');
          s.textContent = w;
          s.style.setProperty('--wi', k++);
          o.append(s);
          f.append(o);
        });
        n.replaceWith(f);
      }
    })
  );

  const px = [
    ['.hero h1', '.hero', 0.14],
    ['.hero .role', '.hero', 0.22],
    ['.mc.wide .flow', '.mc.wide', 0.05]
  ]
    .map(([a, b, s]) => [$(a), $(b), s])
    .filter(([a, b]) => a && b);

  const mq = $('.mq'),
    tls = $$('.tl'),
    its = $$('.it');
  let lastY = window.scrollY,
    vel = 0,
    tick = false;

  function fx() {
    tick = false;
    px.forEach(([el, par, s]) => {
      const r = par.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
      el.style.translate =
        '0 ' + ((r.top + r.height / 2 - window.innerHeight / 2) * -s).toFixed(1) + 'px';
    });
    const dy = window.scrollY - lastY;
    lastY = window.scrollY;
    vel += (dy - vel) * 0.18;
    if (mq) mq.style.transform = `skewX(${Math.max(-8, Math.min(8, vel * -0.18)).toFixed(2)}deg)`;
    tls.forEach(tl => {
      if (tl.offsetParent) {
        const r = tl.getBoundingClientRect();
        tl.style.setProperty(
          '--tp',
          Math.max(0, Math.min(1, (window.innerHeight * 0.65 - r.top) / r.height)).toFixed(3)
        );
      }
    });
    its.forEach(i => {
      if (i.offsetParent) {
        i.classList.toggle('on', i.getBoundingClientRect().top < window.innerHeight * 0.65);
      }
    });
    if (Math.abs(vel) > 0.05)
      requestAnimationFrame(() => {
        if (!tick) {
          tick = true;
          fx();
        }
      });
  }
  window.addEventListener(
    'scroll',
    () => {
      if (!tick) {
        tick = true;
        requestAnimationFrame(fx);
      }
    },
    { passive: true }
  );
  window.addEventListener('resize', fx);
  fx();

  if (matchMedia('(pointer:fine)').matches) {
    $$('.btn,.nbtn,.soc a,.soc2 a').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1)}px`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.translate = '';
      });
    });
    const c = document.createElement('div');
    c.id = 'cur';
    c.setAttribute('aria-hidden', 'true');
    document.body.append(c);
    let x = -80,
      y = -80,
      cx = -80,
      cy = -80;
    window.addEventListener(
      'pointermove',
      e => {
        x = e.clientX;
        y = e.clientY;
        c.classList.toggle('h', !!(e.target.closest && e.target.closest('a,button,.xi')));
      },
      { passive: true }
    );
    (function l() {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      c.style.transform = `translate3d(${(cx - 18).toFixed(1)}px,${(cy - 18).toFixed(1)}px,0)`;
      requestAnimationFrame(l);
    })();
  }
})();