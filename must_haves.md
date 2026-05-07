# Molofu6 — Must-Have Acceptance Criteria

**All 7 criteria MUST pass for the product to be considered shippable.**

---

## MH-1: Auth Flow — Phone OTP Login
**Observable behavior**: User enters a phone number, submits OTP (or uses bypass code `123456`), and lands on the role-appropriate dashboard.

**Test steps**:
1. Navigate to `/auth`
2. Enter phone number `+852 60000000`
3. Submit → OTP sent (or bypass with `123456`)
4. Verify OTP → session created
5. Verify: URL becomes `/dashboard` (Commander) or `/helper` (Helper) or `/observer` (Observer)
6. Verify: Role badge visible in header (Commander | Helper | Observer)

---

## MH-2: Commander Can Create an Activity
**Observable behavior**: Commander fills the "New Activity" form and the activity appears in today's timeline immediately.

**Test steps**:
1. Log in as Commander
2. Click "+ New Activity" button
3. Fill form: title="Piano lesson", type="lesson", date=today, time="15:00-16:00"
4. Assign to Helper member
5. Submit form
6. Verify: Activity card appears in today's Morning/Afternoon/Evening section
7. Verify: Card shows correct title, time, type icon, assignee

---

## MH-3: Helper Sees Only Assigned Tasks
**Observable behavior**: Helper logs in and sees only their assigned tasks for today — no ability to create activities.

**Test steps**:
1. Log in as Helper
2. Verify: Dashboard shows only activities where `assigned_to` = Helper's member ID
3. Verify: No "+ New Activity" button visible
4. Verify: Each task card has a large "I'm Here" button (min 64px height)
5. Verify: Tasks sorted by `start_time`

---

## MH-4: Helper Check-In Creates Real-Time Feed Update
**Observable behavior**: Helper taps "I'm Here" on a task, and all family members see the arrival appear in their activity feed within 5 seconds via Supabase Realtime.

**Test steps**:
1. As Commander: open `/dashboard`, confirm a Helper-assigned task is visible
2. As Helper: tap "I'm Here" on that task
3. Verify (as Helper): Task shows "Arrived" state, "Done" button now visible
4. Verify (as Commander): Arrival check-in appears in activity feed in ≤5 seconds
5. As Helper: tap "Done" on that task
6. Verify: Activity status changes to "completed" for all roles

---

## MH-5: Timeline Shows All Family Activity
**Observable behavior**: Completed activities automatically create timeline posts, visible to all family roles.

**Test steps**:
1. Complete an activity (Helper taps Done — from MH-4)
2. Verify: Timeline post (type: `milestone`) auto-created with activity title
3. Navigate to `/timeline`
4. Verify: Post visible with author name, timestamp, activity icon
5. Log in as Observer → navigate to `/observer`
6. Verify: Timeline post also visible in Observer view

---

## MH-6: Critical Priority = Breaking Notification Flag
**Observable behavior**: When an activity is created with `priority=critical`, the system flags the notification record as `is_critical=true`.

**Test steps**:
1. Log in as Commander
2. Create activity with `priority=critical`
3. Submit
4. Verify in response/network: notification record has `is_critical: true` and `notification_type: 'critical'`
5. Verify: Activity card shows red "CRITICAL" badge

---

## MH-7: Helper App Works Offline
**Observable behavior**: Helper loads their task list, disconnects from network, and can still view tasks and queue check-ins.

**Test steps**:
1. Log in as Helper, verify tasks are loaded
2. Open DevTools → Network → check "Offline" (or disconnect Wi-Fi)
3. Verify: "You are offline" banner appears at top of page
4. Verify: Previously loaded tasks still visible with full details
5. Tap "I'm Here" on a task
6. Verify: Toast or inline message "Check-in queued — will sync when online"
7. Reconnect network
8. Verify: Queued check-in syncs to Supabase (activity check-in visible to Commander)

---

*Criteria generated at Phase 1. No criteria to be added or modified after Phase 4 Judge review.*
