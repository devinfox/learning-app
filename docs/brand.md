# Design system

How the brand rules are enforced in code. Live component reference: `/design`.

## Palette

Cosmos is `#120C24`. Ink `#191325` is a separate token, used for body text on
light grounds.

## Two grounds

Paper is the default ground and covers roughly 90% of screen time. Cosmos is
used for arrival moments: onboarding, results, milestones.

Components never hard-code a ground. They use semantic tokens that re-map under
`[data-ground="cosmos"]`, so one component renders correctly on both:

```tsx
<Screen ground="cosmos">
  <ArrivalHeader title="Your syllabus is ready" highlight="Placement complete" />
</Screen>
```

| Token | Paper | Cosmos |
|---|---|---|
| `ground` | `#F4F3FA` | `#120C24` |
| `surface` | `#FFFFFF` | `#1C1533` |
| `ink` | `#191325` | `#FFFFFF` |
| `ink-muted` | `#544C6E` | `#C3BDD8` |
| `ink-subtle` | `#726A8C` | `#ABA4C4` |
| `brand` | `#5B3CE4` | `#B39BFF` |
| `accent-soft` | `#ECE7FB` (Aura) | `rgb(179 155 255 / .18)` |

Brand lifts on Cosmos because Ultraviolet measures 2.91:1 there and fails every
WCAG threshold. The token lifts to `#B39BFF`, the first stop of the mark's
contour gradient, at 8.20:1.

Aura does not carry over. It is a light-ground fill; on Cosmos it blows out to
near-white and takes white text with it. `accent-soft` exists so selected states
stay legible on both.

## Contrast

Target is WCAG AA, AAA for core reading views. Ratios below are computed from a
WCAG 2.1 relative-luminance calculation over the token pairs, and should be
re-run whenever the palette moves.

### Paper ground

| Pair | Ratio | Level |
|---|---|---|
| Ink on Paper | 16.40:1 | AAA |
| Ink on Surface | 18.08:1 | AAA |
| Ink on Aura | 14.98:1 | AAA |
| ink-muted on Paper | 7.23:1 | AAA |
| ink-subtle on Paper | 4.58:1 | AA |
| Ultraviolet on Paper | 5.93:1 | AA |
| White on Ultraviolet | 6.54:1 | AA |
| Cosmos on Lumen | 14.68:1 | AAA |

### Cosmos ground

| Pair | Ratio | Level |
|---|---|---|
| White on Cosmos | 19.03:1 | AAA |
| ink-muted on Cosmos | 10.50:1 | AAA |
| ink-subtle on Cosmos | 8.01:1 | AAA |
| brand on Cosmos | 8.20:1 | AAA |
| White on surface | 17.44:1 | AAA |

### Fill-only tokens

Verdant `#34D6B0` measures 1.84:1 on white and Ember `#FF6B6B` measures 2.78:1.
Both fail AA as text and are fill-only. Use `verdant-ink` (6.44:1) and
`ember-ink` (6.12:1) for text.

Lumen is never text: `#C6F24C` on white is 1.30:1.

## Lumen usage

Sanctioned uses, and nothing else:

- Earned progress: completed chapter nodes, the progress ring, progress bars
- `<Button variant="accent">`, at most one per screen
- The single highlight on an `<ArrivalHeader>`
- The `New` badge on an un-placed subject

The header wash on dashboard, profile and quiz headers is Aura, not Lumen
(`<Screen wash />`).

Neutral position indicators such as quiz position and slide position use the
`cosmos` or `brand` tone, never `lumen`.

## Spectrum rays

The four ray colours are lifted from `uvbrain-icon.svg` so the motif and the
mark cannot drift: `#A98BFF · #35C6DE · #34D6B0 · #C6F24C`.

| Use | Component |
|---|---|
| Divider | `<Divider variant="spectrum" />`, `<RayRule />` |
| Section rule | `<Section ruled />` |
| Progress | `<ProgressBar tone="spectrum" />`, `<ProgressRing tone="spectrum" />` |
| Empty-state art | `<EmptyState />` (default), `<RayBurst />` |
| Arrival glow | `<PrismGlow />` via `<Screen ground="cosmos" />` |

The spectrum is a graphic device. It never carries text and is never a page
background.

## Typography

Fraunces is display only. Hanken Grotesk is UI. Encoded in `<Text variant>`:

| Variant | Face | Size |
|---|---|---|
| `display` | Fraunces | 36px |
| `h1` | Fraunces | 28px |
| `h2` | Fraunces | 22px |
| `h3` | Fraunces | 18px |
| `bodyLarge` / `body` | Hanken | 17 / 15px |
| `caption` / `label` / `overline` | Hanken | 13 / 14 / 11px |

No serif is set below 14px, which is why there is no serif variant below `h3`
(18px). Captions are sans.

`<Prose>` is for lesson and tutor copy: 68ch measure, 1.65 line height, Ink
rather than muted.

Fraunces carries SOFT and WONK axes with no specified values. The system uses
`font-optical-sizing: auto` and leaves SOFT/WONK at family defaults, exposed as
`--fraunces-soft` / `--fraunces-wonk`. Set those two variables if real values
are supplied.

## The mark

`<Logo>` and `<LogoMark>` inline the paths so the mark inherits colour per
ground and stays crisp at any size. Rules are enforced in the component:

- Clear space at least the glowing node's height, via `<Logo clearSpace />`
- Icon minimum 24px
- 32px and below reduces automatically to brain, node and 3 rays. Override with
  `simplified`
- Wordmark: Hanken Grotesk ExtraBold, -0.03em tracking, "UV" in Lumen on dark
  or deepened lime on light, "Brain" in white or ink, switched by `ground`

## Copy

Component copy is encouraging and specific. A person gets a lesson, not a
"content module".

`<EmptyState>` and `<ArrivalHeader>` set their titles in Fraunces.
