---
name: Campus Pulse
colors:
  surface: '#12131b'
  surface-dim: '#12131b'
  surface-bright: '#383842'
  surface-container-lowest: '#0d0e16'
  surface-container-low: '#1a1b23'
  surface-container: '#1e1f28'
  surface-container-high: '#292932'
  surface-container-highest: '#33343d'
  on-surface: '#e3e1ed'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#e3e1ed'
  inverse-on-surface: '#2f3039'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c4c0ff'
  primary: '#c4c0ff'
  on-primary: '#2000a4'
  primary-container: '#8781ff'
  on-primary-container: '#1b0091'
  inverse-primary: '#4f44e2'
  secondary: '#ffb2bc'
  on-secondary: '#670023'
  secondary-container: '#8f0935'
  on-secondary-container: '#ff97a7'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00a572'
  on-tertiary-container: '#00311f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c4c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#3622ca'
  secondary-fixed: '#ffd9dd'
  secondary-fixed-dim: '#ffb2bc'
  on-secondary-fixed: '#400012'
  on-secondary-fixed-variant: '#8f0935'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#12131b'
  on-background: '#e3e1ed'
  surface-variant: '#33343d'
  neon-emerald: '#43E97B'
  accent-gold: '#F59E0B'
  surface-space-deep: '#0B0C14'
  surface-space-elevated: '#121324'
  glass-border: rgba(255, 255, 255, 0.08)
  glass-border-focused: rgba(108, 99, 255, 0.40)
typography:
  display-hero:
    fontFamily: Outfit
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Outfit
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 2.5rem
  margin-screen: 1.25rem
  gutter-default: 0.75rem
  nav-bar-height: 4.5rem
---

## Brand & Style

This design system delivers an elevated, Apple-minimalist mobile experience tailored for modern university life. It synthesizes iOS Human Interface Guidelines—uncluttered visual hierarchies, edge-to-edge content, disciplined typography, and tactile precision—with the electric vibrancy of a collegiate super-app.

The visual language sits at the intersection of **Apple Minimalist Glassmorphism** and **Gamified Utility**. Surfaces employ dark, low-opacity vitreous materials (`backdrop-blur-2xl`, ultra-fine borders) layered above a cosmic canvas, allowing vivid semantic accents to guide focus without cognitive fatigue. The target audience of ambitious university students demands speed, native responsiveness, and zero administrative friction; the emotional tone is focused, modern, empowering, and effortlessly fluid.

## Colors

The color palette establishes deliberate role division against deep nocturnal space:

- **Primary (`#6C63FF` - Electric Violet)**: Reserved for primary CTAs, system navigation active indicators, user identity accents, and active focus rings.
- **Secondary (`#FF6584` - Warm Coral)**: Applied to peer interactions, SquadUp discovery matches, and human-to-human connection points.
- **Tertiary & Gamification (`#10B981` / `#43E97B` - Neon Emerald)**: Exclusively governs progression, XP gains, quest completions, and real-time open status (e.g., open study rooms).
- **Gold (`#F59E0B`)**: Denotes institutional achievements, competitions, milestones, and verified badges.
- **Canvas Neutrals (`#0B0C14` & `#121324`)**: Deep space dark canvas provides absolute contrast, preventing OLED battery bleed while producing a focused viewport.

### Hierarchy & Tint Rules
Tinted colors must not cover large flat regions. Accents appear as pill outlines, subtle glow emitters, 12% opacity badge fills, and gradient ramps. Interactive CTAs utilize a smooth 135-degree directional gradient between `#6C63FF` and `#FF6584` to signal forward momentum.

## Typography

Typography balances structural legibility with modern geometry:

- **Headlines & Key Metric Display (`Outfit`)**: Geometric, open, and confident. Outfit handles section titles, screen headers, dynamic balance figures, and modal intros. Tracking is condensed at display scales (`-0.02em`) to mirror iOS large title rendering.
- **Body & Controls (`Inter`)**: Inter performs all informational heavy-lifting. With neutral apertures and high x-height, it preserves legibility across dense schedules, roster lists, and notifications.
- **Scale Rules**: Never set body text beneath 11px on touch devices. All subtext relies on font-weight shifts (`500` vs `400`) and low-contrast white opacities (`rgba(255,255,255,0.65)`) rather than undersized scale.

## Layout & Spacing

The architecture operates mobile-first under a strict 4pt/8pt rhythm:

