# Typography Guide - SafeSphere

This document outlines the standardized typography system used throughout the SafeSphere application.

## Font Family

**Primary Font:** Inter
- A modern, highly legible font designed for user interfaces
- Excellent readability at all sizes
- Professional appearance suitable for enterprise applications

**Fallback Stack:**
```css
"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif
```

## Typography Scale

### Display Text
- **Font Weight:** 800 (ExtraBold)
- **Font Size:** 3.5rem (56px)
- **Line Height:** 1.1
- **Letter Spacing:** -0.025em
- **Usage:** Hero sections, main headlines, landing page titles

### Headings

#### Heading 1 (H1)
- **Font Weight:** 700 (Bold)
- **Font Size:** 2.75rem (44px)
- **Line Height:** 1.2
- **Letter Spacing:** -0.025em
- **Usage:** Page titles, major section headers

#### Heading 2 (H2)
- **Font Weight:** 700 (Bold)
- **Font Size:** 2.25rem (36px)
- **Line Height:** 1.3
- **Letter Spacing:** -0.025em
- **Usage:** Section headers, card titles

#### Heading 3 (H3)
- **Font Weight:** 600 (SemiBold)
- **Font Size:** 1.875rem (30px)
- **Line Height:** 1.4
- **Letter Spacing:** -0.025em
- **Usage:** Subsection headers, important content titles

#### Heading 4 (H4)
- **Font Weight:** 600 (SemiBold)
- **Font Size:** 1.5rem (24px)
- **Line Height:** 1.4
- **Letter Spacing:** -0.025em
- **Usage:** Card titles, form section headers

#### Heading 5 (H5)
- **Font Weight:** 600 (SemiBold)
- **Font Size:** 1.25rem (20px)
- **Line Height:** 1.4
- **Letter Spacing:** -0.025em
- **Usage:** Small section headers, list titles

### Body Text

#### Body Large
- **Font Weight:** 400 (Regular)
- **Font Size:** 1.125rem (18px)
- **Line Height:** 1.6
- **Letter Spacing:** 0.01em
- **Usage:** Important descriptions, lead paragraphs

#### Body (Default)
- **Font Weight:** 400 (Regular)
- **Font Size:** 1rem (16px)
- **Line Height:** 1.6
- **Letter Spacing:** 0.01em
- **Usage:** Main content, paragraphs, form labels

#### Body Small
- **Font Weight:** 400 (Regular)
- **Font Size:** 0.875rem (14px)
- **Line Height:** 1.6
- **Letter Spacing:** 0.01em
- **Usage:** Secondary text, captions, metadata

### UI Elements

#### Button Text
- **Font Weight:** 600 (SemiBold)
- **Font Size:** 0.875rem (14px)
- **Line Height:** 1.5
- **Letter Spacing:** 0.01em
- **Usage:** Buttons, navigation items, interactive elements

#### Caption
- **Font Weight:** 400 (Regular)
- **Font Size:** 0.75rem (12px)
- **Line Height:** 1.4
- **Letter Spacing:** 0.02em
- **Usage:** Small labels, timestamps, metadata

#### Overline
- **Font Weight:** 500 (Medium)
- **Font Size:** 0.75rem (12px)
- **Line Height:** 1.4
- **Letter Spacing:** 0.1em
- **Text Transform:** Uppercase
- **Usage:** Category labels, section dividers

## Responsive Typography

The typography system includes responsive breakpoints for mobile devices:

```css
@media (max-width: 600px) {
  .text-display { font-size: 2.5rem; }
  .text-heading-1 { font-size: 2rem; }
  .text-heading-2 { font-size: 1.75rem; }
  .text-heading-3 { font-size: 1.5rem; }
  .text-heading-4 { font-size: 1.25rem; }
  .text-heading-5 { font-size: 1.125rem; }
}
```

## Usage Guidelines

### 1. Hierarchy
- Use heading levels sequentially (H1 → H2 → H3)
- Maintain clear visual hierarchy
- Don't skip heading levels

### 2. Consistency
- Use the same typography variants for similar content
- Maintain consistent spacing between text elements
- Follow the established font weight patterns

### 3. Readability
- Ensure sufficient contrast between text and background
- Use appropriate line heights for readability
- Consider mobile readability when choosing font sizes

### 4. Accessibility
- Maintain minimum font sizes for accessibility
- Use semantic HTML elements
- Ensure sufficient color contrast ratios

## Implementation

### Using MUI Typography Component
```tsx
import { Typography } from '@mui/material';

// Standard MUI variants
<Typography variant="h1">Display Text</Typography>
<Typography variant="h2">Heading 1</Typography>
<Typography variant="body1">Body Text</Typography>
<Typography variant="button">Button Text</Typography>
```

### Using Custom Typography Component
```tsx
import Typography from '../components/common/Typography';

// Custom variants
<Typography variant="display">Display Text</Typography>
<Typography variant="heading1">Heading 1</Typography>
<Typography variant="bodyLarge">Body Large</Typography>
<Typography variant="bodySmall">Body Small</Typography>
```

### CSS Classes
```css
.text-display { /* Display text styles */ }
.text-heading-1 { /* Heading 1 styles */ }
.text-body-large { /* Body large styles */ }
.text-button { /* Button text styles */ }
```

## Theme Configuration

The typography system is configured in the Material-UI theme:

```tsx
const theme = createTheme({
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: { /* Display text configuration */ },
    h2: { /* Heading 1 configuration */ },
    // ... other variants
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
        },
      },
    },
    // ... other component overrides
  },
});
```

## Best Practices

1. **Consistency:** Use the same typography variants for similar content across the application
2. **Hierarchy:** Maintain clear visual hierarchy with appropriate heading levels
3. **Readability:** Ensure text is easily readable at all screen sizes
4. **Accessibility:** Follow accessibility guidelines for typography
5. **Performance:** Use system fonts as fallbacks for better performance
6. **Maintenance:** Keep typography consistent when adding new components

## Examples

### Page Header
```tsx
<Typography variant="h1" sx={{ mb: 2 }}>
  PPE Dashboard
</Typography>
<Typography variant="body1" color="text.secondary">
  Welcome back, John! Here's your comprehensive overview.
</Typography>
```

### Card Title
```tsx
<Typography variant="h4" sx={{ mb: 1 }}>
  Safety Helmets
</Typography>
<Typography variant="body2" color="text.secondary">
  Current stock: 150 units
</Typography>
```

### Button
```tsx
<Button sx={{ fontFamily: '"Inter", sans-serif' }}>
  Create New Purchase
</Button>
```

This typography system ensures consistent, professional, and accessible text presentation throughout the SafeSphere application. 