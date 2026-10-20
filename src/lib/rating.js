import { PROOF_METHODS } from './templates.js';

// Bayesian average: score = (C × m + Σ wᵢrᵢ) / (C + Σ wᵢ)
// C = confidence threshold, m = category mean, wᵢ = per-review weight.
export const C = 10;
export const DEFAULT_MEAN = 3.5;
export const MIN_CONFIDENT = 3;
const DAY = 864e5;

/** Weight = proof strength × recency decay × reviewer trust. */
export function reviewWeight(r, now = Date.now()) {
	const ageDays = Math.max(0, (now - r.created_at) / DAY);
	const recency = Math.max(0.5, 1 - ageDays / 730); // floors at 0.5 after 2 years
	const trust = 0.5 + Math.min(100, Math.max(0, r.trust ?? 50)) / 100; // 0.5–1.5
	const proof = PROOF_METHODS[r.proof_method]?.weight ?? 1;
	return proof * recency * trust;
}

/**
 * @param {Array<{rating:number,created_at:number,trust?:number,proof_method?:string,criteria?:Record<string,number>}>} reviews published reviews only
 * @param {number} mean category mean
 * @param {string[]} criteriaKeys
 */
export function aggregate(reviews, mean = DEFAULT_MEAN, criteriaKeys = [], now = Date.now()) {
	let sw = 0;
	let sr = 0;
	const dist = [0, 0, 0, 0, 0]; // index 0 = 5 stars
	for (const r of reviews) {
		const w = reviewWeight(r, now);
		sw += w;
		sr += w * r.rating;
		dist[5 - r.rating]++;
	}
	const n = reviews.length;
	const score = (C * mean + sr) / (C + sw);
	const raw = n ? reviews.reduce((a, r) => a + r.rating, 0) / n : null;
	const criteria = {};
	for (const k of criteriaKeys) {
		const v = reviews.map((r) => r.criteria?.[k]).filter((x) => x >= 1 && x <= 5);
		criteria[k] = v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
	}
	return { score: Math.round(score * 100) / 100, n, raw, dist, criteria, confident: n >= MIN_CONFIDENT };
}
