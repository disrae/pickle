/** @type {import('tailwindcss').Config} */

// Every semantic color reads from a CSS variable defined in `lib/theme.ts`,
// so light/dark theming + opacity modifiers (e.g. `bg-brand/20`) work everywhere.
const withVar = (name) => `rgb(var(${name}) / <alpha-value>)`;

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Surfaces
        background: {
          DEFAULT: withVar("--color-background"),
          foreground: withVar("--color-foreground"),
        },
        surface: {
          DEFAULT: withVar("--color-surface"),
          2: withVar("--color-surface-2"),
        },
        card: {
          DEFAULT: withVar("--color-card"),
          foreground: withVar("--color-card-foreground"),
        },
        popover: {
          DEFAULT: withVar("--color-popover"),
          foreground: withVar("--color-popover-foreground"),
        },

        // Text
        foreground: {
          DEFAULT: withVar("--color-foreground"),
          muted: withVar("--color-muted-foreground"),
        },

        // Brand (Volt)
        brand: {
          DEFAULT: withVar("--color-brand"),
          foreground: withVar("--color-brand-foreground"),
          strong: withVar("--color-brand-strong"),
          subtle: withVar("--color-brand-subtle"),
        },

        // Competition (Amber) — ladder / tournament / ranking
        competition: {
          DEFAULT: withVar("--color-competition"),
          foreground: withVar("--color-competition-foreground"),
        },

        // Primary (high-contrast ink)
        primary: {
          DEFAULT: withVar("--color-primary"),
          foreground: withVar("--color-primary-foreground"),
        },

        // Neutral surfaces
        secondary: {
          DEFAULT: withVar("--color-secondary"),
          foreground: withVar("--color-secondary-foreground"),
        },
        accent: {
          DEFAULT: withVar("--color-accent"),
          foreground: withVar("--color-accent-foreground"),
        },
        muted: {
          DEFAULT: withVar("--color-muted"),
          foreground: withVar("--color-muted-foreground"),
        },

        // Status
        destructive: {
          DEFAULT: withVar("--color-destructive"),
          foreground: withVar("--color-destructive-foreground"),
        },
        success: {
          DEFAULT: withVar("--color-success"),
          foreground: withVar("--color-success-foreground"),
        },
        warning: {
          DEFAULT: withVar("--color-warning"),
          foreground: withVar("--color-warning-foreground"),
        },
        info: {
          DEFAULT: withVar("--color-info"),
          foreground: withVar("--color-info-foreground"),
        },

        // Lines & focus
        border: withVar("--color-border"),
        input: withVar("--color-input"),
        ring: withVar("--color-ring"),
      },
      borderRadius: {
        "4xl": "28px",
      },
    },
  },
  plugins: [],
};
