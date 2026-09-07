# DeltaDev Link

A bilingual, progressively enhanced storefront for an artisan sausage producer in Cai Be, Tien Giang, Vietnam.

The application is a static front end. Product discovery, cart state, and account UI run in the browser. Order completion is handed off to Zalo. This repository does not include a payment processor, inventory service, or server-side identity provider.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-informational.svg)](package.json)
[![Version](https://img.shields.io/badge/version-3.2.1-lightgrey.svg)](package.json)

---

## 1. Abstract

DeltaDev Link is a client-side commerce surface designed for a small food producer whose sales channel is messaging rather than card-not-present checkout. The system therefore optimizes for (i) bilingual product communication, (ii) validated lead capture, and (iii) a privacy-preserving analytics default, rather than for PCI-DSS payment flows.

The storefront follows a modular ES-module architecture: a singleton application controller composes feature managers, a frozen configuration object, and a small set of pure utilities. Persistence is limited to `localStorage` / `sessionStorage`. Third-party tracking is inert until the visitor grants consent and until real measurement IDs are configured.

## 2. Scope and non-goals

| In scope | Out of scope |
| --- | --- |
| Marketing site, catalog, cart, wishlist, comparison | Authoritative order ledger |
| Vietnamese / English UI with `?lang=` persistence | Server-rendered i18n or hreflang microsites |
| Order form with VN mobile validation and Zalo handoff | Card payments, MoMo/VNPay capture, refunds |
| PWA install prompt and cache-first static assets | Push notifications, background sync in production |
| GDPR Consent Mode v2 (default denied) | A production CDP or tag-management program |
| Demo admin UI behind a client-side lock | RBAC, audit logs, or secrets management |

Treat `admin.html` as a prototype. Credentials are hashed in the browser and stored in `sessionStorage`. That is a demonstration of UX, not an authentication protocol.

## 3. System architecture

```
index.html                 document shell, landmarks, JSON-LD
admin.html                 prototype operations UI
src/js/main.js             boot; fail-closed error surface
src/js/app.js              composition root
src/js/config/             frozen app + environment config
src/js/state/AppState.js   observer-based in-memory state
src/js/managers/           UI feature controllers
src/js/features/           search, wishlist, comparison, reviews
src/js/services/           analytics loader, web-platform helpers
src/js/utils/              validation, hashing, logging, formatters
src/css/                   design tokens, reset, components
public/                    web app manifest, service worker, robots, sitemap
tests/                     Node.js test runner (no browser harness)
```

Control flow is unidirectional:

1. `main.js` waits for `DOMContentLoaded` and calls `App.init()`.
2. `App` instantiates managers, registers a service worker in non-development environments, and initializes analytics with a denied-by-default consent state.
3. Managers read `APP_CONFIG` and subscribe to `AppState`. They must not mutate config.
4. The order form validates input in `src/js/utils/validation.js`, copies a structured message to the clipboard, and opens Zalo.

Design constraints:

- **No bundler.** Modules load natively (`type="module"`). Node 20+ is required only for tests and lint.
- **CDN-assisted CSS/JS.** Tailwind Play CDN, Alpine.js, AOS, GSAP, and Swiper are loaded from public CDNs. This is acceptable for a low-traffic brochure site and incorrect for a high-QPS production deploy; compile and vendor those assets before scale.
- **Fail visible.** AOS attributes do not hide content before initialization (`html:not(.aos-enabled) [data-aos]`). Image load failures substitute SVG placeholders.

## 4. Domain logic

### 4.1 Telephone validation

Vietnamese mobile numbers are accepted in national (`0[35789]xxxxxxxx`) and E.164 (`+84[35789]xxxxxxxx`) form. Punctuation is stripped before the regular expression is applied. Landline prefixes such as `02` are rejected. The same helper is covered by `tests/utils.test.js`.

### 4.2 Search

Catalog search uses Levenshtein distance and a folded Vietnamese representation (NFD diacritic strip plus `đ → d`) so queries without tone marks still rank. Similarity is `(len(longer) - distance) / len(longer)`. This is a standard edit-distance approach; it is not a substitute for a full-text index if the catalog grows beyond a few dozen SKUs.

### 4.3 Privacy and measurement

Google Consent Mode v2 is initialized with `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization` set to `denied`. `src/js/services/Analytics.js` injects Google Analytics, Tag Manager, or Meta Pixel if and only if:

1. `localStorage.cookieConsent === 'all'`, and
2. the configured ID is not empty and not a documented placeholder (`G-XXXX`, `GTM-XXXX`, `YOUR_*`).

Placeholder IDs are never requested. This avoids leaking page views to dummy endpoints and keeps the default lawful under GDPR-style consent.

### 4.4 Progressive Web App

`public/service-worker.js` precaches core routes individually (`cache.add` per URL, not `cache.addAll`) so a single missing asset cannot abort installation. HTML uses network-first with a cache fallback; other same-origin GETs use cache-first. Service worker registration is disabled on localhost.

### 4.5 Accessibility

The document exposes a skip link, `lang` updates on locale change, FAQ buttons with `aria-expanded` / `aria-controls`, cookie UI as a `role="dialog"`, and `prefers-reduced-motion` on animations. Landmark order is `banner` (nav) → `main` (including FAQ) → `contentinfo` (footer). These choices align with WCAG 2.2 AA intent; they are not a certified audit.

## 5. Reproduction

Requires Python 3 (static file server) and Node.js 20+ (tests).

```bash
git clone https://github.com/TheHien04/Deltadev-link-.git
cd Deltadev-link-
python3 -m http.server 8000
```

Open `http://localhost:8000`. Locale can be forced with `?lang=vi` or `?lang=en`.

```bash
node --test tests/*.test.js
```

The test suite covers telephone and email validation, password policy, Levenshtein similarity, Vietnamese folding, VND formatting, HTML escaping, and placeholder-ID detection. It does not replace browser verification of layout or consent.

## 6. Configuration

All deploy-time values live in `src/js/config/app.config.js` (frozen at import). Environment detection lives in `src/js/config/env.config.js`.

| Field | Purpose |
| --- | --- |
| `contact.phone`, `contact.zaloNumber`, `contact.email` | Storefront and Zalo handoff |
| `products.*.price` | Catalog pricing in VND |
| `seo.siteUrl` | Canonical origin used in `robots.txt`, sitemap, and Open Graph |
| `analytics.*` | Measurement IDs; leave empty until issued |
| `vouchers` | Client-side promo codes (not a source of truth) |

Before a public deploy, replace `seo.siteUrl` if the production origin is not `https://deltadevlink.com`, and do not commit real analytics IDs until consent UI has been reviewed against the published privacy policy.

## 7. Threat model (honest)

| Asset | Control | Residual risk |
| --- | --- | --- |
| Order PII typed in the form | Client validation; message copied locally then sent via Zalo | Zalo is the actual processor; this repo does not encrypt that channel |
| Demo user passwords | SHA-256 at rest in `localStorage` | Client-side hashing is reversible in the attacker’s browser; do not reuse real passwords |
| Admin prototype | Session lock + hashed demo secret | Trivial to bypass; keep `/admin.html` off production or behind a real IdP |
| XSS from error text | `escapeHtml` on the boot failure banner | Inline scripts remain because of the Tailwind CDN; CSP still allows `'unsafe-inline'` |
| Supply chain | HTTPS CDNs | No Subresource Integrity hashes; pin and vendor libraries for production |

Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md). Do not file public issues for exploitable defects.

## 8. Deployment notes

The tree is static. Any origin that serves the repository root is sufficient (Netlify, Vercel, GitHub Pages, or a generic object store).

- `robots.txt` and `sitemap.xml` are duplicated at the site root because crawlers request `/robots.txt`, not `/public/robots.txt`.
- `netlify.toml` and `vercel.json` set `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`. Python’s `http.server` does not apply those headers and does not map unknown paths to `404.html`.
- `404.html` is for hosts that rewrite missing routes.

Recommended production hardening, in order: compile Tailwind, vendor JS, add SRI, move CSP from `<meta>` to HTTP headers, and replace the admin lock with a backend.

## 9. Standards referenced

| Standard | How it is applied here |
| --- | --- |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Semantic landmarks, skip link, accordion ARIA, reduced motion |
| [GDPR / Consent Mode v2](https://developers.google.com/tag-platform/security/guides/consent) | Default denied; scripts gated on consent and real IDs |
| [W3C Web App Manifest](https://www.w3.org/TR/appmanifest/) | `public/manifest.json`, SVG icons, shortcuts |
| [Service Worker](https://www.w3.org/TR/service-workers/) | Precache + runtime cache with per-URL install resilience |
| [schema.org FoodEstablishment](https://schema.org/FoodEstablishment) | JSON-LD on the homepage |
| [Open Graph protocol](https://ogp.me/) | `og:*` / Twitter Card tags |
| ISO 639-1 + BCP 47 | `en` / `vi` via `document.documentElement.lang` and `hreflang` |

## 10. Repository conventions

- JavaScript is ES2022 modules with JSDoc on public functions.
- Formatting: Prettier (`.prettierrc.json`). Lint: ESLint 8 (`.eslintrc.json`).
- Editor: 2-space indent, LF, UTF-8 (`.editorconfig`).
- Contribution process: [CONTRIBUTING.md](CONTRIBUTING.md).

## 11. Legal

- [Privacy policy](privacy-policy.html)
- [Terms of service](terms-of-service.html)
- [Security policy](SECURITY.md)
- License: MIT. Copyright (c) 2026 DeltaDev Link / TheHien04. See [LICENSE](LICENSE).
