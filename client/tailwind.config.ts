import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Spec exact variable mappings
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        foreground: 'var(--color-foreground)',
        muted: {
          DEFAULT: 'var(--color-muted-foreground)',
          foreground: 'var(--color-muted-foreground)',
          subtle: 'var(--color-muted-subtle)',
        },
        terracotta: 'var(--color-terracotta)',
        primary: 'var(--color-primary)',
        border: {
          DEFAULT: 'var(--color-border)',
          pill: 'var(--color-border-pill)',
        },
        ring: 'var(--color-ring)',

        // Semantic status tokens
        status: {
          'high-concern': {
            bg: 'var(--color-status-high-concern-bg)',
            fg: 'var(--color-status-high-concern-fg)',
            border: 'var(--color-status-high-concern-border)',
          },
          'needs-review': {
            bg: 'var(--color-status-needs-review-bg)',
            fg: 'var(--color-status-needs-review-fg)',
            border: 'var(--color-status-needs-review-border)',
          },
          'likely-genuine': {
            bg: 'var(--color-status-likely-genuine-bg)',
            fg: 'var(--color-status-likely-genuine-fg)',
            border: 'var(--color-status-likely-genuine-border)',
          },
          confirmed: {
            bg: 'var(--color-status-confirmed-bg)',
            fg: 'var(--color-status-confirmed-fg)',
            border: 'var(--color-status-confirmed-border)',
          },
          // Backwards compatibility aliases
          genuine: {
            fg: 'var(--status-likely-genuine-fg)',
            bg: 'var(--status-likely-genuine-bg)',
            border: 'var(--status-likely-genuine-border)',
          },
          review: {
            fg: 'var(--status-needs-review-fg)',
            bg: 'var(--status-needs-review-bg)',
            border: 'var(--status-needs-review-border)',
          },
          concern: {
            fg: 'var(--status-high-concern-fg)',
            bg: 'var(--status-high-concern-bg)',
            border: 'var(--status-high-concern-border)',
          },
          scam: {
            fg: 'var(--status-confirmed-scam-fg)',
            bg: 'var(--status-confirmed-scam-bg)',
            border: 'var(--status-confirmed-scam-border)',
          },
        },

        // Backward compatibility aliases
        page: 'var(--bg)',
        body: 'var(--text-body)',
        placeholder: 'var(--placeholder)',
        btn: 'var(--btn)',
        'btn-hover': 'var(--btn-hover)',
        pill: 'var(--pill)',
        accent: {
          DEFAULT: 'var(--accent)',
          text: 'var(--accent-text)',
          light: 'var(--accent-light)',
        },
        hairline: 'var(--hairline)',
        control: 'var(--border-control)',

        outcome: {
          pass: {
            fg: 'var(--outcome-pass-fg)',
            bg: 'var(--outcome-pass-bg)',
            border: 'var(--outcome-pass-border)',
          },
          fail: {
            fg: 'var(--outcome-fail-fg)',
            bg: 'var(--outcome-fail-bg)',
            border: 'var(--outcome-fail-border)',
          },
          unknown: {
            fg: 'var(--outcome-unknown-fg)',
            bg: 'var(--outcome-unknown-bg)',
            border: 'var(--outcome-unknown-border)',
          },
          neutral: {
            fg: 'var(--outcome-neutral-fg)',
            bg: 'var(--outcome-neutral-bg)',
            border: 'var(--outcome-neutral-border)',
          },
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          'Noto Sans Devanagari',
          'Noto Sans Kannada',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
        kannada: ['"Noto Sans Kannada"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        btn: 'var(--radius-button)',
        card: 'var(--radius-card)',
        input: 'var(--radius-input)',
        chip: 'var(--radius-chip)',
        pill: 'var(--radius-pill)',
      },
      maxWidth: {
        editorial: 'var(--container-max)',
        analyze: 'var(--container-analyze)',
      },
      height: {
        header: 'var(--header-height)',
      },
    },
  },
  plugins: [],
} satisfies Config;
