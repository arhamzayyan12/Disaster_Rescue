# DisasterRescue: Design System & Visual Strategy
**Role:** Principal Experience Designer
**Version:** 2.0 (Crisis Authority Theme)
**Date:** December 18, 2025

## 1. Design Philosophy: "Calm Authority"
The interface must act as a stabilizer in chaos. It should not scream "Technology" via neon blues; it should whisper "Control" via grounded charcoal tones and extremely precise semantic colors.

**Core Principles:**
1.  **Canvas, Not Decoration**: The UI is a dark, neutral stage. Only *data* (alerts) gets color.
2.  **One Glance, One Truth**: Users must know the severity of a situation without reading text.
3.  **Visual Silence**: If everything is important, nothing is. Reduce noise to amplify signals.

---

## 2. Refined Color Palette

### 2.1 The "Control" Canvas (Basics)
Moving away from "Tech Blue" to "Command Center Charcoal". This reduces long-term eye strain (Computer Vision Syndrome) and increases the relative luminance of alert colors.

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `surface-void` | `#0f1115` | App Background (The Void) |
| `surface-ground`| `#181b21` | Sidebar, Panels (The Ground) |
| `surface-card` | `#22262e` | Individual Cards (Elevated) |
| `surface-highlight` | `#2d333b` | Hover States / Inputs |
| `border-subtle` | `#363c45` | Separators (Non-distracting) |

### 2.2 Semantic Alert Colors (The Signal)
Strictly utilitarian. Saturation = Urgency.

| Level | Semantic Meaning | Color Family | Hex Value | Usage Rule |
| :--- | :--- | :--- | :--- | :--- |
| **CRITICAL** | Life Threat / Evacuate | **Infrared** | `#ff4d4d` | Glow permitted. Backgrounds allowed. |
| **HIGH** | Dangerous Conditions | **Burnt Amber** | `#ff9f1c` | Solid badges. No large backgrounds. |
| **MEDIUM** | Advisory / Watch | **Signal Gold** | `#ffd166` | Accents and text only. |
| **LOW** | Information / Weather | **Data Teal** | `#2ec4b6` | Icons and subtle indicators. |
| **SAFE** | Stable / Relief | **Vital Green** | `#20bf6b` | Success states and safe zones. |

### 2.3 Typography Contrast (Hierarchy)
| Token | value | Usage |
| :--- | :--- | :--- |
| `text-primary` | `#f0f4f8` | Headings, Critical Data |
| `text-secondary` | `#9baecf` | Body text, Descriptions |
| `text-tertiary` | `#63748e` | Metadata, Timestamps (Low priority) |

---

## 3. UI Component Patterns

### 3.1 The Alert Card (Live News / Lists)
**Problem:** Current cards blend together.
**Solution:** "Severity Stripe" Pattern.

*   **Structure**: Dark Card (`#22262e`) + Severity Left Border (4px solid `color-severity`).
*   **Typography**: Title is white/bright. Summary is secondary gray.
*   **Visual Logic**:
    *   *Critical*: Card has a subtle red background tint (`rgba(255, 77, 77, 0.05)`).
    *   *Normal*: Card background is neutral.
    *   *Action*: Hover lifts the card `-2px`.

### 3.2 The Map Interface (Spatial Context)
*   **Base Map**: Use "Dark Matter" or "Carto Dark" styles. The map tiles must not compete with impact zones.
*   **Markers**:
    *   *Point*: Solid circle with white border (high contrast).
    *   *Cluster*: Type-aware color (Red if cluster contains >1 Critical event).
    *   *Pulse*: CSS `box-shadow` animation **ONLY** for Critical markers.

### 3.3 The Dashboard Layout (Focal Point)
*   **Hierarchy**: Map is King (~70% Screen). Sidebar is Context (~30%).
*   **Glassmorphism**: Use *extremely* subtle backdrop blur (`backdrop-filter: blur(8px)`) for overlays to maintain context of the map underneath, but avoid "frosted glass" aesthetic which feels too playful. Use `rgba(15, 17, 21, 0.85)`.

---

## 4. Accessibility & Fatigue Control (WCAG AA)
*   **Contrast**: Critical alerts against data backgrounds must exceed 4.5:1 ratio.
*   **Color Blindness**:
    *   Never rely on Color alone.
    *   *Bad*: A red dot vs a green dot.
    *   *Good*: A red **Square** vs a green **Circle**, or text labels ("CRIT" vs "SAFE").
*   **Motion**:
    *   `prefers-reduced-motion` media query must disable pulsing markers.
    *   Animations > 400ms are banned (too slow).
    *   Animations < 150ms are banned (too jerky). Target **250ms cubic-bezier**.

## 5. Implementation Roadmap
1.  **Phase 1: Variables**: Replace `index.css` generic blues with the "Control" palette.
2.  **Phase 2: Card Redesign**: Refactor `LiveNews` to use Severity Stripes.
3.  **Phase 3: Map Polish**: Update marker logic in `DisasterMap` to strictly follow the visual hierarchy (Pulse only on Critical).

> *"In a crisis, clarity is kindness."*
