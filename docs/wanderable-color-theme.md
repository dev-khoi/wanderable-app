# Wanderable Color Theme

This theme centralizes the colors used by the Wanderable mobile UI so screens do not rely on scattered raw hex or `rgba(...)` values.

## Figma surface references

- `666:8283`: wide rounded white surface
- `666:8364`: tall rounded white surface

Both nodes resolve to the same core surface token:

- `background.surface` / `surface.default`: `#FFFFFF`
- `radii.referenceSurface`: `40`

## Palette

| Token | Value | Usage |
| --- | --- | --- |
| `background.darkMap` | `#121212` | Onboarding fallback background under map |
| `background.deepSpace` | `#070711` | Autoscan fallback background |
| `background.surface` | `#FFFFFF` | Primary white surfaces |
| `brand.primary` | `#24A59E` | Wanderable mark, accent brand color |
| `brand.secondary` | `#DF3B6F` | Primary CTA buttons, notification dot |
| `text.inverse` | `#FFFFFF` | Text on dark backgrounds or CTA buttons |
| `text.primary` | `#1C1243` | Primary heading text |
| `text.strong` | `#151918` | Trip card title text |
| `text.subtle` | `#A5A7AC` | Supporting copy |
| `text.accent` | `#090723` | High-emphasis dark inline text |
| `text.muted` | `#A29EB6` | Pills, indicators, secondary labels |
| `icon.default` | `#1C1243` | Notification bell strokes |
| `icon.notification` | `#DF3B6F` | Notification dot |
| `surface.muted` | `#D9D9D9` | Placeholder panels and scan card |
| `surface.soft` | `#F3E7E7` | Soft stats pill background |
| `surface.avatar` | `#E9E6EA` | Avatar background |
| `surface.avatarFill` | `#CFC8D1` | Avatar inner fill |
| `overlay.mapScrim` | `rgba(30, 21, 27, 0.18)` | Map image darkening overlay |
| `overlay.spaceScrim` | `rgba(4, 6, 20, 0.18)` | Space background darkening overlay |
| `shadow.default` | `#000000` | Shared shadow color |

## Notes

- Use `wanderableTheme` from `constants/wanderableTheme.ts` for all Wanderable screen/component colors.
- Prefer named overlay tokens over inline `rgba(...)` strings.
- The two referenced Figma nodes are treated as surface-theme references, not standalone product screens.
