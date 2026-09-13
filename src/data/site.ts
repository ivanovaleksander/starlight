/**
 * Централна конфигурация на сайта.
 * Всички текстове, връзки и данни, които се показват на страницата, са тук,
 * за да могат да се редактират на едно място.
 *
 * Полетата, отбелязани с `PLACEHOLDER`, все още не са предоставени/потвърдени
 * и се показват на сайта като временни обозначения.
 */

export const PLACEHOLDER = 'Предстои да бъде предоставено';

export const site = {
	brand: 'HINKOV LAW',
	person: 'Адвокат Тодор Хинков',
	personShort: 'Тодор Хинков',
	city: 'Пловдив',
	country: 'България',
	tagline: 'Правна защита с ясна стратегия и последователни действия.',
	subtitle:
		'Правни консултации и процесуално представителство за граждани и бизнес.',
	linkedin: 'https://www.linkedin.com/in/todor-hinkov-4b448a88',
	seo: {
		title: 'Адвокат Тодор Хинков | HINKOV LAW – Пловдив',
		description:
			'Правни консултации и процесуално представителство за граждани и бизнес в Пловдив. Гражданско, административно, търговско и вещно право.',
		ogImage: '/og.png',
		locale: 'bg_BG',
	},
	/** Контактни данни – попълнете при предоставяне. */
	contact: {
		address: PLACEHOLDER as string | null,
		phone: PLACEHOLDER as string | null,
		email: PLACEHOLDER as string | null,
		hours: PLACEHOLDER as string | null,
		/** Картата се показва само ако е предоставен точен адрес и embed URL. */
		mapEmbedUrl: null as string | null,
	},
} as const;

export type NavItem = { label: string; href: string; id: string };

export const nav: NavItem[] = [
	{ label: 'Начало', href: '#nachalo', id: 'nachalo' },
	{ label: 'За мен', href: '#za-men', id: 'za-men' },
	{ label: 'Правни услуги', href: '#uslugi', id: 'uslugi' },
	{ label: 'За граждани', href: '#za-grazhdani', id: 'za-grazhdani' },
	{ label: 'За бизнеса', href: '#za-biznesa', id: 'za-biznesa' },
	{ label: 'Публикации', href: '#publikacii', id: 'publikacii' },
	{ label: 'Контакти', href: '#kontakti', id: 'kontakti' },
];

export type Service = {
	slug: string;
	title: string;
	description: string;
	icon: 'file-text' | 'building' | 'briefcase' | 'key-round' | 'shield-check';
};

export const services: Service[] = [
	{
		slug: 'grazhdansko-pravo',
		title: 'Гражданско право',
		description:
			'Договорни отношения, вземания, обезщетения и гражданскоправни спорове.',
		icon: 'file-text',
	},
	{
		slug: 'administrativno-pravo',
		title: 'Административно право',
		description:
			'Защита и обжалване пред държавни, общински и административни органи.',
		icon: 'building',
	},
	{
		slug: 'targovsko-pravo',
		title: 'Търговско право',
		description:
			'Правни консултации, договори, търговски отношения и защита на бизнеса.',
		icon: 'briefcase',
	},
	{
		slug: 'veshtno-pravo',
		title: 'Вещно право',
		description:
			'Собственост, недвижими имоти, съсобственост, делби и вещноправни спорове.',
		icon: 'key-round',
	},
	{
		slug: 'procesualno-predstavitelstvo',
		title: 'Процесуално представителство',
		description:
			'Представителство и защита пред съдилища, административни органи и други компетентни институции.',
		icon: 'shield-check',
	},
];

export const audiences = {
	citizens: {
		id: 'za-grazhdani',
		eyebrow: 'За граждани',
		title: 'Индивидуален подход към всеки казус.',
		text: 'Индивидуален подход, предварителна оценка на казуса и ясна информация за възможните правни действия.',
		points: [
			'Предварителна оценка на казуса',
			'Ясна информация за възможните правни действия',
			'Последователна комуникация на всеки етап',
		],
	},
	business: {
		id: 'za-biznesa',
		eyebrow: 'За бизнеса',
		title: 'Правна подкрепа за уверени бизнес решения.',
		text: 'Правна подкрепа при договорни отношения, търговски спорове, вземания и взаимодействие с административни органи.',
		points: [
			'Договорни отношения и търговски спорове',
			'Вземания и защита на интересите на дружеството',
			'Взаимодействие с административни органи',
		],
	},
} as const;

