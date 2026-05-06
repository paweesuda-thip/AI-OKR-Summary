# OKR Dashboard Enhancement Plan (Detailed)

> **สำหรับ AI รุ่นถัดไป:** เอกสารฉบับนี้มีรายละเอียดครบถ้วนเกี่ยวกับการเปลี่ยนแปลงทั้งหมดที่ทำไปแล้ว รวมถึง file paths, line numbers, code snippets และ API requirements ที่ชัดเจน

---

## 1. 4 Progress Statuses (Beyond ≥80%, On Track ≥60%, At Risk ≥40%, Behind <40%)

### Domain Layer Changes

**File:** `src/Domain/ValueObjects/Progress.ts`

```typescript
// Lines 28-36
get status(): 'Beyond' | 'On Track' | 'At Risk' | 'Behind' {
  if (this.value >= 80) return 'Beyond';
  if (this.value >= 60) return 'On Track';
  if (this.value >= 40) return 'At Risk';
  return 'Behind';
}
```

**File:** `src/Domain/Entities/Okr.ts`

```typescript
// Line 52 - Type updated
export type ProgressStatus = 'Beyond' | 'On Track' | 'At Risk' | 'Behind' | 'TBD';

// Line 74 - PersonObjective interface
type: 'Beyond' | 'On Track' | 'At Risk' | 'Behind' | 'TBD';

// Lines 103-134 - Objective interface
export interface Objective {
  // ... other fields
  status: 'Beyond' | 'On Track' | 'At Risk' | 'Behind';
}

// Lines 153-164 - ParticipantDetailRaw interface
export interface ParticipantDetailRaw {
  // ... other fields
  status?: 'Beyond' | 'On Track' | 'At Risk' | 'Behind';
}
```

### Infrastructure Layer Changes

**File:** `src/Infrastructure/Persistence/Mappers/OkrMapper.ts`

```typescript
// Lines 43-60 - resolveStatus helper function updated
private resolveStatus(percent: number): 'Beyond' | 'On Track' | 'At Risk' | 'Behind' {
  if (percent >= 80) return 'Beyond';
  if (percent >= 60) return 'On Track';
  if (percent >= 40) return 'At Risk';
  return 'Behind';
}

// Lines 74-87, 108-120 - Usage in mapping functions
```

### UI Layer Changes

**File:** `src/Interface/Ui/Components/Okr/objectives-section.tsx`

```typescript
// Lines 4-24 - statusConfig updated
const statusConfig = {
  Beyond: { color: 'text-violet-400', bg: 'bg-vinc-500/10', border: 'border-violet-500/20', icon: TrendingUp },
  'On Track': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: TrendingUp },
  'At Risk': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Activity },
  'Behind': { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: TrendingDown },
};

// Lines 295-326 - Filter tabs now include Beyond
// Lines 350-373 - Status count display includes Beyond
```

**File:** `src/Interface/Ui/Components/Okr/overview-cards.tsx`

```typescript
// Lines 79-101, 141-163, 201-221 - Progress bar coloring with Beyond (violet)
// Lines 326-353, 371-398 - Status count display with Beyond
```

**File:** `src/Interface/Ui/Components/Okr/check-in-engagement.tsx`

```typescript
// getStatusData function (around line 38-57)
const getStatusData = (percent: number) => {
  if (percent >= 80) return { 
    label: 'Beyond', 
    color: 'text-violet-400', 
    bg: 'bg-violet-500/10', 
    border: 'border-violet-500/20', 
    icon: TrendingUp,
    chartColor: 'violet'
  };
  // ... other statuses
};
```

---

## 2. AI-Generated Score Explanation (Hover Tooltip)

### Mock Data Implementation

**File:** `src/Interface/Ui/Hooks/use-participant-query.ts`

```typescript
// Lines 44-47 - aiScoreReason generation
const goalAchievementRounded = Math.round(goalAchievementScore);
const qualityRounded = Math.round(qualityScore);
const engagementRounded = Math.round(engagementClamped);
const aiScoreReason = p.aiScoreReason ?? `คะแนนรวมได้มาจากผลงาน (${goalAchievementRounded}), คุณภาพ (${qualityRounded}) และพฤติกรรมความตั้งใจ (${engagementRounded}) ซึ่ง AI มองว่า ${trendRoll === 'up' ? 'มีพัฒนาการที่ดีเยี่ยม' : trendRoll === 'down' ? 'ต้องได้รับการดูแลเพิ่มเติม' : 'รักษามาตรฐานได้ดี'}`;
```

**Important:** ใช้ `Math.round()` เพื่อแก้ floating point artifacts (เช่น 62.430000000000001 → 62)

### Tooltip Implementation

**File:** `src/Interface/Ui/Components/Okr/check-in-engagement.tsx`

