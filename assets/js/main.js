/** @format */
const $ = s => document.querySelector(s),
  $$ = s => [...document.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

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
    a: av('chandraveer.jpg')
  },
  {
    t: 'I have worked with Anoop this past fall putting together a website. Anoop was professional, a great communicator, timely, helpful and has built a wonderful website for me. Anoop is easy to work with and I highly recommend him. I have another website I have to redo soon and will use Anoop again without question.',
    n: 'Tom Fierst',
    r: 'President at Thomas Fierst Ins Agency',
    a: av('tom.jpg')
  },
  {
    t: 'Anoop has been our lifeline for the redesign of website in Drupal 8 for a large national nonprofit. He has been particularly attentive to detail and has provided clean, mobile-responsive, beautiful results for our team. We are very happy with the themeing work he has completed for us and look forward to engaging with him for additional website work in the future.',
    n: 'Monica F.',
    r: 'Accessibility-focused enterprise-level technical project manager and Certified ScrumMaster',
    a: av('monica.jpg')
  },
  {
    t: 'Anoop has worked on my Drupal website for more than a year and has done an outstanding job improving its appearance. He is immediately responsive to my requests and finishes each task quickly.',
    n: 'Barry Koren, AIA, PhD',
    r: 'Founder at TimeExchanges',
    a: av('barry.jpg')
  },
  {
    t: 'Anoop is very proficient and skilled web designer with very good knowledge of html and css.He is master in creating websites responsive.He is specialist in drupal theming.',
    n: 'Deepesh Arora',
    r: 'Drupal Consultant | PHP | Laravel | NEXT JS | TypeScript',
    a: av('dipesh.jpg')
  },
  {
    t: 'Anoop is a sincere web designer knows the issues and designing very well. He knows what he is going to do and what will be its impact. As well as he worked according to the standards to maintain the quality.',
    n: 'Shubham Agrawal',
    r: 'Technical Project Manager @ Xceedance | Technology Management, People Management',
    a: av('shubham.jpg')
  },
  {
    t: 'Anoop having deep knowledge of web designing and solve all the designing related points patiently by following proper drupal standard.',
    n: 'Bhuvaneshwar Sharma',
    r: 'Sr. Software Engineer | Developing with Drupal, AngularJS',
    a: av('bhuv.jpg')
  },
  {
    t: 'Anoop have deep knowledge in css and very energetic person. He takes every challenge and complete them by his superb and very effective design. He is mastered in Drupal design, css, and responsive css. It is a great experience with working with anoop.',
    n: 'Shubham Agrawal',
    r: 'Technical Project Manager @ Xceedance | Technology Management, People Management',
    a: av('shubham.jpg')
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
        <img class="t-avatar" src="${r.a}" alt="${r.n}" width="50" height="50" loading="lazy">
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

  const section = document.querySelector('#about.about-pinned-section');
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
   FULL STORY DATA ARRAYS & RENDERING (#me-body)
=================================================== */
const HD = (t, h) => `<h2 class='rv'><small>${t}</small>${h}</h2>`;
const pl = L => L.map((t, i) => `<span style='--i:${i}'>${t}</span>`).join('');

const E = [
  ['NextOpcode Consulting LLP · Bengaluru', 'Senior Software Engineer', 'Sep 2026 – Present', 'Serving as a Senior Software Engineer at NextOpcode Consulting LLP.'],
  ['Ekfrazo Technologies Private Limited · Bengaluru', 'Senior Drupal Developer', 'Nov 2025 – Aug 2026 · 9 mos', 'Served as a Senior Drupal Developer at Ekfrazo Technologies.'],
  ['Valuebound · Bengaluru', 'Tech Lead (SDE-4)', 'Feb 2020 – Sep 2025 · 5 yrs 7 mos', 'Led front-end development, mentored developers, and architected enterprise Drupal platforms.'],
  ['Maan Softwares Inc. · Jaipur', 'Senior Front-end Developer', 'Oct 2016 – Jan 2020 · 3 yrs 4 mos', 'Senior Drupal front-end developer implementing modern responsive technologies and optimizing client applications.'],
  ['Dice Infocom Private Limited · Jaipur', 'Web Designer', 'Jan 2013 – Sep 2016 · 3 yrs 9 mos', 'Responsive web development, clean UI engineering, and cross-browser enhancements.']
];

const ED = [
  ['Jaipur National University · Jaipur Rajasthan', 'Master of Computer Applications (MCA) · Computer Science', '2018 – 2019', 'Postgraduate studies with focus on advanced computer applications, software engineering, and web architectures.'],
  ['Jaipur National University · Jaipur Rajasthan', 'Bachelor of Computer Application (BCA) · Computer Science', '2013 – 2014', 'Undergraduate foundation in programming, database systems, and modern front-end technologies.'],
  ['Board of Technical Education Rajasthan · Jodhpur Rajasthan', 'Polytechnic (Engineering Diploma) · Computer Science', '2009 – 2012', 'Engineering curriculum covering core computer science foundations and programming practices.']
];

const AW = [
  {
    title: 'Best Team',
    org: 'Valuebound · 2021',
    desc: 'In recognition of exemplary team performance and collaborative delivery.',
    img: 'assets/img/team-award.jpg'
  },
  {
    title: 'Best Team of the Quarter',
    org: 'Valuebound · Q3 2022',
    desc: 'Awarded for extraordinary execution, innovation, and client success in Q3 2022.',
    img: 'assets/img/best-team.jpg'
  }
];

const K = [
  ['Front-end & Theming', ['Custom Drupal theming', 'Twig engine', 'Theme migrations (D7→D9, D7→D10, D8→D10)', 'HTML5', 'CSS3', 'SCSS / SASS', 'LESS', 'Bootstrap (3, 4, 5)', 'Bootstrap Barrio', 'bootstrap_sass', 'Responsive design', 'Cross-browser']],
  ['CMS & Decoupled', ['Drupal 7, 8, 9, 10, 11', 'Decoupled Drupal', 'Next.js Frontend', 'REST API & ReactJS', 'Progressive Web Apps (PWA)', 'FlexiStyle Maintainer', 'Drupal Security Advisory', 'WordPress']],
  ['Performance & SEO', ['Google PageSpeed Insights', 'Google Search Console', 'SEO & Metatags', 'Site performance', 'Lighthouse', 'GTmetrix', 'SEMrush', 'Structured data', 'Accessibility (WCAG)']],
  ['Cloud & Hosting', ['AWS (Cloud Economics, EC2, Scaling)', 'Acquia Site Factory', 'Acquia Cloud', 'Pantheon', 'Serverless hosting']],
  ['Preprocessors & Build', ['Gulp', 'Webpack', 'Sass compiler', 'Koala', 'Composer', 'NPM', 'Drush']],
  ['Local Dev & Git', ['DDEV', 'Docker', 'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Acquia Dev Desktop', 'XAMPP']],
  ['UI Design & Motion', ['Figma', 'Adobe XD', 'Photoshop', 'Photopea', 'Wireframing', 'Lenis Smooth Scroll', 'GSAP ScrollTrigger', 'Animate on Scroll (AOS)']],
  ['Workflow & Collaboration', ['Jira', 'Basecamp', 'Notion', 'Slack', 'Zoom', 'Teams', 'Cursor / VS Code', 'Sublime Text']]
];

const PR = [
  ['The DropTimes', 'Anoop Singh Launches New Drupal Theme FlexiStyle Bootstrap', 'https://www.thedroptimes.com/40251/anoop-singh-launches-new-drupal-theme-flexistyle-bootstrap'],
  ['The DropTimes', 'FlexiStyle Bootstrap SCSS Theme Coming to Drupal.org', 'https://www.thedroptimes.com/42013/flexistyle-bootstrap-scss-theme-coming-drupalorg'],
  ['The DropTimes', 'FlexiStyle Digital Experience Theme for Drupal 10 and 11 Announced', 'https://www.thedroptimes.com/42871/flexistyle-digital-experience-theme-drupal-10-and-11-announced'],
  ['The DropTimes', 'Step-by-Step Guide to Publishing Themes and Modules on Drupal.org', 'https://www.thedroptimes.com/44779/step-step-guide-publishing-themes-and-modules-drupalorg'],
  ['Valuebound', "Celebrating Anoop Singh's Success Story: The 'Magician' of Drupal Development", 'https://www.valuebound.com/resources/blog/celebrating-anoop-singhs-success-story-magician-drupal'],
  ['The DropTimes', 'Contributor Profile & Articles on The DropTimes', 'https://www.thedroptimes.com/people/40250/anoopsingh92'],
  ['Instagram Feature', 'Featured Spotlight & Project Milestone Announcement', 'https://www.instagram.com/p/C84UC78Mlqm/'],
  ['Instagram Coverage', 'Community Highlight & Drupal Theming Release', 'https://www.instagram.com/p/C7RQEPmJb7j/'],
  ['Instagram Spotlight', 'Technical Contribution & Project Showcase', 'https://www.instagram.com/p/C3XiL-1Bfsj/'],
  ['LinkedIn Feature', 'Professional Recognition & Contributor Update', 'https://lnkd.in/p/gi7Sdn9x'],
  ['LinkedIn Spotlight', 'Magician of Drupal Development at Valuebound', 'https://www.linkedin.com/feed/update/urn:li:activity:7022168874347290624/'],
  ['LinkedIn Spotlight', 'Drupal Ecosystem Milestone & Community Discussion', 'https://www.linkedin.com/feed/update/urn:li:activity:7293636407598714880/']
];

(function renderStory() {
  const meBody = $('#me-body');
  if (!meBody) return;

  meBody.innerHTML = `
    <!-- Giving Back to Drupal (Open Source) -->
    <section class="sec">
      ${HD('01 / open source', 'Giving back to Drupal.')}
      <p class="drupal-lead rv">
        I actively maintain FlexiStyle and FlexiStyle Bootstrap, with Drupal security advisory coverage, and I'm an Individual Member of the Drupal Association.
      </p>
      
      <div class="drupal-stats-grid rv">
        <div class="drupal-stat-box">
          <b data-n="5" data-p="+">0</b>
          <span>custom Drupal themes built</span>
        </div>
        <div class="drupal-stat-box">
          <b data-n="7" data-p="+">0</b>
          <span>projects maintained</span>
        </div>
        <div class="drupal-stat-box">
          <b data-n="125" data-p="+">0</b>
          <span>credits on issues</span>
        </div>
        <div class="drupal-stat-box">
          <b style="font-size: 2.3rem; letter-spacing: -0.02em;">SA</b>
          <span>opted in to security advisory coverage</span>
        </div>
      </div>

      <div class="rv">
        <a class="drupal-cta-btn" href="https://www.drupal.org/u/anoopsingh92" target="_blank" rel="noopener">
          Drupal.org profile ↗
        </a>
      </div>
    </section>

    <!-- Experience Timeline -->
    <section class="sec">
      ${HD('02 / career', 'Work Experience')}
      <div class="tl">
        ${E.map(
    e => `
          <div class="it rv">
            <h3>${e[1]} &mdash; <span>${e[0]}</span></h3>
            <div class="d">${e[2]}</div>
            <p>${e[3]}</p>
          </div>
        `
  ).join('')}
      </div>
    </section>

    <!-- Education Timeline -->
    <section class="sec">
      ${HD('03 / education', 'Academic Background')}
      <div class="tl">
        ${ED.map(
    e => `
          <div class="it rv">
            <h3>${e[0]}</h3>
            <div class="d">${e[1]} &bull; ${e[2]}</div>
            <p>${e[3]}</p>
          </div>
        `
  ).join('')}
      </div>
    </section>

    <!-- Recognised by the team. (Achievements with Photos) -->
    <section class="sec">
      ${HD('04 / achievements', 'Recognised by the team.')}
      <div class="awd">
        ${AW.map(
    a => `
          <div class="aw-card rv">
            <div class="aw-img-wrap">
              <img src="${a.img}" alt="${a.title}" loading="lazy" width="400" height="300">
            </div>
            <div class="aw-caption">
              <span class="aw-badge">${a.org}</span>
              <h3>${a.title}</h3>
              <p>${a.desc}</p>
            </div>
          </div>
        `
  ).join('')}
      </div>
    </section>

    <!-- Detailed Skillset Matrix -->
    <section class="sec">
      ${HD('05 / technical skills', 'Comprehensive Toolkit')}
      <div class="sk">
        ${K.map(
    k => `
          <div class="box rv">
            <h3>${k[0]}</h3>
            <div class="pills">${pl(k[1])}</div>
          </div>
        `
  ).join('')}
      </div>
    </section>

    <!-- All Delivered Projects -->
    <section class='sec projects'>
      <h2 class='rv'><small>06 / project directory</small>All Notable Projects, one list.</h2>
      <div class='xf rv' role='group' aria-label='Filter projects'>
        <button type='button' data-f='all' aria-pressed='true'>All</button>
        <button type='button' data-f='migration' aria-pressed='false'>Migrations</button>
        <button type='button' data-f='redesign' aria-pressed='false'>Redesigns</button>
        <button type='button' data-f='headless' aria-pressed='false'>Headless</button>
        <button type='button' data-f='dev' aria-pressed='false'>Dev &amp; test</button>
      </div>
      <div class='xp rv'>
        <ul class='xl'>

          <li data-c='all migration headless redesign'>
            <button class='xi' type='button' aria-pressed='false'><b>woodyplants.kendallhunt.com</b><small>May 2025 – Aug 2025</small></button>
            <div class='det'><span class='k'>Project · May 2025 – Aug 2025</span>
              <h3>Woody Plants in North America →</h3>
              <p>Rebuilt as a decoupled educational platform: back end runs on Drupal 11 with Next.js front end.</p>
              <div class='chips'><span>Drupal 7 → 11</span><span>Twig</span><span>Migration</span><span>Next.js</span></div>
              <div class='acts'><a class='btn p' href='https://woodyplants.kendallhunt.com' target='_blank' rel='noopener'>Open site ↗</a></div>
            </div>
          </li>
          <li data-c='all migration'>
            <button class='xi' type='button' aria-pressed='false'><b>greatriverlearning.com</b><small>May 2025 – Aug 2025</small></button>
            <div class='det'><span class='k'>Project · May 2025 – Aug 2025</span>
              <h3>greatriverlearning.com →</h3>
              <p>Higher education publication platform migrated from legacy Drupal 7 to modern Drupal 11.</p>
              <div class='chips'><span>Drupal 7 → 11</span><span>Twig</span></div>
              <div class='acts'><a class='btn p' href='https://greatriverlearning.com/' target='_blank' rel='noopener'>Open site ↗</a></div>
            </div>
          </li>
          <li data-c='all migration'>
            <button class='xi' type='button' aria-pressed='false'><b>store.rclbenziger.com</b><small>May 2025 – Aug 2025</small></button>
            <div class='det'><span class='k'>Project · May 2025 – Aug 2025</span>
              <h3>store.rclbenziger.com →</h3>
              <p>Educational technology and courseware portal migrated from Drupal 7 to modern Drupal 11.</p>
              <div class='chips'><span>Drupal 7 → 11</span><span>Twig</span></div>
              <div class='acts'><a class='btn p' href='https://store.rclbenziger.com/' target='_blank' rel='noopener'>Open site ↗</a></div>
            </div>
          </li>
          <li data-c='all migration'>
            <button class='xi' type='button' aria-pressed='false'><b>walji.kendallhunt.com</b><small>May 2025 – Aug 2025</small></button>
            <div class='det'><span class='k'>Project · May 2025 – Aug 2025</span>
              <h3>walji.kendallhunt.com →</h3>
              <p>Educational technology and courseware portal migrated from Drupal 7 to modern Drupal 11.</p>
              <div class='chips'><span>Drupal 7 → 11</span><span>Twig</span></div>
              <div class='acts'><a class='btn p' href='https://walji.kendallhunt.com/' target='_blank' rel='noopener'>Open site ↗</a></div>
            </div>
          </li>

          <li data-c='all migration'>
            <button class='xi' type='button' aria-pressed='false'><b>paradigmeducation.com</b><small>May 2025 – Aug 2025</small></button>
            <div class='det'><span class='k'>Project · May 2025 – Aug 2025</span>
              <h3>Paradigm Education Solutions →</h3>
              <p>Educational technology and courseware portal migrated from Drupal 7 to modern Drupal 11.</p>
              <div class='chips'><span>Drupal 7 → 11</span><span>Twig</span></div>
              <div class='acts'><a class='btn p' href='https://www.paradigmeducation.com/' target='_blank' rel='noopener'>Open site ↗</a></div>
            </div>
          </li>

          <li data-c='all migration'><button class='xi' type='button' aria-pressed='false'><b>betapharm.drreddys.acsitefactory.com</b><small>May 2025 – Aug 2025</small></button>
            <div class='det'><span class='k'>Dev / test environment · May 2025 – Aug 2025</span>
              <h3>Dr. Reddy’s Betapharm →</h3>
              <p>Listed on LinkedIn without a write-up.</p>
              <div class='chips'><span>Acquia Site Factory</span></div>
              <div class='acts'><a class='btn p' href='https://betapharm.drreddys.acsitefactory.com/' target='_blank' rel='noopener'>Open site ↗</a></div>
            </div>
          </li>

          <li data-c='all dev'><button class='xi' type='button' aria-pressed='false'><b>heart.rclbenziger.com</b><small>Jan 2024 – Jun 2025</small></button>
            <div class='det'><span class='k'>Dev / test environment · Jan 2024 – Jun 2025</span>
              <h3>RCL Benziger Heart →</h3>
              <p>Listed on LinkedIn without a write-up.</p>
              <div class='acts'><a class='btn p' href='http://heart.rclbenziger.com' target='_blank' rel='noopener'>Open site ↗</a></div>
            </div>
          </li>
          <li data-c='all dev'><button class='xi' type='button' aria-pressed='false'><b>problock.ai</b><small>May 2025 – Jun 2025</small></button>
            <div class='det'><span class='k'>Project · May 2025 – Jun 2025</span>
              <h3>ProBlock AI →</h3>
              <p>Listed on LinkedIn without a write-up.</p>
              <div class='acts'><a class='btn p' href='https://problock.ai' target='_blank' rel='noopener'>Open site ↗</a><button class='btn' type='button' data-live='https://problock.ai'>Load live preview</button></div>
              <div class='fr' hidden></div>
              <p class='k' style='margin-top:10px'>Loads the real site. Some sites block embedding.</p>
            </div>
          </li>
          <li data-c='all migration headless'><button class='xi' type='button' aria-pressed='false'><b>costsheet.kendallhunt.com</b><small>Apr 2024 – Nov 2024</small></button>
            <div class='det'><span class='k'>Project · Apr 2024 – Nov 2024</span>
              <h3>CostSheet Kendall Hunt →</h3>
              <p>Listed on LinkedIn without a write-up.</p>
              <div class='acts'><a class='btn p' href='https://costsheet.kendallhunt.com' target='_blank' rel='noopener'>Open site ↗</a><button class='btn' type='button' data-live='https://costsheet.kendallhunt.com'>Load live preview</button></div>
              <div class='fr' hidden></div>
              <p class='k' style='margin-top:10px'>Loads the real site. Some sites block embedding.</p>
            </div>
          </li>
          <li data-c='all migration'><button class='xi' type='button' aria-pressed='false'><b>k12.kendallhunt.com</b><small>Mar 2023 – Nov 2024</small></button>
            <div class='det'><span class='k'>Project · Mar 2023 – Nov 2024</span>
              <h3>K12 Kendall Hunt →</h3>
              <p>Listed on LinkedIn without a write-up.</p>
              <div class='acts'><a class='btn p' href='https://k12.kendallhunt.com/' target='_blank' rel='noopener'>Open site ↗</a><button class='btn' type='button' data-live='https://k12.kendallhunt.com/'>Load live preview</button></div>
              <div class='fr' hidden></div>
              <p class='k' style='margin-top:10px'>Loads the real site. Some sites block embedding.</p>
            </div>
          </li>
          <li data-c='all dev'><button class='xi' type='button' aria-pressed='false'><b>digitalexperience.live</b><small>Jul 2024 – Oct 2024</small></button>
            <div class='det'><span class='k'>Project · Jul 2024 – Oct 2024</span>
              <h3>digitalexperience.live →</h3>
              <p>Listed on LinkedIn without a write-up.</p>
              <div class='acts'><a class='btn p' href='https://digitalexperience.live' target='_blank' rel='noopener'>Open site ↗</a><button class='btn' type='button' data-live='https://digitalexperience.live'>Load live preview</button></div>
              <div class='fr' hidden></div>
              <p class='k' style='margin-top:10px'>Loads the real site. Some sites block embedding.</p>
            </div>
          </li>
          <li data-c='all migration'><button class='xi' type='button' aria-pressed='false'><b>grlcontent.com</b><small>Aug 2023 – Jun 2024</small></button>
            <div class='det'><span class='k'>Project · Aug 2023 – Jun 2024</span>
              <h3>GRL Content →</h3>
              <p>Front-end developer on a Drupal 7 project. Migrated the custom theme from Drupal 7 to Drupal 10: a Bootstrap 3 based theme, with every page designed and all the necessary Twig templates created.</p>
              <div class='chips'><span>Drupal 7 → 10</span><span>Bootstrap 3</span><span>Twig</span></div>
              <div class='acts'><a class='btn p' href='https://www.grlcontent.com' target='_blank' rel='noopener'>Open site ↗</a><button class='btn' type='button' data-live='https://www.grlcontent.com'>Load live preview</button></div>
              <div class='fr' hidden></div>
              <p class='k' style='margin-top:10px'>Loads the real site. Some sites block embedding.</p>
            </div>
          </li>
          <li data-c='all migration'><button class='xi' type='button' aria-pressed='false'><b>kendallhunt.com</b><small>Sep 2023 – Jun 2024</small></button>
            <div class='det'><span class='k'>Project · Sep 2023 – Jun 2024</span>
              <h3>Kendall Hunt Corporate →</h3>
              <p>Listed on LinkedIn without a write-up.</p>
              <div class='acts'><a class='btn p' href='https://www.kendallhunt.com/' target='_blank' rel='noopener'>Open site ↗</a><button class='btn' type='button' data-live='https://www.kendallhunt.com/'>Load live preview</button></div>
              <div class='fr' hidden></div>
              <p class='k' style='margin-top:10px'>Loads the real site. Some sites block embedding.</p>
            </div>
          </li>
          <li data-c='all migration'><button class='xi' type='button' aria-pressed='false'><b>pescirrus.com</b><small>Aug 2023 – Jun 2024</small></button>
            <div class='det'><span class='k'>Project · Aug 2023 – Jun 2024</span>
              <h3>PESCirrus →</h3>
              <p>Listed on LinkedIn without a write-up.</p>
              <div class='acts'><a class='btn p' href='https://www.pescirrus.com' target='_blank' rel='noopener'>Open site ↗</a><button class='btn' type='button' data-live='https://www.pescirrus.com'>Load live preview</button></div>
              <div class='fr' hidden></div>
              <p class='k' style='margin-top:10px'>Loads the real site. Some sites block embedding.</p>
            </div>
          </li>
          <li data-c='all migration'><button class='xi' type='button' aria-pressed='false'><b>flourishkh.com</b><small>Feb 2023 – Mar 2024</small></button>
            <div class='det'><span class='k'>Project · Feb 2023 – Mar 2024</span>
              <h3>Flourish KH →</h3>
              <p>Listed on LinkedIn without a write-up.</p>
              <div class='acts'><a class='btn p' href='https://flourishkh.com' target='_blank' rel='noopener'>Open site ↗</a><button class='btn' type='button' data-live='https://flourishkh.com'>Load live preview</button></div>
              <div class='fr' hidden></div>
              <p class='k' style='margin-top:10px'>Loads the real site. Some sites block embedding.</p>
            </div>
          </li>

          <li data-c='all migration'><button class='xi' type='button' aria-pressed='false'><b>he.kendallhunt.com</b><small>Jan 2022 – Jul 2023</small></button>
            <div class='det'><span class='k'>Project · Jan 2022 – Jul 2023</span>
              <h3>HE Kendall Hunt →</h3>
              <p>Kendall Hunt Higher Education was a migration project. As the Drupal themer I migrated the theme from Drupal 7 to Drupal 9, using the latest Bootstrap with a custom theme based on bootstrap_sass and Gulp as the compiler.</p>
              <div class='chips'><span>Drupal 9</span><span>Bootstrap Barrio</span><span>Twig</span><span>Gulp</span><span>Git</span><span>Drush</span></div>
              <div class='acts'><a class='btn p' href='https://he.kendallhunt.com' target='_blank' rel='noopener'>Open site ↗</a><button class='btn' type='button' data-live='https://he.kendallhunt.com'>Load live preview</button></div>
              <div class='fr' hidden></div>
              <p class='k' style='margin-top:10px'>Loads the real site. Some sites block embedding.</p>
            </div>
          </li>
          <li data-c='all dev headless'><button class='xi' type='button' aria-pressed='false'><b>Wellbeing VMware</b><small>Jun 2021 – Sep 2021</small></button>
            <div class='det'><span class='k'>Project · Jun 2021 – Sep 2021</span>
              <h3>Wellbeing VMware →</h3>
              <p>UI developer on a headless Drupal project. Designed all the pages and widgets from the business-provided mockups and worked on accessibility.</p>
              <div class='chips'><span>Headless Drupal</span><span>Accessibility</span></div>
            </div>
          </li>
          <li data-c='all redesign'><button class='xi' type='button' aria-pressed='false'><b>valuebound.com</b><small>Jun 2021 – Jul 2021</small></button>
            <div class='det'><span class='k'>Project · Jun 2021 – Jul 2021</span>
              <h3>Valuebound Corporate →</h3>
              <p>Redesigned the Valuebound site, moving it from Drupal 8 to Drupal 10 with a new UI. Worked with decoupled Drupal and the REST API with ReactJS, built a Progressive Web App and improved site performance. Started as the front-end developer, later leading a team on it.</p>
              <div class='chips'><span>Drupal 10</span><span>Decoupled</span><span>ReactJS</span><span>PWA</span><span>Performance</span></div>
              <div class='acts'><a class='btn p' href='https://www.valuebound.com' target='_blank' rel='noopener'>Open site ↗</a><button class='btn' type='button' data-live='https://www.valuebound.com'>Load live preview</button></div>
              <div class='fr' hidden></div>
              <p class='k' style='margin-top:10px'>Loads the real site. Some sites block embedding.</p>
            </div>
          </li>
          <li data-c='all redesign migration'><button class='xi' type='button' aria-pressed='false'><b>grlengagement.com</b><small>Apr 2020 – Apr 2021</small></button>
            <div class='det'><span class='k'>Project · Apr 2020 – Apr 2021</span>
              <h3>GRL Engagement →</h3>
              <p>Front-end developer for the redesign. Built a new custom theme from scratch on Bootstrap 4 (bootstrap_sass) with Gulp as the compiler, across a multisite that also includes khpengagement.com, pesengagement.com and rclbengagement.com.</p>
              <div class='chips'><span>Bootstrap 4</span><span>Gulp</span><span>Multisite</span></div>
              <div class='acts'><a class='btn p' href='https://www.grlengagement.com' target='_blank' rel='noopener'>Open site ↗</a><button class='btn' type='button' data-live='https://www.grlengagement.com'>Load live preview</button></div>
              <div class='fr' hidden></div>
              <p class='k' style='margin-top:10px'>Loads the real site. Some sites block embedding.</p>
            </div>
          </li>
          <li data-c='all dev'><button class='xi' type='button' aria-pressed='false'><b>DietTracker</b><small>Jun 2020 – Nov 2020</small></button>
            <div class='det'><span class='k'>Project · Jun 2020 – Nov 2020</span>
              <h3>GRL DietTracker →</h3>
              <p>A Drupal 8 project where I handled front end and back end. Created a custom Bootstrap 4 (Bootstrap Barrio) theme in SASS and built all sections and pages from the provided design.</p>
              <div class='chips'><span>Drupal 8</span><span>Bootstrap Barrio</span><span>SASS</span></div>
              <div class='acts'><a class='btn p' href='https://diettracker.greatriverlearning.com' target='_blank' rel='noopener'>Open site ↗</a><button class='btn' type='button' data-live='https://diettracker.greatriverlearning.com'>Load live preview</button></div>
              <div class='fr' hidden></div>
            </div>
          </li>
         
          <li data-c='all dev'><button class='xi' type='button' aria-pressed='false'><b>greenamerica.org</b><small>2016 – 2019</small></button>
            <div class='det'><span class='k'>Project · 2016 – 2019</span>
              <h3>Green America →</h3>
              <p>Website for Green America, a national not-for-profit membership organization founded in 1982 working toward a socially just and environmentally sustainable society.</p>
              <div class='chips'><span>Drupal</span></div>
              <div class='acts'><a class='btn p' href='https://greenamerica.org/' target='_blank' rel='noopener'>Open site ↗</a><button class='btn' type='button' data-live='https://greenamerica.org/'>Load live preview</button></div>
              <div class='fr' hidden></div>
              <p class='k' style='margin-top:10px'>Loads the real site. Some sites block embedding.</p>
            </div>
          </li>
        </ul>
        <aside class='xv' aria-live='polite' aria-label='Project preview'></aside>
      </div>
    </section>

    <!-- Verified Certifications -->
    <section class='sec licenses'>
      <h2 class='rv'><small>07 / licenses & certifications</small>16 Verified Certifications.</h2>
      <div class='xp rv'>
        <ul class='xl'>
          <li><button class='xi' type='button' aria-pressed='false'><b>Introduction to Drupal 10</b><small>Feb 2025</small></button>
            <div class='det'>
              <div class='bdg' style='--h:56'>FC</div><span class='k'>Forcontu</span>
              <h3>Introduction to Drupal 10</h3>
              <div class='k2'>Issued Feb 2025</div>
              <p>Credential ID</p><code class='id'>D10SBINIEN2163</code>
            </div>
          </li>
          <li><button class='xi' type='button' aria-pressed='false'><b>Introduction to Drupal 9</b><small>Jan 2023</small></button>
            <div class='det'>
              <div class='bdg' style='--h:56'>FC</div><span class='k'>Forcontu</span>
              <h3>Introduction to Drupal 9</h3>
              <div class='k2'>Issued Jan 2023</div>
              <p>Credential ID</p><code class='id'>D9SBINIEN1611</code>
            </div>
          </li>
          <li><button class='xi' type='button' aria-pressed='false'><b>Responsive Web Design</b><small>Jun 2021</small></button>
            <div class='det'>
              <div class='bdg' style='--h:174'>fCC</div><span class='k'>freeCodeCamp</span>
              <h3>Responsive Web Design</h3>
              <div class='k2'>Issued Jun 2021</div>
              <p>Verify this credential from my LinkedIn profile.</p>
            </div>
          </li>
          <li><button class='xi' type='button' aria-pressed='false'><b>Google Material Design Lite</b><small>Feb 2021</small></button>
            <div class='det'>
              <div class='bdg' style='--h:12'>U</div><span class='k'>Udemy</span>
              <h3>Google Material Design Lite</h3>
              <div class='k2'>Issued Feb 2021</div>
              <p>Credential ID</p><code class='id'>UC-a0284bc3-d075-495c-a095-3e55d0beb830</code>
            </div>
          </li>
          <li><button class='xi' type='button' aria-pressed='false'><b>CSS Essential Training</b><small>Nov 2020</small></button>
            <div class='det'>
              <div class='bdg' style='--h:134'>in</div><span class='k'>LinkedIn</span>
              <h3>CSS Essential Training</h3>
              <div class='k2'>Issued Nov 2020</div>
              <p>Credential ID</p><code class='id'>AQVwj_8S1wcjWj1rEH1TjiVWhi6I</code>
            </div>
          </li>
          <li><button class='xi' type='button' aria-pressed='false'><b>HTML Essential Training</b><small>Nov 2020</small></button>
            <div class='det'>
              <div class='bdg' style='--h:134'>in</div><span class='k'>LinkedIn</span>
              <h3>HTML Essential Training</h3>
              <div class='k2'>Issued Nov 2020</div>
              <p>Credential ID</p><code class='id'>AS50JZ8vYV-I__mjgXPvN8UJ2MZ0</code>
            </div>
          </li>
          <li><button class='xi' type='button' aria-pressed='false'><b>AWS Cloud Economics</b><small>Jun 2020</small></button>
            <div class='det'>
              <div class='bdg' style='--h:276'>aws</div><span class='k'>Amazon Web Services (AWS)</span>
              <h3>AWS Cloud Economics</h3>
              <div class='k2'>Issued Jun 2020</div>
              <p>Credential ID</p><code class='id'>Dp1URZptRECL1KMhsqwa_w2</code>
            </div>
          </li>
          <li><button class='xi' type='button' aria-pressed='false'><b>Introduction to Amazon Elastic Compute Cloud (EC2)</b><small>Jun 2020</small></button>
            <div class='det'>
              <div class='bdg' style='--h:276'>aws</div><span class='k'>Amazon Web Services (AWS)</span>
              <h3>Introduction to Amazon Elastic Compute Cloud (EC2)</h3>
              <div class='k2'>Issued Jun 2020</div>
              <p>Credential ID</p><code class='id'>eEYysXqaZUW0y-eqrxOBUQ2</code>
            </div>
          </li>
          <li><button class='xi' type='button' aria-pressed='false'><b>Introduction to EC2 Auto Scaling</b><small>Jun 2020</small></button>
            <div class='det'>
              <div class='bdg' style='--h:276'>aws</div><span class='k'>Amazon Web Services (AWS)</span>
              <h3>Introduction to EC2 Auto Scaling</h3>
              <div class='k2'>Issued Jun 2020</div>
              <p>Credential ID</p><code class='id'>ZyX0NbxU60qO7Cg6IfpaLw2</code>
            </div>
          </li>
          <li><button class='xi' type='button' aria-pressed='false'><b>Diploma in Web Design</b><small>Jul 2019</small></button>
            <div class='det'>
              <div class='bdg' style='--h:256'>A</div><span class='k'>Alison – Free Online Learning</span>
              <h3>Diploma in Web Design</h3>
              <div class='k2'>Issued Jul 2019</div>
              <p>Credential ID</p><code class='id'>256-14292767</code>
            </div>
          </li>
          <li><button class='xi' type='button' aria-pressed='false'><b>Web Page Design Using HTML5 and CSS3</b><small>Jul 2019</small></button>
            <div class='det'>
              <div class='bdg' style='--h:256'>A</div><span class='k'>Alison – Free Online Learning</span>
              <h3>Web Page Design Using HTML5 and CSS3</h3>
              <div class='k2'>Issued Jul 2019</div>
              <p>Credential ID</p><code class='id'>1413-14292767</code>
            </div>
          </li>
          <li><button class='xi' type='button' aria-pressed='false'><b>Web Page Development</b><small>Jul 2019</small></button>
            <div class='det'>
              <div class='bdg' style='--h:256'>A</div><span class='k'>Alison – Free Online Learning</span>
              <h3>Web Page Development</h3>
              <div class='k2'>Issued Jul 2019</div>
              <p>Credential ID</p><code class='id'>245-14292767</code>
            </div>
          </li>
          <li><button class='xi' type='button' aria-pressed='false'><b>Web Development By Doing: HTML / CSS From Scratch</b><small>Apr 2019</small></button>
            <div class='det'>
              <div class='bdg' style='--h:12'>U</div><span class='k'>Udemy</span>
              <h3>Web Development By Doing: HTML / CSS From Scratch</h3>
              <div class='k2'>Issued Apr 2019</div>
              <p>Credential ID</p><code class='id'>UC-N4D56W16</code>
            </div>
          </li>
          <li><button class='xi' type='button' aria-pressed='false'><b>Complete Bootstrap 4 course - build 3 projects</b><small>Mar 2019</small></button>
            <div class='det'>
              <div class='bdg' style='--h:12'>U</div><span class='k'>Udemy</span>
              <h3>Complete Bootstrap 4 course - build 3 projects</h3>
              <div class='k2'>Issued Mar 2019</div>
              <p>Credential ID</p><code class='id'>UC-7GD9H7AC</code>
            </div>
          </li>
          <li><button class='xi' type='button' aria-pressed='false'><b>HTML/CSS and Bootstrap, ranking in the top 25%</b><small>Dec 2017</small></button>
            <div class='det'>
              <div class='bdg' style='--h:265'>TD</div><span class='k'>TestDome</span>
              <h3>HTML/CSS and Bootstrap, ranking in the top 25%</h3>
              <div class='k2'>Issued Dec 2017</div>
              <p>Credential ID</p><code class='id'>ji8keiut4m</code>
            </div>
          </li>
          <li><button class='xi' type='button' aria-pressed='false'><b>HTML/CSS, ranking in the top 10%</b><small>Dec 2017</small></button>
            <div class='det'>
              <div class='bdg' style='--h:265'>TD</div><span class='k'>TestDome</span>
              <h3>HTML/CSS, ranking in the top 10%</h3>
              <div class='k2'>Issued Dec 2017</div>
              <p>Credential ID</p><code class='id'>85w6yvi1zd</code>
            </div>
          </li>
        </ul>
        <aside class='xv' aria-live='polite' aria-label='Credential preview'></aside>
      </div>
      <div class='ed' style='margin-top:22px'>
        <div class='box rv'>
          <h3>Bootstrap Test on UpWork</h3>
          <p style='margin:0 0 8px;color:var(--mut)'>Score 3.40 · Above Average</p><span>Nov 2017</span>
        </div>
        <div class='box rv'>
          <h3>CSS Test on UpWork</h3>
          <p style='margin:0 0 8px;color:var(--mut)'>Score 4.10 · Top 20%</p><span>Feb 2015</span>
        </div>
      </div>
    </section>

    <!-- In The Press -->
    <div class="sec">
      ${HD('08 / in the press', 'Featured & mentioned in the publications & articles')}
      <div class="pr">
        ${PR.map(
    p => `
          <a class="box rv" href="${p[2]}" target="_blank" rel="noopener">
            <small>${p[0]}</small>
            <h3>${p[1]} &rarr;</h3>
          </a>
        `
  ).join('')}
      </div>
    </div>
  `;
})();

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

  homeEl.hidden = isMe;
  meEl.hidden = !isMe;
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