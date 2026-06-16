# Design System - SmartRestaurant

## Palette de Couleurs

### Couleurs Principales
| Nom | Hex | Usage |
|-----|-----|-------|
| Primary | `#306D29` | Boutons principaux, actions, navigation active |
| Primary Dark | `#0D530E` | Accents profonds, headers |
| Primary Light | `#94d786` | États hover, focus |
| Primary Container | `#306d29` | Backgrounds primaires |
| Primary Fixed | `#b0f49f` | Éléments fixes clairs |
| Primary Fixed Dim | `#94d786` | Éléments fixes atténués |

### Couleurs Secondaires
| Nom | Hex | Usage |
|-----|-----|-------|
| Secondary | `#2a6c25` | Éléments secondaires |
| Secondary Container | `#acf59d` | Backgrounds secondaires |
| Secondary Fixed | `#acf59d` | Éléments fixes secondaires |
| Secondary Fixed Dim | `#91d883` | Éléments fixes atténués |

### Couleurs Tertiaires
| Nom | Hex | Usage |
|-----|-----|-------|
| Tertiary | `#7c2a4f` | Données, analytics |
| Tertiary Container | `#994267` | CTAs secondaires, badges |
| Tertiary Fixed | `#ffd9e4` | Éléments fixes tertiaires |
| Tertiary Fixed Dim | `#ffb0cc` | Éléments fixes atténués |

### Couleurs Neutres
| Nom | Hex | Usage |
|-----|-----|-------|
| Error | `#ba1a1a` | Erreurs, alerts |
| Error Container | `#ffdad6` | Backgrounds d'erreur |
| Background | `#f7fbf1` | Fond principal (chaud) |
| Surface | `#f7fbf1` | Surfaces de base |
| Surface Dim | `#d8dbd2` | Surfaces atténuées |
| Surface Bright | `#f7fbf1` | Surfaces brillantes |
| Surface Container | `#ecefe5` | Conteneurs de surface |
| Surface Container Low | `#f2f5eb` | Conteneurs bas |
| Surface Container High | `#e6e9e0` | Conteneurs hauts |
| Surface Container Highest | `#e0e4da` | Conteneurs les plus hauts |
| Surface Container Lowest | `#ffffff` | Conteneurs les plus bas (blanc) |
| On Surface | `#191d17` | Texte sur surface |
| On Surface Variant | `#41493d` | Texte secondaire |
| Inverse Surface | `#2d322b` | Surfaces inversées (dark) |
| Inverse On Surface | `#eff2e8` | Texte sur surface inversée |
| Inverse Primary | `#94d786` | Primary en mode inversé |
| Outline | `#717a6c` | Bordures |
| Outline Variant | `#c1c9ba` | Bordures variantes |
| Surface Tint | `#2e6b27` | Teinte de surface |

### Couleurs "On" (Texte sur couleur)
| Nom | Hex | Usage |
|-----|-----|-------|
| On Primary | `#ffffff` | Texte sur primary |
| On Primary Container | `#a9ed99` | Texte sur primary container |
| On Primary Fixed | `#002201` | Texte sur primary fixed |
| On Primary Fixed Variant | `#135211` | Texte sur primary fixed variant |
| On Secondary | `#ffffff` | Texte sur secondary |
| On Secondary Container | `#30722a` | Texte sur secondary container |
| On Secondary Fixed | `#002201` | Texte sur secondary fixed |
| On Secondary Fixed Variant | `#0c530e` | Texte sur secondary fixed variant |
| On Tertiary | `#ffffff` | Texte sur tertiary |
| On Tertiary Container | `#ffcedd` | Texte sur tertiary container |
| On Tertiary Fixed | `#3e0020` | Texte sur tertiary fixed |
| On Tertiary Fixed Variant | `#7a294d` | Texte sur tertiary fixed variant |
| On Error | `#ffffff` | Texte sur error |
| On Error Container | `#93000a` | Texte sur error container |
| On Background | `#191d17` | Texte sur background |

## Typographie

### Fonts
- **Headlines** : `Source Serif 4` (serif) - Tradition, confiance, élégance éditoriale
- **Body/UI** : `Work Sans` (sans-serif) - Propre, lisible pour environnements rapides

### Scale
| Nom | Taille | Line Height | Weight | Usage |
|-----|--------|-------------|--------|-------|
| display-lg | 48px | 56px | 700 | Titres principaux, hero |
| headline-lg | 32px | 40px | 600 | Titres de section |
| headline-md | 24px | 32px | 600 | Sous-titres |
| headline-sm | 20px | 28px | 600 | Titres de carte |
| body-lg | 18px | 28px | 400 | Texte principal grand |
| body-md | 16px | 24px | 400 | Texte principal |
| body-sm | 14px | 20px | 400 | Texte secondaire |
| label-md | 14px | 16px | 500 | Labels, boutons |
| label-sm | 12px | 16px | 600 | Badges, petits labels |