```typescript
// Lines 505-517 - Dark theme tooltip
<TooltipContent side="left" className="!bg-zinc-950 !border-zinc-800 !text-zinc-100 text-xs font-semibold max-w-[260px] whitespace-pre-wrap shadow-xl">
  <div className="flex items-center gap-2 mb-2">
    <span className={person.trend === 'up' ? 'text-emerald-400' : person.trend === 'down' ? 'text-rose-400' : 'text-zinc-400'}>
      Trend: {person.trend === 'up' ? 'Improving' : person.trend === 'down' ? 'Declining' : 'Stable'}
    </span>
  </div>
  {(!queryParams?.dateStart && !queryParams?.dateEnd) && person.aiScoreReason && (
    <div className="mt-2 text-zinc-300 font-normal leading-relaxed border-t border-zinc-700 pt-2">
      <Sparkles className="w-3 h-3 inline mr-1.5 text-blue-400" />
      {person.aiScoreReason}
    </div>
  )}
</TooltipContent>
```

**Logic:** Tooltip แสดงเฉพาะเมื่อ:
- ไม่มี date filter (queryParams.dateStart และ dateEnd เป็น undefined)
- Overall QTR mode active
- มี aiScoreReason data

---

## 3. Status Pills ในหน้า Versus Mode

**File:** `src/Interface/Ui/Components/Okr/versus-mode.tsx`

```typescript
// Lines 340-386 - Player showcase cards
// แสดง status pill ใต้ชื่อ player
<div className="...">
  <span className={cn(
    "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
    status === 'Beyond' && "bg-violet-500/10 text-violet-400 border border-violet-500/20",
    status === 'On Track' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    status === 'At Risk' && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    status === 'Behind' && "bg-rose-500/10 text-rose-400 border border-rose-500/20"
  )}>
    {status}
  </span>
</div>
```

---

## 4. Hall of Fame → ParticipantObjectiveDrawer Integration

### State Management

**File:** `src/Interface/Ui/Components/Dashboard/dashboard.tsx`

```typescript
// Lines 624-666 - State and drawer wiring
const [hallOfFamePersonId, setHallOfFamePersonId] = useState<number | null>(null);

// Hall of Fame card click handler
<div 
  className="..."
  onClick={() => setHallOfFamePersonId(p.employeeId)}
>
  {/* Card content */}
</div>

// Drawer component usage
<ParticipantObjectiveDrawer
  isOpen={!!hallOfFamePersonId}
  onClose={() => setHallOfFamePersonId(null)}
  employeeId={hallOfFamePersonId}
  participantDetails={participantDetails}
  objectives={okrData?.objectives || []}
  showStatus={showStatus}
/>
```

---

## 5. Enterprise Hall of Fame Hover Design

**File:** `src/Interface/Ui/Components/Dashboard/dashboard.tsx`

