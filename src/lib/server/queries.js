import { db } from './db.js';
import { aggregate, DEFAULT_MEAN } from '../rating.js';
import { CATEGORIES } from '../templates.js';

const parse = (r) => ({ ...r, criteria: r.criteria ? JSON.parse(r.criteria) : {} });

export function categoryMeans() {
	const rows = db
		.prepare(
			`SELECT i.category c, AVG(r.rating) m FROM reviews r JOIN items i ON i.id=r.item_id
       WHERE r.status='published' GROUP BY i.category`
		)
		.all();
	return Object.fromEntries(rows.map((r) => [r.c, r.m]));
}

export function publishedReviews(itemId) {
	return db
		.prepare(
			`SELECT r.*, u.name user_name, u.trust FROM reviews r JOIN users u ON u.id=r.user_id
       WHERE r.item_id=? AND r.status='published'`
		)
		.all(itemId)
		.map(parse);
}

export function summarize(item, means = categoryMeans()) {
	const reviews = publishedReviews(item.id);
	const keys = CATEGORIES[item.category]?.criteria.map((c) => c.key) ?? [];
	return { ...aggregate(reviews, means[item.category] ?? DEFAULT_MEAN, keys), reviews };
}

/** Items with computed scores. Fine for MVP scale; cache in a table when catalog grows. */
export function listItems({ q = '', cat = 'all', limit = 50, sort = 'score' } = {}) {
	const params = [];
	let where = `status='active'`;
	if (cat !== 'all' && CATEGORIES[cat]) {
		where += ' AND category=?';
		params.push(cat);
	}
	if (q) {
		where += ' AND (name LIKE ? OR barcode = ?)';
		params.push(`%${q.replace(/[%_]/g, '')}%`, q);
	}
	const means = categoryMeans();
	const rows = db.prepare(`SELECT * FROM items WHERE ${where} LIMIT 500`).all(...params);
	const out = rows.map((it) => {
		const s = summarize(it, means);
		return { ...it, score: s.score, n: s.n };
	});
	if (sort === 'score') out.sort((a, b) => (b.n > 0) - (a.n > 0) || b.score - a.score);
	if (sort === 'name') out.sort((a, b) => a.name.localeCompare(b.name));
	return out.slice(0, limit);
}

export function latestReviews(limit = 6) {
	return db
		.prepare(
			`SELECT r.*, u.name user_name, i.name item_name, i.category item_category,
         (SELECT COUNT(*) FROM votes v WHERE v.review_id=r.id) helpful
       FROM reviews r JOIN users u ON u.id=r.user_id JOIN items i ON i.id=r.item_id
       WHERE r.status='published' ORDER BY r.published_at DESC LIMIT ?`
		)
		.all(limit)
		.map(parse);
}

export function helpfulCounts(ids) {
	if (!ids.length) return {};
	const rows = db
		.prepare(`SELECT review_id, COUNT(*) n FROM votes WHERE review_id IN (${ids.map(() => '?').join(',')}) GROUP BY review_id`)
		.all(...ids);
	return Object.fromEntries(rows.map((r) => [r.review_id, r.n]));
}

export function votedBy(userId, ids) {
	if (!userId || !ids.length) return [];
	return db
		.prepare(`SELECT review_id FROM votes WHERE user_id=? AND review_id IN (${ids.map(() => '?').join(',')})`)
		.all(userId, ...ids)
		.map((r) => r.review_id);
}
