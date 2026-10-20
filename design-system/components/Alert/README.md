# Alert

An inline message for status or feedback inside a screen.

- Tones: `info`, `success`, `warning`, `danger`, each with its own icon and a soft background; text stays `ink` for readability.
- `danger` alerts use `role="alert"` so screen readers announce them.
- **The consumer provides:** `tone`, a short `title`, and one sentence of body as children that says what to do next.
