# Design System Specification (`design.md`)

## 1. Overview & Aesthetic Direction
This design system defines a modern, dark-mode SaaS dashboard built around high-contrast typography, subtle surface layering, and a crisp **Light Red (`#FF7F7F`)** accent color. The layout prioritizes a persistent left navigation rail paired with a clean, spacious main workspace designed for onboarding, service management, and quick actions.

- **Theme:** Dark mode primary
- **Visual Style:** Flat-elevated cards, hairline borders, pill-shaped primary controls, minimal visual noise
- **Content Rule:** Keep structural containers and color tokens consistent while adapting labels, icons, and copy to the specific domain.

---

## 2. Color Palette & Tokens

All previous turquoise/mint accents are replaced with **Light Red (`#FF7F7F`)** and its derived opacity tints.

### Brand & Accent Colors
| Token | Hex / Value | Usage |
| :--- | :--- | :--- |
| `--accent-primary` | `#FF7F7F` | Primary CTA buttons, active toggle pill, greeting headline, avatar badge, brand dot, active nav indicator bar, icon strokes |
| `--accent-hover` | `#FF6666` | Hover/active state for primary buttons and interactive accent links |
| `--accent-tint-bg` | `rgba(255, 127, 127, 0.12)` | Active navigation item background, small square icon badge backgrounds |
| `--accent-tint-border` | `rgba(255, 127, 127, 0.25)` | Optional subtle focus rings or highlighted states |
| `--text-on-accent` | `#0E1417` | High-contrast dark text/icons placed directly on `#FF7F7F` fills (buttons, active toggles, avatar initials) |

### Neutral & Surface Colors
| Token | Hex / Value | Usage |
| :--- | :--- | :--- |
| `--bg-canvas` | `#0E1417` | Main workspace background |
| `--bg-sidebar` | `#1C2327` | Left navigation panel background |
| `--bg-surface` | `#1A2125` | Hero banner card and secondary action cards |
| `--bg-surface-hover` | `#212A2F` | Hover state for interactive cards and non-active nav links |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | Card borders, sidebar divider, workspace switcher outline |
| `--border-strong` | `rgba(255, 255, 255, 0.18)` | Outlined selector containers (e.g., workspace/account box) |
| `--pill-neutral-bg` | `#F5F7F8` | Unselected half of the dual-state header toggle (with dark muted text) |

### Typography Colors
| Token | Hex / Value | Usage |
| :--- | :--- | :--- |
| `--text-primary` | `#FFFFFF` | Hero headlines, card titles, primary nav labels |
| `--text-secondary` | `#B0B8BD` | Card descriptions, body copy, secondary labels |
| `--text-muted` | `#748087` | Eyebrow labels, uppercase sidebar section headers, item subtitles |
| `--text-accent` | `#FF7F7F` | Welcome/greeting headline and active sidebar link text |

---

## 3. Typography & Hierarchy

- **Font Family:** Clean geometric sans-serif (`Inter`, `Plus Jakarta Sans`, or system-ui fallback).
- **Scale & Weights:**
  - **Hero Title:** `32px–36px`, Bold (`700`), tight line-height (`1.15`), `#FFFFFF`
  - **Page Greeting / Highlight Title:** `22px–24px`, Bold (`700`), `--text-accent` (`#FF7F7F`)
  - **Section Heading (e.g., Quick Actions):** `18px`, Semi-Bold (`600`), `#FFFFFF`
  - **Card Title:** `15px–16px`, Semi-Bold (`600`), `#FFFFFF`
  - **Body Copy:** `14px–15px`, Regular (`400`), line-height `1.5`, `--text-secondary`
  - **Nav Item Title:** `14px`, Medium (`500`), `#FFFFFF` (or `#FF7F7F` when active)
  - **Nav Item Subtitle / Eyebrow:** `12px`, Regular (`400`), `--text-muted`
  - **Uppercase Group Header:** `11px`, Semi-Bold (`600`), letter-spacing `0.08em`, `--text-muted`

---

## 4. Layout & Structural Grid

### Application Shell
- **Two-Column Fixed-Sidebar Layout:**
  - **Left Sidebar:** Fixed width (`260px–280px`), full viewport height (`100vh`), `--bg-sidebar`, `1px solid --border-subtle` on the right edge. Collapses into a drawer on mobile/tablet viewports.
  - **Main Content Area:** Fluid width (`flex: 1`), `--bg-canvas`, generous horizontal padding (`32px–48px`) and vertical rhythm (`24px–32px` gaps).

