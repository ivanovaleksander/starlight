# HINKOV LAW – Адвокат Тодор Хинков

Уебсайт на адвокатска кантора HINKOV LAW (Пловдив, България), изграден с [Astro](https://astro.build) като статичен сайт без клиентски framework. Цялото съдържание е на български език.

## Стартиране

```bash
npm install
npm run dev       # локален сървър на http://localhost:4321
npm run build     # production build в ./dist
npm run preview   # преглед на build-а
npm run check     # проверка на типовете (astro check)
npm run og        # регенерира public/og.png и apple-touch-icon.png
```

## Структура

```
src/
├── data/site.ts            # ЕДИНСТВЕНОТО място за текстове, контакти, услуги, навигация
├── layouts/
│   ├── BaseLayout.astro    # <head>, SEO, Open Graph, JSON-LD, header/footer
│   └── LegalLayout.astro   # layout за политиките (временно съдържание)
├── components/             # секции и общи елементи (Header, Hero, Practice, About…)
├── scripts/
│   ├── main.ts             # header, мобилно меню, reveal анимации, активна навигация
│   └── booking.ts          # процес за резервиране на консултация (3 стъпки)
├── config/booking.ts       # настройки на резервациите и интеграция с Microsoft Bookings
├── content/publications/   # статии (Markdown) → /publikacii/<slug>; схема в content.config.ts
├── components/booking/     # BookingFlow, ServiceSelector, BookingCalendar, AvailableTimes…
├── styles/global.css       # дизайн токени, типография, reset, анимации
└── pages/                  # index + три правни подстраници
public/                     # favicon, OG изображение, портрет placeholder, robots.txt
scripts/generate-og.mjs     # генерира OG изображението чрез sharp
```

## Какво трябва да се предостави / свърже преди публикуване

| Елемент | Къде | Статус |
| --- | --- | --- |
| Портрет на адвокат Хинков | `public/images/portrait-placeholder.svg` → заменете и обновете `src` в `Hero.astro` и `About.astro` | placeholder |
| Биография, образование, опит | `src/components/About.astro` (масивът `facts`) | попълнени |
| Адрес, телефон, имейл, работно време | `src/data/site.ts` → `site.contact` | placeholder |
| Карта | `site.contact.mapEmbedUrl` – показва се само ако е зададен | изключена |
| Публикации | Markdown файлове в `src/content/publications/` (front matter: title, category, summary, date, demo) | **демо съдържание** – заменете с реални статии и задайте `demo: false` |
| Политики (поверителност, бисквитки, правна информация) | `src/pages/politika-*.astro`, `pravna-informacia.astro` | временен текст, `noindex` |
| Публичен домейн | `PUBLIC_SITE_URL` (Netlify подава `URL` автоматично) | – |
| Microsoft Bookings страница | `PUBLIC_BOOKING_PAGE_URL` (виж `.env.example` и `src/config/booking.ts`) | **не е свързана** |
| API за реална наличност / резервации | `PUBLIC_BOOKING_AVAILABILITY_URL`, `PUBLIC_BOOKING_CREATE_URL` | по избор |
| Канал за заявки (резервен) | `PUBLIC_CONTACT_ENDPOINT` | **не е свързан** |

### Резервиране на консултация

Секцията „Запазете консултация“ е процес в три стъпки: вид консултация → дата и час → данни. Настройките са в `src/config/booking.ts`, поведението в `src/scripts/booking.ts`, компонентите в `src/components/booking/`.

- **Microsoft Bookings:** задайте `PUBLIC_BOOKING_PAGE_URL` с публичния адрес на страницата (`https://outlook.office.com/book/…`). При потвърждаване тя се отваря в нов раздел, за да се избере точният час. Ако адресът липсва, интерфейсът показва разбираемо съобщение вместо счупен бутон.
- **Реална наличност (по избор):** `PUBLIC_BOOKING_AVAILABILITY_URL` (GET `?service=&date=` → `{ slots: [{ start, end }] }`) показва свободните часове в самия сайт, а `PUBLIC_BOOKING_CREATE_URL` (POST JSON) създава резервацията. Без тях сайтът **не показва измислени часове** – в production потребителят избира предпочитана дата, а часът се потвърждава в Microsoft Bookings.
- **Демо часове** се показват само при `npm run dev` и без API, за преглед на интерфейса.
- **Заявката** (име, имейл, телефон, тема, описание, вид, дата) се изпраща към `PUBLIC_BOOKING_CREATE_URL` или, ако липсва, към `PUBLIC_CONTACT_ENDPOINT`. Без нито един от двата е демо режим с предупреждение в конзолата; нищо не се записва в localStorage.

## Двуезичност (BG / EN)

Сайтът е изцяло двуезичен. Български е езикът по подразбиране и се рендира статично; английският се прилага в браузъра веднага, без презареждане, а изборът се пази в `localStorage` (ключ `hl-lang`).

**Къде са преводите**

- `src/locales/bg.json` и `src/locales/en.json` – всички текстове на интерфейса (меню, секции, бутони, форми, съобщения, SEO). Двата файла имат еднаква структура от ключове.
- `src/components/legal/*.astro` (BG) и `src/components/legal/en/*.astro` (EN) – правните документи.
- `src/content/publications/bg/<slug>.md` и `src/content/publications/en/<slug>.md` – статиите (еднакво име на файла = една статия на два езика; ако английската липсва, се показва българският оригинал с бележка).

**Как се редактира или добавя превод**

1. Намерете ключа в `bg.json` (напр. `hero.ctaPrimary`) и променете стойността му там и в `en.json`.
2. За нов текст добавете ключ и в двата файла, после го използвайте в компонента:
   `<p {...i18n('section.key')}>{t('section.key')}</p>` (текст) или `{...i18nHtml('key')} set:html={t('key')}` (текст с HTML).
   За атрибути: `{...i18nAttr({ 'aria-label': 'key' })}`. В клиентските скриптове: `t('key')` от `src/scripts/i18n.ts`.
3. Пуснете `npm run check:i18n` – проверява, че всички ключове съществуват и в двата файла, че използваните ключове са дефинирани и че в компонентите няма „твърд“ български текст.

**Ограничение:** статичният HTML е на български; английският се прилага от JavaScript. Търсачките индексират българската версия. За отделни индексирани английски адреси (напр. `/en/…`) е нужен допълнителен build с отделни страници.

## Принципи

- Не се измислят биография, квалификации, брой дела, години опит, награди или отзиви – липсващата информация е означена като placeholder.
- Структурираните данни (`LegalService` / `Attorney`) съдържат само потвърдена информация: име, град, LinkedIn и области на практика.
- Шрифтовете (Playfair Display, Manrope) се хостват локално – без външни заявки към Google Fonts.
- Всички текстове са в `src/locales/`; компонентите не съдържат видим текст директно.
- Анимациите спазват `prefers-reduced-motion`; без JavaScript цялото съдържание е видимо.
- Иконите са от [Lucide](https://lucide.dev); LinkedIn иконата е официалната форма от Simple Icons (Lucide не поддържа брандови икони).
