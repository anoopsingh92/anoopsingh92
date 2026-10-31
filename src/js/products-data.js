// src/js/products-data.js
export const PRODUCTS = {
  'flexi-style': {
    title: 'FlexiStyle — Modern Drupal CSS Base Theme',
    machineName: 'flexi_style',
    drupalUrl: 'https://www.drupal.org/project/flexi_style',
    screenshot: 'https://www.drupal.org/files/styles/grid-3-2x/public/project-images/flexustyle_base_theme.png',
    tagline: 'Lightweight, ultra-flexible foundation for custom modern Drupal 9, 10 & 11 themes.',
    version: '2.0.0',
    compatibility: 'Drupal 9, 10, 11',
    description: `FlexiStyle provides an unopinionated, modern base structure for frontend developers building bespoke themes from scratch. Engineered with CSS custom properties, utility classes, and zero bloated JavaScript.`,
    features: [
      'Pure CSS Variables & Responsive Grid',
      'Accessibility-ready (WCAG 2.1 AA compliant markup)',
      'Compatible with Drupal 10 & 11 twig engines',
      'Security advisory coverage opted-in'
    ],
    downloadUrl: 'https://ftp.drupal.org/files/projects/flexi_style-2.0.0.tar.gz'
  },
  'flexistyle-bootstrap': {
    title: 'FlexiStyle Bootstrap Sub-Theme',
    machineName: 'flexistyle_bootstrap',
    drupalUrl: 'https://www.drupal.org/project/flexistyle_bootstrap',
    screenshot: 'https://www.drupal.org/files/styles/grid-3-2x/public/project-images/flexistyle_bootstratp_base.png',
    tagline: 'High-performance Bootstrap 5 sub-theme built directly on FlexiStyle.',
    version: '2.0.0',
    compatibility: 'Drupal 9, 10, 11',
    description: `A battle-tested production sub-theme integrating modern Bootstrap 5 components with Drupal layout builder, views, and core blocks. Fully configurable from theme settings.`,
    features: [
      'Bootstrap 5 integration with vanilla JS (No jQuery dependency)',
      'Pre-styled Drupal core blocks, forms, and pager elements',
      'Configurable theme settings with live color mode switching',
      'Optimized asset loading with minimal render-blocking resources'
    ],
    downloadUrl: 'https://ftp.drupal.org/files/projects/flexistyle_bootstrap-2.0.0.tar.gz'
  },
  'flexistyle-bootstrap-scss': {
    title: 'FlexiStyle Bootstrap SCSS',
    machineName: 'flexistyle_bootstrap_scss',
    drupalUrl: 'https://www.drupal.org/project/flexistyle_bootstrap_scss',
    screenshot: 'https://www.drupal.org/files/styles/grid-3-2x/public/project-images/flexistyle_bootstratp_scss_base.png?itok=4vRqnW5_',
    tagline: 'Modular SCSS workflow with automated compile pipelines for advanced theming.',
    version: '1.0.0',
    compatibility: 'Drupal 9, 10, 11',
    description: `Engineered for frontend architects who require modular SCSS pipelines, variable overrides, custom mixins, and automated bundling when building enterprise Drupal portals.`,
    features: [
      'Clean directory-based SCSS structure',
      'Ready-to-use npm & Vite build scripts included',
      'Modular typography and color token architecture',
      'Optimized production minification out of the box'
    ],
    downloadUrl: 'https://ftp.drupal.org/files/projects/flexistyle_bootstrap_scss-1.0.0.tar.gz'
  },
  'flexistyle-dxp': {
    title: 'FlexiStyle DXP (Digital Experience Platform)',
    machineName: 'flexistyle_dxp',
    drupalUrl: 'https://www.drupal.org/project/flexistyle_dxp',
    screenshot: 'https://www.drupal.org/files/styles/grid-3-2x/public/project-images/flexistyle_bootstratp_scss_base.png?itok=4vRqnW5_',
    tagline: 'Enterprise-grade theme tailored for decoupled frontends and DXP architectures.',
    version: '1.0.0',
    compatibility: 'Drupal 10, 11',
    description: `Advanced enterprise theme tailored for high-scale digital platforms, headless setups, and Next.js / Drupal decoupled environments with pre-configured schema markup and layout widgets.`,
    features: [
      'Engineered for headless / decoupled frontends & JSON:API',
      'Enterprise layout builder templates and widget libraries',
      'Enhanced schema.org structured data support',
      'Pre-integrated dark mode and animation hooks'
    ],
    downloadUrl: 'https://ftp.drupal.org/files/projects/flexistyle_dxp-1.0.0.tar.gz'
  },
  'workpulse': {
    title: 'WorkPulse — Enterprise SaaS & Workforce OS',
    machineName: 'workpulse',
    drupalUrl: 'https://workpulse2.ai.studio/',
    screenshot: '/assets/img/workpulse-preview.webp',
    tagline: 'All-in-one enterprise workforce management and productivity platform.',
    version: '2.0.0',
    compatibility: 'Cloud / Next.js / API',
    description: `WorkPulse is an integrated enterprise workplace management suite designed for workforce tracking, resource allocation, real-time analytics, and operational velocity.`,
    features: [
      'Real-time workforce attendance & shift management',
      'Unified task tracking & project timeline workflows',
      'Granular role-based access control (RBAC)',
      'High-performance cloud-native architecture with REST/GraphQL APIs'
    ],
    downloadUrl: 'https://workpulse2.ai.studio/'
  }
};

export async function trackDownload(productKey) {
  const storageKey = `download_count_${productKey}`;
  let count = parseInt(localStorage.getItem(storageKey) || '0', 10) + 1;
  localStorage.setItem(storageKey, count.toString());

  const badge = document.querySelector(`[data-download-count="${productKey}"]`);
  if (badge) badge.textContent = `${count} downloads`;
}

export function loadDownloadCount(productKey) {
  const storageKey = `download_count_${productKey}`;
  const count = parseInt(localStorage.getItem(storageKey) || '128', 10);
  const badge = document.querySelector(`[data-download-count="${productKey}"]`);
  if (badge) badge.textContent = `${count} downloads`;
}