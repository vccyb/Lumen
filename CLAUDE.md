# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lumen** is a personal life and wealth management application that combines:
- Life milestone tracking (important life events)
- Wealth management (monthly tracking focused on trends and reasons)
- Goal setting and achievement tracking

**Slogan**: "你的生活，你的微光，你的平衡" (Your Life, Your Light, Your Balance)

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Font**: Inter (Google Fonts)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Directory Structure
```
lumen/
├── app/              # Next.js App Router pages
├── components/       # Reusable React components
├── lib/             # Utilities, helpers, and data
├── types/           # TypeScript type definitions
└── public/          # Static assets
```

### Key Design Patterns

1. **Type-First Development**: All data structures are defined in `types/index.ts`
2. **Component Composition**: Reusable components in `/components` directory
3. **Utility Functions**: Common functions (formatCurrency, formatDate, etc.) in `lib/data.ts`
4. **Sample Data**: Use sample data from `lib/data.ts` for development and testing

### Data Model

Core types are defined in `types/index.ts`:
- **Milestone**: Life events with financial and emotional context
- **WealthRecord**: Monthly wealth tracking with asset breakdown
- **LifeGoal**: Personal goals linked to milestones

## Design System

### Color Palette
- Background: `#F4F4F6` (base), `#FFFFFF` (surface)
- Text: `#111111` (primary), `#666666` (secondary), `#999999` (tertiary)
- Accent: `#F0A07A` (gold), `#E28B6B` → `#D5546C` (warm gradient)
- Border: `#EAEAEA` (subtle), `#CCCCCC` (focus)

### Typography
- Font: Inter family
- Negative letter-spacing for headings (e.g., `-tracking-tight`)
- Uppercase with wide letter-spacing for labels (`tracking-widest`)

### Spacing Scale
- xs: 4px, sm: 12px, md: 24px, lg: 48px, xl: 96px, xxl: 160px

### Special Effects
- Glow shadow: `shadow-glow` for card emphasis
- Smooth transitions: `transition-all duration-300`
- Hover effects: Scale and shadow enhancements

## Component Guidelines

1. **Use TypeScript strictly**: All components should have proper prop types
2. **Follow design system**: Use Tailwind classes from the design system
3. **Responsive design**: Mobile-first approach (to be implemented)
4. **Accessibility**: Use semantic HTML and ARIA labels where needed

## Page Structure

1. **Home Page (`/`)**: Life narrative with milestone cards
2. **Wealth (`/wealth`)**: Wealth tracking and trends (pending)
3. **Goals (`/goals`)**: Life goals and progress (pending)
4. **Assets (`/assets`)**: Asset inventory (pending)
5. **Visions (`/visions`)**: Future planning (pending)

## Important Notes

- The app uses Chinese as the primary language
- Image sources are from Unsplash and Pexels (configured in next.config.js)
- Current focus is on desktop experience; mobile responsiveness is pending
- Data persistence is not yet implemented (using sample data)

## Development Workflow

1. Start by checking `types/index.ts` for data structures
2. Look at existing components in `/components` for patterns
3. Use utility functions from `lib/data.ts`
4. Follow the design system in `tailwind.config.ts`
5. Test changes by running `npm run dev`
