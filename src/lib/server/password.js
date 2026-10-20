import crypto from 'node:crypto';

export function hashPassword(pw) {
	const salt = crypto.randomBytes(16).toString('hex');
	const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
	return `${salt}:${hash}`;
}

export function verifyPassword(pw, stored) {
	const [salt, hash] = String(stored).split(':');
	if (!salt || !hash) return false;
	const a = crypto.scryptSync(pw, salt, 64);
	const b = Buffer.from(hash, 'hex');
	return a.length === b.length && crypto.timingSafeEqual(a, b);
}
