/**
 * Клиентски i18n: сменя езика веднага, без презареждане.
 * - html[lang] определя активния език (задава се рано от inline скрипт в <head>)
 * - [data-i18n="key"]        → textContent от locales
 * - [data-i18n-html="key"]   → innerHTML от locales
 * - [data-i18n-attr="attr:key;attr2:key2"] → атрибути
 * - [data-l10n='{"bg":"…","en":"…"}'] и [data-l10n-attr='{"attr":{"bg":…,"en":…}}'] → инлайн текст
 * - [data-lang="bg|en"] блокове се показват/скриват чрез CSS (global.css)
 * Изборът се пази в localStorage (ключ hl-lang); по подразбиране: bg.
 */
import bg from '../locales/bg.json';
import en from '../locales/en.json';

export type Lang = 'bg' | 'en';
export const STORAGE_KEY = 'hl-lang';
const locales: Record<Lang, unknown> = { bg, en };

export function getLang(): Lang {
	return document.documentElement.lang === 'en' ? 'en' : 'bg';
}

function resolve(obj: unknown, path: string): unknown {
	return path.split('.').reduce<unknown>((acc, part) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined), obj);
}

export function interpolate(text: string, params?: Record<string, string | number>): string {
	if (!params) return text;
	return text.replace(/\{(\w+)\}/g, (_, k) => (k in params ? String(params[k]) : `{${k}}`));
}

export function t(key: string, params?: Record<string, string | number>, lang: Lang = getLang()): string {
	const value = resolve(locales[lang], key);
	if (typeof value !== 'string') {
		console.warn(`[i18n] Липсващ ключ „${key}“ за език „${lang}“`);
		const fallback = resolve(locales.bg, key);
		return typeof fallback === 'string' ? interpolate(fallback, params) : key;
	}
	return interpolate(value, params);
}

export function tList(key: string, lang: Lang = getLang()): string[] {
	const value = resolve(locales[lang], key);
	return Array.isArray(value) ? (value as string[]) : [];
}

/** Intl локал за дати/числа според активния език. */
export function intlLocale(lang: Lang = getLang()): string {
	return lang === 'en' ? 'en-GB' : 'bg-BG';
}

function parseParams(el: Element): Record<string, string | number> | undefined {
	const raw = el.getAttribute('data-i18n-params');
	if (!raw) return undefined;
	try {
		return JSON.parse(raw);
	} catch {
		return undefined;
	}
}

/** Прилага преводите върху целия документ (или част от него). */
export function applyTranslations(root: ParentNode = document, lang: Lang = getLang()) {
	root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
		el.textContent = t(el.dataset.i18n!, parseParams(el), lang);
	});
	root.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach((el) => {
		el.innerHTML = t(el.dataset.i18nHtml!, parseParams(el), lang);
	});
	root.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((el) => {
		for (const pair of el.dataset.i18nAttr!.split(';')) {
			const [attr, key] = pair.split(':');
			if (attr && key) el.setAttribute(attr.trim(), t(key.trim(), undefined, lang));
		}
	});
	root.querySelectorAll<HTMLElement>('[data-l10n]').forEach((el) => {
		try {
			const v = JSON.parse(el.dataset.l10n!) as Record<Lang, string>;
			if (v[lang] !== undefined) el.textContent = v[lang];
		} catch {
			/* игнорира невалиден JSON */
		}
	});
	root.querySelectorAll<HTMLElement>('[data-l10n-attr]').forEach((el) => {
		try {
			const map = JSON.parse(el.dataset.l10nAttr!) as Record<string, Record<Lang, string>>;
			for (const [attr, v] of Object.entries(map)) if (v[lang] !== undefined) el.setAttribute(attr, v[lang]);
		} catch {
			/* игнорира невалиден JSON */
		}
	});
}

export function setLang(lang: Lang) {
	document.documentElement.lang = lang;
	try {
		localStorage.setItem(STORAGE_KEY, lang);
	} catch {
		/* localStorage може да е недостъпен */
	}
	applyTranslations(document, lang);
	document.querySelectorAll<HTMLButtonElement>('[data-lang-switch]').forEach((b) => {
		b.setAttribute('aria-pressed', String(b.dataset.langSwitch === lang));
	});
	document.dispatchEvent(new CustomEvent<Lang>('langchange', { detail: lang }));
}

/** Инициализация: прилага записания език и свързва превключвателите. */
export function initI18n() {
	const lang = getLang();
	if (lang !== 'bg') applyTranslations(document, lang);
	document.querySelectorAll<HTMLButtonElement>('[data-lang-switch]').forEach((b) => {
		b.setAttribute('aria-pressed', String(b.dataset.langSwitch === lang));
		b.addEventListener('click', () => {
			const next = b.dataset.langSwitch as Lang;
			if (next !== getLang()) setLang(next);
		});
	});
	document.documentElement.classList.add('i18n-ready');
}
