# Review Platform — Product Foundation

Global. Mobile-first web app. Verified reviews only.

---

## 1. Core Principles

- Only verified buyers review.
- Guests browse freely.
- Review form fits item type.
- Item rating reflects trustworthy reviews.
- Mobile first, desktop adapts.

---

## 2. Roles & Permissions

| Role | Browse | Review | Vote helpful | Report | Moderate |
|---|---|---|---|---|---|
| Guest | ✅ | ❌ | ❌ | ❌ | ❌ |
| Registered (unverified) | ✅ | ❌ | ✅ | ✅ | ❌ |
| Verified reviewer | ✅ | ✅ | ✅ | ✅ | ❌ |
| Business / item owner | ✅ | ❌ (own items) | ❌ | ✅ | Reply only |
| Moderator / Admin | ✅ | — | — | — | ✅ |

Guest hitting "Write review" → sign-up gate, return to same item.

---

## 3. Core Entities

- **User** — identity, locale, trust score.
- **Item** — product, service, or place.
- **Category** — defines review template.
- **Review Template** — steps, fields, criteria.
- **Proof** — existence + purchase evidence.
- **Review** — answers, ratings, media, status.
- **Rating Aggregate** — computed per item.
- **Business** — optional claimed owner.

---

## 4. Proof System

Two separate proofs. Both required.

### 4.1 Proof of Existence (item real)
- Item link (URL, store listing).
- Barcode / GTIN scan.
- Map location (places, services).
- Photo of item.
- Match against existing catalog first. Avoid duplicates.

### 4.2 Proof of Purchase (user bought/used)
| Method | Strength | Notes |
|---|---|---|
| Receipt photo / PDF | Medium | OCR: merchant, date, amount, item |
| Order email forward | Medium-High | Parse sender domain |
| Merchant API / integration | High | Partner stores only |
| Booking/invoice number | Medium | Services, travel |
| Payment card match | High | Later phase, privacy cost |

### 4.3 Verification Pipeline
1. Upload proof.
2. Auto-check: OCR, fraud signals, duplicate receipt hash.
3. Confidence score → auto-approve, review, reject.
4. Manual queue for low confidence.
5. Badge on review: "Verified purchase".

### 4.4 Privacy
- Redact personal data before storage.
- Proof never shown publicly.
- Retention limit, then delete.
- Comply: GDPR, PDPL (Saudi), CCPA.

---

## 5. Dynamic Review Forms

Category → template → steps.

### 5.1 Template Structure
```
Template
 ├─ Steps[]
 │   ├─ Fields[] (rating, text, choice, media, date)
 │   └─ Conditional rules (show if…)
 ├─ Rating criteria[] (with weights)
 └─ Required proof types[]
```

### 5.2 Examples
| Type | Steps | Criteria |
|---|---|---|
| Physical product | Proof → Usage duration → Criteria → Pros/cons → Photos | Quality, value, durability, accuracy vs listing |
| Service | Proof → Service date → Criteria → Story | Professionalism, timeliness, price fairness, outcome |
| Place / venue | Proof → Visit date → Criteria → Photos | Cleanliness, staff, location, value |
| Digital / software | Proof → Usage length → Criteria | Ease, reliability, support, value |

### 5.3 Shared Rules
- Overall star rating always required.
- Min text length, configurable.
- Draft autosave per step.
- Max 5–7 steps. Progress bar visible.
- Edit window, then locked + versioned.

---

## 6. Rating Aggregation

Plain average fails. Low counts mislead.

### 6.1 Formula — Bayesian Average
```
score = (C × m + Σ ratings) / (C + n)
C = confidence threshold (e.g. 10)
m = category mean
n = review count
```

### 6.2 Weights
- Proof strength multiplier.
- Reviewer trust score.
- Recency decay (older weighs less).
- Flagged/removed reviews excluded.

### 6.3 Display
- Overall score + count.
- Distribution bars (1–5).
- Per-criterion breakdown.
- "Not enough reviews" below threshold.

---

## 7. Trust & Abuse

- One review per user per item per purchase.
- Duplicate receipt detection (hash).
- Velocity limits per account.
- Device/IP clustering for review rings.
- Owner cannot review own item.
- Incentivized reviews: disclosure required.
- Report → moderation queue → outcome notice.
- Owner reply, never deletion.

---

## 8. Global Readiness

- i18n from day one. RTL support (Arabic).
- Reviews in original language + auto-translate toggle.
- Locale-aware currency, dates, numbers.
- Region filter on reviews.
- Regional data residency, if required.

---

## 9. Mobile-First IA

### Bottom nav
1. Home / Discover
2. Search
3. Write (+)
4. Activity
5. Profile

### Key screens
- Item page: score, breakdown, filters, reviews.
- Search: scan barcode, paste link, text.
- Review wizard: stepper, one task per step.
- Proof upload: camera first.
- Profile: reviews, trust badge, drafts.

### Mobile patterns
- Camera-first proof capture.
- Bottom sheets for filters.
- Thumb-zone primary actions.
- Offline draft save.
- PWA install prompt.

---

## 10. Key Flows

**Guest browse**
Search → item → read → filter → (gate on write).

**Write review**
Find/add item → existence proof → purchase proof → template steps → submit → pending → verified → published.

**Add new item**
Not found → existence proof → category pick → dedupe check → created (pending).

---

## 11. Review Status Lifecycle

```
Draft → Submitted → Proof verifying → Published
                        ↓                ↓
                     Rejected         Reported → Hidden / Restored
```

---

## 12. MVP Scope

**In**
- Guest browse, search.
- Registration, email/OAuth.
- Receipt upload + OCR + manual queue.
- 3–4 category templates.
- Bayesian aggregate.
- EN + AR, RTL.

**Later**
- Merchant integrations.
- Business accounts, replies.
- Template builder UI (admin).
- Trust score ML.
- Auto-translation.

---

## 13. Open Questions

1. Publish before or after verification?
2. Proof for free / gifted items?
3. Review incentives allowed?
4. Business claim + paid tier? Revenue model?
5. Who defines templates — admin only?
6. Anonymous display name allowed?
7. Target launch markets first?
8. Edit policy after publish?
