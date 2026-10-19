# ÜÜR — Project Context

"ÜÜR" бол зохиомол Монгол ноолуурын luxury брэнд. Энэ repo нь түүний онлайн дэлгүүр.

**Зорилго:** 3D visual-аар хүний сэтгэлийг татаж, дараа нь бараа худалдаж авахад хөтлөх.

## Нүүр хуудасны scroll түүх

1. Говийн үүрийн зураг
2. Зураг мянга мянган ширхэг (particle) болж задарч салхинд хийснэ
3. Ширхэгүүд эргэлдэж утас болно
4. Утаснууд сүлжилдэж нэхмэл болно
5. Даавуу салхинд намирна, өнгө нь солигдоно
6. Бүтээгдэхүүний цуглуулга
7. Брэндийн түүх, гарал үүсэл

## Tech stack

- Next.js (App Router), TypeScript
- Tailwind CSS v4
- three.js + React Three Fiber + drei
- GSAP + ScrollTrigger
- Lenis (smooth scroll)

## Design — "чимээгүй luxury"

- Цайвар дулаан дэвсгэр: цөцгий, элсэн, тэмээн хүрэн, манантай саарал
- Гарчигт кирилл үсэг дэмждэг serif фонт
- Их цагаан зай
- Удаан, зөөлөн хөдөлгөөн

## Хэл ба валют

- Хэл: Монгол (mn), Англи (en)
- Валют: MNT, USD

## Дүрэм

- Бүтээгдэхүүний тоо баримт, сэтгэгдлийг (review) **зохиож бичихгүй** — placeholder тавина.
- Бүтээгдэхүүний хуудас 3D-гүйгээр ч хурдан ажиллана.
- Гар утсан дээр сайн харагдана.

## Архитектурын шийдвэрүүд

### Checkout

- Одоохондоо **зөвхөн demo cart**. Төлбөрийн хуудсанд маягт + "Төлбөр удахгүй" placeholder.
- `PaymentProvider` interface байна. Дараа нь QPay (гол), магадгүй олон улсын карт нэмнэ.
- **Бодит төлбөрийн код одоо бичихгүй.**

### Өгөгдөл

- Эх үүсвэр: локал файл `src/content/products.ts`.
- Бүх уншилт **Repository interface**-ээр дамжина. Component, page шууд файл импортлохгүй.
- Дараа нь Shopify/CMS руу шилжихэд зөвхөн repository implementation-ийг солино.

### Үнэ ба валют

- **Ханшийн хөрвүүлэлт хийхгүй**, ханшийн API хэрэггүй.
- Бүтээгдэхүүн бүрт MNT болон USD үнийг тус тусад нь гараар тавина.
- Luxury маягаар бөөрөнхий тоо: жишээ нь ₮890,000 / $259.
- Type дээр **хоёр үнийг хоёуланг нь заавал** шаардана (optional биш).

## Зургийн дүрэм

- Эх сурвалж: **зөвхөн** Unsplash (Unsplash+ зураг авахгүй), Pexels, Pixabay. 3D текстур: Poly Haven, ambientCG (CC0).
- Тод харагдах царайтай хүн, лого, брэнд харагдах зураг авахгүй. Contact sheet-ээр нүдээр шалгасны дараа л нэмнэ.
- Хадгалах: `public/media/<category>/` — WebP, 2 хэмжээ (2400px, 1200px). 3D текстур: `public/media/textures/<id>/{diffuse,normal,roughness}-{2048,1024}.webp` (GPU-д 2-ын зэрэг).
- Бүртгэл: `src/content/media.ts` (эх URL, зохиогч, лиценз, огноо) — `scripts/media/registry.json`-оос **автоматаар үүснэ**, гараар бүү засварла.
- Бүтээгдэхүүний түр зураг `placeholder: true` — бодит зургаар солигдоно.
- Ашиглах: `getPhoto(id)` / `photoSlot(id)` / `getTexture(id)` (`src/lib/media.ts`, id нь typed). Зохиогчийн нэр `/credits` хуудсанд (footer-оос холбоостой) — Unsplash guideline.
- Сонгогдсон: hero = `hero-unsplash-xgbugdiobvm` (нүүр, 3D stage 1), түүх = svaofknuoak + 4 хэсэг; текстур: `tex-cotton-jersey` (даавуу намирах), `tex-fabric019` (нэхмэл).
- Дуу (CC0): `node scripts/media/fetch-audio.mjs` → `public/media/audio/`, `getAudio(id)`. Нүүрний салхи = `audio-wind-freesound-697217` (freesound HQ preview mp3; эх wav login шаарддаг).
- Устгах: `node scripts/media/remove.mjs <id...>`.
- Хэрэгсэл: `node scripts/media/fetch-textures.mjs`, `node scripts/media/fetch-photos.mjs search|add` (`.env.local` → `UNSPLASH_ACCESS_KEY` / `PIXABAY_API_KEY` / `PEXELS_API_KEY`; Pexels шинэ key олголт 2026-10 байдлаар түр зогссон; Pixabay энгийн key 1280px хүртэл). Шалгах: `/dev/media`.
- Unsplash сайт bot-хамгаалалттай (Anubis) — тойрохгүй; Unsplash/Pixabay хэрэгтэй бол албан ёсны API key ашиглана.

