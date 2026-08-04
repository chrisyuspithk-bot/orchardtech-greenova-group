# OrchardTech Greenova Group — Corporate Website

A 7-page trilingual (繁體中文 default / 简体中文 / English) static corporate
website for **OrchardTech Greenova Group Limited**, a Hong Kong-headquartered
industrial technology platform (subsidiaries: Pro-IAQ Limited, GP Investment
Group Limited).

No build step, no framework — plain HTML + CSS + vanilla JS. Open any page over
a static file server and it works.

**Live (GitHub Pages):** https://chrisyuspithk-bot.github.io/orchardtech-greenova-group/

## Run locally

Any static server works. From this directory:

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .

# or PHP
php -S localhost:8000
```

Then open <http://localhost:8000/index.html>.

> Use a server rather than `file://` so that fonts, JSON-LD and relative
> assets resolve consistently.

## Pages

| Route                    | 繁體中文          | English               |
| ------------------------ | ----------------- | --------------------- |
| `index.html`             | 首页              | Home                  |
| `about.html`             | 关于我们          | About Us              |
| `business.html`          | 业务版图          | Business Portfolio    |
| `advantages.html`        | 核心优势          | Core Advantages       |
| `rd-partnerships.html`   | 研发与合作        | R&D & Partnerships    |
| `investor-relations.html`| 投资者关系        | Investor Relations    |
| `contact.html`           | 联络我们          | Contact Us            |
| `404.html`               | 找不到此页面      | Page Not Found        |

## Project structure

```
├── *.html                  # 8 pages (content-free shells; copy lives in JS dicts)
├── assets/
│   ├── css/
│   │   ├── base.css        # design tokens (design-guide.md §3/§4), resets, a11y
│   │   ├── layout.css      # header / mobile menu / footer / container
│   │   ├── components.css  # buttons, cards, tables, timeline, org chart, forms…
│   │   └── pages.css       # page-specific sections (hero, flywheel, UoP bar…)
│   ├── js/
│   │   ├── i18n.js         # locale engine (zh-HK default, en toggle, localStorage)
│   │   ├── main.js         # nav, scroll reveal, counters, ticker, form, misc
│   │   └── content/        # one file per page: OG.register(scope, {zh, en})
│   └── img/                # logo.svg, favicon.svg, og-image.svg
├── robots.txt
├── sitemap.xml
└── README.md
```

## Internationalisation

- All copy is stored verbatim (from `pages/01–07` content files) in
  `assets/js/content/*.js` as `{ zh: {…}, cn: {…}, en: {…} }` dictionaries —
  `zh` = 繁體中文 (Hong Kong conventions, converted via OpenCC with HK glyph
  fixes), `cn` = 简体中文, `en` = English.
- Elements opt in with `data-i18n="key"`; attributes via
  `data-i18n-attr="placeholder:key,aria-label:key"`.
- Default locale is **zh-HK (繁體)**. The header toggle (繁 / 简 / EN) switches
  the full page (content, `<title>`, meta description, Open Graph,
  `<html lang>`), persists to `localStorage("og-locale")`, honours
  `?lang=zh|cn|en`, and falls back to `navigator.language` on first visit
  (Hans regions → 简体, other Chinese → 繁體, otherwise English).

## SEO

- Per-page unique `<title>` + meta description (繁 / 简 / EN, swapped with locale).
- Open Graph + Twitter Card tags; canonical URLs; `hreflang` alternates
  (`zh-HK`, `zh-CN`, `en`, `x-default`).
- JSON-LD: `Organization` on home, `BreadcrumbList` on every content page,
  `FAQPage` on Investor Relations (risk factors), `ContactPoint` on Contact.
- `sitemap.xml` + `robots.txt`; bilingual `404.html`.

## Contact form

Client-side validation, then POSTs to the endpoint configured on the form's
`action` attribute in `contact.html`:

```html
<form id="enquiry-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST" novalidate>
```

Replace `YOUR_FORM_ID` with a real Formspree/Web3Forms ID. Until then the form
honestly surfaces the failure state with the fallback email link — it never
fakes a successful send.

## OG image

`assets/img/og-image.svg` is the placeholder social card (deep evergreen,
logo lockup, gold IPO badge). To rasterise for stricter platforms:

```bash
# e.g. with Inkscape or rsvg-convert
rsvg-convert -w 1200 -h 630 assets/img/og-image.svg -o assets/img/og-image.png
```

## Accessibility & performance notes

- Semantic landmarks, skip link, focus-visible rings, aria on all toggles,
  keyboard-navigable menu, WCAG AA contrast, `prefers-reduced-motion` respected.
- Zero raster images / zero stock photos: all visuals are CSS gradients and
  inline SVG (org chart, flywheel, bar chart, Use-of-Proceeds bar).
- Fonts: Google Fonts — Space Grotesk + Inter (Latin), **Noto Serif HK/SC**
  (CJK display heads, editorial voice), **Noto Sans HK/SC** (CJK body/UI,
  Hong Kong-correct glyph forms), Source Serif 4 italic (EN quotes);
  system fallbacks per design-guide.md §4.
