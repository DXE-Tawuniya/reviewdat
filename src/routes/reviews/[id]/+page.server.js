import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';

export function load({ params, locals, url }) {
	const r = db
		.prepare(
			`SELECT r.*, i.name item_name, i.category item_category, u.name user_name, p.confidence, p.status proof_status
       FROM reviews r JOIN items i ON i.id=r.item_id JOIN users u ON u.id=r.user_id LEFT JOIN proofs p ON p.id=r.proof_id
       WHERE r.id=?`
		)
		.get(Number(params.id));
	const isOwner = r && locals.user?.id === r.user_id;
	const isAdmin = locals.user?.role === 'admin';
	if (!r || (r.status !== 'published' && !isOwner && !isAdmin)) error(404, 'Review not found');
	return {
		review: { ...r, criteria: JSON.parse(r.criteria) },
		isOwner,
		justPosted: url.searchParams.has('new')
	};
}
