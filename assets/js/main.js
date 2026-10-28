const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

/* hero letters */
$$('h1 .ln').forEach((l, r) => {
  l.innerHTML = [...l.dataset.s].map((c, i) => `<span class="ch" style="--i:${i + r * 5}">${c}</span>`).join('');
});

/* typewriter */
const words = ['custom Drupal themes', 'pixel-perfect interfaces', 'silky animations', 'fast responsive sites'];
let wi = 0, ci = 0, del = false;
const w = $('#word');
(function type() {
  if (!w) return;
  const t = words[wi];
  w.textContent = t.slice(0, ci);
  if (!del && ci === t.length) { del = true; return setTimeout(type, 1400); }
  if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; }
  ci += del ? -1 : 1;
  setTimeout(type, del ? 35 : 70);
})();

/* projects */
const P = [
  ['drreddys.acsitefactory.com', 'https://betapharm.test-drreddys.acsitefactory.com', 'Enterprise pharmaceutical portal deployed on Acquia Site Factory with customized theming.', 'Acquia Site Factory', ['Drupal', 'Acquia', 'Enterprise', 'Theming']],
  ['grlcontent.com', 'https://www.grlcontent.com', 'Migrated custom Drupal theme from D7 to D10. Designed all pages with modern Bootstrap and custom Twigs.', 'Drupal Migration', ['Drupal 10', 'Migration', 'Twig', 'Bootstrap']],
  ['he.kendallhunt.com', 'https://he.kendallhunt.com', 'Higher Education theme migration from D7 to D9 using Bootstrap Barrio with SASS compiler and Twig.', 'Drupal Theming', ['Drupal 9', 'Bootstrap Barrio', 'Gulp', 'Drush']],
  ['valuebound.com', 'https://valuebound.com', 'Redesigned corporate platform with Decoupled Drupal, REST API with ReactJS, and PWA capabilities.', 'Decoupled Drupal', ['Drupal 10', 'ReactJS', 'REST API', 'PWA']],
  ['grlengagement.com', 'https://grlengagement.com', 'Multisite custom theme created from scratch in Bootstrap 4 SASS with Gulp compiler.', 'Multisite Theming', ['Drupal 10', 'Multisite', 'Bootstrap SASS', 'Gulp']],
  ['greenamerica.org', 'https://greenamerica.org/', 'Custom Bootstrap-based theme in Drupal for prominent 501(c)(3) environmental organization.', 'Drupal Theming', ['Drupal', 'Bootstrap', 'Pantheon', 'Non-Profit']],
];

const gridEl = $('#grid');
if (gridEl) {
  gridEl.innerHTML = P.map((p, i) => `<a class="card rv" style="--d:${(i % 3) * .1}s" href="${p[1]}" target="_blank" rel="noopener">
<div class="n"><span>${String(i + 1).padStart(2, '0')} · ${p[3]}</span><span class="arrow">↗</span></div>
<h3>${p[0]}</h3><p>${p[2]}</p><div class="chips">${p[4].map(t => `<span>${t}</span>`).join('')}</div></a>`).join('');
}

/* reveal + counters */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  e.target.querySelectorAll('[data-n]').forEach(c => {
    const n = +c.dataset.n, p = c.dataset.p || '';
    let s = null;
    const f = t => {
      s = s || t;
      const k = Math.min((t - s) / 1400, 1);
      c.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))) + p;
      if (k < 1) requestAnimationFrame(f);
    };
    reduce ? c.textContent = n + p : requestAnimationFrame(f);
  });
  io.unobserve(e.target);
}), { threshold: .15 });

$$('.rv').forEach(e => io.observe(e));

/* scroll progress + active link */
const links = $$('nav ul a');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const bar = $('#bar');
  if (bar) bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  links.forEach(a => {
    const s = $(a.getAttribute('href'));
    if (s && !s.hidden) {
      const r = s.getBoundingClientRect();
      a.classList.toggle('on', r.top < innerHeight * .45 && r.bottom > innerHeight * .45);
    }
  });
}, { passive: true });

/* card tilt + spotlight */
$$('.card').forEach(c => {
  c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.setProperty('--mx', x * 100 + '%');
    c.style.setProperty('--my', y * 100 + '%');
    if (!reduce) c.style.transform = `rotateX(${(.5 - y) * 10}deg) rotateY(${(x - .5) * 12}deg) translateZ(6px)`;
  });
  c.addEventListener('pointerleave', () => c.style.transform = '');
});

