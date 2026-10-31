# Architecture & Technical Design Specification
**Project:** Portfolio & Career Showcase (`anoopsingh92.github.io/ask/`)  
**Engineer:** Anoop Singh — Senior Software Engineer  
**Core Stack:** Vanilla ESNext, Modern CSS3, Vite 8, GSAP, Lenis, GitHub Pages  
**Document Version:** 1.0.0  

---

## 1. System Overview & Vision

The objective of this architecture is to deliver a zero-dependency runtime portfolio that balances high visual fidelity with optimal performance. The architecture migrates away from unbundled legacy static scripts to an automated **Static Multi-Page Application (MPA)** compiled via **Vite**.

### Core Tenets
1. **Zero Client-Side Layout Thrashing (FOUC Elimination):** Instant styled paint with zero-DOM flash on hard refresh.
2. **Deterministic Bundle Delivery:** Singular, tree-shaken, and minified production bundles (`bundle.min.css` and `bundle.min.js`).
3. **Clean-Path Directory Routing:** Complete removal of `.html` extensions across local preview and production deployments (`/about/` instead of `/about.html`).
4. **Environment-Agnostic Portability:** Dynamic resolution of base paths allowing immediate transition between subdirectory deployment (`/ask/`) and apex/root domain hosting.

---

## 2. Architecture & Deployment Topology

```
                       ┌─────────────────────────┐
                       │   Local / Remote Git    │
                       │   (Source Code / src/)  │
                       └────────────┬────────────┘
                                    │
                            git push to main
                                    ▼
                       ┌─────────────────────────┐
                       │      GitHub Actions     │
                       │    (.github/workflows)  │
                       └────────────┬────────────┘
                                    │
                     Vite Build Engine (Rolldown)
                     ├── vite-plugin-html-inject
                     ├── PostCSS & CSS Aggregation
                     └── Public Assets Pass-through
                                    ▼
                       ┌─────────────────────────┐
                       │   Static Output (/dist) │
                       │ ├── index.html          │
                       │ ├── about/index.html    │
                       │ ├── 404.html            │
                       │ ├── assets/             │
                       │ └── static manifests    │
                       └────────────┬────────────┘
                                    │
                               Deploy to
                                    ▼
        ┌─────────────────────────────────────────────────────────┐
        │                 GitHub Pages Static CDN                 │
        │             anoopsingh92.github.io/ask/                 │
        └───────────────────────────┬─────────────────────────────┘
                                    │ HTTP/2 Cache-Control
                                    ▼
        ┌─────────────────────────────────────────────────────────┐
        │                     Client Browser                      │
        │                                                         │
        │  ┌────────────────────┐      ┌───────────────────────┐  │
        │  │   Service Worker   │      │    Lenis Smooth       │  │
        │  │  (Offline Cache)   │      │       Scroller        │  │
        │  └─────────┬──────────┘      └──────────┬────────────┘  │
        │            │                            │               │
        │            ▼                            ▼               │
        │  ┌────────────────────┐      ┌───────────────────────┐  │
        │  │ DOM & Critical CSS │      │  GSAP ScrollTrigger & │  │
        │  │      Painting      │      │    Canvas Particles   │  │
        │  └────────────────────┘      └───────────────────────┘  │
        └─────────────────────────────────────────────────────────┘
```

---

## 3. Structural Design Patterns

### 3.1 Compile-Time HTML Component Injection Pattern
Instead of bringing in bloated client-side templating libraries or runtime JSX interpreters, the system leverages `vite-plugin-html-inject`.

* **Partials Separation:** Navigation (`src/partials/header.html`) and footer elements (`src/partials/footer.html`) are isolated into reusable source fragments.
* **Build-Time Composition:** During the Vite build phase, these partials are inlined directly into `index.html`, `about/index.html`, and `404.html`.
* **Zero Overhead:** The browser receives pre-stitched, semantic HTML with zero JavaScript parsing required for initial DOM construction.

### 3.2 Subdirectory Native Directory Routing Pattern
To enforce search engine optimization (SEO) standards and user-friendly URLs without requiring an active server rewriting engine (such as Nginx or Apache):

* Pages are organized structurally into physical folder hierarchies (`about/index.html`).
* GitHub Pages' internal routing table maps requests targeting `/ask/about/` directly to `dist/about/index.html`.
* Anchors within pages dynamically adjust relative references depending on directory depth, preventing broken cross-page jumps.

### 3.3 Dynamic Base URL Normalization Pattern
To prevent vendor lock-in to the `/ask/` subdirectory:
* `vite.config.js` extracts `process.env.BASE_PATH` dynamically.
* Runtime JavaScript uses browser URL resolution (`new URL(target, window.location.href)`) combined with `import.meta.env.BASE_URL` to evaluate root and anchor targets dynamically.

---

## 4. Client Runtime Software Design Patterns

