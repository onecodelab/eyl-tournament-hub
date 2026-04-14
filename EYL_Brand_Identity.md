# EYL Tournament Hub — Brand Identity Guidelines

**Theme Name:** Neon Professionalism
**Core Concept:** A premium, high-performance command center aesthetic merging the cinematic intensity of the Premier League with the analytical precision of elite esports.

---

## 1. Color Palette System

The interface relies on deeply saturated dark tones contrasted with extreme "neon" highlights to command attention and organize information hierarchically.

*   **Deep Navy (Base Background):** `hsl(var(--eyl-navy))` / `#0e1b31` 
    *   *Usage:* The primary background for all major pages. It provides a deeper, richer void than pure black or generic dark grays.
*   **Neon Cyan (Primary Highlight):** `#00e5ff`
    *   *Usage:* Primary calls-to-action (CTAs), live badges, and active navigation states.
*   **Cyan Gradient (Action Gradient):** `linear-gradient(135deg, #00e5ff 0%, #0099aa 100%)` (Maps to `.bg-eyl-gradient`)
    *   *Usage:* Read Article buttons, Hero CTA buttons, and highlighted marketing accents.
*   **Ghost Borders:** `rgba(255, 255, 255, 0.05)` to `rgba(255, 255, 255, 0.1)`
    *   *Usage:* Used almost exclusively for borders on cards. We actively avoid harsh border colors, preferring subtle light refraction (glassmorphism).

---

## 2. Typography

The typography creates a dichotomy between "cinematic hype" and "analytical data."

### Primary Headings (Cinematic)
*   **Style:** `text-3xl` to `text-5xl`, `font-black`, `text-white`, `uppercase`, `italic`, `tracking-tighter`, `leading-[1.1]`.
*   **Usage:** Used on Hero Sections and major story headlines to replicate modern football broadcasting packages (e.g., LALIGA, Premier League).

### Technical Tags & Micro-copy (Analytical)
*   **CSS Class:** `.data-precision-mono`
*   **Style:** `text-[10px]` to `text-xs`, strictly Monospace, `uppercase`, extreme tracking (`tracking-[0.2em]` to `tracking-[0.3em]`), `text-primary`.
*   **Usage:** Used for category tags (e.g., "HEADLINE STORY", "MATCH CENTRE"), timestamps, and navigation links.

### Tabular Numbers (Data Precision)
*   **CSS Class:** `.data-precision`
*   **Style:** Standard font but utilizing `font-variant-numeric: tabular-nums;`.
*   **Usage:** Mandatory for all player statistics, match scores, standings points, and goal differences so columns align flawlessly.

---

## 3. UI Components & CSS Primitives

The core identity is powered by several custom CSS utility classes that you should carry over to mobile or other platforms.

*   `.glass-card`
    *   *Effect:* A dark translucent surface (`bg-white/5`) with a subtle ghost border and an intense blur backing (`backdrop-blur-xl`). 
    *   *Usage:* Holds news items, stats, and match scoreboards.
*   `.live-badge`
    *   *Effect:* A pulsating neon indicator indicating active real-time events.
*   `.live-card-pulse`
    *   *Effect:* Used on Match Cards that are currently in progress. Applies an infinitely glowing/breathing effect to the border shadow using the Primary Neon Cyan.

---

## 4. Layout & Grid Principles

*   **Asymmetrical Matrix (`.news-grid-laliga`):**
    *   Unlike traditional balanced 2-column or 3-column layouts, the EYL hub prioritizes one massive "Hero" focal point for stories/matches, juxtaposed against high-density, compact lists on the side. 
*   **Radial Glows:**
    *   Instead of flat backgrounds, hero sections use large, sweeping, low-opacity radial gradients behind the text to simulate stadium lighting or command-center ambiance.
    *   *Example:* `bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_60%)]`

---

## 5. Mobile Translation Notes (For EYL-mobile-apk)

If you are currently migrating this styling back to React Native / Expo:
1.  **Drop Shadows:** React Native handles shadows differently (especially on Android). Use explicit `elevation` to simulate the glow, or render an SVG radial gradient behind your elements.
2.  **Typography Customization:** Ensure you pre-load a heavy, italic sans-serif font for your headings, and a reliable monospace font for your `.data-precision-mono` tags, as default system fonts lack the necessary aggressiveness.
3.  **BlurViews:** Utilize `expo-blur` heavily to recreate the `.glass-card` effect over the React Native `ImageBackground` components.
