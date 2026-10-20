import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { seed } from './seed.js';

const DATA_DIR = process.env.DATA_DIR || 'data';
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Reuse one connection across Vite dev reloads; reopening on every reload leaks native handles.
export const db = (globalThis.__reviewdatDb ??= new Database(path.join(DATA_DIR, 'reviewdat.db')));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',          -- user | admin
  trust INTEGER NOT NULL DEFAULT 50,          -- 0..100
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Global',
  link TEXT,
  barcode TEXT,
  photo TEXT,                                 -- stored filename
  status TEXT NOT NULL DEFAULT 'active',      -- active | pending | removed
  created_by INTEGER REFERENCES users(id),
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS items_name_cat ON items(lower(name), category);
CREATE TABLE IF NOT EXISTS proofs (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  item_id INTEGER NOT NULL REFERENCES items(id),
  method TEXT NOT NULL,
  file_name TEXT,
  file_hash TEXT,
  mime TEXT,
  size INTEGER,
  confidence REAL NOT NULL,
  status TEXT NOT NULL,                       -- approved | review | rejected
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS proofs_hash ON proofs(file_hash) WHERE file_hash IS NOT NULL;
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES items(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  proof_id INTEGER REFERENCES proofs(id),
  proof_method TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  criteria TEXT NOT NULL DEFAULT '{}',        -- JSON {key: 1..5}
  extra TEXT,
  text TEXT NOT NULL,
  pros TEXT,
  cons TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',   -- submitted | pending | published | rejected | hidden
  created_at INTEGER NOT NULL,
  published_at INTEGER,
  UNIQUE (item_id, user_id)
);
CREATE INDEX IF NOT EXISTS reviews_item ON reviews(item_id, status);
CREATE TABLE IF NOT EXISTS votes (
  review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  PRIMARY KEY (review_id, user_id)
);
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',        -- open | upheld | dismissed
  created_at INTEGER NOT NULL,
  UNIQUE (review_id, user_id)
);
`);

if (!db.prepare('SELECT 1 FROM users LIMIT 1').get()) seed(db);
