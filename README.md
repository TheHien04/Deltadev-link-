# DeltaDev Link

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-3.2.1-green.svg)](package.json)

Artisan sausage storefront for **DeltaDev Link** — a Cai Be, Tien Giang producer blending a family recipe with a modern bilingual website.

The site is a static, progressively enhanced storefront. Orders are completed on Zalo. There is no production payment gateway or server-side account database in this repository.

## Features

- Bilingual Vietnamese / English interface
- Product catalog, cart, wishlist, and comparison (client-side)
- Order form with Vietnamese phone validation and Zalo handoff
- PWA install prompt, offline caching, and cookie consent (GDPR Consent Mode v2)
- Accessible navigation, skip link, FAQ accordion, and reduced-motion support
- Demo admin dashboard behind a client-side lock screen

## Quick start

```bash
git clone https://github.com/TheHien04/Deltadev-link-.git
cd Deltadev-link-
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

```bash
npm test          # Node 20+ built-in test runner
```

## Configuration

Edit `src/js/config/app.config.js` before going live:

- Contact phone, email, Zalo number
- Product prices
- `seo.siteUrl` (currently `https://deltadevlink.com`)
- `analytics.*` IDs — leave empty until you have real Google / Meta IDs

Tracking scripts never load for placeholder IDs, and they stay off until the visitor accepts cookies.

## Architecture

```
index.html                 Storefront
admin.html                 Demo admin UI
src/js/config/             App + environment config
src/js/managers/           Feature controllers
src/js/utils/              Validation, logging, security helpers
src/css/                   Design tokens and components
public/                    PWA manifest, service worker, robots, sitemap
tests/                     Unit tests (node:test)
```

This is a CDN-assisted static site (Tailwind Play CDN, Alpine, AOS, GSAP, Swiper). For a high-traffic production deploy, compile Tailwind and vendor those libraries instead of loading them from a CDN.

## Admin demo

`admin.html` is a frontend prototype. Sign-in uses a hashed demo password (`DeltaDev-Admin-2026`) stored in the browser session. It is **not** production authentication. Do not expose it on a public domain without a real backend.

## Legal

- [Privacy Policy](privacy-policy.html)
- [Terms of Service](terms-of-service.html)
- [Security Policy](SECURITY.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT © DeltaDev Link
