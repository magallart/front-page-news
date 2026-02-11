# Design Profile - App Template

Rellena solo estos campos al clonar el template.

## Quick Fill (Required)

### Identity

- `app_name`: `<My App>`
- `style`: `<calm | professional | bold | playful>`
- `density`: `<compact | standard | spacious>`

### Typography

- `font_ui`: `<Inter>`
- `font_heading`: `<Geist>`
- `font_mono`: `<JetBrains Mono>`

### Shape and Depth

- `radius`: `<sm | md | lg | xl>`
- `shadow`: `<none | subtle | medium>`
- `motion`: `<none | minimal | moderate>`

### Core Colors (HSL)

Use `H S L` values without `hsl()`.

- `light_primary`: `<49 100% 63%>`
- `light_background`: `<0 0% 96%>`
- `light_foreground`: `<0 2% 16%>`
- `dark_primary`: `<46 65% 52%>`
- `dark_background`: `<0 30% 8%>`
- `dark_foreground`: `<0 0% 96%>`

### Palette Reference (HSL)

- `white-smoke`: `0 0% 96%`
- `mustard`: `49 100% 63%`
- `metallic-gold`: `46 65% 52%`
- `shadow-grey`: `0 2% 16%`
- `coffee-bean`: `0 30% 8%`

## Rules

- Always use Tailwind semantic tokens (`bg-primary`, `text-foreground`, `border-border`).
- Do not use hex colors in component classes.
- If you change visual direction, update this file first.

## Mapping

- `light_*` maps to `:root` tokens in `src/styles.css`.
- `dark_*` maps to `.dark` tokens in `src/styles.css`.
