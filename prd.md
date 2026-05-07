# Molofu6 PRD — Family Command Centre

## 1. Concept & Vision

Molofu6 replaces the Commander's mental WhatsApp spreadsheet with a real-time family command centre. Commander sees everything — kid locations, helper check-ins, today's schedule. Helper sees only what matters right now, works offline on the MTR, checks in with one tap. Observer (grandparent/remote parent) gets a calm read-only view with smart alerts that break through silent mode only for genuine emergencies.

Emotional tone: **calm control**. Not another notification flood — a reduction in mental load.

---

## 2. Design Language

### Color Palette
- Primary: `#6366F1` (Indigo)
- Commander background: `#0F172A` (slate-900, dark)
- Helper/Observer background: `#F8FAFC` (slate-50, light)
- Success: `#22C55E`
- Warning: `#F59E0B`
- Critical/Alert: `#EF4444`
- Muted: `#64748B`

### Typography
- Font: Inter (Latin), Noto Sans HK (Cantonese), Noto Sans SC (Mandarin)
- Commander: dark theme, bold headings
- Helper: light theme, large touch targets (min 48px, ideally 64px for primary actions)

### Motion
- Minimal, purposeful — no decorative animations
- Loading: skeleton shimmer
- Transitions: subtle fade (150ms ease)

---

## 3. Layout & Structure

### Commander Dashboard (`/dashboard`)
- Dark theme, full-width
- Top bar: family name, language picker (EN/中文), user avatar
- Left sidebar nav: Dashboard | Schedule | Kids | Helpers | Timeline
- Main: today's schedule timeline grouped by time-of-day (Morning/Afternoon/Evening)
- Right panel: live activity feed + notification summary
- FAB: "+ New Activity" button

### Helper View (`/helper`)
- Light theme, single-column, mobile-first
- Hero card: current/next task with large "I'm Here" / "Done" buttons (64px height)
- Offline banner when disconnected
- Bottom nav: My Tasks | Timeline | Profile

### Observer View (`/observer`)
- Minimal, card-based, read-only
- Family timeline (no actions)
- Critical alert banner when critical notifications exist

### Auth (`/auth`)
- Phone + OTP via Supabase
- Commander: enters phone → receives OTP → Verify → dashboard
- Language selector on auth page (English | 中文)

---

## 4. Features

### F1: Role-Based Auth
- Phone + OTP via Supabase Auth
- Roles: `commander` (full CRUD), `helper` (task list + check-in), `observer` (read-only)
- First login prompts role assignment (Commander code required)

### F2: Activity Scheduling (Commander)
- Create activity: title, kid, date/time, location, type, assignee
- Activity types: `pickup`, `dropoff`, `lesson`, `tutor`, `medical`, `social`, `other`
- Priority levels: `low`, `normal`, `high`, `critical`
- Mark as "offline available" (synced to Helper's PWA cache)
- View, edit, cancel activities

### F3: Helper Check-In
- View assigned tasks for today (or selected date)
- "I'm Here" tap (arrival check-in, optional photo)
- "Done" tap (completion check-in)
- Works offline — queues check-ins, syncs on reconnect
- Shows full task details even without signal (cached on load)

### F4: Real-Time Activity Feed
- All family members see check-ins in real-time (Supabase Realtime)
- Timeline post types: `update`, `photo`, `milestone`, `alert`
- Commander can post to timeline with optional photo

### F5: Smart Notifications
- Routine: grouped, silent (no interruption)
- Critical (`priority=critical`): breaks silent mode via `is_critical=true`
- Notification preferences per role

### F6: GPS School Location (Commander)
- Store school coordinates per kid
- Commander sees distance of assigned helper from school
- One-tap maps link (Google Maps intent)

### F7: Offline Mode (Helper)
- Service Worker caches today's assigned tasks
- Queue check-ins when offline, sync on reconnect
- Clear offline indicator in UI

### F8: Multilingual
- English, Cantonese (zh-HK), Mandarin (zh-CN)
- Stored in `profile.preferred_language`
- UI strings via next-intl or dictionary pattern

---

## 5. Required shadcn/ui Components

```
button, card, input, label, select, dialog, sheet,
tabs, avatar, badge, separator, skeleton, toast,
textarea, popover, calendar, dropdown-menu, scroll-area,
switch, sonner, progress, tooltip, alert-dialog
```

### Custom Components to Build
- `ActivityCard` — Timeline card with type icon, time, status badge, assignee avatar
- `CheckInButton` — 64px tall primary action button for Helper view
- `OfflineBanner` — Sticky banner when `navigator.onLine === false`
- `LanguagePicker` — Dropdown: English | 中文
- `RoleBadge` — Colored badge: Commander (indigo) | Helper (green) | Observer (gray)
- `TimelinePost` — Feed item: avatar, name, content, optional photo, timestamp
- `KidAvatar` — Avatar with colored status dot (at school / en route / home)
- `PriorityBadge` — Badge: low (gray) | normal (blue) | high (orange) | critical (red)
- `ActivityForm` — Full create/edit form in a Dialog
- `EmptyState` — Illustrated empty state for each view

---

## 6. API Routes (Next.js App Router)

### Auth
- `POST /api/auth/phone-otp` — Send OTP to phone number
- `POST /api/auth/verify-otp` — Verify OTP, establish session, return role
- `GET /api/auth/me` — Get current user + family role

### Activities
- `GET /api/activities?date=YYYY-MM-DD` — List activities for date
- `POST /api/activities` — Create activity (Commander)
- `PATCH /api/activities/[id]` — Update activity (Commander)
- `DELETE /api/activities/[id]` — Cancel activity (Commander)

### Check-ins
- `POST /api/checkins` — Record arrival/departure/completed
- `GET /api/checkins?activity_id=X` — Get check-ins for activity

### Notifications
- `GET /api/notifications` — List user notifications (unread first)
- `PATCH /api/notifications/[id]` — Mark as read
- `POST /api/notifications` — Create notification (Commander only)

### Timeline
- `GET /api/timeline?limit=20` — Paginated family timeline
- `POST /api/timeline` — Create post (any family member)
- `POST /api/timeline/[id]/photo` — Upload photo to post

### Family
- `GET /api/family/members` — List family members with roles
- `GET /api/family/kids` — List kids
- `POST /api/family/kids` — Add kid (Commander)
- `PATCH /api/family/members/[id]` — Update member role/status (Commander)

### Profile
- `GET /api/profile` — Get own profile
- `PATCH /api/profile` — Update language, display_name

---

## 7. Technical Approach

- **Framework**: Next.js 15 (App Router, TypeScript)
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (Postgres + Auth + Realtime + Storage)
- **Auth**: Supabase Phone OTP (`signInWithOtp`)
- **Offline**: Service Worker + IndexedDB (`idb` library)
- **Deployment**: Vercel (auto-deploy from GitHub)
- **CSP**: Strict Content-Security-Policy, no `eval()`, `worker-src 'self' blob:` for Service Worker
- **Environment vars**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 8. Project Structure

```
web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── auth/page.tsx
│   │   ├── (app)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── helper/page.tsx
│   │   │   ├── observer/page.tsx
│   │   │   ├── timeline/page.tsx
│   │   │   ├── kids/page.tsx
│   │   │   └── helpers/page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── activities/
│   │   │   ├── checkins/
│   │   │   ├── notifications/
│   │   │   ├── timeline/
│   │   │   ├── family/
│   │   │   └── profile/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/ (shadcn)
│   │   └── molofu/ (custom)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── public/
│   └── sw.js (Service Worker)
└── supabase/
    └── schema.sql
```
