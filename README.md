# Aayush Adhikari — Personal Portfolio

Production-ready portfolio for Aayush Adhikari — Founder & Director of Four G. Engineering
Solution Pvt. Ltd. and founder of DORDI 346°. Zero frameworks: static HTML + one shared
stylesheet + one small deferred script + a single Vercel serverless function for the
contact form.

## Structure

```
aayush-portfolio/
├── index.html              # Home: hero, about, ventures, capabilities, contact
├── privacy-policy.html     # /privacy-policy (served clean via vercel.json cleanUrls)
├── terms.html              # /terms
├── 404.html                # Custom branded 404 (auto-served by Vercel)
├── api/
│   └── contact.js          # POST /api/contact — validation, honeypot, timing check,
│                           #   rate limiting, Turnstile hook, Resend email delivery
├── assets/
│   ├── css/style.css       # Single ~11KB stylesheet (mobile-first, WCAG-audited palette)
│   └── js/main.js          # Cookie consent + consent-gated Plausible, mobile nav,
│                           #   real-time form validation with ARIA errors
├── favicon.ico             # 32×32
├── favicon.svg             # Scalable brand mark
├── apple-touch-icon.png    # 180×180
├── icon-192.png            # PWA icons referenced by the manifest
├── icon-512.png
├── site.webmanifest
├── og-image.png            # 1200×630 social preview card
├── robots.txt
├── sitemap.xml
├── vercel.json             # Security headers (HSTS, nosniff, DENY), cleanUrls, caching
├── .env.example            # All server-side secrets (values go in Vercel dashboard)
└── README.md
```

## Local testing

```bash
npx vercel dev        # serves the site + the /api/contact function
```

Static pages open directly in a browser too (the form endpoint needs Vercel dev).

## Deployment checklist — plug these in before going live

### 1. Environment variables (Vercel → Settings → Environment Variables)
| Variable | Value |
|---|---|
| `RESEND_API_KEY` | API key from https://resend.com/api-keys |
| `CONTACT_TO_EMAIL` | e.g. `hello@aayushadhikari.com.np` |
| `MAIL_FROM` | `Portfolio Contact <no-reply@aayushadhikari.com.np>` |
| `TURNSTILE_SECRET_KEY` | *(optional)* Turnstile secret for extra bot protection |
| `SITE_URL` | `https://aayushadhikari.com.np` |

### 2. Domain & DNS
1. Buy the domain and add it in Vercel → Project → Domains.
2. At the registrar, point DNS to Vercel:
   - Apex: `A` record → `76.76.21.21`
   - `www`: `CNAME` → `cname.vercel-dns.com`
3. HTTPS certificates are issued automatically; `vercel.json` already enforces HSTS
   and Vercel forces HTTP→HTTPS on every route.

### 3. Email deliverability (Resend)
- Verify the sending domain at https://resend.com/domains (add the DKIM/SPF records
  Resend shows you to DNS).

### 4. Analytics
- In `assets/js/main.js`, set `ANALYTICS_DOMAIN` (line 8) to the live domain.
- Add the site at https://plausible.io (or swap the script URL for a self-hosted
  Plausible instance — it only loads after the visitor clicks **Accept**).

### 5. Content to personalize before launch
- Social profile URLs in `index.html` (LinkedIn / GitHub / X links are placeholders
  pointing at the assumed handles `aayush-adhikari`, `aayushadhikari`, `aayush_adhikari`).
- If the production domain differs from `aayushadhikari.com.np`, update it in: every
  `<link rel="canonical">`, all `og:url` / `og:image` / `twitter:image` tags,
  `sitemap.xml`, `robots.txt`, `.env.example`, and `ANALYTICS_DOMAIN` in `main.js`.

### 6. Optional: Cloudflare Turnstile
- Create a widget at https://dash.cloudflare.com → Turnstile.
- Server side: set `TURNSTILE_SECRET_KEY` (already wired in `api/contact.js`).
- Client side: embed the Turnstile widget inside `#contact-form` with a hidden input
  named `cfTurnstileResponse`; the server verifies it automatically when the env var
  is set.

## What's already handled (launch checklist mapping)

1. ✅ Privacy Policy at `/privacy-policy`, linked in footer
2. ✅ Terms at `/terms`, linked in footer
3. ✅ Zero client-side secrets (all keys are server env vars, `.env.example` included)
4. ✅ HTTPS: HSTS preload header + Vercel automatic HTTP→HTTPS redirects
5. ✅ GDPR cookie banner (Accept/Decline → `localStorage`)
6. ✅ Unique `<title>` + meta description per route
7. ✅ Open Graph + Twitter Card tags → `/og-image.png` (1200×630)
8. ✅ Favicon suite: `.ico`, SVG, `apple-touch-icon.png`, `site.webmanifest`
9. ✅ `sitemap.xml` + `robots.txt` referencing all indexable routes
10. ✅ Image alt audit: zero raster `<img>` tags on pages — all visuals are decorative
    inline SVG/CSS with `aria-hidden`; the OG image carries a descriptive `og:image:alt`
11. ✅ Performance: explicit dimensions/aspect ratios, no layout shift, lazy styles,
    no web fonts, one cached CSS + one deferred JS file
12. ✅ Speed: no frameworks, no render-blocking third parties, system font stack
13. ✅ WCAG AA/AAA-contrast palette (documented ratios in `style.css`)
14. ✅ Mobile-first, `clamp()` fluid type, 48px tap targets, 320px–1440px+ tested layouts
15. ✅ Branded 404 with navigation home + sections
16. ✅ All internal links verified against real targets (no dead/malformed `href`)
17. ✅ Real-time client validation (ARIA errors) + server-side validation & sanitization
18. ✅ Spam protection: CSS honeypot, 2.5s timing check, per-IP rate limit, Turnstile hook
19. ✅ Consent-gated privacy-first analytics (Plausible, cookie-free)
20. ✅ Single CTA ("Start a Project") in hero, nav and footer — no competing buttons
