# Spec: Dashboard Enhancements

| | |
|---|---|
| **Status** | ✅ SHIPPED |
| **Shipped** | May 6, 2026 |
| **Build** | ✅ Success (TypeScript + production build) |

---

## Features Delivered (8 รายการ)

### 1. 4-Tier Progress Status System

**Thresholds (ใช้เดียวกันทุก component — ห้าม drift):**

| Status | Threshold | Color |
|--------|-----------|-------|
| Beyond | ≥ 80% | Violet (`text-violet-400`, `bg-violet-500/10`) |
| On Track | ≥ 60% | Emerald |
| At Risk | ≥ 40% | Amber |
| Behind | < 40% | Rose |

**Files modified:**

| File | Change |
|------|--------|
| `src/Domain/ValueObjects/Progress.ts:28-36` | `get status()` returns 4-tier |
| `src/Domain/Entities/Okr.ts:52` | `ProgressStatus` type + `'Beyond'` added |
| `src/Infrastructure/Persistence/Mappers/OkrMapper.ts:43-60` | `resolveStatus()` updated |
| `src/Interface/Ui/Components/Okr/objectives-section.tsx:4-24` | `statusConfig` + filter tabs + counts |
| `src/Interface/Ui/Components/Okr/overview-cards.tsx:79-221` | Progress bar coloring + status counts |
| `src/Interface/Ui/Components/Okr/check-in-engagement.tsx` | `getStatusData()` + Beyond case |
| `src/Interface/Ui/Components/Okr/ParticipantObjectiveDrawer.tsx` | Beyond support |

---

### 2. AI-Generated Score Explanation (Hover Tooltip)

**Logic:** tooltip แสดงเฉพาะเมื่อ `!queryParams?.dateStart && !queryParams?.dateEnd` (Overall QTR mode)

**Files modified:**

| File | Change |
|------|--------|
| `src/Interface/Ui/Hooks/use-participant-query.ts:44-47` | Mock `aiScoreReason` generation (ใช้ `Math.round()` แก้ float artifacts) |
| `src/Interface/Ui/Components/Okr/check-in-engagement.tsx:505-544` | Dark tooltip + AI reason + score breakdown |

**Tooltip snippet (check-in-engagement.tsx):**
```tsx
// Condition for showing AI reason
{(!queryParams?.dateStart && !queryParams?.dateEnd) && person.aiScoreReason && (
  <div className="text-zinc-300 font-normal leading-relaxed text-xs">
    ...{person.aiScoreReason}
  </div>
)}
```

---

### 3. Status Pills ในหน้า Versus Mode

แสดง status pill ใต้ชื่อ player ใน showcase cards

**File:** `src/Interface/Ui/Components/Okr/versus-mode.tsx:340-386`

---

### 4. Hall of Fame → ParticipantObjectiveDrawer Integration

Hall of Fame cards click → เปิด drawer แสดง objectives รายคน

**Files modified:**

| File | Change |
|------|--------|
| `src/Interface/Ui/Components/Dashboard/dashboard.tsx:624-666` | `hallOfFamePersonId` state + click handler + `<ParticipantObjectiveDrawer>` |

---

### 5. Enterprise Hall of Fame Hover Design

Redesign hover overlay ให้เป็น enterprise style

**File:** `src/Interface/Ui/Components/Dashboard/dashboard.tsx:477-563`

**Design elements:**
- Background: `linear-gradient(145deg, #0d0f14 0%, #151820 50%, #0d0f14 100%)`
- Rank badge (#1/#2/#3) พร้อม tier colors
- Score แสดงพร้อม `/100` context
- 3 metric bars (Goal=emerald, Quality=amber, Engagement=violet)

---

### 6. AI Processing Time Placeholder

**File:** `src/Interface/Ui/Components/Okr/ParticipantObjectiveDrawer.tsx:160-163`

```tsx
<div className="absolute top-6 left-8 ...">
  <Loader2 className="w-3 h-3 animate-spin text-blue-400" /> AI Processing Time: -- s
</div>
```

> ⏳ **Pending:** แสดงค่าจริงเมื่อ API ส่ง `aiProcessingTimeMs`

---

### 7. Cursor Pointer Fix

**File:** `src/Interface/Ui/Components/Okr/check-in-engagement.tsx:~490`

เปลี่ยน `cursor-help` → `cursor-pointer` ที่ Engage column trigger

---

### 8. Shared Component: ParticipantObjectiveDrawer

**New file:** `src/Interface/Ui/Components/Okr/ParticipantObjectiveDrawer.tsx`

**Props interface:**
```typescript
interface ParticipantObjectiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number | null;
  participantDetails: ParticipantDetailRaw[];
  objectives: Objective[];
  showStatus: boolean;
}
```

**Used in:**
- `dashboard.tsx` — Hall of Fame integration
- `check-in-engagement.tsx` — Engagement table row click

---

## API Fields Pending Backend

เมื่อ API พร้อม ให้ลบ mock ใน `use-participant-query.ts` และรับข้อมูลจริง:

```typescript
interface ParticipantDetailRaw {
  // NEW FIELDS (need backend implementation)
  goalAchievementScore?: number;      // 0–100
  qualityScore?: number;              // 0–100
  engagementBehaviorScore?: number;   // 0–100
  totalScore?: number;                // calculated: goal*0.5 + quality*0.3 + engage*0.2
  trend?: 'up' | 'normal' | 'down';
  aiScoreReason?: string;             // Thai language explanation
  aiProcessingTimeMs?: number;
  status?: 'Beyond' | 'On Track' | 'At Risk' | 'Behind';
}
```

> **Mock location:** `src/Interface/Ui/Hooks/use-participant-query.ts` — `mockPerformanceScores()` (lines 24–89)  
> **Remove:** entire function + `seeded()` helper (lines 14–21) when API ready

---

## Common Pitfalls (อย่าลืม)

| Pitfall | Correct approach |
|---------|-----------------|
| Progress display | `Math.floor()` ไม่ใช่ `Math.round()` |
| AI score text | `Math.round()` แก้ floating point |
| Theme scale | `zinc` ไม่ใช่ `gray` |
| Border style | bg-color + shadow, **ห้าม** colored border |
| Status thresholds | 80/60/40 เดียวกันทุก component |
