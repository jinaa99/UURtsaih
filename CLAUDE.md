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

- Одоогоор бодит брэндийн зураг байхгүй — placeholder-оор эхэлнэ.
- Phase 2-оос Claude өөрөө Unsplash, Pexels, Pixabay-аас үнэгүй зураг хайж татна.
- Зөвхөн арилжааны хэрэглээнд үнэгүй, зөвшөөрөл шаардахгүй лицензтэй зураг авна.
- Зураг бүрийн эх сурвалжийг `public/images/CREDITS.md`-д бүртгэнэ: файлын нэр, зохиогч, эх URL, лиценз, татсан огноо.
- Танигдахуйц хүн, бусад брэндийн лого, бараа агуулсан зургийг бүтээгдэхүүний зураг болгож ашиглахгүй.
- Зургийг web-д зориулж optimize хийнэ (WebP/AVIF, зохистой хэмжээ); `next/image` ашиглана.

## Next.js 16 онцлог (анхаар)

@AGENTS.md

- Next 16.4: `cacheComponents` + `partialPrefetching` асаалттай. `dynamicParams` ажиллахгүй.
- `middleware` → **`src/proxy.ts`** (нэр нь өөрчлөгдсөн). Locale-гүй URL-ыг Accept-Language-аар `/mn` эсвэл `/en` руу redirect хийнэ.
- Root layout нь `src/app/[lang]/layout.tsx`. Locale-ыг `next/root-params`-аас уншина (`getLocale()`, `getDictionary()` — `src/i18n/dictionaries.ts`).
- Код бичихээсээ өмнө `node_modules/next/dist/docs/`-оос холбогдох guide-ыг унш.

## Бүтэц

- `src/i18n/` — locale config, `mn.json` (эх загвар) / `en.json`
- `src/lib/currency.ts` — `Price` type (MNT, USD хоёулаа заавал), `formatPrice`
- `src/components/currency/` — `CurrencyProvider` (localStorage, default: mn→MNT, en→USD), `PriceTag`
- `src/components/ui/` — Header, LocaleSwitch, CurrencySwitch
- Design token: `src/app/globals.css` дахь `@theme` (cream, sand, camel, mist, ink; `ease-silk`; serif = Cormorant Garamond, sans = Manrope — хоёулаа кирилл)

## Командууд

- `npm run dev` / `npm run build` / `npm run lint`
- `npm run format` — Prettier (+ tailwind class эрэмбэлэгч)

## Явц

- [x] Phase 0 — Суурь (scaffold, token, фонт, i18n routing, валют switch)
- [ ] Phase 1 — Худалдааны хэсэг (Repository, products, collection, product, cart, PaymentProvider)
- [ ] Phase 2 — Scroll систем + зураг
- [ ] Phase 3 — 3D түүх
- [ ] Phase 4 — Өнгөлгөө
