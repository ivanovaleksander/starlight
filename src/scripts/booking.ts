/**
 * Поведение на процеса за резервиране на консултация (3 стъпки).
 * Markup: src/components/booking/*.astro · Стилове: src/styles/booking.css
 * Настройки и интеграция: src/config/booking.ts
 */
import { BOOKING_CONFIG, getAvailabilityMode, type ServiceKey } from '../config/booking';
import { t, tList, intlLocale, getLang } from './i18n';

type Slot = { start: string; end: string; label: string };
type Step = 1 | 2 | 3;

const CFG = BOOKING_CONFIG;
const TZ = CFG.timezone;

/* ---------- Дати в часовата зона на кантората (форматите следват активния език) ---------- */
const ymdFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const timeFmt = () => new Intl.DateTimeFormat(intlLocale(), { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
const monthFmt = () => new Intl.DateTimeFormat(intlLocale(), { timeZone: 'UTC', month: 'long', year: 'numeric' });
const longFmt = () => new Intl.DateTimeFormat(intlLocale(), { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });

/** Дата (в TZ) като 'YYYY-MM-DD'. */
const toYmd = (d: Date) => ymdFmt.format(d);
/** 'YYYY-MM-DD' → UTC Date (само за форматиране и аритметика по дни). */
const fromYmd = (s: string) => new Date(`${s}T00:00:00Z`);
const addDays = (s: string, n: number) => toYmd(new Date(fromYmd(s).getTime() + n * 864e5 + 12 * 36e5));
/** ISO ден от седмицата: 1 = понеделник … 7 = неделя. */
const isoWeekday = (s: string) => ((fromYmd(s).getUTCDay() + 6) % 7) + 1;
const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function selectableRange() {
	const now = Date.now();
	const min = toYmd(new Date(now + CFG.minimumNoticeHours * 36e5));
	const max = toYmd(new Date(now + CFG.maxDaysAhead * 864e5));
	return { today: toYmd(new Date(now)), min, max };
}

function isSelectable(ymd: string, range: ReturnType<typeof selectableRange>) {
	return ymd >= range.min && ymd <= range.max && (CFG.workingDays as readonly number[]).includes(isoWeekday(ymd));
}

/* ---------- Наличност ---------- */
async function fetchSlots(service: ServiceKey, date: string): Promise<Slot[]> {
	const url = new URL(CFG.availabilityUrl, location.href);
	url.searchParams.set('service', service);
	url.searchParams.set('date', date);
	url.searchParams.set('timezone', TZ);
	const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
	if (!res.ok) throw new Error(`Availability API responded with ${res.status}`);
	const data = (await res.json()) as { slots?: { start: string; end: string }[] };
	return (data.slots ?? []).map((s) => ({ ...s, label: timeFmt().format(new Date(s.start)) }));
}

/** ДЕМО часове – само при `astro dev` без API (виж getAvailabilityMode). */
function demoSlots(service: ServiceKey, date: string): Slot[] {
	const duration = CFG.services[service].duration ?? 30;
	const step = duration + CFG.bufferMinutes;
	const [hs, ms] = CFG.workingHours.start.split(':').map(Number);
	const [he, me] = CFG.workingHours.end.split(':').map(Number);
	const [bs, bsm] = CFG.workingHours.breakStart.split(':').map(Number);
	const [be, bem] = CFG.workingHours.breakEnd.split(':').map(Number);
	const startMin = hs * 60 + ms, endMin = he * 60 + me, brS = bs * 60 + bsm, brE = be * 60 + bem;
	const slots: Slot[] = [];
	for (let t = startMin; t + duration <= endMin; t += step) {
		if (t < brE && t + duration > brS) continue;
		// демо: „заети“ са някои часове според деня, за да не изглежда еднакво
		if ((t / 15 + fromYmd(date).getUTCDate()) % 4 === 0) continue;
		const hh = String(Math.floor(t / 60)).padStart(2, '0');
		const mm = String(t % 60).padStart(2, '0');
		slots.push({ start: `${date}T${hh}:${mm}:00`, end: '', label: `${hh}:${mm}` });
	}
	return slots;
}

/* ---------- Валидиране на данните ---------- */
type FieldEl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
const phoneRe = /^\+?[0-9\s().-]{6,20}$/;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const errorKeys: Record<string, string> = {
	name: 'booking.errName',
	email: 'booking.errEmail',
	phone: 'booking.errPhone',
	topic: 'booking.errTopic',
	message: 'booking.errMessage',
	consent: 'booking.errConsent',
};
/** Връща ключ на съобщение за грешка или '' – текстът се превежда при показване. */
function validateField(el: FieldEl): string {
	if (el instanceof HTMLInputElement && el.type === 'checkbox') return el.checked ? '' : errorKeys.consent;
	const v = el.value.trim();
	if (el.required && !v) return errorKeys[el.name] ?? 'booking.errRequired';
	switch (el.name) {
		case 'name': return v.length < 2 ? errorKeys.name : '';
		case 'email': return emailRe.test(v) ? '' : errorKeys.email;
		case 'phone': return phoneRe.test(v) ? '' : errorKeys.phone;
		case 'message': return v.length < 20 ? errorKeys.message : '';
		default: return '';
	}
}
function setError(el: FieldEl, errorKey: string) {
	const errEl = document.getElementById(`${el.id}-err`);
	if (errEl) {
		errEl.textContent = errorKey ? t(errorKey) : '';
		if (errorKey) errEl.dataset.i18n = errorKey;
		else delete errEl.dataset.i18n;
	}
	if (errorKey) el.setAttribute('aria-invalid', 'true');
	else el.removeAttribute('aria-invalid');
}

/* ---------- Изпращане ---------- */
async function postJson(url: string, payload: unknown) {
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		body: JSON.stringify(payload),
	});
	if (!res.ok) throw new Error(`Endpoint responded with ${res.status}`);
}

