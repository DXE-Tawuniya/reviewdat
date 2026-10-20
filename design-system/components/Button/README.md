# Button

Use buttons for actions; **primary** at most once per screen, for the main thing the screen is for.

- **Variants:** `primary` (filled `brand`), `secondary` (outlined, `line-strong` border), `ghost` (text only, low emphasis), `danger` (destructive, always confirm first).
- **Sizes:** `md` = `control-height` (48px, the default touch target); `sm` = `control-height-sm` (36px) only inside cards or dense lists.
- **Label:** verb first, sentence case, 1–3 words: "Submit review", not "SUBMIT" or "Click here".
- **The consumer provides:** the label as children, `onClick`, and `block` for full-width buttons at the bottom of mobile screens.
- **Don't:** put two primary buttons side by side; pair primary with secondary or ghost instead.
