import { getSessionUser, COOKIE } from '$lib/server/auth.js';

export async function handle({ event, resolve }) {
	const sid = event.cookies.get(COOKIE);
	event.locals.user = sid ? getSessionUser(sid) : null;
	event.locals.lang = event.cookies.get('lang') === 'ar' ? 'ar' : 'en';
	const lang = event.locals.lang;
	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('%rd.lang%', lang).replace('%rd.dir%', lang === 'ar' ? 'rtl' : 'ltr')
	});
}
