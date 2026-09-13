/**
 * Валидиране и изпращане на контактната форма.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ТУК СЕ СВЪРЗВА РЕАЛНАТА УСЛУГА ЗА ИЗПРАЩАНЕ                          │
 * │                                                                      │
 * │  Задайте PUBLIC_CONTACT_ENDPOINT в .env (виж .env.example) – URL,    │
 * │  който приема POST заявка с JSON тяло:                               │
 * │  { name, phone, email, topic, message, consent, page, submittedAt }  │
 * │                                                                      │
 * │  Подходящи варианти: Netlify Function / Form, Formspree, собствен    │
 * │  API. Без зададен endpoint формата работи в ДЕМО режим – валидира,   │
 * │  показва успешно състояние, но НЕ изпраща данни никъде.              │
 * └──────────────────────────────────────────────────────────────────────┘
 */

const ENDPOINT: string = import.meta.env.PUBLIC_CONTACT_ENDPOINT ?? '';

type FieldEl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const messages = {
	required: 'Полето е задължително.',
	name: 'Въведете име и фамилия (поне 2 символа).',
	phone: 'Въведете валиден телефонен номер.',
	email: 'Въведете валиден имейл адрес.',
	topic: 'Изберете тема на запитването.',
	message: 'Опишете казуса накратко (поне 20 символа).',
	consent: 'Необходимо е съгласие с политиката за поверителност.',
};

const phoneRe = /^\+?[0-9\s().-]{6,20}$/;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateField(el: FieldEl): string {
	const value = (el.value ?? '').trim();
	const name = el.name;

	if (el instanceof HTMLInputElement && el.type === 'checkbox') {
		return el.checked ? '' : messages.consent;
	}
	if (el.required && !value) {
		return (messages as Record<string, string>)[name] ?? messages.required;
	}
	switch (name) {
		case 'name':
			return value.length < 2 ? messages.name : '';
		case 'phone':
			return phoneRe.test(value) ? '' : messages.phone;
		case 'email':
			return emailRe.test(value) ? '' : messages.email;
		case 'message':
			return value.length < 20 ? messages.message : '';
		default:
			return '';
	}
}

function setError(el: FieldEl, error: string) {
	const errId = `${el.id}-err`;
	const errEl = document.getElementById(errId);
	if (errEl) errEl.textContent = error;
	if (error) {
		el.setAttribute('aria-invalid', 'true');
	} else {
		el.removeAttribute('aria-invalid');
	}
}

async function submit(payload: Record<string, unknown>): Promise<void> {
	if (!ENDPOINT) {
		// ДЕМО РЕЖИМ – няма реален backend. Свържете реална услуга (виж по-горе).
		console.warn(
			'[HINKOV LAW] Контактната форма е в демо режим: PUBLIC_CONTACT_ENDPOINT не е зададен. Данните НЕ са изпратени.',
			payload,
		);
		await new Promise((r) => setTimeout(r, 700));
		return;
	}

	const res = await fetch(ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		body: JSON.stringify(payload),
	});
	if (!res.ok) throw new Error(`Endpoint responded with ${res.status}`);
}

export function initContactForm(root: ParentNode = document) {
	const form = root.querySelector<HTMLFormElement>('[data-contact-form]');
	if (!form) return;

	const wrap = form.parentElement!;
	const success = wrap.querySelector<HTMLElement>('[data-form-success]');
	const failure = wrap.querySelector<HTMLElement>('[data-form-failure]');
	const status = form.querySelector<HTMLElement>('[data-form-status]');
	const submitBtn = form.querySelector<HTMLButtonElement>('[type="submit"]');
	const fields = Array.from(
		form.querySelectorAll<FieldEl>('input[name]:not([name="website"]), select[name], textarea[name]'),
	);

	// Валидиране при напускане на поле и изчистване на грешката при въвеждане
	for (const el of fields) {
		el.addEventListener('blur', () => setError(el, validateField(el)));
		el.addEventListener('input', () => {
			if (el.getAttribute('aria-invalid') === 'true') setError(el, validateField(el));
		});
	}

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		failure?.setAttribute('hidden', '');

		// Honeypot – ботове попълват скритото поле
		const hp = form.querySelector<HTMLInputElement>('input[name="website"]');
		if (hp && hp.value) return;

		let firstInvalid: FieldEl | null = null;
		for (const el of fields) {
			const err = validateField(el);
			setError(el, err);
			if (err && !firstInvalid) firstInvalid = el;
		}
		if (firstInvalid) {
			firstInvalid.focus();
			if (status) status.textContent = 'Моля, коригирайте отбелязаните полета.';
			return;
		}

		const data = new FormData(form);
		const payload = {
			name: String(data.get('name') ?? '').trim(),
			phone: String(data.get('phone') ?? '').trim(),
			email: String(data.get('email') ?? '').trim(),
			topic: String(data.get('topic') ?? ''),
			message: String(data.get('message') ?? '').trim(),
			consent: data.get('consent') === 'on',
			page: location.href,
			submittedAt: new Date().toISOString(),
		};

		form.classList.add('is-submitting');
		if (submitBtn) submitBtn.setAttribute('aria-disabled', 'true');
		if (status) status.textContent = 'Изпращане…';

		try {
			await submit(payload);
			form.setAttribute('hidden', '');
			if (success) {
				success.removeAttribute('hidden');
				success.focus();
			}
		} catch (err) {
			console.error(err);
			failure?.removeAttribute('hidden');
			if (status) status.textContent = '';
		} finally {
			form.classList.remove('is-submitting');
			submitBtn?.removeAttribute('aria-disabled');
		}
	});
}
