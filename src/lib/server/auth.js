import crypto from 'node:crypto';
import { redirect } from '@sveltejs/kit';
import { db } from './db.js';

const SESSION_DAYS = 30;
export const COOKIE = 'sid';

export function createSession(userId) {
	const id = crypto.randomBytes(32).toString('hex');
	const expires = Date.now() + SESSION_DAYS * 864e5;
	db.prepare('INSERT INTO sessions (id,user_id,expires_at) VALUES (?,?,?)').run(id, userId, expires);
	return { id, expires: new Date(expires) };
}

export function getSessionUser(id) {
	return (
		db
			.prepare(
				`SELECT u.id,u.name,u.email,u.role,u.trust FROM sessions s JOIN users u ON u.id=s.user_id
         WHERE s.id=? AND s.expires_at>?`
			)
			.get(id, Date.now()) ?? null
	);
}

export function deleteSession(id) {
	db.prepare('DELETE FROM sessions WHERE id=?').run(id);
}

export function setSessionCookie(cookies, session) {
	cookies.set(COOKIE, session.id, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production' && process.env.INSECURE_COOKIES !== '1',
		expires: session.expires
	});
}

/** Redirect guests to sign-in, returning them to `url` afterwards. */
export function requireUser(locals, url) {
	if (!locals.user) redirect(303, `/login?next=${encodeURIComponent(url.pathname + url.search)}`);
	return locals.user;
}

export function requireAdmin(locals, url) {
	const u = requireUser(locals, url);
	if (u.role !== 'admin') redirect(303, '/');
	return u;
}

/** Only allow local redirect targets. */
export function safeNext(next) {
	return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}
