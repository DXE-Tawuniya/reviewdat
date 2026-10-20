import { listItems } from '$lib/server/queries.js';
import { CATEGORIES } from '$lib/templates.js';

export function load({ url }) {
	const q = (url.searchParams.get('q') ?? '').trim().slice(0, 100);
	const cat = CATEGORIES[url.searchParams.get('cat')] ? url.searchParams.get('cat') : 'all';
	return { q, cat, results: listItems({ q, cat, limit: 50 }) };
}
