/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        page: 'var(--bg)',
        surface: 'var(--surface)',
        primary: 'var(--text)',
        body: 'var(--text-body)',
        muted: 'var(--text-muted)',
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
        status: {
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
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
        kannada: ['"Noto Sans Kannada"', 'sans-serif'],
      },
      borderRadius: {
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
};
