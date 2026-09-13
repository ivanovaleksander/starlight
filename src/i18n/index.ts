/**
 * i18n за сървърното рендиране (Astro компоненти).
 * Преводите са в src/locales/{bg,en}.json. Български е език по подразбиране
 * и се рендира статично; английският се прилага в браузъра от src/scripts/i18n.ts
 * без презареждане (елементи с data-i18n / data-l10n / data-lang).
 */
import bg from '../locales/bg.json';
import en from '../locales/en.json';

export type Lang = 'bg' | 'en';
export const LANGS: Lang[] = ['bg', 'en'];
export const DEFAULT_LANG: Lang = 'bg';
export const locales = { bg, en } as const;

/** Текст, зададен и на двата езика (за съдържание извън JSON, напр. статии). */
export type Localized = { bg: string; en: string };

function resolve(obj: unknown, path: string): unknown {
	return path.split('.').reduce<unknown>((acc, part) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined), obj);
}

export function interpolate(text: string, params?: Record<string, string | number>): string {
	if (!params) return text;
	return text.replace(/\{(\w+)\}/g, (_, k) => (k in params ? String(params[k]) : `{${k}}`));
}

/** Превод по ключ за даден език. При липсващ ключ хвърля грешка по време на build. */
export function t(key: string, params?: Record<string, string | number>, lang: Lang = DEFAULT_LANG): string {
	const value = resolve(locales[lang], key);
	if (typeof value !== 'string') throw new Error(`[i18n] Липсващ ключ „${key}“ за език „${lang}“`);
	return interpolate(value, params);
}

/** Списък (масив от низове) по ключ. */
export function tList(key: string, lang: Lang = DEFAULT_LANG): string[] {
	const value = resolve(locales[lang], key);
	if (!Array.isArray(value)) throw new Error(`[i18n] Ключът „${key}“ не е списък за език „${lang}“`);
	return value as string[];
}

/** Двуезичен обект за ключ – удобно за data-l10n. */
export function both(key: string, params?: Record<string, string | number>): Localized {
	return { bg: t(key, params, 'bg'), en: t(key, params, 'en') };
}

/**
 * Атрибути за елемент, чийто текст се сменя от клиента:
 *   <h2 {...i18n('about.title')}>{t('about.title')}</h2>
 */
export function i18n(key: string, params?: Record<string, string | number>) {
	return params ? { 'data-i18n': key, 'data-i18n-params': JSON.stringify(params) } : { 'data-i18n': key };
}

/** Същото, но текстът съдържа HTML (set:html). */
export function i18nHtml(key: string) {
	return { 'data-i18n-html': key };
}

/**
 * Атрибути, които се превеждат: i18nAttr({ placeholder: 'booking.fTopicPlaceholder', 'aria-label': 'nav.openMenu' })
 * Рендира и стойностите за bg.
 */
export function i18nAttr(map: Record<string, string>) {
	const out: Record<string, string> = { 'data-i18n-attr': Object.entries(map).map(([a, k]) => `${a}:${k}`).join(';') };
	for (const [attr, key] of Object.entries(map)) out[attr] = t(key);
	return out;
}

/** Атрибути за текст, зададен инлайн на двата езика (data-l10n). */
export function l10n(value: Localized) {
	return { 'data-l10n': JSON.stringify(value) };
}
export function l10nAttr(map: Record<string, Localized>) {
	const out: Record<string, string> = { 'data-l10n-attr': JSON.stringify(map) };
	for (const [attr, v] of Object.entries(map)) out[attr] = v.bg;
	return out;
}

/** Ключ на категория публикация по българското ѝ име (front matter). */
export const CATEGORY_KEYS: Record<string, string> = {
	'Гражданско право': 'civil',
	'Административно право': 'administrative',
	'Търговско право': 'commercial',
	'Вещно право': 'property',
	'Процесуално представителство': 'litigation',
};
