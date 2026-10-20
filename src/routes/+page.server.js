import { listItems, latestReviews, votedBy } from '$lib/server/queries.js';
import { CATEGORIES } from '$lib/templates.js';

export function load({ url, locals }) {
	const cat = CATEGORIES[url.searchParams.get('cat')] ? url.searchParams.get('cat') : 'all';
	const recent = latestReviews(5);
	return {
		cat,
		top: listItems({ cat, limit: 5 }),
		recent,
		voted: votedBy(locals.user?.id, recent.map((r) => r.id))
	};
}
