/**
 * Клиентски скриптове: header, мобилно меню, reveal анимации,
 * активна секция в навигацията, предварителен избор на тема във формата.
 */
import { initContactForm } from './contact-form';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Header: състояние при скрол ---------- */
function initHeader() {
	const header = document.querySelector<HTMLElement>('[data-header]');
	if (!header) return;
	let lastY = window.scrollY;
	let ticking = false;

	const update = () => {
		const y = window.scrollY;
		header.classList.toggle('is-scrolled', y > 24);
		// Скрива header-а при скрол надолу, показва при скрол нагоре (само десктоп)
		const menuOpen = header.classList.contains('is-open');
		if (!menuOpen && window.innerWidth >= 1024) {
			header.classList.toggle('is-hidden', y > lastY && y > 320);
		} else {
			header.classList.remove('is-hidden');
		}
		lastY = y;
		ticking = false;
	};
	window.addEventListener(
		'scroll',
		() => {
			if (!ticking) {
				requestAnimationFrame(update);
				ticking = true;
			}
		},
		{ passive: true },
	);
	update();
}

/* ---------- Мобилно меню ---------- */
function initMobileMenu() {
	const header = document.querySelector<HTMLElement>('[data-header]');
	const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
	const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');
	if (!header || !toggle || !menu) return;

	const setOpen = (open: boolean) => {
		toggle.setAttribute('aria-expanded', String(open));
		toggle.setAttribute('aria-label', open ? 'Затвори менюто' : 'Отвори менюто');
		header.classList.toggle('is-open', open);
		menu.classList.toggle('is-open', open);
		document.body.classList.toggle('is-locked', open);
		if (open) {
			menu.removeAttribute('inert');
			menu.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
		} else {
			menu.setAttribute('inert', '');
		}
	};

	toggle.addEventListener('click', () => {
		setOpen(toggle.getAttribute('aria-expanded') !== 'true');
	});
	menu.addEventListener('click', (e) => {
		if ((e.target as HTMLElement).closest('a')) setOpen(false);
	});
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
			setOpen(false);
			toggle.focus();
		}
	});
	// Затваря менюто при преминаване към десктоп
	const mq = window.matchMedia('(min-width: 64rem)');
	mq.addEventListener('change', (e) => {
		if (e.matches) setOpen(false);
	});
}

/* ---------- Reveal при скролиране ---------- */
function initReveal() {
	const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
	if (!items.length) return;
	if (reduceMotion || !('IntersectionObserver' in window)) {
		items.forEach((el) => el.classList.add('is-visible'));
		return;
	}
	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					io.unobserve(entry.target);
				}
			}
		},
		{ rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
	);
	items.forEach((el) => io.observe(el));
}

/* ---------- Активна секция в навигацията ---------- */
function initActiveNav() {
	const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'));
	if (!links.length || !('IntersectionObserver' in window)) return;
	const ids = Array.from(new Set(links.map((l) => l.dataset.navLink!)));
	const sections = ids
		.map((id) => document.getElementById(id))
		.filter((el): el is HTMLElement => Boolean(el));

	const setActive = (id: string) => {
		for (const link of links) {
			if (link.dataset.navLink === id) link.setAttribute('aria-current', 'true');
			else link.removeAttribute('aria-current');
		}
	};

	const io = new IntersectionObserver(
		(entries) => {
			const visible = entries
				.filter((e) => e.isIntersecting)
				.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
			if (visible) setActive(visible.target.id);
		},
		{ rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.1, 0.5] },
	);
	sections.forEach((s) => io.observe(s));
}

/* ---------- Предварителен избор на тема от секцията „Услуги“ ---------- */
function initTopicPreselect() {
	const select = document.querySelector<HTMLSelectElement>('#f-topic');
	if (!select) return;
	document.querySelectorAll<HTMLAnchorElement>('[data-topic]').forEach((a) => {
		a.addEventListener('click', () => {
			const topic = a.dataset.topic ?? '';
			const opt = Array.from(select.options).find((o) => o.value === topic);
			if (opt) {
				select.value = topic;
				select.dispatchEvent(new Event('input', { bubbles: true }));
			}
		});
	});
}

initHeader();
initMobileMenu();
initReveal();
initActiveNav();
initTopicPreselect();
initContactForm();

/* ---------- Правни документи в модален прозорец ---------- */
function initLegalDialog() {
	const dialog = document.querySelector<HTMLDialogElement>('[data-legal-dialog]');
	if (!dialog || typeof dialog.showModal !== 'function') return;

	const title = dialog.querySelector<HTMLElement>('[data-legal-title]');
	const scroll = dialog.querySelector<HTMLElement>('[data-legal-scroll]');
	const pageLink = dialog.querySelector<HTMLAnchorElement>('[data-legal-page-link]');
	const tabs = Array.from(dialog.querySelectorAll<HTMLButtonElement>('[data-legal-tab]'));
	const docs = Array.from(dialog.querySelectorAll<HTMLElement>('[data-legal-doc]'));
	const openers = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-legal-open]'));
	const hrefByKey = new Map(openers.map((a) => [a.dataset.legalOpen!, a.getAttribute('href') ?? '/']));
	const keyByHref = new Map(Array.from(hrefByKey, ([k, h]) => [h, k]));
	let lastOpener: HTMLElement | null = null;

	const show = (key: string) => {
		for (const doc of docs) doc.hidden = doc.dataset.legalDoc !== key;
		for (const tab of tabs) tab.setAttribute('aria-pressed', String(tab.dataset.legalTab === key));
		const active = tabs.find((t) => t.dataset.legalTab === key);
		if (title && active) title.textContent = active.textContent?.trim() ?? '';
		if (pageLink) pageLink.href = hrefByKey.get(key) ?? '/';
		if (scroll) scroll.scrollTop = 0;
	};

	const open = (key: string, opener?: HTMLElement) => {
		lastOpener = opener ?? null;
		show(key);
		if (!dialog.open) dialog.showModal();
		document.body.classList.add('is-locked');
		scroll?.focus({ preventScroll: true });
	};

	const close = () => dialog.close();

	for (const a of openers) {
		a.addEventListener('click', (e) => {
			// Ctrl/Cmd+клик или среден бутон – отваря самостоятелната страница
			if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
			e.preventDefault();
			open(a.dataset.legalOpen!, a);
		});
	}
	for (const tab of tabs) tab.addEventListener('click', () => show(tab.dataset.legalTab!));
	dialog.querySelectorAll('[data-legal-close]').forEach((b) => b.addEventListener('click', close));

	// Връзки между документите вътре в прозореца превключват документа
	dialog.addEventListener('click', (e) => {
		const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
		if (a && keyByHref.has(a.getAttribute('href') ?? '')) {
			e.preventDefault();
			show(keyByHref.get(a.getAttribute('href')!)!);
			return;
		}
		// Клик върху фона затваря
		if (e.target === dialog) close();
	});
	dialog.addEventListener('close', () => {
		document.body.classList.remove('is-locked');
		lastOpener?.focus();
	});
}

initLegalDialog();