export const processSteps = [
	{
		title: 'Първоначален контакт',
		text: 'Изпращате запитване или се свързвате по телефон. Уточняваме основните факти и документите, които са налични.',
	},
	{
		title: 'Преглед и оценка на казуса',
		text: 'Преглед на фактите, документите и приложимата правна рамка. Получавате предварителна оценка на възможните действия.',
	},
	{
		title: 'Правна стратегия',
		text: 'Изготвяне на ясна стратегия с конкретни стъпки, срокове и очаквани резултати, съобразени с вашите цели.',
	},
	{
		title: 'Консултация или процесуално представителство',
		text: 'Консултация, подготовка на документи или представителство пред съда и компетентните органи – според нуждите на казуса.',
	},
];

/**
 * ДЕМО СЪДЪРЖАНИЕ – примерни заглавия, които илюстрират оформлението на
 * секцията. Не представляват публикувани становища на адвокат Хинков.
 */
export const publications = [
	{
		category: 'Гражданско право',
		title: 'Какво да проверим преди подписване на договор за наем',
		summary:
			'Основни клаузи, на които наемодателят и наемателят следва да обърнат внимание, преди да поемат задължения.',
		date: '2026-06-02',
		readingTime: 5,
	},
	{
		category: 'Административно право',
		title: 'Обжалване на административен акт: срокове и основни стъпки',
		summary:
			'Практичен преглед на реда за обжалване по административен и по съдебен ред и на сроковете, които не бива да се пропускат.',
		date: '2026-04-14',
		readingTime: 6,
	},
	{
		category: 'Вещно право',
		title: 'Съсобственост и делба: основни положения',
		summary:
			'Кога съсобствениците могат да поискат делба, какви са възможните способи и какви документи са необходими.',
		date: '2026-02-20',
		readingTime: 4,
	},
];

export type LegalDoc = {
	key: 'privacy' | 'cookies' | 'legal' | 'accessibility';
	title: string;
	href: string;
	description: string;
	/** Правна рамка – показва се под заглавието. */
	basis: string;
};

/**
 * Правни документи. Всеки има самостоятелна страница (href) и се показва
 * и в модалния прозорец на началната страница (LegalDialog.astro).
 */
export const legalDocs: Record<LegalDoc['key'], LegalDoc> = {
	privacy: {
		key: 'privacy',
		title: 'Политика за поверителност',
		href: '/politika-za-poveritelnost',
		description:
			'Как HINKOV LAW – Адвокат Тодор Хинков обработва лични данни съгласно Регламент (ЕС) 2016/679 (GDPR) и Закона за защита на личните данни.',
		basis:
			'Регламент (ЕС) 2016/679 (Общ регламент относно защитата на данните – GDPR) и Закон за защита на личните данни (ЗЗЛД).',
	},
	cookies: {
		key: 'cookies',
		title: 'Политика за бисквитки',
		href: '/politika-za-biskvitki',
		description:
			'Каква информация се съхранява на вашето устройство при посещение на уебсайта на HINKOV LAW и как можете да я управлявате.',
		basis:
			'Чл. 4а от Закона за електронните съобщения (ЗЕС), Директива 2002/58/ЕО (ePrivacy) и Регламент (ЕС) 2016/679 (GDPR).',
	},
	legal: {
		key: 'legal',
		title: 'Правна информация',
		href: '/pravna-informacia',
		description:
			'Идентификация на доставчика, професионални правила и условия за ползване на уебсайта на HINKOV LAW – Адвокат Тодор Хинков.',
		basis:
			'Чл. 4 от Закона за електронната търговия (ЗЕТ), Закон за адвокатурата (ЗАдв) и Етичен кодекс на адвоката.',
	},
	accessibility: {
		key: 'accessibility',
		title: 'Декларация за достъпност',
		href: '/deklaracia-za-dostapnost',
		description:
			'Ангажимент на HINKOV LAW – Адвокат Тодор Хинков за достъпност на уебсайта съгласно насоките WCAG 2.2, ниво AA.',
		basis:
			'Доброволна декларация, изготвена по образеца на Директива (ЕС) 2016/2102 и насоките WCAG 2.2 (Web Content Accessibility Guidelines).',
	},
};

export const legalList: LegalDoc[] = Object.values(legalDocs);

export const legalLinks = legalList.map((d) => ({ label: d.title, href: d.href, key: d.key }));

export const contactTopics = [
	...services.map((s) => s.title),
	'Друго',
];
