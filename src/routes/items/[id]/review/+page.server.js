import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { requireUser } from '$lib/server/auth.js';
import { storeUpload, isDuplicateProof, verifyProof, overVelocity } from '$lib/server/proofs.js';
import { CATEGORIES, validateReview } from '$lib/templates.js';

function load_item(id) {
	const item = db.prepare(`SELECT * FROM items WHERE id=? AND status='active'`).get(Number(id));
	if (!item) error(404, 'Item not found');
	return item;
}

export function load({ params, locals, url }) {
	const user = requireUser(locals, url);
	const item = load_item(params.id);
	const mine = db.prepare('SELECT id FROM reviews WHERE item_id=? AND user_id=?').get(item.id, user.id);
	if (mine) redirect(303, `/reviews/${mine.id}`);
	if (item.created_by === user.id && db.prepare(`SELECT 1 FROM users WHERE id=? AND role='business'`).get(user.id))
		redirect(303, `/items/${item.id}`); // owners cannot review own items (business accounts: later phase)
	return { item };
}

export const actions = {
	default: async ({ request, params, locals, url }) => {
		const user = requireUser(locals, url);
		const item = load_item(params.id);
		const fd = await request.formData();
		const c = CATEGORIES[item.category];

		const criteria = Object.fromEntries(c.criteria.map((cr) => [cr.key, fd.get('c_' + cr.key)]));
		const v = validateReview(item.category, {
			method: fd.get('method'),
			extra: fd.get('extra'),
			criteria,
			rating: fd.get('rating'),
			text: fd.get('text'),
			pros: fd.get('pros'),
			cons: fd.get('cons')
		});
		if (!v.ok) return fail(400, { error: v.error });

		if (db.prepare('SELECT 1 FROM reviews WHERE item_id=? AND user_id=?').get(item.id, user.id))
			return fail(400, { error: 'You already reviewed this item' });
		if (overVelocity(user.id)) return fail(429, { error: 'Daily review limit reached. Try tomorrow.' });

		const up = await storeUpload(fd.get('proof'), { allowEmail: v.value.method === 'email' });
		if (!up.ok) return fail(400, { error: 'Proof: ' + up.error });
		if (isDuplicateProof(up.file.hash)) return fail(400, { error: 'This proof was already used for another review' });

		const check = verifyProof({ method: v.value.method, size: up.file.size });
		const now = Date.now();
		const reviewStatus = check.status === 'approved' ? 'published' : check.status === 'rejected' ? 'rejected' : 'pending';

		const id = db.transaction(() => {
			const proofId = db
				.prepare(`INSERT INTO proofs (user_id,item_id,method,file_name,file_hash,mime,size,confidence,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)`)
				.run(user.id, item.id, v.value.method, up.file.name, up.file.hash, up.file.mime, up.file.size, check.confidence, check.status, now).lastInsertRowid;
			const rid = db
				.prepare(`INSERT INTO reviews (item_id,user_id,proof_id,proof_method,rating,criteria,extra,text,pros,cons,status,created_at,published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
				.run(item.id, user.id, proofId, v.value.method, v.value.rating, JSON.stringify(v.value.criteria), v.value.extra, v.value.text, v.value.pros, v.value.cons, reviewStatus, now, reviewStatus === 'published' ? now : null).lastInsertRowid;
			if (reviewStatus === 'published') db.prepare('UPDATE users SET trust=MIN(100,trust+2) WHERE id=?').run(user.id);
			return rid;
		})();

		redirect(303, `/reviews/${id}?new=1`);
	}
};
