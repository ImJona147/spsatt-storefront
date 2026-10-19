SPSATT cuenta con logo, colores y demás, los logos serán colocado dentro de la carpeta public más adelante, pero llevaran el nombre spsatt.svg o similar al formato .jpe, .png

Tomar en cuenta este thema que se aplicará más adelante al diseño.
@import "tailwindcss";

@custom-variant dark (&:is(.dark \*));

:root {
--background: oklch(0.9851 0 0);
--foreground: oklch(0.2303 0.0125 264.2926);
--card: oklch(1.0000 0 0);
--card-foreground: oklch(0.2303 0.0125 264.2926);
--popover: oklch(1.0000 0 0);
--popover-foreground: oklch(0.2303 0.0125 264.2926);
--primary: oklch(0.4258 0.1189 270.0203);
--primary-foreground: oklch(1.0000 0 0);
--secondary: oklch(0.9611 0.0070 268.5473);
--secondary-foreground: oklch(0.4258 0.1189 270.0203);
--muted: oklch(0.9702 0 0);
--muted-foreground: oklch(0.5544 0.0407 257.4166);
--accent: oklch(0.9611 0.0070 268.5473);
--accent-foreground: oklch(0.4258 0.1189 270.0203);
--destructive: oklch(0.5858 0.2220 17.5846);
--destructive-foreground: oklch(1.0000 0 0);
--border: oklch(0.9288 0.0126 255.5078);
--input: oklch(0.9288 0.0126 255.5078);
--ring: oklch(0.4258 0.1189 270.0203);
--chart-1: oklch(0.4258 0.1189 270.0203);
--chart-2: oklch(0.5854 0.2041 277.1173);
--chart-3: oklch(0.6231 0.1880 259.8145);
--chart-4: oklch(0.7107 0.0351 256.7878);
--chart-5: oklch(0.8690 0.0198 252.8943);
--sidebar: oklch(1.0000 0 0);
--sidebar-foreground: oklch(0.2303 0.0125 264.2926);
--sidebar-primary: oklch(0.4258 0.1189 270.0203);
--sidebar-primary-foreground: oklch(1.0000 0 0);
--sidebar-accent: oklch(0.9611 0.0070 268.5473);
--sidebar-accent-foreground: oklch(0.4258 0.1189 270.0203);
--sidebar-border: oklch(0.9288 0.0126 255.5078);
--sidebar-ring: oklch(0.4258 0.1189 270.0203);
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-serif: 'Georgia', serif;
--font-mono: 'JetBrains Mono', monospace;
--radius: 0.6rem;
--shadow-x: 0;
--shadow-y: 2px;
--shadow-blur: 8px;
--shadow-spread: 0px;
--shadow-opacity: 0.03;
--shadow-color: #000000;
--shadow-2xs: 0 2px 8px 0px hsl(0 0% 0% / 0.01);
--shadow-xs: 0 2px 8px 0px hsl(0 0% 0% / 0.01);
--shadow-sm: 0 2px 8px 0px hsl(0 0% 0% / 0.03), 0 1px 2px -1px hsl(0 0% 0% / 0.03);
--shadow: 0 2px 8px 0px hsl(0 0% 0% / 0.03), 0 1px 2px -1px hsl(0 0% 0% / 0.03);
--shadow-md: 0 2px 8px 0px hsl(0 0% 0% / 0.03), 0 2px 4px -1px hsl(0 0% 0% / 0.03);
--shadow-lg: 0 2px 8px 0px hsl(0 0% 0% / 0.03), 0 4px 6px -1px hsl(0 0% 0% / 0.03);
--shadow-xl: 0 2px 8px 0px hsl(0 0% 0% / 0.03), 0 8px 10px -1px hsl(0 0% 0% / 0.03);
--shadow-2xl: 0 2px 8px 0px hsl(0 0% 0% / 0.07);
--tracking-normal: -0.011em;
--spacing: 0.25rem;
}