## Next.js 16 онцлог (анхаар)

@AGENTS.md

- Next 16.4: `cacheComponents` + `partialPrefetching` асаалттай. `dynamicParams` ажиллахгүй.
- `middleware` → **`src/proxy.ts`** (нэр нь өөрчлөгдсөн). Locale-гүй URL-ыг Accept-Language-аар `/mn` эсвэл `/en` руу redirect хийнэ.
- Root layout нь `src/app/[lang]/layout.tsx`. Locale-ыг `next/root-params`-аас уншина (`getLocale()`, `getDictionary()` — `src/i18n/dictionaries.ts`).
- Код бичихээсээ өмнө `node_modules/next/dist/docs/`-оос холбогдох guide-ыг унш.

## Бүтэц

- `src/content/products.ts` — placeholder бараа (6). **Зөвхөн** `src/lib/catalog/local-repository.ts` импортлоно.
- `src/lib/catalog/` — `types.ts` (Product, Colorway, ImageSlot, LocalizedText), `repository.ts` (interface), `index.ts` (`productRepository` — эх үүсвэр солих цэг)
- `src/lib/payment/` — `PaymentProvider` interface, `plannedPaymentProviders` (QPay, карт). Implementation байхгүй.
- `src/lib/cart/store.ts` — localStorage сагс (`uur:cart:v1`), useSyncExternalStore
- `src/lib/currency.ts` — `Price` type (MNT, USD хоёулаа заавал), `formatPrice`
- `src/lib/seo.ts` — `pageMetadata` (canonical + hreflang + OG), `jsonLd`
- `src/i18n/` — locale config, `mn.json` (эх загвар) / `en.json`, `fill()` template
- `src/components/` — `cart/` (Provider, Drawer, LineItem), `product/`, `collection/`, `checkout/`, `currency/`, `i18n/` (client-д dict өгөх), `ui/` (Header, Footer, Button, Drawer, MobileMenu)
- Хуудас: `/[lang]` · `/collection` (?category=&color=) · `/product/[slug]` · `/cart` · `/checkout` · `/story` · `/styleguide` (noindex)
- `src/components/three/` — `HeroScrollStage` (нүүр: 700svh sticky, `--hero-wind`/`--hero-ui`, статик зураг = fallback, өнгө сонголт → `/collection?color=`), `particles/` (`stages.ts` = үе шатын хүрээ (three-гүй), `story.ts` = frame төлөв + зөөлрүүлсэн progress, `ParticleSystem` = GPGPU (зураг → салхи → helix утас → knit → даавууны гадаргуу), `Cloth` = MeshPhysicalMaterial + sheen + Poly Haven `cotton_jersey` normal/roughness, `shaders.ts` дахь `clothGlsl` хоёулаа хуваалцана, `PointerWind`, `settings` (100k / сул утас 30k + FPS хамгаалалт), `DebugPanel` = leva, `?debug`)
- `src/components/home/` — нүүрний угсралт: `SmoothScroll` (Lenis + ScrollTrigger + `[data-reveal]`/`[data-reveal-fade]` → `data-in`), `Reveal` (гарчиг маскаас доороос), `HorizontalScroller` (06 цуглуулга: ≥768px sticky + scrub, утсанд native snap), `Loader` (ÜÜR + progress; `src/lib/hero-ready.ts`-ийг хүлээнэ), `WindSound` (default унтраалттай, Web Audio loop), `FilmGrain` (grain + vignette). Бүлгийн гарчиг 02–05 = `CHAPTERS` (`stages.ts`), HeroScrollStage дотор.
- `src/components/motion/` — `SmoothScroll` (нүүр + түүх: Lenis, reveal, `[data-parallax="0.12"]`), `Reveal`.
- `src/components/story/` — `StoryMap` (Монголын SVG газрын зураг, говь → үйлдвэр гэрлийн шугам scroll-оор; 320svh sticky), `ProcessSteps` (самнах → цэвэрлэх → ээрэх → нэхэх, шугаман дүрс зурагдана). Газрын зураг: `src/content/mongolia-map.ts` ← `node scripts/map/build-mongolia.mjs` (Natural Earth 1:50m, public domain; гараар бүү засварла). Үйлдвэрийн цэг = Улаанбаатар — **placeholder**, брэнд баталгаажуулна.
- Түүхийн тоо баримт: `story/page.tsx` дахь `facts` (`null` = "Удахгүй") — зохиож бичихгүй.
- `ui/ShopButton` — бүх хуудсанд доод зүүн "Дэлгүүр" товч (утсан дээр `[data-bottom-bar]` байвал дээш өргөгдөнө).
- Лого: `src/components/brand/Logo.tsx` (`Logo` horizontal/stacked, `LogoMark`, `Wordmark`) — "нэхмэл үүр": тэнгэрийн хаяа дээр мандах нар, дотроо нэхмэлийн эгнээ + Cormorant Garamond 300 wordmark (path, OFL). `node scripts/brand/build-logo.mjs` → `logo-data.ts`, `public/brand/*.svg`, `src/app/{icon.svg,apple-icon.png,favicon.ico}`; дараа нь `node scripts/media/build-og.mjs`. Header (хэвтээ), footer + loader (босоо, loader-т зурагдана).
- Design token: `src/app/globals.css` дахь `@theme` + typography utility (`text-display/title/heading/eyebrow/lead`). Drawer = native `<dialog>` + `.drawer`.

