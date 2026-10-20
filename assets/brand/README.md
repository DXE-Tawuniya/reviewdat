# reviewdat brand assets

`reviewdat-logo.png` is the **original master** (1774 × 887, off-white background). Every other file here was traced from it into vector shapes and exported in the brand colors (`brand` #0561F3, `brand-strong` #0048C6, `brand-accent` #4B90FD).

## Which file to use

| Background | Full logo | Mark only |
|---|---|---|
| White / light (`surface`, `surface-subtle`) | `svg/reviewdat-logo.svg` | `svg/reviewdat-mark.svg` |
| Dark mode (`surface` dark, navy) | `svg/reviewdat-logo-dark-bg.svg` | `svg/reviewdat-mark.svg` |
| Brand blue or photos | `svg/reviewdat-logo-white.svg` | `svg/reviewdat-mark-white.svg` |
| One-color print, fax, stamps | `svg/reviewdat-logo-blue.svg` | — |

- **Use SVG** in the app and on the web: it stays sharp at every size.
- **Use PNG** (`png/`) only where SVG isn't accepted (emails, slides, social posts). Full logos come at 2400px wide and `@1x` at 600px wide; marks at 1024 × 1024. All have transparent backgrounds.
- **Use the mark only** where the space is square or small (app header on mobile, avatars, loading screens). Use the full logo when there's room for the name.

## App icons

| Platform | File | Notes |
|---|---|---|
| iOS | `app-icon/ios/AppIcon-1024.png` | Opaque, square. iOS rounds the corners itself; Xcode generates smaller sizes from this one. |
| Android (Play Store) | `app-icon/android/play-store-512.png` | Opaque, square. Google Play applies its own mask. |
| Android (adaptive launcher) | `app-icon/android/ic_launcher_foreground.png` + `ic_launcher_background.png` | 432 × 432 (108dp at xxxhdpi). Mark sits in the 66dp safe zone so circle, squircle and rounded-square masks never cut it. |

The icon is a white bubble on `brand` blue, with the tail in a light tint and the check cut out so the blue shows through.

## Web

- `web/favicon.ico` (16, 32, 48) — browser tab icon. Also `favicon-16/32/48.png`.
- `web/apple-touch-icon.png` (180) — iPhone home-screen bookmark.
- `web/icon-192.png`, `web/icon-512.png` — PWA / web app manifest icons.

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

## Rules

- Never redraw, stretch, rotate, add effects to, or recolor the logo outside these variants.
- Never retype the wordmark in a font; always use the files.
- Clear space: at least the height of the check mark on every side.
- Minimum size: full logo 96px wide on screen; below that, use the mark (minimum 16px).

## Still to do

- These files are an accurate trace of the PNG. When the designer's original vector source (Figma / Illustrator) is available, export from it and replace `svg/` for perfect curves.
