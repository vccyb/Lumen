# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lumen** is a personal life and wealth management application (Chinese UI) that combines life milestone tracking, wealth management, and goal setting. Slogan: "你的生活，你的微光，你的平衡".

## Technology Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Charts: Recharts
- Date handling: date-fns, react-day-picker
- Icons: lucide-react

## Development Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run lint       # ESLint via next lint
```

No test framework is configured yet.

## Architecture

### Routing & Pages

All pages are client components (`'use client'`). The root `/` redirects to `/dashboard`.

| Route | File | Purpose |
|-------|------|---------|
| `/dashboard` | `app/dashboard/page.tsx` | Overview metrics, wealth summary, insights |
| `/timeline` | `app/timeline/page.tsx` | Life milestones in alternating card layout |
| `/wealth` | `app/wealth/page.tsx` | Monthly wealth records with Recharts charts |
| `/goals` | `app/goals/page.tsx` | Life goal grid with progress tracking |
| `/assets` | `app/assets/page.tsx` | Asset inventory with allocation breakdown |

Every page shares the same layout: a fixed 280px `Sidebar` on the left and a scrollable main content area with a hero section.

### Data Model (`types/index.ts`)

Four core types with comprehensive fields:
- **Milestone**: Life events with `category` (life-chapter, vision-realized, strategic-asset, experience, foundation), `assetClass`, `status` (compounding, completed, planned), and optional media/links
- **WealthRecord**: Monthly snapshot with total assets, change amount/reason, and breakdown (liquid, equities, real estate, other)
- **LifeGoal**: Goals with `category` (financial, experiential, personal-growth, relationship, legacy), `status` (dreaming, planning, in-progress, achieved), and progress percentage
- **Asset**: Individual asset items with category, value, and metadata

### Shared Components

- `components/Sidebar.tsx` — Fixed left nav with active state; contains navigation items and global metrics
- `components/ChapterCard.tsx` — Milestone card with image, metadata, and hover effects
- `components/ui/Modal.tsx` — Dialog with backdrop and escape-key support
- `components/ui/Progress.tsx` — Progress bar component
- `components/ui/DatePicker.tsx` — Date selection wrapping react-day-picker
- `components/ui/LightGlow.tsx` — Mouse-tracking background glow effect (used in root layout)

### Utilities

- `lib/data.ts` — Sample data (4 milestones, 6 wealth records, 3 goals) plus `formatCurrency()` (CNY), `formatDate()` (Chinese format), and category label mappers
- `lib/hooks/useScrollAnimation.ts` — Scroll-triggered animation hook
- `lib/exportUtils.ts` — Data export utilities

### State Management

No global state library. Each page manages its own state with React `useState`. Data persistence is not yet implemented — all pages use sample data from `lib/data.ts`.

## Design System (`tailwind.config.ts`)

- **Colors**: Base `#F4F4F6`, surface `#FFFFFF`, accent gold `#F0A07A`, warm gradient `#E28B6B → #D5546C`, dark mode variants available
- **Shadows**: `shadow-subtle`, `shadow-elevated`, `shadow-glow` (warm amber glow for card emphasis)
- **Typography**: Inter font, negative letter-spacing for headings, uppercase with wide tracking for labels
- **Spacing**: Custom scale — xs:4px, sm:12px, md:24px, lg:48px, xl:96px, xxl:160px
- **Motion**: `transition-all duration-300` standard; scale/shadow hover effects on cards

## Key Conventions

- All UI text is in **Chinese** (`lang="zh-CN"` on root)
- Components use TypeScript strict typing for all props
- Client components are marked with `'use client'` directive
- External images come from Unsplash/Pexels (domains configured in `next.config.js`)

---

## 📋 Project Rules

All project rules are defined in `.claude/rules/` directory and loaded automatically at session start.

### 🚨 Critical Rules
- **Code Review**: `.claude/rules/code-review-rules.md` - Mandatory review before merging
- **Security**: `.claude/rules/security.md` - Secrets management, input validation, RLS policies
- **Database Schema**: `.claude/rules/database-schema.md` - Migration files, type generation
- **API Architecture**: `.claude/rules/api-architecture.md` - BaseAPI pattern, shared client
- **Documentation**: `.claude/rules/documentation.md` - External system integration docs
- **Testing**: `.claude/rules/testing.md` - Test requirements and standards

### Quick Reference

#### Code Changes
```bash
# Before committing
npm run lint
npm run build
npm test

# Review your changes
/simplify
```

#### API Development
- ✅ Extend `BaseAPI` class
- ✅ Use shared Supabase client (`lib/supabase/shared-client.ts`)
- ❌ Don't create own Supabase client instances

#### Database Changes
- ✅ Create migration file in `supabase/migrations/`
- ✅ Apply: `supabase db push`
- ✅ Generate types: `supabase gen types typescript --local > lib/database.types.ts`

#### External Systems
- ✅ Create guide in `guides/` directory
- ✅ Follow documentation template in `.claude/rules/documentation.md`

#### Security
- ❌ Never commit secrets or API keys
- ✅ Use `.env.local` for environment variables
- ✅ Enable RLS on all Supabase tables
- ✅ Validate all user input

---
