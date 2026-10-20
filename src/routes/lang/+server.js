import { redirect } from '@sveltejs/kit';
import { safeNext } from '$lib/server/auth.js';

export async function POST({ request, cookies }) {
	const fd = await request.formData();
	const lang = fd.get('lang') === 'ar' ? 'ar' : 'en';
	cookies.set('lang', lang, { path: '/', httpOnly: false, sameSite: 'lax', secure: false, maxAge: 60 * 60 * 24 * 365 });
	redirect(303, safeNext(String(fd.get('next') ?? '/')));
}