/* theme toggle */
const themeBtn = $('#theme');
if (themeBtn) {
  themeBtn.onclick = () => {
    const r = document.documentElement;
    const dark = getComputedStyle(r).getPropertyValue('--bg').trim() === '#0a0e17';
    r.dataset.theme = dark ? 'light' : 'dark';
  };
}

/* cursor glow + particle field */
const cv = $('#bg');
if (cv) {
  const x = cv.getContext('2d');
  let W, H, pts = [], m = { x: -999, y: -999 };
  const gl = $('#glow');

  function size() {
    W = cv.width = innerWidth;
    H = cv.height = innerHeight;
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
  window.addEventListener('pointermove', e => {
    m.x = e.clientX;
    m.y = e.clientY;
    if (gl) {
      gl.style.left = m.x + 'px';
      gl.style.top = m.y + 'px';
    }
  }, { passive: true });

  function draw() {
    x.clearRect(0, 0, W, H);
    const col = getComputedStyle(document.documentElement).getPropertyValue('--ac').trim();
    x.fillStyle = col;
    for (const p of pts) {
      const dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy), R = 150;
      if (d < R && d > 0) {
        const f = (R - d) / R * 26;
        p.x += (dx / d * f) * .15;
        p.y += (dy / d * f) * .15;
      }
      p.x += (p.ox - p.x) * .08;
      p.y += (p.oy - p.y) * .08;
      const s = d < R ? 2.6 : 1.2;
      x.globalAlpha = d < R ? .9 : .28;
      x.beginPath();
      x.arc(p.x, p.y, s, 0, 6.283);
      x.fill();
    }
    x.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  reduce ? (() => {
    x.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ac').trim();
    x.globalAlpha = .25;
    pts.forEach(p => x.fillRect(p.x, p.y, 2, 2));
  })() : draw();
}

/* recommendations */
const av = f => f.startsWith('assets/') ? f : `assets/img/${f}`;
const R = [
  { t: "He is a very good at what he does. Enjoyed working with you.", n: "Chandraveer Singh Rathore", r: "Technical Lead | Helping Businesses Build, Modernise & Scale Drupal and Custom Web Platforms | Drupal 10/11 • PHP • Symfony • APIs • Next.js", a: av('chandraveer.jpg') },
  { t: "I have worked with Anoop this past fall putting together a website. Anoop was professional, a great communicator, timely, helpful and has built a wonderful website for me. Anoop is easy to work with and I highly recommend him. I have another website I have to redo soon and will use Anoop again without question.", n: "Tom Fierst", r: "President at Thomas Fierst Ins Agency", a: av('tom.jpg') },
  { t: "Anoop has been our lifeline for the redesign of website in Drupal 8 for a large national nonprofit. He has been particularly attentive to detail and has provided clean, mobile-responsive, beautiful results for our team. We are very happy with the themeing work he has completed for us and look forward to engaging with him for additional website work in the future.", n: "Monica F.", r: "🌿 Accessibility-focused enterprise-level technical project manager and Certified ScrumMaster®", a: av('monica.jpg') },
  { t: "Anoop has worked on my Drupal website for more than a year and has done an outstanding job improving its appearance. He is immediately responsive to my requests and finishes each task quickly.", n: "Barry Koren, AIA, PhD", r: "Founder at TimeExchanges", a: av('barry.jpg') },
  { t: "Anoop is very proficient and skilled web designer with very good knowledge of html and css.He is master in creating websites responsive.He is specialist in drupal theming.", n: "Deepesh Arora", r: "Drupal Consultant | PHP | Laravel | NEXT JS | TypeScript", a: av('dipesh.jpg') },
  { t: "Anoop is a sincere web designer knows the issues and designing very well. He knows what he is going to do and what will be its impact. As well as he worked according to the standards to maintain the quality.", n: "Shubham Agrawal", r: "Technical Project Manager @ Xceedance | Technology Management, People Management", a: av('shubham.jpg') },
  { t: "Anoop having deep knowledge of web designing and solve all the designing related points patiently by following proper drupal standard.", n: "Bhuvaneshwar Sharma", r: "Sr. Software Engineer | Developing with Drupal, AngularJS", a: av('bhuv.jpg') },
  { t: "Anoop have deep knowledge in css and very energetic person. He takes every challenge and complete them by his superb and very effective design. He is mastered in Drupal design, css, and responsive css. It is a great experience with working with anoop.", n: "Shubham Agrawal", r: "Technical Project Manager @ Xceedance | Technology Management, People Management", a: av('shubham.jpg') }
];

(function () {
  const tr = $('#tr');
  if (!tr || !R.length) return;
  tr.innerHTML = R.map((r, i) => `<div class="tc rv" style="--d:${(i % 3) * .1}s"><div class="trate">★★★★★</div><p>${r.t}</p><div class="who"><img class="t-avatar" src="${r.a}" alt="${r.n}" width="50" height="50" loading="lazy"><div class="who-meta"><b>${r.n}</b><span>${r.r}</span></div></div></div>`).join('');
  $$('#tr .rv').forEach(e => io.observe(e));
})();

/* navigation links */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const h = a.getAttribute('href');
    if (!h || h === '#') return;
    if (h === '#me' || location.hash === '#me') return;

    const t = $(h);
    if (t) {
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth' });
      history.pushState(null, null, h);
    }
  });
});

