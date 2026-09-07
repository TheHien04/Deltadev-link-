# Security Policy

Supported versions: 3.x.

## Reporting

Do not open a public GitHub issue for exploitable defects.

Email `thesundaybite@gmail.com` with:

- type of issue
- steps to reproduce
- impact
- a suggested fix if you have one

Expect an initial reply within 48 hours.

## What this repository actually provides

| Control | Reality |
| --- | --- |
| Host headers (`netlify.toml`, `vercel.json`) | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP |
| Meta CSP on `index.html` / `admin.html` | Present; still allows `'unsafe-inline'` because of Tailwind Play CDN and inline scripts |
| Input checks | Client-side only (`validation.js`). There is no application server and therefore no SQL surface |
| Measurement | Consent Mode default denied; tags load only after opt-in and only with real IDs |
| CDN libraries | AOS, Swiper, GSAP, Chart.js are pinned with Subresource Integrity. Tailwind Play CDN cannot be SRI-hashed |
| Admin `/admin.html` | Client-side digest check and a 4-hour `sessionStorage` lock. Not an identity provider. Keep it off production or put it behind a real IdP |
| Demo storefront accounts | SHA-256 in `localStorage`. Not a password vault |

## Before a public deploy

- Rotate the admin digest in `src/js/utils/admin-auth.js`
- Leave analytics IDs empty until the privacy policy and consent UI are reviewed together
- Compile Tailwind, vendor remaining JS, and move CSP from `<meta>` to HTTP-only headers
- Do not commit live measurement IDs, payment secrets, or a production passphrase
