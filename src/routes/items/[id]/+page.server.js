import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { summarize, helpfulCounts, votedBy } from '$lib/server/queries.js';

function getItem(id) {
	const item = db.prepare(`SELECT * FROM items WHERE id=? AND status!='removed'`).get(Number(id));
	if (!item) error(404, 'Item not found');
	return item;
}

export function load({ params, url, locals }) {
	const item = getItem(params.id);
	const { reviews, ...summary } = summarize(item);
	const sort = ['newest', 'highest', 'lowest', 'helpful'].includes(url.searchParams.get('sort')) ? url.searchParams.get('sort') : 'newest';
	const ids = reviews.map((r) => r.id);
	const counts = helpfulCounts(ids);
	const list = reviews.map((r) => ({ ...r, item_category: item.category, helpful: counts[r.id] ?? 0 }));
	const sorters = {
		newest: (a, b) => b.published_at - a.published_at,
		highest: (a, b) => b.rating - a.rating || b.published_at - a.published_at,
		lowest: (a, b) => a.rating - b.rating || b.published_at - a.published_at,
		helpful: (a, b) => b.helpful - a.helpful
	};
	list.sort(sorters[sort]);
	const mine = locals.user
		? db.prepare('SELECT id,status FROM reviews WHERE item_id=? AND user_id=?').get(item.id, locals.user.id)
		: null;
	let host = null;
	try { if (item.link) host = new URL(item.link).hostname; } catch { /* invalid link */ }
	return { item, host, summary, reviews: list, sort, voted: votedBy(locals.user?.id, ids), mine };
}

function needUser(locals, params) {
	if (!locals.user) redirect(303, `/login?next=/items/${params.id}`);
	return locals.user;
}

function getReview(itemId, reviewId) {
	return db.prepare(`SELECT * FROM reviews WHERE id=? AND item_id=? AND status='published'`).get(Number(reviewId), Number(itemId));
}

export const actions = {
	helpful: async ({ request, locals, params }) => {
		const user = needUser(locals, params);
		const id = (await request.formData()).get('review_id');
		const r = getReview(params.id, id);
		if (!r) return fail(404, { error: 'Review not found' });
		if (r.user_id === user.id) return fail(400, { error: 'Cannot vote on own review' });
		const del = db.prepare('DELETE FROM votes WHERE review_id=? AND user_id=?').run(r.id, user.id);
		if (!del.changes) db.prepare('INSERT INTO votes (review_id,user_id) VALUES (?,?)').run(r.id, user.id);
		return { ok: true };
	},
	report: async ({ request, locals, params }) => {
		const user = needUser(locals, params);
		const fd = await request.formData();
		const r = getReview(params.id, fd.get('review_id'));
		if (!r) return fail(404, { error: 'Review not found' });
		const reason = String(fd.get('reason') ?? 'flagged').slice(0, 200);
		db.prepare('INSERT OR IGNORE INTO reports (review_id,user_id,reason,created_at) VALUES (?,?,?,?)').run(r.id, user.id, reason, Date.now());
		return { reported: true };
	}
};
