import { vars } from "nativewind";

/**
 * WePickle design tokens — single source of truth for color.
 *
 * These CSS variables are consumed by `tailwind.config.js` via
 * `rgb(var(--token) / <alpha-value>)`, so every semantic class
 * (`bg-background`, `text-foreground`, `bg-brand`, etc.) is theme-aware.
 *
 * Brand:
 *  - brand  = "Volt" pickleball lime-green (energy, primary CTAs)
 *  - ink    = green-tinted near-black (structure, text)
 *  - competition = amber, reserved for ladder / tournament / ranking
 *
 * Values are space-separated RGB triplets (no rgb() wrapper) so Tailwind
 * can apply opacity modifiers like `bg-brand/20`.
 */
export const themes = {
    light: vars({
        // Surfaces
        "--color-background": "250 250 247", // warm paper
        "--color-surface": "255 255 255",
        "--color-surface-2": "243 244 239",
        "--color-card": "255 255 255",
        "--color-card-foreground": "18 23 15",
        "--color-popover": "255 255 255",
        "--color-popover-foreground": "18 23 15",

        // Text
        "--color-foreground": "18 23 15", // ink
        "--color-muted-foreground": "92 100 84",

        // Brand (Volt)
        "--color-brand": "132 204 22",
        "--color-brand-foreground": "21 28 12",
        "--color-brand-strong": "101 163 13",
        "--color-brand-subtle": "233 246 211",

        // Competition (Amber) — ladder / tournament / ranking only
        "--color-competition": "245 158 11",
        "--color-competition-foreground": "36 22 4",

        // Primary (high-contrast ink for solid dark elements)
        "--color-primary": "18 23 15",
        "--color-primary-foreground": "250 250 247",

        // Secondary / accent / muted (neutral surfaces)
        "--color-secondary": "243 244 239",
        "--color-secondary-foreground": "18 23 15",
        "--color-accent": "243 244 239",
        "--color-accent-foreground": "18 23 15",
        "--color-muted": "243 244 239",

        // Status
        "--color-destructive": "220 38 38",
        "--color-destructive-foreground": "250 250 250",
        "--color-success": "22 163 74",
        "--color-success-foreground": "250 250 250",
        "--color-warning": "234 179 8",
        "--color-warning-foreground": "28 22 4",
        "--color-info": "14 165 233",
        "--color-info-foreground": "250 250 250",

        // Lines & focus
        "--color-border": "226 228 219",
        "--color-input": "226 228 219",
        "--color-ring": "132 204 22",
    }),

    dark: vars({
        // Surfaces (green-tinted charcoal)
        "--color-background": "11 14 9",
        "--color-surface": "20 25 16",
        "--color-surface-2": "28 34 22",
        "--color-card": "20 25 16",
        "--color-card-foreground": "244 247 240",
        "--color-popover": "20 25 16",
        "--color-popover-foreground": "244 247 240",

        // Text
        "--color-foreground": "244 247 240",
        "--color-muted-foreground": "158 167 147",

        // Brand (Volt — brighter on dark)
        "--color-brand": "163 230 53",
        "--color-brand-foreground": "12 16 8",
        "--color-brand-strong": "132 204 22",
        "--color-brand-subtle": "30 40 17",

        // Competition (Amber)
        "--color-competition": "251 191 36",
        "--color-competition-foreground": "28 18 4",

        // Primary (light ink on dark)
        "--color-primary": "244 247 240",
        "--color-primary-foreground": "14 18 10",

        // Secondary / accent / muted
        "--color-secondary": "28 34 22",
        "--color-secondary-foreground": "244 247 240",
        "--color-accent": "28 34 22",
        "--color-accent-foreground": "244 247 240",
        "--color-muted": "28 34 22",

        // Status
        "--color-destructive": "248 113 113",
        "--color-destructive-foreground": "28 10 10",
        "--color-success": "74 222 128",
        "--color-success-foreground": "5 26 13",
        "--color-warning": "250 204 21",
        "--color-warning-foreground": "28 22 4",
        "--color-info": "56 189 248",
        "--color-info-foreground": "6 20 28",

        // Lines & focus
        "--color-border": "38 45 30",
        "--color-input": "38 45 30",
        "--color-ring": "163 230 53",
    }),
} as const;