### 4.1 Encapsulated Module / Controller Pattern
Client execution is divided into distinct functional singletons within `src/js/main.js`:

1. **Theme Manager:** Manages light/dark mode switches, syncs with `localStorage`, and handles OS-level `prefers-color-scheme` media queries.
2. **Canvas Particle System:** Manages a high-DPI HTML5 2D canvas that calculates cursor proximity vectors and renders animated nodes with linear interpolation.
3. **Scroll Coordinator:** Unifies page-level virtual scrolling (Lenis) with frame-by-frame animation triggers (GSAP ScrollTrigger).

### 4.2 Observer & Safe-Selector ScrollSpy Pattern
The active navigation state reflects current viewport coordinates through an optimized passive scroll listener:

```
[Window Scroll Event] ──► Extract Current Path
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
       Path is '/about/'              Path is Homepage ('/')
               │                               │
    Set 'Full Story' Active          Extract Nav Anchor Hashes
                                               │
                                     Sanitize & Guard Hash
                                     (Strip invalid URLs)
                                               │
                                     Calculate Viewport Box
                                     (Element in 45% range?)
                                               │
                                     Toggle '.on' Class
```

* **Guard Clause:** Prevents `querySelector` execution on non-selector strings (such as `/about/` or absolute URLs), eliminating DOM exceptions in client logs.

### 4.3 Frame-Lock Render Loop Pattern
To eliminate micro-stutters and screen tearing between Lenis smooth scrolling and GSAP animations:

```javascript
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
```

* Lenis delegates its frame calculation directly to GSAP's global ticker.
* Scroll offsets and transformation matrices are evaluated in the same frame step, preventing desynchronized scroll positions.

### 4.4 Resilient Offline-First Service Worker Pattern
The Service Worker (`sw.js`) employs a **Cache-First with Network Fallback** pattern for immutable versioned assets:
* Pre-caches core application bundles (`bundle.min.css`, `bundle.min.js`), layout templates, and core branding icons on the `install` event.
* Automatically prunes stale caches during the `activate` lifecycle phase.
* Intercepts `navigate` requests to provide offline fallback capability.

---

## 5. File System & Module Layout

```text
anoopsingh92/
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD deployment pipeline to GitHub Pages
├── public/                       # Raw assets copied directly to dist/
│   ├── assets/
│   │   ├── img/                  # High-density graphics, avatars, screenshots
│   │   └── Anoop-Singh-Resume.pdf# Downloadable resume asset
│   ├── _redirects                # Redirect rules for edge hosts (Netlify/Cloudflare)
│   ├── favicon.ico               # Root browser favicon
│   ├── llms.txt                  # LLM and AI agent discovery metadata
│   ├── manifest.json             # PWA web application manifest
│   ├── robots.txt                # Search engine crawler policies
│   ├── sitemap.xml               # Canonical XML sitemap index
│   └── sw.js                     # Progressive Web App service worker
├── src/                          # Application source code
│   ├── css/
│   │   └── style.css             # Main stylesheet (Design tokens, layout, themes)
│   ├── js/
│   │   └── main.js               # Core logic, Canvas, Lenis, and GSAP controller
│   ├── partials/
│   │   ├── footer.html           # Reusable site footer partial
│   │   └── header.html           # Reusable site header and navigation partial
│   └── main.js                   # Master Vite build entry module
├── about/
│   └── index.html                # Dedicated Full Story view (/about/)
├── 404.html                      # Error fallback view
├── index.html                    # Homepage view
├── vite.config.js                # Vite compiler build configuration
├── package.json                  # NPM manifest and project dependencies
├── LICENSE                       # MIT License declaration
└── README.md                     # Repository documentation & onboarding guide
```

---

## 6. Build Lifecycle & Optimization Matrix

| Step | Tool / Processor | Purpose |
|---|---|---|
| **Entry Resolution** | Vite Multi-Page Engine | Discovers `index.html`, `about/index.html`, and `404.html` as explicit entry modules. |
| **Component Injection** | `vite-plugin-html-inject` | Inlines `header.html` and `footer.html` into each page before transformation. |
| **Bundle Consolidation** | Rolldown / Rollup | Aggregates and minifies source assets into singular entry files: `bundle.min.js` and `bundle.min.css`. |
| **Directory Flattening** | Vite Asset Pipeline | Rewrites asset references and moves `public/` files directly to `dist/`. |
| **Dev Routing Middleware** | Custom Vite Plugin | Rewires 404 error routing during local development to match production server behavior. |

---

## 7. Performance & Quality Benchmarks

* **Zero FOUC:** The preloader blocks visual rendering until stylesheets are parsed, fading into view without layout shift.
* **Target Load Time:** < 500ms on broadband connections; < 1.5s on simulated 4G mobile devices.
* **Lighthouse Targets:**
  * Performance: 95+
  * Accessibility (WCAG 2.1 AA): 100
  * Best Practices: 100
  * SEO: 100