/* full story content */
const HD = (t, h) => `<h2 class='rv'><small>${t}</small>${h}</h2>`;
const pl = L => L.map((t, i) => `<span style='--i:${i}'>${t}</span>`).join('');
const E = [
  ['NextOpcode Consulting LLP', 'Senior Software Engineer', 'Sep 2026 – Present', 'Serving as a Senior Software Engineer at NextOpcode Consulting LLP.'],
  ['Ekfrazo Technologies Private Limited', 'Senior Drupal Developer', 'Nov 2025 – Aug 2026 · 9 mos', 'Served as a Senior Drupal Developer at Ekfrazo Technologies.'],
  ['Valuebound · Bengaluru', 'Tech Lead (SDE-4)', 'Feb 2020 – Sep 2025 · 5 yrs 7 mos', 'Led front-end development and managed Drupal-based projects.'],
  ['Maan Softwares Inc. · Jaipur', 'Senior Front-end Developer', 'Oct 2016 – Jan 2020 · 3 yrs 4 mos', 'Senior Drupal front-end developer implementing modern front-end technologies and optimizing performance for Drupal applications.'],
  ['Dice Infocom · Jaipur', 'Web Designer', 'Jan 2013 – Sep 2016 · 3 yrs 9 mos', 'UI design, responsive web development and front-end enhancements.']
];
const ED = [
  ['Master of Computer Applications (MCA) · Computer Science', 'Jaipur National University', '2018 – 2019'],
  ['Bachelor of Computer Application (BCA) · Computer Science', 'Jaipur National University', '2013 – 2014'],
  ['Polytechnic (Engineering Diploma) · Computer Science', 'Board of Technical Education Rajasthan', '2009 – 2012']
];
const K = [
  ['Front-end & Theming', ['Custom Drupal theming', 'Twig engine', 'Theme migrations (D7→D9, D7→D10, D8→D10)', 'HTML5', 'CSS3', 'SCSS / SASS', 'LESS', 'Bootstrap (3, 4, 5)', 'Bootstrap Barrio', 'bootstrap_sass', 'Google MDL', 'Responsive design', 'Cross-browser']],
  ['CMS & Decoupled', ['Drupal 7, 8, 9, 10, 11', 'Decoupled Drupal', 'REST API & ReactJS', 'Progressive Web Apps (PWA)', 'FlexiStyle Maintainer', 'Drupal Security Advisory', 'WordPress', 'Project Browser']],
  ['Performance & SEO', ['Google PageSpeed Insights', 'Google Search Console', 'SEO & Metatags', 'Site performance', 'Lighthouse', 'GTmetrix', 'SEMrush', 'Structured data', 'Accessibility (WCAG)']],
  ['Cloud & Hosting', ['AWS (Cloud Economics, EC2, Scaling)', 'Acquia Site Factory', 'Acquia Cloud', 'Pantheon', 'Serverless hosting']],
  ['Preprocessors & Build', ['Gulp', 'Webpack', 'Sass compiler', 'Koala', 'Composer', 'NPM', 'Drush']],
  ['Local Dev & Git', ['DDEV', 'Docker', 'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Acquia Dev Desktop', 'XAMPP']],
  ['UI Design & Prototyping', ['Figma', 'Adobe XD', 'Photoshop', 'Photopea', 'Wireframing', 'Email templates (Mailchimp/Mandrill)', 'Animate on Scroll (AOS)']],
  ['Workflow & Collaboration', ['Jira', 'Basecamp', 'Notion', 'Slack', 'Zoom', 'Teams', 'Cursor / VS Code', 'Sublime Text']]
];
const PR = [
  ['The DropTimes', 'Anoop Singh Launches New Drupal Theme FlexiStyle Bootstrap', 'https://www.thedroptimes.com/40251/anoop-singh-launches-new-drupal-theme-flexistyle-bootstrap'],
  ['The DropTimes', 'FlexiStyle Bootstrap SCSS Theme Coming to Drupal.org', 'https://www.thedroptimes.com/42013/flexistyle-bootstrap-scss-theme-coming-drupalorg'],
  ['The DropTimes', 'FlexiStyle Digital Experience Theme for Drupal 10 and 11 Announced', 'https://www.thedroptimes.com/42871/flexistyle-digital-experience-theme-drupal-10-and-11-announced'],
  ['The DropTimes', 'Step-by-Step Guide to Publishing Themes and Modules on Drupal.org', 'https://www.thedroptimes.com/44779/step-step-guide-publishing-themes-and-modules-drupalorg'],
  ['Valuebound', 'Celebrating Anoop Singh’s Success Story: The ‘Magician’ of Drupal Development', 'https://www.valuebound.com/resources/blog/celebrating-anoop-singhs-success-story-magician-drupal'],
  ['The DropTimes', 'Contributor profile on The DropTimes', 'https://www.thedroptimes.com/people/40250/anoopsingh92']
];
const CE = [
  ['Introduction to Drupal 10', 'Forcontu · Credential ID: D10SBINIEN2163', 'Issued Feb 2025', ''],
  ['Introduction to Drupal 9', 'Forcontu · Credential ID: D9SBINIEN1611', 'Issued Jan 2023', ''],
  ['Responsive Web Design', 'freeCodeCamp', 'Issued Jun 2021', ''],
  ['Google Material Design Lite', 'Udemy', 'Issued Feb 2021', ''],
  ['CSS Essential Training', 'LinkedIn', 'Issued Nov 2020', ''],
  ['HTML Essential Training', 'LinkedIn', 'Issued Nov 2020', ''],
  ['AWS Cloud Economics', 'Amazon Web Services (AWS)', 'Issued Jun 2020', ''],
  ['Diploma in Web Design', 'Alison', 'Issued Jul 2019', ''],
  ['Complete Bootstrap 4 course', 'Udemy', 'Issued Mar 2019', '']
];
const LP = [
  ['woodyplants.kendallhunt.com', 'Decoupled · Drupal 11 + Next.js', 'Rebuilt as a decoupled educational platform: back end runs on Drupal 11 with Next.js front end.', 'https://woodyplants.kendallhunt.com/'],
  ['store.rclbenziger.com', 'Drupal 7 → 11 Migration', 'Catholic educational publisher store and curriculum portal migrated from Drupal 7 to modern Drupal 11.', 'https://store.rclbenziger.com/'],
  ['greatriverlearning.com', 'Drupal 7 → 11 Migration', 'Higher education publication platform migrated from legacy Drupal 7 to modern Drupal 11.', 'https://www.greatriverlearning.com/'],
  ['walji.kendallhunt.com', 'Drupal 7 → 11 Migration', 'Higher education courseware portal migrated from Drupal 7 to Drupal 11.', 'https://walji.kendallhunt.com/'],
  ['paradigmeducation.com', 'Drupal 7 → 11 Migration', 'Educational technology and courseware portal migrated from Drupal 7 to modern Drupal 11.', 'https://www.paradigmeducation.com/'],
  ['Dr. Reddy’s Betapharm', 'Enterprise Acquia Theming', 'Enterprise pharmaceutical portal deployed on Acquia Site Factory with customized theming.', 'https://betapharm.test-drreddys.acsitefactory.com'],
  ['GRL Content (D7 to D10 Migration)', 'Drupal 10 Migration', 'Migrated custom Drupal theme from D7 to D10. Custom Twigs and Bootstrap components.', 'https://www.grlcontent.com'],
  ['Valuebound Corporate & PWA', 'Decoupled PWA', 'Corporate platform with Decoupled Drupal, REST API with ReactJS, and Progressive Web App.', 'https://valuebound.com']
];

