# Design System: Toujours Knot

## 1. Visual Theme & Atmosphere
**Atmosphere:** "Whimsical Garden & Cozy Craft"
The aesthetic is designed to be "cute," inviting, and airy. It emphasizes softness, warmth, and a sense of artisanal care. The mood is light-hearted and feminine, utilizing generous whitespace and rounded elements to create a friendly, non-intimidating shopping experience.

**Core Principles:**
- **Softness:** Avoid sharp corners; use organic, rounded shapes.
- **Clarity:** High contrast for readability but muted tones for the background to prevent eye strain.
- **Responsiveness:** Mobile-first approach with fluid transitions to ensure "zero lagging" feel.

## 2. Color Palette & Roles
- **Blossom Pink (#FFD1DC):** Primary Brand Color. Used for primary call-to-actions, accents, and highlights.
- **Sage Mist (#B2C2A2):** Secondary Brand Color. Used for nature-related elements, "Leaf" customization options, and success states.
- **Creamy Vanilla (#FFFDF5):** Main Background. Used as the primary page background to keep the site feeling warm and airy.
- **Charcoal Berry (#4A4A4A):** Primary Text. A soft off-black for high readability without the harshness of pure black.
- **Golden Honey (#FFD700):** Accent Color. Used for star ratings, special offers, and "Charm" highlights.

## 3. Typography Rules
- **Headings:** *Playfair Display* (Serif). Elegant and whimsical, used for page titles and product names.
- **Body:** *Quicksand* (Sans-Serif). Rounded, friendly, and highly legible, used for descriptions and UI elements.
- **Weights:**
    - Bold for headers and price points.
    - Medium/Regular for product details.
    - Light for secondary information (e.g., "Free shipping").

## 4. Component Stylings
- **Buttons:** 
    - Shape: Pill-shaped (`rounded-full`).
    - Style: Solid Blossom Pink with a subtle hover lift (Y-axis translation) and a soft glow.
- **Cards/Containers:**
    - Shape: Generously rounded corners (`rounded-2xl`).
    - Background: White with a whisper-soft diffused shadow (`shadow-sm`) to create depth without clutter.
- **Inputs/Forms:**
    - Style: Soft-grey borders with a Blossom Pink focus ring. 
    - Shape: Rounded corners to match the card aesthetic.

## 5. Layout Principles
- **Whitespace:** Liberal use of padding and margins to prevent a "cluttered" feel.
- **Grid:** Flexible CSS Grid for product displays, ensuring seamless transitions between mobile (1 column) and desktop (3-4 columns).
- **Interactions:** Micro-animations (e.g., heart icon popping when favorited) to enhance the "cute" factor without impacting performance.

---

# Implementation Roadmap

## Phase 1: Foundation & Core UI
- [ ] Setup project structure and theme configuration.
- [ ] Implement Home Page (Hero section, Featured Categories).
- [ ] Build Product Listing Page (Bouquets & Keychains).

## Phase 2: The Customization Engine (Priority)
- [ ] **Custom Bouquet Builder:** 
    - Step 1: Select Base Flowers.
    - Step 2: Add Fillers/Leaves.
    - Step 3: Choose Wrapping Paper.
    - Real-time visual preview of the selection.
- [ ] Keychain product detail pages.

## Phase 3: Commerce & User Flow
- [ ] Shopping Cart & Drawer.
- [ ] Checkout flow (Shipping, Payment, Review).
- [ ] User Account/Order History.

## Phase 4: Performance Optimization
- [ ] Image optimization (WebP/AVIF) for fast loading.
- [ ] Lazy loading for product grids.
- [ ] Skeleton screens for "zero lag" perceived performance.
