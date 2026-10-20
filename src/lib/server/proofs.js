import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { UPLOAD_DIR, db } from './db.js';

export const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/heic': 'heic',
	'application/pdf': 'pdf',
	'message/rfc822': 'eml',
	'text/plain': 'txt'
};

/**
 * Read, validate and store an uploaded file privately (never served publicly).
 * @returns {Promise<{ok:true,file:{name:string,hash:string,mime:string,size:number}}|{ok:false,error:string}>}
 */
export async function storeUpload(file, { allowEmail = false } = {}) {
	if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'Attach a file' };
	if (file.size > MAX_BYTES) return { ok: false, error: 'File too large (8 MB max)' };
	const ext = TYPES[file.type];
	const isEmail = file.type === 'message/rfc822' || file.type === 'text/plain';
	if (!ext || (isEmail && !allowEmail)) return { ok: false, error: 'Use JPG, PNG, WEBP, HEIC or PDF' };
	const buf = Buffer.from(await file.arrayBuffer());
	const hash = crypto.createHash('sha256').update(buf).digest('hex');
	const name = `${hash}.${ext}`;
	const dest = path.join(UPLOAD_DIR, name);
	if (!fs.existsSync(dest)) fs.writeFileSync(dest, buf);
	return { ok: true, file: { name, hash, mime: file.type, size: file.size } };
}

/** Duplicate receipt detection: same file bytes already used as proof. */
export function isDuplicateProof(hash) {
	return !!db.prepare('SELECT 1 FROM proofs WHERE file_hash=?').get(hash);
}

/**
 * MVP verification: mock auto-approve.
 * Real pipeline later: OCR (merchant, date, amount, item) → fraud signals → confidence → manual queue.
 */
export function verifyProof({ method, size }) {
	const base = { receipt: 0.86, email: 0.92, invoice: 0.84, booking: 0.9 }[method] ?? 0.8;
	const confidence = Math.min(0.99, base + (size > 50_000 ? 0.04 : 0));
	return { status: 'approved', confidence: Math.round(confidence * 100) / 100 };
}

/** Velocity limit: max reviews per user per 24h. */
export const MAX_REVIEWS_PER_DAY = 5;
export function overVelocity(userId) {
	const n = db
		.prepare('SELECT COUNT(*) n FROM reviews WHERE user_id=? AND created_at>?')
		.get(userId, Date.now() - 864e5).n;
	return n >= MAX_REVIEWS_PER_DAY;
}
