import { redirect } from '@sveltejs/kit';
import { deleteSession, COOKIE } from '$lib/server/auth.js';

export function POST({ cookies }) {
	const sid = cookies.get(COOKIE);
	if (sid) deleteSession(sid);
	cookies.delete(COOKIE, { path: '/' });
	redirect(303, '/');
}