/* ====================================================================== */
export function initBooking() {
	const root = document.querySelector<HTMLElement>('[data-booking]');
	if (!root) return;

	const $ = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel);
	const $$ = <T extends HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel));

	const form = $<HTMLFormElement>('[data-booking-form]')!;
	const panels = $$<HTMLElement>('[data-step-panel]');
	const progress = $$<HTMLElement>('[data-progress-step]');
	const serviceInputs = $$<HTMLInputElement>('[data-service-input]');
	const nextBtns = $$<HTMLButtonElement>('[data-next]');
	const backBtns = $$<HTMLButtonElement>('[data-back]');
	const calGrid = $<HTMLElement>('[data-calendar-grid]')!;
	const calMonth = $<HTMLElement>('[data-calendar-month]')!;
	const calPrev = $<HTMLButtonElement>('[data-calendar-prev]')!;
	const calNext = $<HTMLButtonElement>('[data-calendar-next]')!;
	const calWeekdays = $<HTMLElement>('[data-calendar-weekdays]');
	const timesSub = $<HTMLElement>('[data-times-sub]')!;
	const timesList = $<HTMLElement>('[data-times-list]')!;
	const timesDemo = $<HTMLElement>('[data-times-demo]');
	const timesStates = $$<HTMLElement>('[data-times-state]');
	const summaryService = $<HTMLElement>('[data-summary-service]')!;
	const summaryWhen = $<HTMLElement>('[data-summary-when]')!;
	const summaryWhenRow = $<HTMLElement>('[data-summary-when-row]')!;
	const status = $<HTMLElement>('[data-booking-status]')!;
	const success = $<HTMLElement>('[data-booking-success]')!;
	const successText = $<HTMLElement>('[data-success-text]')!;
	const successBookings = $<HTMLAnchorElement>('[data-success-bookings]');
	const failure = $<HTMLElement>('[data-booking-failure]')!;
	const submitBtn = $<HTMLButtonElement>('[data-submit]')!;

	const mode = getAvailabilityMode();
	const range = selectableRange();

	const state = {
		step: 1 as Step,
		service: null as ServiceKey | null,
		date: null as string | null,
		slot: null as Slot | null,
		month: range.min.slice(0, 7), // 'YYYY-MM'
		slotsRequest: 0,
	};

	const needsTime = () => state.service !== null && CFG.services[state.service].duration !== null;
	/** В режим без API часът се избира в Microsoft Bookings – датата е достатъчна за продължаване. */
	const timeRequired = () => needsTime() && mode !== 'bookings-page';

	/* ---------- Стъпки ---------- */
	function setProgress() {
		for (const el of progress) {
			const n = Number(el.dataset.progressStep);
			const note = el.querySelector<HTMLElement>('[data-progress-note]');
			let st: 'done' | 'current' | 'upcoming' | 'skipped' = n < state.step ? 'done' : n === state.step ? 'current' : 'upcoming';
			if (n === 2 && state.service && !needsTime()) st = state.step > 2 ? 'skipped' : 'skipped';
			el.dataset.state = st;
			if (st === 'current') el.setAttribute('aria-current', 'step');
			else el.removeAttribute('aria-current');
			if (note) note.textContent = n === 2 && st === 'skipped' ? t('booking.skipped') : '';
		}
	}
	function showStep(step: Step, focus = true) {
		state.step = step;
		for (const p of panels) p.hidden = Number(p.dataset.stepPanel) !== step;
		setProgress();
		updateNextButtons();
		if (focus) panels.find((p) => !p.hidden)?.querySelector<HTMLElement>('[data-step-title]')?.focus({ preventScroll: false });
	}
	function updateNextButtons() {
		const step1 = state.service !== null;
		const step2 = state.date !== null && (!timeRequired() || state.slot !== null);
		for (const b of nextBtns) {
			const panel = Number(b.closest<HTMLElement>('[data-step-panel]')?.dataset.stepPanel);
			b.disabled = panel === 1 ? !step1 : !step2;
		}
	}
	function fillSummary() {
		summaryService.textContent = state.service ? t(`booking.services.${state.service}.name`) : '–';
		if (!needsTime()) {
			summaryWhenRow.hidden = true;
			return;
		}
		summaryWhenRow.hidden = false;
		const dateText = state.date ? capitalize(longFmt().format(fromYmd(state.date))) : '–';
		summaryWhen.textContent = state.slot
			? t('booking.summaryAt', { date: dateText, time: state.slot.label })
			: t('booking.summaryTimeTbc', { date: dateText });
	}

	/* ---------- Стъпка 1 ---------- */
	for (const input of serviceInputs) {
		input.addEventListener('change', () => {
			state.service = input.value as ServiceKey;
			state.slot = null;
			setProgress();
			updateNextButtons();
			if (state.date) void loadTimes();
		});
	}

	/* ---------- Стъпка 2: календар ---------- */
	function renderCalendar() {
		const [y, m] = state.month.split('-').map(Number);
		const first = `${state.month}-01`;
		const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
		const lead = isoWeekday(first) - 1;
		calMonth.textContent = capitalize(monthFmt().format(fromYmd(first)));
		if (calWeekdays) calWeekdays.innerHTML = tList('booking.weekdays').map((d) => `<span>${d}</span>`).join('');
		calPrev.disabled = state.month <= range.min.slice(0, 7);
		calNext.disabled = state.month >= range.max.slice(0, 7);

		const cells: string[] = [];
		const start = addDays(first, -lead);
		const total = Math.ceil((lead + daysInMonth) / 7) * 7;
		let firstEnabledSet = false;
		for (let i = 0; i < total; i++) {
			const ymd = addDays(start, i);
			const outside = ymd.slice(0, 7) !== state.month;
			const enabled = !outside && isSelectable(ymd, range);
			const selected = ymd === state.date;
			const isToday = ymd === range.today;
			const tabbable = enabled && (selected || (!state.date && !firstEnabledSet) || (state.date && state.date.slice(0, 7) !== state.month && !firstEnabledSet));
			if (tabbable) firstEnabledSet = true;
			const label = capitalize(longFmt().format(fromYmd(ymd)));
			cells.push(
				`<button type="button" class="bk-day${outside ? ' bk-day--outside' : ''}${isToday ? ' bk-day--today' : ''}"` +
					` data-date="${ymd}" aria-label="${label}${enabled ? '' : ' – недостъпна'}" aria-pressed="${selected}"` +
					`${enabled ? '' : ' disabled'} tabindex="${tabbable ? 0 : -1}">${Number(ymd.slice(8))}</button>`,
			);
		}
		calGrid.innerHTML = cells.join('');
	}
	function shiftMonth(delta: number) {
		const [y, m] = state.month.split('-').map(Number);
		const d = new Date(Date.UTC(y, m - 1 + delta, 1));
		state.month = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
		renderCalendar();
	}
	calPrev.addEventListener('click', () => shiftMonth(-1));
	calNext.addEventListener('click', () => shiftMonth(1));
	calGrid.addEventListener('click', (e) => {
		const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.bk-day');
		if (!btn || btn.disabled) return;
		state.date = btn.dataset.date!;
		state.slot = null;
		const hadFocus = calGrid.contains(document.activeElement);
		renderCalendar();
		if (hadFocus) calGrid.querySelector<HTMLButtonElement>('.bk-day[aria-pressed="true"]')?.focus();
		updateNextButtons();
		void loadTimes();
	});
	// Клавиатура: стрелки между дните, Home/End, PageUp/PageDown между месеците
	calGrid.addEventListener('keydown', (e) => {
		const days = Array.from(calGrid.querySelectorAll<HTMLButtonElement>('.bk-day'));
		const i = days.indexOf(document.activeElement as HTMLButtonElement);
		if (i < 0) return;
		const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 };
		let target: number | null = null;
		if (e.key in moves) {
			let j = i + moves[e.key];
			while (j >= 0 && j < days.length && days[j].disabled) j += Math.sign(moves[e.key]) * (Math.abs(moves[e.key]) === 7 ? 7 : 1);
			target = j;
		} else if (e.key === 'Home') target = days.findIndex((d) => !d.disabled);
		else if (e.key === 'End') target = days.length - 1 - [...days].reverse().findIndex((d) => !d.disabled);
		else if (e.key === 'PageDown' && !calNext.disabled) { e.preventDefault(); shiftMonth(1); calGrid.querySelector<HTMLButtonElement>('.bk-day[tabindex="0"]')?.focus(); return; }
		else if (e.key === 'PageUp' && !calPrev.disabled) { e.preventDefault(); shiftMonth(-1); calGrid.querySelector<HTMLButtonElement>('.bk-day[tabindex="0"]')?.focus(); return; }
		if (target === null || target < 0 || target >= days.length || days[target].disabled) return;
		e.preventDefault();
		days.forEach((d) => d.setAttribute('tabindex', '-1'));
		days[target].setAttribute('tabindex', '0');
		days[target].focus();
	});

	/* ---------- Стъпка 2: часове ---------- */
	function showTimesState(name: string) {
		for (const el of timesStates) el.hidden = el.dataset.timesState !== name;
	}
	function refreshTimesSub() {
		if (!state.date) {
			timesSub.textContent = t('booking.timesPickDate');
			return;
		}
		const dateText = capitalize(longFmt().format(fromYmd(state.date)));
		timesSub.textContent = mode === 'bookings-page' ? t('booking.preferredDate', { date: dateText }) : t('booking.chooseTimeFor', { date: dateText });
		delete timesSub.dataset.i18n;
	}
	async function loadTimes() {
		if (!state.date || !state.service) return;
		refreshTimesSub();
		if (!needsTime()) return;
		if (mode === 'bookings-page') {
			showTimesState('external');
			return;
		}
		const req = ++state.slotsRequest;
		showTimesState('loading');
		try {
			const slots = mode === 'api' ? await fetchSlots(state.service, state.date) : demoSlots(state.service, state.date);
			if (req !== state.slotsRequest) return; // по-нова заявка
			if (!slots.length) { showTimesState('empty'); return; }
			timesList.innerHTML = slots
				.map(
					(s, i) =>
						`<label class="bk-slot"><input class="bk-slot__input" type="radio" name="slot" value="${s.start}" data-label="${s.label}" data-end="${s.end}" ${i === 0 ? '' : ''}/>` +
						`<span class="bk-slot__label">${s.label}</span></label>`,
				)
				.join('');
			if (timesDemo) timesDemo.hidden = mode !== 'demo';
			showTimesState('list');
		} catch (err) {
			console.error(err);
			if (req === state.slotsRequest) showTimesState('error');
		}
	}
	timesList.addEventListener('change', (e) => {
		const input = e.target as HTMLInputElement;
		if (input.name !== 'slot') return;
		state.slot = { start: input.value, end: input.dataset.end ?? '', label: input.dataset.label ?? '' };
		updateNextButtons();
	});

	/* ---------- Навигация ---------- */
	for (const b of nextBtns) {
		b.addEventListener('click', () => {
			if (state.step === 1) {
				if (!state.service) return;
				if (needsTime()) {
					renderCalendar();
					if (state.date) void loadTimes();
					else showTimesState('idle');
					showStep(2);
				} else {
					state.date = null;
					state.slot = null;
					fillSummary();
					showStep(3);
				}
			} else if (state.step === 2) {
				fillSummary();
				showStep(3);
			}
		});
	}
	for (const b of backBtns) {
		b.addEventListener('click', () => {
			if (state.step === 3) showStep(needsTime() ? 2 : 1);
			else if (state.step === 2) showStep(1);
		});
	}

	/* ---------- Стъпка 3: валидиране и изпращане ---------- */
	const fields = Array.from(form.querySelectorAll<FieldEl>('#f-name, #f-email, #f-phone, #f-topic, #f-message, #f-consent'));
	for (const el of fields) {
		el.addEventListener('blur', () => setError(el, validateField(el)));
		el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') setError(el, validateField(el)); });
	}

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		if (state.step !== 3) return;
		failure.hidden = true;
		const hp = form.querySelector<HTMLInputElement>('input[name="website"]');
		if (hp && hp.value) return; // honeypot

		let firstInvalid: FieldEl | null = null;
		for (const el of fields) {
			const err = validateField(el);
			setError(el, err);
			if (err && !firstInvalid) firstInvalid = el;
		}
		if (firstInvalid) {
			firstInvalid.focus();
			status.textContent = t('booking.fixFields');
			return;
		}

		const data = new FormData(form);
		const service = state.service!;
		const payload = {
			type: 'booking-request',
			provider: CFG.provider,
			service,
			serviceName: t(`booking.services.${service}.name`, undefined, 'bg'),
			durationMinutes: CFG.services[service].duration,
			date: state.date,
			slotStart: state.slot?.start ?? null,
			slotEnd: state.slot?.end || null,
			timezone: TZ,
			name: String(data.get('name') ?? '').trim(),
			email: String(data.get('email') ?? '').trim(),
			phone: String(data.get('phone') ?? '').trim(),
			topic: String(data.get('topic') ?? ''),
			topicLabel: (() => { const v = String(data.get('topic') ?? ''); return v ? (v === 'other' ? t('services.other') : t(`services.items.${v}.title`)) : ''; })(),
			language: getLang(),
			message: String(data.get('message') ?? '').trim(),
			consent: data.get('consent') === 'on',
			page: location.href,
			submittedAt: new Date().toISOString(),
		};

		// Без API за резервации: отваря Microsoft Bookings (синхронно, за да не бъде блокирано като pop-up)
		const handOff = needsTime() && !CFG.createUrl && Boolean(CFG.bookingPageUrl);
		if (handOff) window.open(CFG.bookingPageUrl, '_blank', 'noopener');

		form.classList.add('is-submitting');
		submitBtn.setAttribute('aria-disabled', 'true');
		status.textContent = t('booking.sending');
		try {
			if (CFG.createUrl) await postJson(CFG.createUrl, payload);
			else if (CFG.requestUrl) await postJson(CFG.requestUrl, payload);
			else {
				// ДЕМО РЕЖИМ – няма свързан backend. Виж src/config/booking.ts и .env.example.
				console.warn('[HINKOV LAW] Резервацията е в демо режим: няма PUBLIC_BOOKING_CREATE_URL / PUBLIC_CONTACT_ENDPOINT. Данните НЕ са изпратени.', payload);
				await new Promise((r) => setTimeout(r, 600));
			}
			const successKey = handOff ? 'booking.successHandOff' : needsTime() && !CFG.createUrl ? 'booking.successTbc' : 'booking.successDefault';
			successText.dataset.i18n = successKey;
			successText.textContent = t(successKey);
			if (successBookings) successBookings.hidden = !needsTime();
			form.hidden = true;
			success.hidden = false;
			success.focus();
			for (const el of progress) el.dataset.state = 'done';
		} catch (err) {
			console.error(err);
			failure.hidden = false;
			status.textContent = '';
		} finally {
			form.classList.remove('is-submitting');
			submitBtn.removeAttribute('aria-disabled');
		}
	});

	// Смяна на езика: пререндира динамичните текстове (календар, часове, обобщение, грешки)
	document.addEventListener('langchange', () => {
		renderCalendar();
		if (state.date) refreshTimesSub();
		if (state.step === 3) fillSummary();
		setProgress();
		for (const el of fields) if (el.getAttribute('aria-invalid') === 'true') setError(el, validateField(el));
		if (status.textContent) status.textContent = '';
	});

	// Начално състояние
	renderCalendar();
	showStep(1, false);
}
