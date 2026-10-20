# Rating

Star rating, read-only by default; pass `onChange` to make it interactive.

- Filled stars use `rating`; empty stars use `line-strong`. The numeric value sits beside the stars so the score is readable without color.
- Interactive stars are buttons with labels like "4 of 5 stars" and get a larger tap area.
- **The consumer provides:** `value`, optional `max` (default 5), and `onChange` for input.
- This component assumes reviewdat collects star scores; drop it if reviews are text-only.
