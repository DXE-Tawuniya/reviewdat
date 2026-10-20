reviewdat is built from one idea in its logo: a speech bubble with a check mark. Feedback that leads to a clear decision. The interface should feel the same: friendly, rounded, blue, and calm, with one obvious next step on every screen.

## Brand at a glance

- **Primary blue** `brand` (#0561F3), taken from the logo bubble.
- **Deep blue** `brand-strong` (#0048C6), taken from the wordmark.
- **Light blue** `brand-accent` (#4B90FD), taken from the bubble's tail.
- **Shapes:** generous rounded corners (`radius-md` 12px, `radius-lg` 20px), like the bubble.
- **Type:** Lexend for headings (geometric and rounded, the closest free match to the wordmark), Figtree for everything else.

## Content fundamentals

- Write to the user as "you"; the app speaks as "we" only in system messages ("We saved your draft").
- Sentence case everywhere: titles, buttons, tabs. Never ALL CAPS.
- Buttons start with a verb: "Submit review", "Approve", "Request changes".
- Short and specific: say what happened and what to do next ("Couldn't send. Check your connection and try again.").
- No emoji in UI copy. No exclamation marks except in a first-time success moment.
- Keep strings ready for Arabic: avoid word play and text baked into images. Layouts must mirror for RTL.

## Color

- Screens sit on `surface`; group lists and form sections on `surface-subtle`; cards on `surface-raised` with `shadow-sm`.
- Text is `ink`; secondary text is `ink-muted`. Both pass 4.5:1 on every surface in light and dark.
- `brand` is for interaction only: primary buttons, selected tabs, links, focus. Use `brand-tint` behind selected rows and info messages.
- `brand-accent` is decorative (illustrations, charts, highlights). Never use it for text.
- Text on any `brand` fill is `on-brand`, never hard-coded white, so dark mode keeps contrast.
- Status colors (`success`, `warning`, `danger`) always come with an icon or a word, never color alone. Each has a `-soft` background.
- Use `line` for dividers and `line-strong` for control borders (inputs, outline buttons). Only `line-strong` meets 3:1.
- Both themes are defined: switch with `data-theme="light"` or `data-theme="dark"` on the root.

## Typography

- Headings use `display`, `title-1`, `title-2` and `title-3` (Lexend 600). One `title-1` per screen as the screen title.
- Body uses `body` (16px); secondary lines use `body-sm`; buttons, tabs and field labels use `label`; badges and timestamps use `caption`.
- Load both fonts from Google Fonts: `Lexend:wght@500;600` and `Figtree:wght@400;500;600`.
- Arabic falls back to IBM Plex Sans Arabic (also on Google Fonts), already in both font stacks.
- Lexend is not the logo's exact typeface. Never retype the wordmark; always use the logo file.

## Spacing and layout

- 4px grid: `space-1` (4) to `space-7` (48).
- Screen side margins are `space-4` (16px). Gap between sections is `space-5`; between cards `space-3`.
- Touch targets are at least `control-height` (48px). Compact controls (`control-height-sm`, 36px) only inside cards.
- Design mobile first at 390 × 844 (iPhone 14/15); test at 360px wide for small Android phones.

## Shape, depth and states

- Corners: `radius-sm` badges, `radius-md` buttons, inputs and alerts, `radius-lg` cards and sheets, `radius-full` pills and avatars.
- Depth: `shadow-sm` for cards, `shadow-md` for sheets, menus and toasts. Nothing else casts shadows.
- Hover/pressed: primary goes from `brand` to `brand-strong`; secondary and ghost get a `brand-tint` fill.
- Disabled: 45% opacity, no pointer.
- Focus: a solid 2px `focus` ring with a 2px offset, on every interactive element.
- Motion: 150–200ms ease-out for color and position changes. No bounce.

## Iconography

- Use **Lucide** icons (lucide.dev): free, 24px grid, 2px rounded strokes that match the logo's rounded check.
- Default size `icon-size` (24px), 20px inside alerts, 12px inside badges. Icons take the text color they sit next to.
- The check mark is the brand's signature: use it for approved and complete states.

## Logo use

- Use the files in `assets/brand/` (see its README for which one fits each background). Prefer the SVG versions.
- Light screens: `reviewdat-logo.svg`. Dark mode: `reviewdat-logo-dark-bg.svg`. On brand blue: `reviewdat-logo-white.svg`.
- Small or square spaces: the mark only (`reviewdat-mark.svg`), at least 16px.
- Never redraw, recolor, stretch or retype it. Keep clear space of at least the check mark's height on every side.

## Components

Button, TextField, Card, Badge, Rating, Tabs and Alert live in `components/bundle.js` as `window.Reviewdat` and need React 18. Classes are prefixed `rd-`.