## Espacement

### Margins
- **margin-desktop** : 40px
- **margin-mobile** : 16px

### Gutters
- **gutter** : 24px (desktop)
- **gutter-tablet** : 16px
- **gutter-mobile** : 16px

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

## Border Radius

- **DEFAULT** : 0.25rem (4px)
- **lg** : 0.5rem (8px) - Boutons, inputs
- **xl** : 0.75rem (12px) - Cards
- **2xl** : 1rem (16px) - Large cards
- **full** : 9999px - Pills, avatars

## Shadows

### Ambient Shadows (teintées vert)
- **ambient-shadow-sm** : `0 4px 12px rgba(48, 109, 41, 0.04)` - Cards légères
- **ambient-shadow-md** : `0 12px 24px rgba(48, 109, 41, 0.08)` - Cards élevées, dropdowns

### Glassmorphism
- **glass-panel** : `background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(12px)`

## Composants

### Boutons

#### Primary
```css
bg-primary text-on-primary hover:bg-primary-dark hover:shadow-md
```
- Background: `#306D29`
- Texte: Blanc
- Hover: `#0D530E` + shadow

#### Secondary
```css
bg-surface-container-highest text-on-surface border border-outline-variant/50 hover:bg-surface-container-high
```
- Background: `#e0e4da`
- Bordure: `#c1c9ba` à 50%
- Hover: `#e6e9e0`

#### Tertiary
```css
bg-tertiary-container text-on-tertiary hover:opacity-90
```
- Background: `#994267`
- Texte: Blanc
- Hover: opacity 90%

#### Ghost
```css
text-on-surface-variant hover:bg-surface-container-high
```
- Transparent
- Texte: `#41493d`
- Hover: `#e6e9e0`

### Inputs
- Background: `#ffffff` (surface-container-lowest)
- Bordure: `#c1c9ba` à 50%
- Focus: Bordure `#306D29` + ring `#306D29` à 20%
- Error: Bordure `#ba1a1a`
- Padding: 10px vertical, 16px horizontal (44px avec icône)

### Cards
- Background: `#ffffff`
- Bordure: `#c1c9ba` à 30%
- Border radius: 12-16px
- Shadow: ambient-shadow-sm ou ambient-shadow-md

### Badges/Chips
- Background: Couleur à 10-20% d'opacité
- Texte: Couleur principale
- Border radius: pill (999px)
- Padding: 4px 8px

## Icons

### Material Symbols Outlined
- Style: Line (2px stroke)
- Fill: 0 (outlined) ou 1 (filled) pour états actifs
- Taille: 20-24px standard, 32px pour les grands icons

## Responsive

### Desktop (>1024px)
- 12 colonnes
- Gutter: 24px
- Margin: 40px
- TopNavBar visible

### Tablet (768px - 1024px)
- 8 colonnes
- Gutter: 16px
- Margin: 24px
- TopNavBar visible

### Mobile (<768px)
- 4 colonnes
- Gutter: 16px
- Margin: 16px
- BottomNavBar visible
- TopNavBar caché

## Animations

### Transitions
- **duration-200** : Transitions standard (hover, focus)
- **duration-500** : Transitions d'images (scale)
- **duration-700** : Transitions lentes (hero images)

### Hover Effects
- **Cards** : `group-hover:scale-105` sur les images
- **Boutons** : `active:scale-[0.98]` pour feedback tactile
- **Links** : Changement de couleur + underline

### Micro-interactions
- Focus ring sur inputs
- Scale sur boutons au clic
- Opacity sur boutons au hover
- Backdrop blur sur navbars

## Layout Patterns

### Bento Grid
Utilisé pour les Signature Dishes :
```css
grid grid-cols-12 gap-gutter auto-rows-[250px]
```
- Grande carte : `col-span-8 row-span-2`
- Petites cartes : `col-span-4 row-span-1`

### Split Screen (Login/Register)
- Left : `w-5/12` (visual, hidden mobile)
- Right : `w-7/12` (form)

### Three Panel (Caissier)
- Left : 320px (tables list)
- Center : flex-1 (order details)
- Right : 384px (payment actions)

## Dark Mode

Supporté via `darkMode: "class"` :
- Ajouter `class="dark"` sur `<html>` pour activer
- Couleurs inversées automatiquement via les variables `inverse-*`
