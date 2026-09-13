/**
 * Централна конфигурация на сайта – само НЕтекстови данни (връзки, контакти, ключове).
 * Всички потребителски текстове са в src/locales/bg.json и src/locales/en.json
 * и се четат чрез t('ключ') от src/i18n.
 */

export const site = {
	brand: 'HINKOV LAW',
	linkedin: 'https://www.linkedin.com/in/todor-hinkov-4b448a88',
	/** Данни от Единния адвокатски регистър (Висш адвокатски съвет). */
	registryNumber: '1000137640',
	/** Първо вписване в регистъра на колегията: 01.07.2013 г. */
	memberSince: '2013',
	seo: { ogImage: '/og.png' },
	/** Контактни данни (по Единния адвокатски регистър). */
	contact: {
		phone: '+359 896 306 246' as string | null,
		email: 'todor_hinkov@abv.bg' as string | null,
		/** Работно време – ключ в локалите или null, докато не е предоставено. */
		hoursKey: null as string | null,
		postalCode: '4000',
		/**
		 * Връзка към картата (отваря се в нов прозорец). Не се вгражда iframe,
		 * за да не се зареждат бисквитки на трети страни без съгласие.
		 */
		mapUrl:
			'https://www.google.com/maps/search/?api=1&query=' +
			encodeURIComponent('ул. Кресна 5, 4000 Пловдив, България'),
		/** Ако бъде решено да се вгради карта, задайте embed URL и обновете Политиката за бисквитки. */
		mapEmbedUrl: null as string | null,
	},
} as const;

export type NavItem = { key: string; href: string; id: string };

export const nav: NavItem[] = [
	{ key: 'nav.home', href: '#nachalo', id: 'nachalo' },
	{ key: 'nav.about', href: '#za-men', id: 'za-men' },
	{ key: 'nav.services', href: '#uslugi', id: 'uslugi' },
	{ key: 'nav.audiences', href: '#kogo-predstavlyavam', id: 'kogo-predstavlyavam' },
	{ key: 'nav.publications', href: '#publikacii', id: 'publikacii' },
	{ key: 'nav.contact', href: '#kontakti', id: 'kontakti' },
];

export type ServiceKey = 'civil' | 'administrative' | 'commercial' | 'property' | 'litigation';
export type Service = {
	key: ServiceKey;
	icon: 'file-text' | 'building' | 'briefcase' | 'key-round' | 'shield-check';
};

/** Заглавие: services.items.<key>.title · описание: services.items.<key>.desc */
export const services: Service[] = [
	{ key: 'civil', icon: 'file-text' },
	{ key: 'administrative', icon: 'building' },
	{ key: 'commercial', icon: 'briefcase' },
	{ key: 'property', icon: 'key-round' },
	{ key: 'litigation', icon: 'shield-check' },
];

export type LegalKey = 'privacy' | 'cookies' | 'legal' | 'accessibility';
export type LegalDoc = { key: LegalKey; href: string };

/**
 * Правни документи. Всеки има самостоятелна страница (href) и се показва
 * и в модалния прозорец на началната страница (LegalDialog.astro).
 * Текстове: legal.docs.<key>.{title,description,basis}
 */
export const legalList: LegalDoc[] = [
	{ key: 'privacy', href: '/politika-za-poveritelnost' },
	{ key: 'cookies', href: '/politika-za-biskvitki' },
	{ key: 'legal', href: '/pravna-informacia' },
	{ key: 'accessibility', href: '/deklaracia-za-dostapnost' },
];
export const legalDocs = Object.fromEntries(legalList.map((d) => [d.key, d])) as Record<LegalKey, LegalDoc>;
