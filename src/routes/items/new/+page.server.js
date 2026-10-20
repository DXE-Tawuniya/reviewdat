import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { requireUser } from '$lib/server/auth.js';
import { storeUpload } from '$lib/server/proofs.js';
import { CATEGORIES } from '$lib/templates.js';

export function load({ locals, url }) {
	requireUser(locals, url);
	return { name: url.searchParams.get('name') ?? '' };
}

const validUrl = (s) => {
	try {
		const u = new URL(s);
		return u.protocol === 'https:' || u.protocol === 'http:';
	} catch {
		return false;
	}
};

export const actions = {
	default: async ({ request, locals, url }) => {
		const user = requireUser(locals, url);
		const fd = await request.formData();
		const name = String(fd.get('name') ?? '').trim().slice(0, 140);
		const category = String(fd.get('category') ?? '');
		const region = String(fd.get('region') ?? 'Global').trim().slice(0, 60) || 'Global';
		const link = String(fd.get('link') ?? '').trim();
		const barcode = String(fd.get('barcode') ?? '').replace(/\s/g, '');
		const photo = fd.get('photo');
		const values = { name, category, region, link, barcode };

		if (name.length < 3) return fail(400, { ...values, error: 'Name needs at least 3 characters' });
		if (!CATEGORIES[category]) return fail(400, { ...values, error: 'Pick a category' });
		if (!link && !barcode) return fail(400, { ...values, error: 'Proof of existence: add a link or a barcode' });
		if (link && !validUrl(link)) return fail(400, { ...values, error: 'Link must start with https://' });
		if (barcode && !/^\d{8,14}$/.test(barcode)) return fail(400, { ...values, error: 'Barcode must be 8–14 digits' });

		// Dedupe: same name in category, or same barcode
		const existing = db
			.prepare(`SELECT id FROM items WHERE (lower(name)=lower(?) AND category=?) OR (barcode IS NOT NULL AND barcode=?)`)
			.get(name, category, barcode || null);
		if (existing) redirect(303, `/items/${existing.id}?dup=1`);

		let photoName = null;
		if (photo instanceof File && photo.size > 0) {
			const up = await storeUpload(photo);
			if (!up.ok) return fail(400, { ...values, error: up.error });
			photoName = up.file.name;
		}

		const id = db
			.prepare(`INSERT INTO items (name,category,region,link,barcode,photo,status,created_by,created_at) VALUES (?,?,?,?,?,?,'active',?,?)`)
			.run(name, category, region, link || null, barcode || null, photoName, user.id, Date.now()).lastInsertRowid;
		redirect(303, `/items/${id}/review`);
	}
};
