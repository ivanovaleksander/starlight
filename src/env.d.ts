/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PUBLIC_SITE_URL?: string;
	readonly PUBLIC_CONTACT_ENDPOINT?: string;
}

interface ImportMetaEnv {
	/** Публична страница в Microsoft Bookings (виж src/config/booking.ts). */
	readonly PUBLIC_BOOKING_PAGE_URL?: string;
	/** GET ?service=&date=YYYY-MM-DD → { slots: [{ start, end }] } */
	readonly PUBLIC_BOOKING_AVAILABILITY_URL?: string;
	/** POST JSON с данните на резервацията */
	readonly PUBLIC_BOOKING_CREATE_URL?: string;
}
