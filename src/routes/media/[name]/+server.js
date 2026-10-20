import { error } from '@sveltejs/kit';
import fs from 'node:fs';
import path from 'node:path';
import { db, UPLOAD_DIR } from '$lib/server/db.js';

const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic' };

/** Public media: item photos only. Proof files are never served here. */
export function GET({ params }) {
	const name = params.name;
	if (!/^[a-f0-9]{64}\.(jpg|png|webp|heic)$/.test(name)) error(404);
	if (!db.prepare(`SELECT 1 FROM items WHERE photo=? AND status='active'`).get(name)) error(404);
	const file = path.join(UPLOAD_DIR, name);
	if (!fs.existsSync(file)) error(404);
	return new Response(fs.readFileSync(file), {
		headers: { 'content-type': MIME[name.split('.').pop()], 'cache-control': 'public, max-age=31536000, immutable' }
	});
}