const meBody = $('#me-body');
if (meBody) {
  meBody.innerHTML = [
    `<div class='sec'>${HD('01 / open source', 'Giving back to Drupal.')}<div class='stats rv'><div class='stat'><b data-n='5' data-p='+'>0</b><span>custom Drupal themes built</span></div><div class='stat'><b data-n='7' data-p='+'>0</b><span>projects maintained</span></div><div class='stat'><b data-n='125' data-p='+'>0</b><span>credits on issues</span></div><div class='stat'><b>SA</b><span>opted in to security advisory coverage</span></div></div><div class='box rv' style='margin:20px 0'><div class='pills'>${pl(['Patches', 'Modules', 'Themes', 'Issue queues', 'Documentation'])}</div></div><a class='btn p' href='https://www.drupal.org/u/anoopsingh92' target='_blank' rel='noopener'>Drupal.org profile ↗</a></div>`,
    `<div class='sec'>${HD('02 / experience', 'Where I’ve worked.')}<div class='tl'>${E.map(e => `<div class='it rv'><h3>${e[1]}</h3><div class='d'>${e[0]} · ${e[2]}</div><p>${e[3]}</p></div>`).join('')}</div></div>`,
    `<div class='sec'>${HD('04 / education', 'Where I learned.')}<div class='ed'>${ED.map(e => `<div class='box rv'><h3>${e[0]}</h3><p style='margin:0 0 10px;color:var(--mut)'>${e[1]}</p><span>${e[2]}</span></div>`).join('')}</div></div>`,
    `<div class='sec'>${HD('05 / technical skills', 'Everything in the toolbox.')}<div class='sk'>${K.map((k, i) => `<div class='box rv' style='--d:${(i % 3) * .1}s'><h3>${k[0]}</h3><div class='pills'>${pl(k[1])}</div></div>`).join('')}</div></div>`,
    LP.length ? `<div class='sec'>${HD('06 / my projects', 'My Projects.')}<div class='pr'>${LP.map(l => `<${l[3] ? "a href='" + l[3] + "' target='_blank' rel='noopener'" : 'div'} class='box rv'><small>${l[1]}</small><h3>${l[0]}</h3><p style='margin:8px 0 0;color:var(--mut);font-size:.92rem'>${l[2]}</p></${l[3] ? 'a' : 'div'}>`).join('')}</div></div>` : '',
    `<div class='sec'>${HD('07 / in the press', 'Featured &amp; mentioned.')}<div class='pr'>${PR.map(p => `<a class='box rv' href='${p[2]}' target='_blank' rel='noopener'><small>${p[0]} ↗</small><h3>${p[1]}</h3></a>`).join('')}</div></div>`,
    CE.length ? `<div class='sec'>${HD('08 / licenses &amp; certifications', 'Always learning.')}<div class='ed'>${CE.map(c => `<${c[3] ? "a href='" + c[3] + "' target='_blank' rel='noopener'" : 'div'} class='box rv'><h3>${c[0]}</h3><p style='margin:0 0 10px;color:var(--mut)'>${c[1]}</p><span>${c[2]}</span></${c[3] ? 'a' : 'div'}>`).join('')}</div></div>` : ''
  ].filter(Boolean).join('');
  $$('#me-body .rv').forEach(e => io.observe(e));
}

