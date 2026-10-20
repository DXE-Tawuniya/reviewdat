import { listItems } from '$lib/server/queries.js';

export function load({ url }) {
	const q = (url.searchParams.get('q') ?? '').trim().slice(0, 100);
	return { q, results: listItems({ q, limit: q ? 30 : 8, sort: q ? 'name' : 'score' }) };
}
