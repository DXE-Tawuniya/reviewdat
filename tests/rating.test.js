import { describe, it, expect } from 'vitest';
import { aggregate, reviewWeight, C } from '../src/lib/rating.js';
import { validateReview, stepsFor } from '../src/lib/templates.js';

const now = Date.UTC(2026, 9, 20);
const r = (rating, extra = {}) => ({ rating, created_at: now, trust: 50, proof_method: 'receipt', ...extra });

describe('aggregate', () => {
	it('returns category mean with no reviews', () => {
		const a = aggregate([], 4, [], now);
		expect(a.score).toBe(4);
		expect(a.n).toBe(0);
	});
	it('one 5-star review barely moves the score', () => {
		const a = aggregate([r(5)], 3.5, [], now);
		expect(a.score).toBeGreaterThan(3.5);
		expect(a.score).toBeLessThan(3.7);
		expect(a.confident).toBe(false);
	});
	it('many reviews converge to their mean', () => {
		const a = aggregate(Array.from({ length: 200 }, () => r(5)), 3, [], now);
		expect(a.score).toBeGreaterThan(4.85);
	});
	it('counts distribution and criteria', () => {
		const a = aggregate([r(5, { criteria: { q: 4 } }), r(3, { criteria: { q: 2 } })], 3.5, ['q'], now);
		expect(a.dist).toEqual([1, 0, 1, 0, 0]);
		expect(a.criteria.q).toBe(3);
	});
});

describe('reviewWeight', () => {
	it('stronger proof weighs more', () => {
		expect(reviewWeight(r(5, { proof_method: 'email' }), now)).toBeGreaterThan(reviewWeight(r(5), now));
	});
	it('old reviews decay to a 0.5 floor', () => {
		const old = r(5, { created_at: now - 5 * 365 * 864e5 });
		expect(reviewWeight(old, now)).toBeCloseTo(0.5, 5);
	});
	it('higher trust weighs more', () => {
		expect(reviewWeight(r(5, { trust: 90 }), now)).toBeGreaterThan(reviewWeight(r(5, { trust: 10 }), now));
	});
	it('C is 10', () => expect(C).toBe(10));
});

describe('templates', () => {
	const good = { method: 'receipt', extra: 'gt6m', criteria: { quality: 5, value: 4, durability: 4, accuracy: 5 }, rating: 5, text: 'x'.repeat(40) };
	it('accepts a complete product review', () => expect(validateReview('product', good).ok).toBe(true));
	it('rejects missing criterion', () => {
		const v = validateReview('product', { ...good, criteria: { quality: 5 } });
		expect(v.ok).toBe(false);
	});
	it('rejects short text', () => expect(validateReview('product', { ...good, text: 'short' }).ok).toBe(false));
	it('rejects proof method not allowed for category', () => expect(validateReview('service', { ...good, method: 'email' }).ok).toBe(false));
	it('services skip pros/cons step', () => expect(stepsFor('service')).not.toContain('proscons'));
});