## Гүйцэтгэл (Lighthouse mobile 85+ / a11y 95+ / SEO 95+)

- 3D: сул төхөөрөмж (saveData, ≤2 цөм/GB, software WebGL — unmasked renderer) ба reduced-motion → 3D-гүй, `fallback` (зурагтай бүлгүүд). Ажиллаж байхдаа 30k-д ч <30fps → 3D унтарна. 3D bundle нь load + 3.5с (эсвэл анхны scroll/touch)-ийн дараа; даавууны shader/текстурыг idle үед урьдчилан бэлдэнэ (`Cloth.prepare`). `?3d` — хүчээр асаах.
- Hero-ийн анхны өндөр/fallback-ыг CSS шийднэ (`.hero-stage[data-mode="auto"]`) — 3D хэрэглэгчид далд зураг татахгүй.
- LCP нь гарчиг (текст): hero фон зураг `fetchPriority="low"`; Cormorant зөвхөн 300/400 + `cyrillic-ext` (Ү/Ө), Manrope `preload: false`. `priority` (deprecated) биш `preload` ашигла, зөвхөн жинхэнэ LCP зурагт.
- Бүтэн өргөнтэй `object-cover` зурагт `coverSizes(photo, heightVh)` (`src/lib/media.ts`).
- OG: `public/og/{default,story}.jpg` ← `node scripts/media/build-og.mjs`; `pageMetadata` default-аар хэрэглэнэ. Production-д `NEXT_PUBLIC_SITE_URL` заавал (sitemap/OG/canonical).

## Мэдэгдэж буй зүйлс

- Байхгүй slug (`/mn/product/xxx`) нь PPR streaming-ийн улмаас 404 биш **200 + not-found UI + noindex** буцаана (Next-ийн documented behavior).
- `/cart`, `/checkout` нь санаатайгаар `noindex` → Lighthouse SEO 66 (`is-crawlable`). Засах шаардлагагүй.
- `npm audit`: 5 high — бүгд dev-only `eslint-config-next → fast-glob → micromatch → braces`. Production 0. `audit fix --force` бүү ажиллуул (eslint-config-next 14 руу буулгана).

## Командууд

- `npm run dev` / `npm run build` / `npm run lint`
- `npm run format` — Prettier (+ tailwind class эрэмбэлэгч)

## Явц

- [x] Phase 0 — Суурь (scaffold, token, фонт, i18n routing, валют switch)
- [x] Phase 1 — Худалдааны хэсэг (Repository, products, collection, product, cart, checkout, story, SEO, styleguide)
- [x] Phase 2a — Зураг татах, сайтад холбох (Unsplash + Poly Haven/ambientCG)
- [ ] Phase 2b — Scroll систем (Lenis + GSAP: нүүрэнд асаалттай; hero progress одоохондоо native scroll-оос)
- [ ] Phase 3 — 3D түүх (stage 1–5 хийгдсэн: зураг → утас → нэхмэл → даавуу + өнгө; progress одоо native scroll-оос — Phase 2b-д ScrollTrigger руу; 6–7 HTML-ээр угсарсан, 3D-гүй)
- [ ] Phase 4 — Өнгөлгөө
