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
│   └── contact-form.ts     # валидиране и изпращане на контактната форма
├── styles/global.css       # дизайн токени, типография, reset, анимации
└── pages/                  # index + три правни подстраници
public/                     # favicon, OG изображение, портрет placeholder, robots.txt
scripts/generate-og.mjs     # генерира OG изображението чрез sharp
```

## Какво трябва да се предостави / свърже преди публикуване

| Елемент | Къде | Статус |
| --- | --- | --- |
| Портрет на адвокат Хинков | `public/images/portrait-placeholder.svg` → заменете и обновете `src` в `Hero.astro` и `About.astro` | placeholder |
| Биография, образование, опит | `src/components/About.astro` (масивът `facts`) | placeholder |
| Адрес, телефон, имейл, работно време | `src/data/site.ts` → `site.contact` | placeholder |
| Карта | `site.contact.mapEmbedUrl` – показва се само ако е зададен | изключена |
| Публикации | `src/data/site.ts` → `publications` | **демо съдържание** |
| Политики (поверителност, бисквитки, правна информация) | `src/pages/politika-*.astro`, `pravna-informacia.astro` | временен текст, `noindex` |
| Публичен домейн | `PUBLIC_SITE_URL` (Netlify подава `URL` автоматично) | – |
| Backend на контактната форма | `PUBLIC_CONTACT_ENDPOINT` (виж `.env.example` и `src/scripts/contact-form.ts`) | **не е свързан** |

### Контактна форма

Формата има пълно клиентско валидиране, honeypot и състояния за успех/грешка, но **няма реален backend**. Без зададен `PUBLIC_CONTACT_ENDPOINT` тя работи в демо режим: валидира, показва успешно състояние и записва предупреждение в конзолата, без да изпраща данни. Мястото за свързване е ясно отбелязано в `src/scripts/contact-form.ts` – endpoint-ът трябва да приема `POST` с JSON `{ name, phone, email, topic, message, consent, page, submittedAt }` (Netlify Function, Formspree, собствен API и др.).

## Принципи

- Не се измислят биография, квалификации, брой дела, години опит, награди или отзиви – липсващата информация е означена като placeholder.
- Структурираните данни (`LegalService` / `Attorney`) съдържат само потвърдена информация: име, град, LinkedIn и области на практика.
- Шрифтовете (Playfair Display, Manrope) се хостват локално – без външни заявки към Google Fonts.
- Анимациите спазват `prefers-reduced-motion`; без JavaScript цялото съдържание е видимо.
- Иконите са от [Lucide](https://lucide.dev); LinkedIn иконата е официалната форма от Simple Icons (Lucide не поддържа брандови икони).
