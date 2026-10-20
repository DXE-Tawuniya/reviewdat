import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { verifyPassword } from '$lib/server/password.js';
import { createSession, setSessionCookie, safeNext } from '$lib/server/auth.js';

export function load({ locals, url }) {
	if (locals.user) redirect(303, safeNext(url.searchParams.get('next')));
	return { next: safeNext(url.searchParams.get('next')) };
}

export const actions = {
	default: async ({ request, cookies }) => {
		const fd = await request.formData();
		const email = String(fd.get('email') ?? '').trim();
		const password = String(fd.get('password') ?? '');
		const next = safeNext(String(fd.get('next') ?? '/'));
		const user = db.prepare('SELECT * FROM users WHERE email=?').get(email);
		if (!user || !verifyPassword(password, user.password_hash))
			return fail(400, { email, error: 'Email or password is wrong' });
		setSessionCookie(cookies, createSession(user.id));
		redirect(303, next);
	}
};
