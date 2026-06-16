---
name: Culinary Intelligence System
colors:
  surface: '#f7fbf1'
  surface-dim: '#d8dbd2'
  surface-bright: '#f7fbf1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f5eb'
  surface-container: '#ecefe5'
  surface-container-high: '#e6e9e0'
  surface-container-highest: '#e0e4da'
  on-surface: '#191d17'
  on-surface-variant: '#41493d'
  inverse-surface: '#2d322b'
  inverse-on-surface: '#eff2e8'
  outline: '#717a6c'
  outline-variant: '#c1c9ba'
  surface-tint: '#2e6b27'
  primary: '#165413'
  on-primary: '#ffffff'
  primary-container: '#306d29'
  on-primary-container: '#a9ed99'
  inverse-primary: '#94d786'
  secondary: '#2a6c25'
  on-secondary: '#ffffff'
  secondary-container: '#acf59d'
  on-secondary-container: '#30722a'
  tertiary: '#7c2a4f'
  on-tertiary: '#ffffff'
  tertiary-container: '#994267'
  on-tertiary-container: '#ffcedd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0f49f'
  primary-fixed-dim: '#94d786'
  on-primary-fixed: '#002201'
  on-primary-fixed-variant: '#135211'
  secondary-fixed: '#acf59d'
  secondary-fixed-dim: '#91d883'
  on-secondary-fixed: '#002201'
  on-secondary-fixed-variant: '#0c530e'
  tertiary-fixed: '#ffd9e4'
  tertiary-fixed-dim: '#ffb0cc'
  on-tertiary-fixed: '#3e0020'
  on-tertiary-fixed-variant: '#7a294d'
  background: '#f7fbf1'
  on-background: '#191d17'
  surface-variant: '#e0e4da'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is engineered for high-performance restaurant management, blending the utilitarian clarity of **Linear** with the editorial elegance of **Notion**. The brand personality is authoritative yet approachable, positioning the platform as a sophisticated partner in culinary operations rather than just a tool.

The visual style follows a **Modern Corporate** aesthetic with **Glassmorphism** accents. It prioritizes information density and clarity while using soft, organic textures to reflect the hospitality industry. The user interface utilizes generous whitespace, subtle depth through layered surfaces, and precision-engineered typography to evoke a sense of premium reliability.

## Colors
The palette is rooted in organic tones that resonate with fresh ingredients and high-end dining environments. 

- **Primary Green (#306D29):** Used for main action buttons, active states, and primary branding elements. It represents growth and efficiency.
- **Secondary Green (#0D530E):** Reserved for deep accents, navigation headers, and heavy-duty interactive elements.
- **Accent Purple (#994267):** A sophisticated counterpoint used specifically for data visualization, analytics highlights, and secondary call-to-actions to ensure visual variety.
- **Neutral Gray (#747870):** Balanced for secondary text, UI borders, and iconography to maintain a soft contrast against the off-white background.
- **Surface & Background:** The background uses a warm off-white (#F7F7F5) to reduce eye strain during long shifts, while white (#FFFFFF) is reserved for elevated cards and containers.

## Typography
The typography strategy creates a high-end editorial feel through a serif/sans-serif pairing. 

**Source Serif 4** is used for headlines to convey tradition, trust, and the "literary" nature of a menu or wine list. It should be used with tighter letter-spacing in larger sizes.

**Work Sans** provides a clean, neutral balance for functional data. It is highly legible in the fast-paced environment of a kitchen or floor-management dashboard. Use `label-sm` for table headers and technical metadata to maximize screen real estate without sacrificing readability.

## Layout & Spacing
The layout follows a **Fixed-Fluid hybrid grid**. Sidebars and navigation menus use fixed widths to maintain structural consistency, while the main dashboard area utilizes a 12-column fluid grid.

- **Desktop:** 12-column grid, 24px gutters, 40px outer margins.
- **Tablet:** 8-column grid, 16px gutters, 24px outer margins.
- **Mobile:** 4-column grid, 16px gutters, 16px outer margins.

Spacing follows a 4px baseline shift, but primarily utilizes 8px increments. Density is key: use `md` (16px) for internal card padding and `lg` (24px) for spacing between major sections.

## Elevation & Depth
Depth is communicated through a combination of **Tonal Layers** and **Ambient Shadows**. This design system avoids harsh blacks, opting instead for shadows tinted with the Primary Green to maintain a cohesive atmosphere.

1.  **Level 0 (Base):** #F7F7F5 background.
2.  **Level 1 (Cards):** #FFFFFF surface with a 1px border (#E5E7EB) and a soft ambient shadow: `0 4px 12px rgba(48, 109, 41, 0.04)`.
3.  **Level 2 (Dropdowns/Popovers):** #FFFFFF surface with a defined shadow: `0 12px 24px rgba(48, 109, 41, 0.08)`.
4.  **Level 3 (Modals):** Glassmorphism overlay (Backdrop blur: 12px, 60% opacity background) with a high-contrast shadow.

Glassmorphism should be applied sparingly to global navigation sidebars and top bars to create a sense of lightness and modernism.

## Shapes
The shape language is "Premium Soft." By using a **Rounded (0.5rem / 8px)** base, the UI feels modern and tactile without becoming overly playful or "bubbly."

- **Standard Buttons & Inputs:** 8px (0.5rem).
- **Cards & Large Containers:** 12px - 16px (0.75rem - 1rem).
- **Status Chips:** Full pill-shape (999px) to distinguish them from interactive buttons.
- **Image Containers:** Consistent 12px corner radius to mirror card containers.

## Components

### Buttons
- **Primary:** Solid #306D29 with white text. 8px radius. Soft shadow on hover.
- **Secondary:** Ghost style with #306D29 border and text. 
- **Tertiary:** Accent Purple (#994267) for high-impact analytics or seasonal promotion actions.

### Inputs
- Background: #FFFFFF. Border: 1px solid #747870 (at 30% opacity). Focus state: 1px solid #306D29 with a 2px outer glow in primary green at 10% opacity.

### Chips & Badges
- Used for order status (e.g., "In Progress", "Completed"). Use status colors with a 10% opacity background of the same hue for a "soft badge" look.

### Cards
- Use for table overviews, financial summaries, and inventory items. Cards must have a 16px radius and Level 1 elevation. 

### Sophisticated Iconography
- Icons should be **Line style** (2px stroke) using the Neutral Gray or Primary Green. Avoid filled icons except for active navigation states. Use icons from a refined set (e.g., Phosphor or Lucide) to maintain the technical, clean aesthetic of Linear.