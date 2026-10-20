import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { hashPassword } from '$lib/server/password.js';
import { createSession, setSessionCookie, safeNext } from '$lib/server/auth.js';

export function load({ locals, url }) {
	if (locals.user) redirect(303, safeNext(url.searchParams.get('next')));
	return { next: safeNext(url.searchParams.get('next')) };
}

export const actions = {
	default: async ({ request, cookies }) => {
		const fd = await request.formData();
		const name = String(fd.get('name') ?? '').trim().slice(0, 40);
		const email = String(fd.get('email') ?? '').trim().toLowerCase();
		const password = String(fd.get('password') ?? '');
		const next = safeNext(String(fd.get('next') ?? '/'));
		if (name.length < 2) return fail(400, { name, email, error: 'Name needs at least 2 characters' });
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(400, { name, email, error: 'Enter a valid email' });
		if (password.length < 8) return fail(400, { name, email, error: 'Password needs at least 8 characters' });
		if (db.prepare('SELECT 1 FROM users WHERE email=?').get(email))
			return fail(400, { name, email, error: 'Email already registered. Sign in instead.' });
		const id = db
			.prepare('INSERT INTO users (name,email,password_hash,created_at) VALUES (?,?,?,?)')
			.run(name, email, hashPassword(password), Date.now()).lastInsertRowid;
		setSessionCookie(cookies, createSession(id));
		redirect(303, next);
	}
};
