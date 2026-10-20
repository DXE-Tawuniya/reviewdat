# Review Dat — MVP

Review anything, anywhere. Verified buyers only. Mobile-first web app.

Spec: [docs/review-platform-spec.md](docs/review-platform-spec.md)

## Stack
- SvelteKit 2 + Svelte 5
- SQLite (better-sqlite3), file uploads on disk
- Node adapter — single process, no external services

## Run
```bash
npm install
npm run dev            # http://localhost:5173
```

Production:
```bash
npm run build
ORIGIN=https://your.domain node build     # PORT=3000 default
```
Local prod over plain http: add `INSECURE_COOKIES=1`.

Data lives in `./data` (override `DATA_DIR`). First start seeds example data.

## Demo accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@reviewdat.local | admin1234 |
| User | sarak@example.com | demo1234 |

## Test
```bash
npm test                                   # unit: rating math, templates
BASE=http://localhost:3000 bash scripts/smoke.sh   # end-to-end, 32 checks
```

## What works
| Area | MVP behaviour |
|---|---|
| Guest | Browse home, search, categories, item pages, reviews |
| Auth | Email + password, 30-day httpOnly session, return-to-page after sign-in |
| Add item | Proof of existence (link or barcode, optional photo), dedupe by name/category or barcode |
| Review wizard | Steps from category template; proof upload; draft autosave (browser) |
| Proof | Private storage, SHA-256 duplicate receipt block, **mock auto-approve** with confidence score |
| Rating | Bayesian average, C=10; weights = proof strength × recency × reviewer trust |
| Trust & abuse | 1 review per user per item, 5 reviews/day limit, no self-votes, report → moderation |
| Moderation | `/admin`: open reports, hide/dismiss, restore, proof log, stats |
| i18n | English + Arabic, full RTL |
| Security | CSRF origin check, scrypt passwords, proof files never public, no open redirects |

## Structure
```
src/lib/templates.js        categories → steps, criteria, proof methods, validation
src/lib/rating.js           Bayesian aggregate + weights (pure, unit-tested)
src/lib/i18n.js             EN / AR strings
src/lib/server/db.js        schema + first-run seed
src/lib/server/proofs.js    upload, hash, mock verify, velocity limit
src/routes/                 pages + form actions
```

Add a category: one entry in `src/lib/templates.js`. Wizard, validation, breakdown follow.

## Next (from spec "Later")
- Real verification: OCR → fraud signals → manual queue (replace `verifyProof`)
- Merchant integrations, business accounts + replies
- Auto-translation, region filter
- OAuth / magic link, email verification
- Postgres + cached aggregates when catalog grows
- Object storage (S3/R2) for uploads

## Theme
- Tokens imported from `design-system/tokens.css` in `src/app.css`. Edit tokens there, not in app.
- Light/dark: `data-theme` on `<html>`, set from OS preference in `src/app.html`.
- Fonts: Lexend (headings), Figtree (body), IBM Plex Sans Arabic (Arabic).
- Icons: Lucide (`@lucide/svelte`).
- Logos + favicons: copied from `assets/brand/` into `static/`.