### Main Workspace Vertical Stack
1. **Top Utility Bar (`56px–64px` height):**
   - **Left:** Dual-option environment/mode pill toggle (e.g., `Option A` / `Option B`).
   - **Right:** Compact account/profile indicator with small icon and label.
2. **Page Header Block:**
   - Small muted eyebrow label above a bold accent-colored page greeting/title.
3. **Primary Hero / Feature Card:**
   - Full-width rounded container (`border-radius: 16px`, `--bg-surface`, internal padding `36px–44px`).
   - Left-aligned content block (max-width `~580px` for readable line length) containing headline, short supporting paragraph, and a horizontal action row (1 solid pill CTA + 1 text/ghost secondary link).
4. **Collapsible / Secondary Section:**
   - Section title with optional inline chevron icon (`Quick Actions ⌄`).
   - **Responsive Card Grid:** `2` to `3` equal columns (`grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))`), `16px–20px` gap.

---

## 5. Component Specifications

### A. Sidebar Navigation
- **Brand Header:** Wordmark logo at top-left; optional trailing accent dot in `#FF7F7F`.
- **Context / Account Switcher Card:**
  - Rounded rectangle (`border-radius: 10px`), `1px solid --border-strong`, internal padding `10px 14px`.
  - Contains a `32px` circular avatar badge filled with `#FF7F7F` and bold dark initials (`--text-on-accent`), paired with the account/workspace name.
- **Standard Nav Links:**
  - Rounded row (`border-radius: 8px`), left icon (`18px`) + label.
  - **Active State:** Background `--accent-tint-bg`, text and icon `#FF7F7F`, and a `3px` vertical pill bar anchored to the far left edge in `#FF7F7F`.
- **Categorized Service/Module List:**
  - Preceded by a muted uppercase section header (e.g., `SERVICES` or `MODULES`).
  - Each item displays a `20px` outline/solid icon on the left, a primary title (`14px`), and a muted subtitle (`11px–12px`) stacked underneath.

### B. Mode / Environment Toggle Pill
- **Container:** Pill-shaped (`border-radius: 9999px`), `--pill-neutral-bg` background with `3px` inner padding (or dark container with pill slider).
- **Inactive Segment:** Muted uppercase text (`12px`, Semi-Bold).
- **Active Segment:** Filled pill in `#FF7F7F` with dark bold text (`--text-on-accent`).

### C. Buttons & Interactive Links
- **Primary CTA Button:**
  - Pill shape (`border-radius: 9999px`), padding `10px 22px`.
  - Background: `#FF7F7F`, Text: `#0E1417` (`600` weight).
  - Hover: `--accent-hover` (`#FF6666`).
- **Secondary Action Link:**
  - Transparent background, `#FFFFFF` Semi-Bold text (`14px`), subtle underline or opacity shift on hover.

### D. Action / Feature Grid Cards
- **Container:** `--bg-surface`, `1px solid --border-subtle`, `border-radius: 12px`, padding `24px`.
- **Header Row:**
  - `36px × 36px` rounded-square icon badge (`border-radius: 8px`, background `--accent-tint-bg`, stroke icon in `#FF7F7F`).
  - Card title positioned inline to the right of the icon badge.
- **Body:** 2–3 lines of concise description in `--text-secondary` (`13.5px–14px`).
- **Interaction:** Subtle border brightening (`rgba(255, 255, 255, 0.16)`) and background shift to `--bg-surface-hover` on hover.

---

## 6. Rules for Antigravity Implementation
1. **No Turquoise Leakage:** Never use teal, mint, or cyan (`#1AD1A5`, etc.). Every brand highlight, active state, icon badge, and primary CTA must reference `#FF7F7F` or `--accent-tint-bg`.
2. **Contrast Safety:** Always pair `#FF7F7F` solid fills (buttons, active toggles, avatars) with dark text (`#0E1417`) rather than white text to maintain strong WCAG contrast.
3. **Surface Separation:** Rely on subtle tonal steps (`#0E1417` canvas vs. `#1C2327` sidebar vs. `#1A2125` cards) and `1px` low-opacity borders rather than heavy drop shadows.
4. **Content Agnosticism:** Keep the layout skeleton intact regardless of use case—swap out greeting copy, hero text, sidebar module names, and quick action cards dynamically as needed.