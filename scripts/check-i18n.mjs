/**
 * Проверка на преводите:
 *  1) всеки ключ в bg.json има съответствие в en.json и обратно (еднакъв тип);
 *  2) всички ключове, използвани в кода (t('…'), i18n('…'), both('…'), data-i18n="…"), съществуват;
 *  3) в .astro компонентите няма „твърд“ български текст извън коментари.
 * Стартиране: npm run check:i18n
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const bg = JSON.parse(readFileSync('src/locales/bg.json', 'utf8'));
const en = JSON.parse(readFileSync('src/locales/en.json', 'utf8'));

function flatten(obj, prefix = '', out = {}) {
	for (const [k, v] of Object.entries(obj)) {
		const key = prefix ? `${prefix}.${k}` : k;
		if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
		else out[key] = Array.isArray(v) ? 'list' : typeof v;
	}
	return out;
}
const fbg = flatten(bg), fen = flatten(en);
let errors = 0;
for (const k of Object.keys(fbg)) if (!(k in fen)) { console.error(`✗ Липсва в en.json: ${k}`); errors++; }
for (const k of Object.keys(fen)) if (!(k in fbg)) { console.error(`✗ Липсва в bg.json: ${k}`); errors++; }
for (const k of Object.keys(fbg)) if (k in fen && fbg[k] !== fen[k]) { console.error(`✗ Различен тип за ${k}`); errors++; }

function walk(dir, files = []) {
	for (const f of readdirSync(dir)) {
		const p = join(dir, f);
		if (statSync(p).isDirectory()) walk(p, files);
		else if (/\.(astro|ts)$/.test(f) && !p.includes('locales') && !/i18n[\\/]index\.ts$|scripts[\\/]i18n\.ts$/.test(p)) files.push(p);
	}
	return files;
}
const files = walk('src');
const keyRe = /\b(?:t|i18n|i18nHtml|both|tList)\(\s*'([a-zA-Z0-9_.]+)'|data-i18n(?:-html)?="([a-zA-Z0-9_.]+)"|i18nAttr\(\{([^}]+)\}\)/g;
const used = new Set();
for (const f of files) {
	const src = readFileSync(f, 'utf8');
	for (const m of src.matchAll(keyRe)) {
		if (m[1]) used.add(m[1]);
		if (m[2]) used.add(m[2]);
		if (m[3]) for (const mm of m[3].matchAll(/'([a-zA-Z0-9_.]+)'\s*(?=[,}])/g)) used.add(mm[1]);
	}
}
for (const k of used) if (!(k in fbg)) { console.error(`✗ Използван ключ без превод: ${k}`); errors++; }

// Твърд текст на кирилица в .astro (извън коментари, frontmatter коментари и legal/bg съдържание)
const cyr = /[А-Яа-я]{3,}/;
for (const f of files.filter((f) => f.endsWith('.astro') && !f.includes('components/legal/'))) {
	const src = readFileSync(f, 'utf8');
	const body = src.replace(/^---[\s\S]*?---/, (fm) => fm.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')).replace(/<!--[\s\S]*?-->/g, '').replace(/<style>[\s\S]*?<\/style>/g, '');
	const lines = body.split('\n');
	lines.forEach((line, i) => {
		const stripped = line.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/g, '').replace(/'[^']*[А-Яа-я][^']*'/g, (q) => (/(?:t|i18n|both)\(/.test(line) ? '' : q));
		if (cyr.test(stripped) && !/^\s*\*/.test(stripped)) { console.error(`✗ Нелокализиран текст: ${f}:${i + 1}: ${stripped.trim().slice(0, 90)}`); errors++; }
	});
}

console.log(`Ключове: bg ${Object.keys(fbg).length}, en ${Object.keys(fen).length}, използвани ${used.size}`);
if (errors) { console.error(`\n${errors} проблем(а).`); process.exit(1); }
console.log('✓ Преводите са пълни.');
