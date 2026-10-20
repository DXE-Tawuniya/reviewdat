// Review templates per category. Category decides steps, criteria and accepted proof methods.
// Add a category here and the wizard, validation and aggregation pick it up.

/** @typedef {{key:string,en:string,ar:string}} Criterion */

export const PROOF_METHODS = {
	receipt: { en: 'Receipt photo / PDF', ar: 'صورة إيصال أو PDF', weight: 1 },
	email: { en: 'Order or subscription email', ar: 'بريد الطلب أو الاشتراك', weight: 1.2 },
	invoice: { en: 'Invoice / booking number', ar: 'رقم الفاتورة أو الحجز', weight: 1 },
	booking: { en: 'Booking confirmation', ar: 'تأكيد الحجز', weight: 1.1 }
};

export const CATEGORIES = {
	product: {
		en: 'Products',
		ar: 'منتجات',
		icon: '📦',
		criteria: [
			{ key: 'quality', en: 'Quality', ar: 'الجودة' },
			{ key: 'value', en: 'Value', ar: 'القيمة' },
			{ key: 'durability', en: 'Durability', ar: 'المتانة' },
			{ key: 'accuracy', en: 'Matches listing', ar: 'مطابقة للوصف' }
		],
		extra: {
			key: 'usage',
			en: 'How long have you used it?',
			ar: 'منذ متى تستخدمه؟',
			options: [
				{ value: 'lt1m', en: 'Under a month', ar: 'أقل من شهر' },
				{ value: '1to6m', en: '1–6 months', ar: '١–٦ أشهر' },
				{ value: 'gt6m', en: '6+ months', ar: 'أكثر من ٦ أشهر' }
			]
		},
		prosCons: true,
		proofs: ['receipt', 'email']
	},
	service: {
		en: 'Services',
		ar: 'خدمات',
		icon: '🛠',
		criteria: [
			{ key: 'pro', en: 'Professionalism', ar: 'الاحترافية' },
			{ key: 'time', en: 'Timeliness', ar: 'الالتزام بالوقت' },
			{ key: 'price', en: 'Price fairness', ar: 'عدالة السعر' },
			{ key: 'outcome', en: 'Outcome', ar: 'النتيجة' }
		],
		extra: {
			key: 'when',
			en: 'When was the service?',
			ar: 'متى كانت الخدمة؟',
			options: [
				{ value: 'week', en: 'This week', ar: 'هذا الأسبوع' },
				{ value: 'month', en: 'This month', ar: 'هذا الشهر' },
				{ value: 'older', en: 'Earlier', ar: 'قبل ذلك' }
			]
		},
		prosCons: false,
		proofs: ['invoice', 'receipt']
	},
	place: {
		en: 'Places',
		ar: 'أماكن',
		icon: '📍',
		criteria: [
			{ key: 'clean', en: 'Cleanliness', ar: 'النظافة' },
			{ key: 'staff', en: 'Staff', ar: 'الموظفون' },
			{ key: 'location', en: 'Location', ar: 'الموقع' },
			{ key: 'value', en: 'Value', ar: 'القيمة' }
		],
		extra: {
			key: 'visit',
			en: 'Visit type',
			ar: 'نوع الزيارة',
			options: [
				{ value: 'solo', en: 'Solo', ar: 'فردي' },
				{ value: 'family', en: 'Family', ar: 'عائلي' },
				{ value: 'business', en: 'Business', ar: 'عمل' }
			]
		},
		prosCons: false,
		proofs: ['receipt', 'booking']
	},
	digital: {
		en: 'Software',
		ar: 'برمجيات',
		icon: '💻',
		criteria: [
			{ key: 'ease', en: 'Ease of use', ar: 'سهولة الاستخدام' },
			{ key: 'reliable', en: 'Reliability', ar: 'الاعتمادية' },
			{ key: 'support', en: 'Support', ar: 'الدعم' },
			{ key: 'value', en: 'Value', ar: 'القيمة' }
		],
		extra: {
			key: 'usage',
			en: 'How long have you used it?',
			ar: 'منذ متى تستخدمه؟',
			options: [
				{ value: 'lt1m', en: 'Under a month', ar: 'أقل من شهر' },
				{ value: '1to12m', en: '1–12 months', ar: '١–١٢ شهرًا' },
				{ value: 'gt1y', en: 'Over a year', ar: 'أكثر من سنة' }
			]
		},
		prosCons: true,
		proofs: ['email', 'receipt']
	}
};

/** Wizard step ids for a category, in order. */
export function stepsFor(category) {
	const c = CATEGORIES[category];
	return ['proof', 'extra', 'criteria', ...(c.prosCons ? ['proscons'] : []), 'text'];
}

export const MIN_TEXT = 30;

/**
 * Validate a submitted review against its template.
 * @returns {{ok:true,value:object}|{ok:false,error:string}}
 */
export function validateReview(category, input) {
	const c = CATEGORIES[category];
	if (!c) return { ok: false, error: 'Unknown category' };
	if (!c.proofs.includes(input.method)) return { ok: false, error: 'Choose a proof method' };
	if (!c.extra.options.some((o) => o.value === input.extra))
		return { ok: false, error: 'Answer: ' + c.extra.en };
	const criteria = {};
	for (const cr of c.criteria) {
		const v = Number(input.criteria?.[cr.key]);
		if (!Number.isInteger(v) || v < 1 || v > 5) return { ok: false, error: 'Rate: ' + cr.en };
		criteria[cr.key] = v;
	}
	const rating = Number(input.rating);
	if (!Number.isInteger(rating) || rating < 1 || rating > 5)
		return { ok: false, error: 'Overall rating required' };
	const text = String(input.text ?? '').trim();
	if (text.length < MIN_TEXT) return { ok: false, error: `Review needs at least ${MIN_TEXT} characters` };
	if (text.length > 5000) return { ok: false, error: 'Review too long (5000 max)' };
	return {
		ok: true,
		value: {
			method: input.method,
			extra: input.extra,
			criteria,
			rating,
			text,
			pros: c.prosCons ? String(input.pros ?? '').trim().slice(0, 300) : '',
			cons: c.prosCons ? String(input.cons ?? '').trim().slice(0, 300) : ''
		}
	};
}
