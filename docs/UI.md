# CarSearch AI Design System Documentation

## Color Palette

### Primary Colors
- Primary Blue: `#2563eb` (blue-600)
- White: `#ffffff`
- Black: `#000000`

### Secondary Colors
- Gray Scale:
  - Light Gray: `#9ca3af` (gray-400)
  - Medium Gray: `#374151` (gray-700)
  - Dark Gray: `#1f2937` (gray-800)

### Opacity Variants
- Blue with opacity: `rgba(37, 99, 235, 0.2)` (blue-600/20)
- White with opacity: `rgba(255, 255, 255, 0.1)` (white/10)
- Black with opacity: `rgba(0, 0, 0, 0.05)` (black/5)

## Typography

### Font Family
```
-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
```

### Text Sizes
- Hero Title: `text-7xl` (desktop), `text-5xl` (mobile)
- Section Headers: `text-4xl`
- Subheaders: `text-xl`
- Navigation: `text-xl`
- Body Text: Base size
- Feature Cards Title: `text-xl`
- Badge Text: `text-sm`

### Font Weights
- Bold: `font-bold`
- Semibold: `font-semibold`
- Normal: `font-normal`

## Components

### Buttons

#### Primary Button
```
{
  background: #2563eb (blue-600);
  color: white;
  padding: 1rem 2rem (px-8 py-4);
  border-radius: 0.5rem (rounded-lg);
  hover: { background: #1d4ed8 (blue-700) };
}
```

#### Secondary Button
```
{
  background: rgba(255, 255, 255, 0.1) (white/10);
  color: white;
  padding: 1rem 2rem (px-8 py-4);
  border-radius: 0.5rem (rounded-lg);
  hover: { background: rgba(255, 255, 255, 0.2) (white/20) };
}
```

### Navigation Bar
```
{
  position: fixed;
  width: 100%;
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur;
  z-index: 50;
  height: 4rem (h-16);
}
```

### Feature Cards
```
{
  padding: 1.5rem (p-6);
  border-radius: 0.75rem (rounded-xl);
  background: rgba(255, 255, 255, 0.05) (white/5);
  hover: { background: rgba(255, 255, 255, 0.1) (white/10) };
  transition: colors;
}
```

### Badge
```
{
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(37, 99, 235, 0.1) (blue-600/10);
  padding: 0.5rem 1rem (px-4 py-2);
  border-radius: 9999px (rounded-full);
  color: #2563eb (blue-600);
}
```

## Layout

### Container Widths
- Max Width: `max-w-7xl`
- Padding:
  - Default: `px-4`
  - Small screens: `sm:px-6`
  - Large screens: `lg:px-8`

### Spacing
- Section Padding: `py-24`
- Component Gap: `gap-8`
- Margin Bottom (sections): `mb-16`
- Margin Bottom (elements): `mb-4`, `mb-8`, `mb-12`

### Grid System
```
{
  display: grid;
  grid-template-columns: 1 (mobile), 2 (tablet), 4 (desktop);
  gap: 2rem (gap-8);
}
```

## Gradients

### Background Gradient
```
{
  background: linear-gradient(
    to bottom right,
    rgba(59, 130, 246, 0.1),
    rgba(147, 51, 234, 0.1)
  );
}
```

### Hero Gradient
```
{
  background: linear-gradient(
    to bottom right,
    rgba(37, 99, 235, 0.2),
    rgba(147, 51, 234, 0.2)
  );
}
```

## Icons
- Source: Lucide React
- Sizes:
  - Navigation: `h-8 w-8`
  - Features: `h-12 w-12`
  - Buttons: `h-5 w-5`
  - Badge: `h-4 w-4`
- Color: Matches text color or `text-blue-500/600`

## Animations & Transitions
- Hover Effects: `transition-colors`
- Transform Effects: `transform -translate-x-1/2`

## Responsive Breakpoints
- Mobile: Default
- Tablet: `sm:` (640px)
- Desktop: `md:` (768px)
- Large Desktop: `lg:` (1024px)

This design system provides a comprehensive guide for maintaining consistent styling across the CarSearch AI application. All components follow these guidelines to ensure a cohesive user experience.