```typescript
// Lines 477-563 - Enterprise hover overlay
<div 
  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 flex flex-col cursor-pointer"
  style={{ background: 'linear-gradient(145deg, #0d0f14 0%, #151820 50%, #0d0f14 100%)' }}
  onClick={() => setHallOfFamePersonId(p.employeeId)}
>
  {/* Rank Badge - Top Right */}
  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${isFirst ? 'bg-amber-500/15 text-amber-400' : origIndex === 1 ? 'bg-zinc-500/15 text-zinc-400' : 'bg-orange-500/15 text-orange-400'} border border-white/5`}>
    <span className="text-xs font-bold">#{origIndex + 1}</span>
  </div>

  {/* Score with /100 context */}
  <div className="flex items-baseline gap-2 mt-1">
    <span className="text-3xl font-semibold text-white tracking-tight">
      {Math.round(p.totalScore ?? p.avgPercent)}
    </span>
    <span className="text-xs text-zinc-500">/100</span>
  </div>

  {/* Metrics with colored dots */}
  {[
    { label: 'Goal Achievement', val: p.goalAchievementScore ?? 0, color: '#10b981' },
    { label: 'Quality of Work', val: p.qualityScore ?? 0, color: '#f59e0b' },
    { label: 'Engagement', val: p.engagementBehaviorScore ?? 0, color: '#8b5cf6' },
  ].map(({ label, val, color }) => (
    <div key={label}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-zinc-400">{label}</span>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[12px] font-semibold text-white tabular-nums">{Math.round(val)}</span>
        </div>
      </div>
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(val, 100)}%`, backgroundColor: color }} />
      </div>
    </div>
  ))}
</div>
```

---

## 6. AI Processing Time Placeholder

**File:** `src/Interface/Ui/Components/Okr/ParticipantObjectiveDrawer.tsx`

```typescript
// Lines 160-163
<div className="absolute top-6 left-8 flex items-center gap-2 text-zinc-400 font-mono text-[10px] tracking-widest uppercase bg-white/5 border border-white/10 px-3 py-1.5 rounded-md backdrop-blur-md">
  <Loader2 className="w-3 h-3 animate-spin text-blue-400" /> AI Processing Time: -- s
</div>
```

**Note:** แสดงอยู่มุมซ้ายบนของ drawer header มี loading spinner icon หมุน

---

## 7. Cursor Pointer Fix

**File:** `src/Interface/Ui/Components/Okr/check-in-engagement.tsx`

```typescript
// Line ~490 - Changed from cursor-help to cursor-pointer
<div className="... cursor-pointer ...">
```

---

## 8. Shared Component: ParticipantObjectiveDrawer

**New File:** `src/Interface/Ui/Components/Okr/ParticipantObjectiveDrawer.tsx`

### Component Interface

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

### Key Features
- Hero header พร้อม status badge และ circular progress ring
- AI processing time placeholder
- Objectives list พร้อม progress bars
- Support 4 statuses (Beyond, On Track, At Risk, Behind)

### Usage Examples

```typescript
// In dashboard.tsx - Hall of Fame integration
<ParticipantObjectiveDrawer
  isOpen={!!hallOfFamePersonId}
  onClose={() => setHallOfFamePersonId(null)}
  employeeId={hallOfFamePersonId}
  participantDetails={participantDetails}
  objectives={okrData?.objectives || []}
  showStatus={showStatus}
/>

// In check-in-engagement.tsx - Engagement table integration
<ParticipantObjectiveDrawer
  isOpen={isDrawerOpen}
  onClose={() => setIsDrawerOpen(false)}
  employeeId={selectedEmployeeId}
  participantDetails={participantDetails}
  objectives={objectives}
  showStatus={showStatus}
/>
```

---

## API Requirements (Pending Backend Integration)

### Required API Fields

**Endpoint:** Participant Details API

```typescript
interface ParticipantDetailRaw {
  // EXISTING FIELDS (already present)
  employeeId: number;
  fullName: string;
  pictureURL?: string;
  pictureMediumURL?: string;
  totalCheckIn: number;
  totalCheckInAll: number;
  totalMissCheckIn: number;
  avgPercent: number;
  
  // NEW FIELDS (need backend implementation)
  goalAchievementScore?: number;      // 0-100
  qualityScore?: number;              // 0-100
  engagementBehaviorScore?: number;   // 0-100
  totalScore?: number;                // 0-100 (calculated)
  trend?: 'up' | 'normal' | 'down';   // Based on historical comparison
  aiScoreReason?: string;             // Thai language explanation
  aiProcessingTimeMs?: number;        // Processing time in milliseconds
  status?: 'Beyond' | 'On Track' | 'At Risk' | 'Behind';
}
```

### Calculation Logic (Backend Side)

**Total Score Formula:**
```
totalScore = (goalAchievementScore × 0.5) + (qualityScore × 0.3) + (engagementBehaviorScore × 0.2)
```

**Trend Determination:**
- `up` - Score improved > 5% from previous period
- `down` - Score decreased > 5% from previous period
- `normal` - Score change within ±5%

**AI Score Reason Template:**
```
คะแนนรวมได้มาจากผลงาน ({goalAchievement}), คุณภาพ ({quality}) และพฤติกรรมความตั้งใจ ({engagement}) ซึ่ง AI มองว่า {trendMessage}
```

**Trend Messages:**
- up: "มีพัฒนาการที่ดีเยี่ยม"
- down: "ต้องได้รับการดูแลเพิ่มเติม"
- normal: "รักษามาตรฐานได้ดี"

### Files to Remove Mock Data

When API is ready, remove or modify:

1. **File:** `src/Interface/Ui/Hooks/use-participant-query.ts`
   - Remove `mockPerformanceScores()` function (lines 24-59)
   - Remove `seeded()` helper (lines 14-21)
   - Return raw data directly from API

---

## Testing Checklist

### Build Verification
```bash
npm run build
# Should complete without errors
```

### Visual Verification
- [ ] 4 statuses display correctly with proper colors
- [ ] Beyond status (violet) visible when progress ≥80%
- [ ] AI tooltip shows on Total Score hover (Overall QTR mode)
- [ ] Thai text displays without floating point artifacts
- [ ] Hall of Fame hover shows enterprise design
- [ ] Clicking Hall of Fame card opens drawer
- [ ] Versus mode shows status pills below player names
- [ ] Cursor pointer on Engage column

### Data Verification
- [ ] Status thresholds correct (80/60/40)
- [ ] Math.floor() used for percentages
- [ ] Math.round() used for AI score display

---

## Dependencies

**No new dependencies added.** ใช้ libraries ที่มีอยู่แล้ว:
- `lucide-react` - Icons
- `recharts` - Charts (removed from Hall of Fame hover)
- `framer-motion` - Animations
- `@radix-ui/react-tooltip` - Tooltips
- Tailwind CSS - Styling

---

## Common Pitfalls for Future AI

1. **Status Thresholds:** ต้องใช้ thresholds เดียวกันทั้งระบบ (80/60/40)
2. **Math.floor vs Math.round:** 
   - Percentages ใช้ `Math.floor()` (ตาม requirement)
   - AI scores ใช้ `Math.round()` (แก้ floating point)
3. **Dark Theme:** ใช้ `zinc` scale ไม่ใช่ `gray`
4. **Tooltip Logic:** AI tooltip แสดงเฉพาะเมื่อไม่มี date filter
5. **No Colored Borders:** ตาม user rule - ใช้ background/shadow แทน

---

## Last Updated

Date: May 6, 2026
Build Status: ✅ Success
