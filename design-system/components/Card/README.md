# Card

A rounded container for one item: a review request, a project, a comment thread.

- `radius-lg` corners and `shadow-sm` on `surface-raised`, with `space-4` padding.
- **The consumer provides:** `title` (title-3), optional `meta` line (body-sm, `ink-muted`), optional `badge` for status, and children for the body (rating, actions).
- Keep at most two actions inside a card, using `sm` buttons.
- Stack cards with `space-3` between them and `space-4` screen margins.
