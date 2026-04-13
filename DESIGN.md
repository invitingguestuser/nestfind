# Design Brief: Modern Real Estate Platform

## Tone & Differentiation
Premium editorial experience conveying trust, stability, and growth. Property cards as hero elements. Warm earth tones + crisp modernism. Verification badges as trust signals. Low-clutter, high-breathing-room layout prioritizing large images and clear information hierarchy.

## Palette (Light Mode)

| Token | OKLCH | Usage |
|-------|-------|-------|
| Primary | 51.5 0.16 30 | Terracotta CTAs, verification accents, active states |
| Secondary | 25 0.03 265 | Deep slate for headings, navigation, trust signals |
| Accent | 66 0.08 155 | Sage green for "new", "verified", growth indicators |
| Background | 98 0.01 30 | Warm off-white, breathing room |
| Card | 100 0 0 | Pure white property cards, content containers |
| Muted | 94 0.01 30 | Subtle backgrounds, inactive elements |
| Destructive | 55 0.22 25 | Remove from shortlist, delete actions |
| Border | 92 0.01 30 | Subtle dividers, card edges |

## Palette (Dark Mode)

| Token | OKLCH | Usage |
|-------|-------|-------|
| Primary | 67 0.12 30 | Warm terracotta for CTAs (elevated) |
| Secondary | 82 0.02 30 | Light warm for headings |
| Accent | 72 0.06 155 | Soft sage for verification, active states |
| Background | 14 0.01 265 | Deep slate background |
| Card | 20 0.01 265 | Slightly elevated card containers |
| Foreground | 96 0.01 30 | Warm off-white text |

## Typography

| Role | Font | Scale | Weight |
|------|------|-------|--------|
| Display | Bricolage Grotesque | 2.4rem–3.2rem | 600+ (headings) |
| Body | DM Sans | 1rem (base) | 400 (body), 500 (labels) |
| Mono | Geist Mono | 0.875rem | 400 (addresses, codes) |

**Type Hierarchy**: H1 (3.2rem), H2 (2.4rem), H3 (1.875rem), Body (1rem, 1.5 line-height), Caption (0.875rem, muted-foreground).

## Structural Zones

| Zone | Treatment |
|------|-----------|
| Header | `bg-card` with `border-b border-border`. Sticky on mobile/desktop. Contains logo + sticky search bar. |
| Hero/Featured | `bg-background` with alternating `bg-muted/20` for visual rhythm. Large property cards with `shadow-card`. |
| Property Grid | `property-grid` utility (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3). Each card: `bg-card shadow-card`. |
| Sidebar Filters | `bg-muted/40` with `border-l border-border`. Sticky on desktop. |
| Footer | `bg-muted/10` with `border-t border-border`. Neutral background. |
| Property Detail Page | Full-width image gallery hero. Sticky CTA footer with `bg-card shadow-elevated border-t`. |

## Component Patterns

- **Property Card**: Image, price (primary-colored), address (mono), bed/bath icons, save button, verification badge (accent + icon).
- **Verification Badge**: Sage green background, icon, "Verified" label, freshness date in muted text.
- **Search Bar**: `input` token, `placeholder-muted-foreground`, focus ring primary color.
- **CTA Buttons**: Primary terracotta for high-intent (contact agent, book visit). Secondary for lower-intent (save, shortlist).
- **Filter Tags**: `bg-muted text-muted-foreground` active: `bg-primary text-primary-foreground`.

## Motion & Transitions

- **Smooth default**: 0.3s cubic-bezier(0.4, 0, 0.2, 1) for all interactive elements.
- **Card hover**: Subtle `scale(1.02)` + shadow elevation on property cards.
- **CTA buttons**: Shadow shift on hover (from `shadow-sm` to `shadow-md`).
- **Page transitions**: Fade + subtle slide (React Router animation).

## Constraints & Anti-Patterns

✗ No full-page gradients or glow effects (ruins trust in real estate).
✗ No rainbow palettes or excessive color variation (unprofessional).
✗ No animations that distract from property images.
✓ All color values via CSS tokens (no raw hex).
✓ Mobile-first responsive (sm:, md:, lg: breakpoints).
✓ High contrast for accessibility (AA+ WCAG).

## Signature Details

- **Terracotta primary color** reinforces warm, premium real estate brand (not tech blue).
- **Verification badges** with sage accent + icon + freshness date (trust signal).
- **Generous card spacing** and breathing room (editorial approach, not dense grid).
- **Warm off-white background** instead of pure white (reduces eye strain, premium feel).
- **Mono font for addresses** (utility + distinctiveness: separates addresses from prose).

## Quality Benchmark

Linear, Stripe, Apple — refined design systems, 1–2 fonts, 3–5 core colors, intentional hierarchy, breathing whitespace.
