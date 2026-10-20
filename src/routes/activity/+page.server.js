import { db } from '$lib/server/db.js';
import { requireUser } from '$lib/server/auth.js';

export function load({ locals, url }) {
	const user = requireUser(locals, url);
	const mine = db
		.prepare(
			`SELECT r.*, i.name item_name, i.category item_category, u.name user_name,
         (SELECT COUNT(*) FROM votes v WHERE v.review_id=r.id) helpful
       FROM reviews r JOIN items i ON i.id=r.item_id JOIN users u ON u.id=r.user_id
       WHERE r.user_id=? ORDER BY r.created_at DESC`
		)
		.all(user.id)
		.map((r) => ({ ...r, criteria: JSON.parse(r.criteria) }));
	return { mine };
}
