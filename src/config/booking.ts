/**
 * Конфигурация на процеса за резервиране на консултация.
 *
 * Astro излага към браузъра само променливи с префикс PUBLIC_ (виж .env.example):
 *   PUBLIC_BOOKING_PAGE_URL          – публичната страница в Microsoft Bookings
 *   PUBLIC_BOOKING_AVAILABILITY_URL  – (по избор) API за реална наличност
 *   PUBLIC_BOOKING_CREATE_URL        – (по избор) API за създаване на резервация
 *
 * Без API за наличност сайтът НЕ показва измислени свободни часове:
 * потребителят избира вид, предпочитана дата и данни, изпраща заявка,
 * а точният час се избира/потвърждава в Microsoft Bookings (bookingPageUrl).
 */

export type ServiceKey = 'office' | 'teams' | 'phone' | 'written';

export interface BookingService {
	name: string;
	/** Продължителност в минути; null = без запазен час (писмена консултация). */
	duration: number | null;
	/** Подтекст в картата за избор. */
	hint: string;
}

export const BOOKING_CONFIG = {
	provider: 'microsoft-bookings',
	bookingPageUrl: import.meta.env.PUBLIC_BOOKING_PAGE_URL || '',
	availabilityUrl: import.meta.env.PUBLIC_BOOKING_AVAILABILITY_URL || '',
	createUrl: import.meta.env.PUBLIC_BOOKING_CREATE_URL || '',
	/** Резервен канал за заявки без API за резервации (същият като контактната форма). */
	requestUrl: import.meta.env.PUBLIC_CONTACT_ENDPOINT || '',
	timezone: 'Europe/Sofia',
	locale: 'bg-BG',
	minimumNoticeHours: 24,
	bufferMinutes: 15,
	/** Колко дни напред може да се избира дата. */
	maxDaysAhead: 60,
	/** Работни дни: 1 = понеделник … 5 = петък. */
	workingDays: [1, 2, 3, 4, 5],
	/** Работни часове – използват се само за ДЕМО наличност в режим на разработка. */
	workingHours: { start: '09:00', end: '17:30', breakStart: '12:30', breakEnd: '13:30' },
	/** Демо часове само при `astro dev` и липса на API. В production никога. */
	demoAvailabilityInDev: true,
	services: {
		office: { name: 'Среща в кантората', duration: 60, hint: '60 мин.' },
		teams: { name: 'Онлайн среща', duration: 45, hint: 'Microsoft Teams · 45 мин.' },
		phone: { name: 'Телефонна консултация', duration: 30, hint: '30 мин.' },
		written: { name: 'Писмена консултация', duration: null, hint: 'Отговор по имейл' },
	} satisfies Record<ServiceKey, BookingService>,
} as const;

export const SERVICE_KEYS = Object.keys(BOOKING_CONFIG.services) as ServiceKey[];

/** Откъде идва наличността на часове. */
export type AvailabilityMode = 'api' | 'demo' | 'bookings-page';

export function getAvailabilityMode(): AvailabilityMode {
	if (BOOKING_CONFIG.availabilityUrl) return 'api';
	if (import.meta.env.DEV && BOOKING_CONFIG.demoAvailabilityInDev) return 'demo';
	return 'bookings-page';
}
