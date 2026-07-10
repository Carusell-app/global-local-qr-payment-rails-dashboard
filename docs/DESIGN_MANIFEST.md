# Design Manifest

## Brand Positioning

The product is a global payment-intelligence operating system for strategy, BD and regulatory teams. It borrows the supplied orange-first financial UI language without representing the app as an Inter product.

## Tokens

```css
--brand-primary: #ff7a00;
--brand-primary-hover: #ff9b3d;
--brand-primary-pressed: #e56e00;
--background: #ffffff;
--surface: #ffffff;
--surface-subtle: #f5f5f7;
--border: #ebebeb;
--text-primary: #161616;
--text-secondary: #6b6b6b;
--text-muted: #9e9e9e;
--success: #00a868;
--warning: #ffb800;
--danger: #e5222d;
--info: #1e7fe6;
```

Dark mode uses `#0d0d0d`, `#161616`, `#1d1d1d`, `#2e2e2e`, `#f5f5f7`, `#bdbdbd` and the lighter orange `#ff9b3d`.

## Typography

Use:

```css
font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Do not bundle Citrina unless a licensed font file is added by the owner.

## UI Rules

- Orange is reserved for primary actions, active navigation, highlights and selected intelligence indicators.
- Avoid orange body text and large uncontrolled orange backgrounds.
- Use white and subtle-grey surfaces, minimal shadows and visible borders.
- Cards use 12-16px radii; large panels can use 24px.
- Interactive targets are at least 44px high.
- Data-heavy views use tabular numerals where practical.
- Focus states use an orange ring.
- Reduced-motion preferences are respected globally.
- All factual dashboard views show data mode and freshness.