- **Screen Safe Zones**: A standardized horizontal screen inset of `1.25rem` (`20px`) protects touch targets and balances against bezel curves.
- **Bottom Navigation Clearance**: Fixed bottom bar requires a persistent page-bottom buffer of `5.5rem` (`nav-bar-height` + bottom safe-area-inset) to guarantee floating action buttons and lists never collide with hardware home indicators.
- **Card Padding**: Micro-cards utilize `space-md` (`16px`), while hero cards and modal containers expand to `space-lg` (`20px`).
- **Vertical Hierarchy**: Maintain generous section gaps (`space-2xl` / `32px`) between unrelated functional strips to instill the open, unhurried negative space characteristic of Apple design.

## Elevation & Depth

Visual plane hierarchy relies on optical depth, frosted glass, and boundary reflections rather than muddy cast shadows:

1. **Layer 0 (Canvas Core - `#0B0C14`)**: The lowest plane. Hosts background vector graphics, map canvas views, and spatial gradients.
2. **Layer 1 (Glass Container Panels)**: `background: rgba(18, 19, 36, 0.70)`, paired with `backdrop-filter: blur(24px)` and a precise `1px` structural boundary: `border: 1px solid rgba(255, 255, 255, 0.08)`.
3. **Layer 2 (Elevated Controls & Floating Modals)**: `background: rgba(28, 30, 54, 0.85)`, `backdrop-filter: blur(32px)`, bordered by `1px solid rgba(255, 255, 255, 0.14)`. Accompanied by a subtle ambient radiance: `box-shadow: 0 12px 36px -8px rgba(0, 0, 0, 0.50)`.
4. **Layer 3 (Hero Action Nodes & Badges)**: Primary elements emit chromatic back-glows: `box-shadow: 0 8px 24px -4px rgba(108, 99, 255, 0.35)`. Gamification nodes project a matching emerald aura: `rgba(67, 233, 123, 0.30)`.

## Shapes

The interface embraces pill geometry and continuous Apple squircle curves:

- **Roundedness Level 3 (Pill-Shaped & Hyper-Curved)**: Micro-tags, action badges, and primary buttons employ full-radius pills (`rounded-full`).
- **Standard Structural Cards**: Rendered with deep, tactile borders using `rounded-2xl` (`1.5rem` / `24px`).
- **Swipe Decks & Sheet Modals**: Rendered with `rounded-3xl` (`2rem` / `32px`) to echo native mobile hardware frames.
- **Avatars & System Hubs**: Fully circular (`rounded-full`) with concentric 2px interactive outer status rings.

## Components

### Buttons
- **Primary CTA**: Full-width or inline pill (`rounded-full`), height `52px`. Gradient fill: `linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)`. White text, font `Outfit`, weight `600`, size `16px`. Active press state triggers scale transform `scale(0.97)`.
- **Secondary / Glass CTA**: Frosted backdrop `rgba(255, 255, 255, 0.06)`, border `1px solid rgba(255, 255, 255, 0.12)`, text `#FFFFFF`.
- **Icon / Speed-Dial FAB**: 56px circular button (`rounded-full`), elevated with Electric Violet glow and a crisp center glyph.

### Chips & Badges
- **XP / Quest Tag**: Pill shape, height `24px`, background `rgba(16, 185, 129, 0.12)`, border `1px solid rgba(67, 233, 123, 0.30)`, text `#43E97B`, `label-sm` uppercase.
- **Squad / Filter Chip**: Height `32px`, pill shape, background `rgba(255, 255, 255, 0.05)`, border `rgba(255, 255, 255, 0.10)`. Active state shifts border to Electric Violet with `rgba(108, 99, 255, 0.20)` fill.

### Cards
- **Glassmorphic Feed Card**: `rounded-2xl`, background `rgba(18, 19, 36, 0.70)`, border `1px solid rgba(255, 255, 255, 0.08)`, backdrop-blur `20px`. Generous internal padding `1.25rem`.
- **SquadUp Deck Card**: `rounded-3xl`, high-ratio aspect framing with subtle inner edge highlights (`inset 0 1px 0 rgba(255, 255, 255, 0.15)`).

### Input Fields
- **Search & Text Inputs**: Height `48px`, `rounded-full` or `rounded-xl`, background `rgba(18, 19, 36, 0.85)`, border `1px solid rgba(255, 255, 255, 0.08)`. Input text `Inter 14px`, placeholder `rgba(255, 255, 255, 0.35)`. Focus transition shifts border color to `#6C63FF` with a 2px outer ambient aura.

### Lists & Navigation
- **Cell Lists**: Separated by hairline borders `rgba(255, 255, 255, 0.06)`. Right chevron `rgba(255, 255, 255, 0.30)`.
- **Bottom Navigation Bar**: Floating detached pill or edge-to-edge frosted dock (`backdrop-blur-3xl`, `rgba(11, 12, 20, 0.85)`). Active tab highlighted with Electric Violet indicator dot and vibrant tint.