.dark {
--background: oklch(0.1509 0.0109 276.1744);
--foreground: oklch(0.9842 0.0034 247.8575);
--card: oklch(0.1930 0.0165 273.8159);
--card-foreground: oklch(0.9842 0.0034 247.8575);
--popover: oklch(0.1509 0.0109 276.1744);
--popover-foreground: oklch(0.9842 0.0034 247.8575);
--primary: oklch(0.3901 0.1076 270.6363);
--primary-foreground: oklch(1.0000 0 0);
--secondary: oklch(0.2365 0.0157 274.1214);
--secondary-foreground: oklch(0.9842 0.0034 247.8575);
--muted: oklch(0.2365 0.0157 274.1214);
--muted-foreground: oklch(0.7107 0.0351 256.7878);
--accent: oklch(0.2365 0.0157 274.1214);
--accent-foreground: oklch(0.9842 0.0034 247.8575);
--destructive: oklch(0.4437 0.1613 26.8994);
--destructive-foreground: oklch(0.9842 0.0034 247.8575);
--border: oklch(0.2909 0.0245 271.4700);
--input: oklch(0.2909 0.0245 271.4700);
--ring: oklch(0.3901 0.1076 270.6363);
--chart-1: oklch(0.3901 0.1076 270.6363);
--chart-2: oklch(0.6658 0.1574 58.3183);
--chart-3: oklch(0.8369 0.1644 84.4286);
--chart-4: oklch(0.4455 0.0374 257.2808);
--chart-5: oklch(0.2795 0.0368 260.0310);
--sidebar: oklch(0.1509 0.0109 276.1744);
--sidebar-foreground: oklch(0.9842 0.0034 247.8575);
--sidebar-primary: oklch(0.3901 0.1076 270.6363);
--sidebar-primary-foreground: oklch(1.0000 0 0);
--sidebar-accent: oklch(0.2365 0.0157 274.1214);
--sidebar-accent-foreground: oklch(0.9842 0.0034 247.8575);
--sidebar-border: oklch(0.2909 0.0245 271.4700);
--sidebar-ring: oklch(0.3901 0.1076 270.6363);
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-serif: 'Georgia', serif;
--font-mono: 'JetBrains Mono', monospace;
--radius: 0.6rem;
--shadow-x: 0;
--shadow-y: 4px;
--shadow-blur: 12px;
--shadow-spread: 0px;
--shadow-opacity: 0.3;
--shadow-color: #000000;
--shadow-2xs: 0 4px 12px 0px hsl(0 0% 0% / 0.15);
--shadow-xs: 0 4px 12px 0px hsl(0 0% 0% / 0.15);
--shadow-sm: 0 4px 12px 0px hsl(0 0% 0% / 0.30), 0 1px 2px -1px hsl(0 0% 0% / 0.30);
--shadow: 0 4px 12px 0px hsl(0 0% 0% / 0.30), 0 1px 2px -1px hsl(0 0% 0% / 0.30);
--shadow-md: 0 4px 12px 0px hsl(0 0% 0% / 0.30), 0 2px 4px -1px hsl(0 0% 0% / 0.30);
--shadow-lg: 0 4px 12px 0px hsl(0 0% 0% / 0.30), 0 4px 6px -1px hsl(0 0% 0% / 0.30);
--shadow-xl: 0 4px 12px 0px hsl(0 0% 0% / 0.30), 0 8px 10px -1px hsl(0 0% 0% / 0.30);
--shadow-2xl: 0 4px 12px 0px hsl(0 0% 0% / 0.75);
}

@theme inline {
--color-background: var(--background);
--color-foreground: var(--foreground);
--color-card: var(--card);
--color-card-foreground: var(--card-foreground);
--color-popover: var(--popover);
--color-popover-foreground: var(--popover-foreground);
--color-primary: var(--primary);
--color-primary-foreground: var(--primary-foreground);
--color-secondary: var(--secondary);
--color-secondary-foreground: var(--secondary-foreground);
--color-muted: var(--muted);
--color-muted-foreground: var(--muted-foreground);
--color-accent: var(--accent);
--color-accent-foreground: var(--accent-foreground);
--color-destructive: var(--destructive);
--color-destructive-foreground: var(--destructive-foreground);
--color-border: var(--border);
--color-input: var(--input);
--color-ring: var(--ring);
--color-chart-1: var(--chart-1);
--color-chart-2: var(--chart-2);
--color-chart-3: var(--chart-3);
--color-chart-4: var(--chart-4);
--color-chart-5: var(--chart-5);
--color-sidebar: var(--sidebar);
--color-sidebar-foreground: var(--sidebar-foreground);
--color-sidebar-primary: var(--sidebar-primary);
--color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
--color-sidebar-accent: var(--sidebar-accent);
--color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
--color-sidebar-border: var(--sidebar-border);
--color-sidebar-ring: var(--sidebar-ring);

--font-sans: var(--font-sans);
--font-mono: var(--font-mono);
--font-serif: var(--font-serif);

--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);

--shadow-2xs: var(--shadow-2xs);
--shadow-xs: var(--shadow-xs);
--shadow-sm: var(--shadow-sm);
--shadow: var(--shadow);
--shadow-md: var(--shadow-md);
--shadow-lg: var(--shadow-lg);
--shadow-xl: var(--shadow-xl);
--shadow-2xl: var(--shadow-2xl);

--tracking-tighter: calc(var(--tracking-normal) - 0.05em);
--tracking-tight: calc(var(--tracking-normal) - 0.025em);
--tracking-normal: var(--tracking-normal);
--tracking-wide: calc(var(--tracking-normal) + 0.025em);
--tracking-wider: calc(var(--tracking-normal) + 0.05em);
--tracking-widest: calc(var(--tracking-normal) + 0.1em);
}

@layer base {

- {
  @apply border-border outline-ring/50;
  }
  body {
  @apply bg-background text-foreground;
  letter-spacing: var(--tracking-normal);
  }
  }
