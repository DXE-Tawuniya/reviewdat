# TextField

A labelled text input; `multiline` turns it into a textarea for written feedback.

- Always pass a visible `label`; placeholders are hints, never labels.
- `helperText` explains format; `error` replaces it in `danger` with a warning sign, so the error is not shown by color alone.
- Text is `body` (16px), which also stops iOS from zooming in on focus.
- **The consumer provides:** `label`, `value`/`onChange` (or `defaultValue`), and `error` after validation.
