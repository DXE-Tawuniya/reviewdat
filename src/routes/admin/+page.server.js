import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { requireAdmin } from '$lib/server/auth.js';

export function load({ locals, url }) {
	requireAdmin(locals, url);
	const reports = db
		.prepare(
			`SELECT rp.review_id, COUNT(*) n, GROUP_CONCAT(DISTINCT rp.reason) reasons, r.text, r.rating, r.status,
         i.name item_name, i.id item_id, u.name author
       FROM reports rp JOIN reviews r ON r.id=rp.review_id JOIN items i ON i.id=r.item_id JOIN users u ON u.id=r.user_id
       WHERE rp.status='open' GROUP BY rp.review_id ORDER BY n DESC`
		)
		.all();
	const hidden = db
		.prepare(
			`SELECT r.id, r.text, r.rating, i.name item_name, u.name author FROM reviews r
       JOIN items i ON i.id=r.item_id JOIN users u ON u.id=r.user_id WHERE r.status='hidden' ORDER BY r.id DESC LIMIT 50`
		)
		.all();
	const proofs = db
		.prepare(
			`SELECT p.id, p.method, p.confidence, p.status, p.mime, p.size, p.created_at, u.name author, i.name item_name
       FROM proofs p JOIN users u ON u.id=p.user_id JOIN items i ON i.id=p.item_id ORDER BY p.id DESC LIMIT 30`
		)
		.all();
	const stats = db
		.prepare(
			`SELECT (SELECT COUNT(*) FROM users) users, (SELECT COUNT(*) FROM items) items,
         (SELECT COUNT(*) FROM reviews WHERE status='published') published, (SELECT COUNT(*) FROM reports WHERE status='open') open`
		)
		.get();
	return { reports, hidden, proofs, stats };
}

const id = async (request) => Number((await request.formData()).get('review_id'));

export const actions = {
	hide: async ({ request, locals, url }) => {
		requireAdmin(locals, url);
		const rid = await id(request);
		const r = db.prepare('SELECT user_id FROM reviews WHERE id=?').get(rid);
		if (!r) return fail(404);
		db.transaction(() => {
			db.prepare(`UPDATE reviews SET status='hidden' WHERE id=?`).run(rid);
			db.prepare(`UPDATE reports SET status='upheld' WHERE review_id=? AND status='open'`).run(rid);
			db.prepare('UPDATE users SET trust=MAX(0,trust-10) WHERE id=?').run(r.user_id);
		})();
		return { ok: true };
	},
	dismiss: async ({ request, locals, url }) => {
		requireAdmin(locals, url);
		db.prepare(`UPDATE reports SET status='dismissed' WHERE review_id=? AND status='open'`).run(await id(request));
		return { ok: true };
	},
	restore: async ({ request, locals, url }) => {
		requireAdmin(locals, url);
		db.prepare(`UPDATE reviews SET status='published', published_at=COALESCE(published_at,?) WHERE id=? AND status='hidden'`).run(Date.now(), await id(request));
		return { ok: true };
	}
};