/* route handler */
function route() {
  const m = location.hash === '#me';
  document.body.classList.toggle('pg-me', m);
  const meEl = $('#me');
  if (meEl) meEl.hidden = !m;

  if (m) {
    window.scrollTo({ top: 0, behavior: 'auto' });
  } else if (location.hash.length > 1) {
    let t = null;
    try { t = $(location.hash); } catch (e) { }
    if (t) {
      setTimeout(() => {
        t.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
window.addEventListener('hashchange', route);
route();

/* footer clock + back to top */
const clockEl = $('#clock');
const ck = () => {
  if (clockEl) clockEl.textContent = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
};
ck();
setInterval(ck, 30000);

const upBtn = $('#up');
if (upBtn) {
  upBtn.onclick = () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}

/* copy email */
const copyBtn = $('#copy');
if (copyBtn) {
  copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText('k.anoopsingh92@gmail.com');
      copyBtn.textContent = 'Copied ✓';
    } catch (e) {
      location.href = 'mailto:k.anoopsingh92@gmail.com';
    }
    setTimeout(() => copyBtn.textContent = 'Copy email', 1800);
  };
}

/* footer watermark spotlight */
const fw = $('.fwm');
const footer = $('footer');
if (fw && footer) {
  footer.addEventListener('pointermove', e => {
    const r = fw.getBoundingClientRect();
    fw.style.setProperty('--fx', (e.clientX - r.left) + 'px');
    fw.style.setProperty('--fy', (e.clientY - r.top) + 'px');
  });
}

window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
  const ring = $('#ring');
  if (ring) ring.style.strokeDashoffset = 125.7 * (1 - p);
  if (upBtn) upBtn.classList.toggle('show', h.scrollTop > 600);
}, { passive: true });