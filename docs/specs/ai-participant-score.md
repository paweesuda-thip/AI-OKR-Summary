# Spec: AI Participant Score

| | |
|---|---|
| **Status** | 🔄 IN PROGRESS |
| **Started** | May 7, 2026 |
| **Build** | ⏳ Not yet implemented |

---

## What We're Building

เมื่อผู้ใช้กด **"Analyze Dashboard Data"** ระบบยิง 2 calls คู่กัน:

| Call | ทำอะไร |
|------|--------|
| `POST /api/ai-score` (เดิม) | วิเคราะห์ภาพรวม team → `score` + `review` |
| `POST /api/ai-participant-score` (ใหม่) | ให้ AI **อธิบายเหตุผล** ของ scores ที่มีอยู่แล้ว รายคน |

### สิ่งที่ AI ทำ (และไม่ทำ)

| | AI ทำ | AI ไม่ทำ |
|---|---|---|
| Scores | ❌ ไม่คำนวณ | Scores มาจาก `use-participant-query.ts` แล้ว |
| Details | ✅ เติม EngageDetail, GoalDetail, QualityDetail, Detail | — |

**AI ได้รับ:** ข้อมูล check-in + scores ที่คำนวณไว้แล้ว → อ่านแล้วอธิบายว่า **ทำไม** ถึงได้คะแนนนั้น

---

## Data Flow

```
participantDetails (from use-participant-query)
  → already has: EngageScore, GoalScore, QualityScore, TotalScore
        │
        └──► POST /api/ai-participant-score
                  │
                  ├─ input per employee:
                  │    scores (เพื่อให้ AI รู้บริบท) + check-in records
                  │
                  ├─ N parallel AI calls (1 per employee)
                  │
                  └─ AI returns per employee:
                       { engageDetail, goalDetail, qualityDetail, detail }
                                 │
                                 ▼
                    assemble final payload:
                    {
                      employeeId, setId,
                      engageScore  ← from participantDetails
                      engageDetail ← from AI
                      goalScore    ← from participantDetails
                      goalDetail   ← from AI
                      qualityScore ← from participantDetails
                      qualityDetail ← from AI
                      totalScore   ← from participantDetails
                      detail       ← from AI
                      dateAIProcessed ← new Date().toISOString()
                    }
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
             update UI state          (Future) save to
             add detail fields        backend cache
             to participantDetails
```

---

## Types

### AI Response (what AI returns — details only)

```typescript
// Internal type — AI output only, not stored in Domain
interface ParticipantAiDetails {
  engageDetail: string;   // Thai: ทำไม engageScore ถึงได้คะแนนนั้น
  goalDetail: string;     // Thai: ทำไม goalScore ถึงได้คะแนนนั้น
  qualityDetail: string;  // Thai: ทำไม qualityScore ถึงได้คะแนนนั้น
  detail: string;         // Thai: สรุปภาพรวมรายคน 2-3 ประโยค
}
```

### Final Payload (assembled — ส่ง backend cache)

```typescript
// src/Domain/Entities/Okr.ts — เพิ่ม
export interface ParticipantAiScore {
  employeeId: number;
  setId: number;            // = assessmentSetId
  engageScore: number;      // ← จาก participantDetails.engagementBehaviorScore
  engageDetail: string;     // ← จาก AI
  goalScore: number;        // ← จาก participantDetails.goalAchievementScore
  goalDetail: string;       // ← จาก AI
  qualityScore: number;     // ← จาก participantDetails.qualityScore
  qualityDetail: string;    // ← จาก AI
  totalScore: number;       // ← จาก participantDetails.totalScore
  detail: string;           // ← จาก AI
  dateAIProcessed: string;  // ← new Date().toISOString() ตอน assemble
}
```

### CheckInRecord (check-in per record — 1:n ต่อ employee)

> **Source:** `use-participant-query.ts` จะส่ง `AnalyzedScore` + `AnalyzedScoreReason` มาพร้อมแต่ละ check-in  
> เป็นผล **upstream AI** (Empeo system) ที่วิเคราะห์ remark ของแต่ละ check-in ไว้แล้ว  
> รูปแบบ exact ที่ API จะส่งยังไม่แน่ใจ แต่ fields เหล่านี้มีแน่ๆ

```typescript
// src/Domain/Entities/Okr.ts — เพิ่ม
export interface CheckInRecord {
  checkInId: number;
  remark: string;
  pointOKR: number;            // 0–10, points earned this check-in
  analyzedScore: number;       // 0–10, upstream AI quality score for this check-in
  analyzedScoreReason: string; // upstream AI explanation (English) — key evidence for qualityDetail
}

// ParticipantDetailRaw — เพิ่ม field
export interface ParticipantDetailRaw {
  // ... existing fields ...
  checkIns?: CheckInRecord[];        // ← เพิ่ม (1:n — 1 employee, N check-ins)
  engageDetail?: string;             // ← เพิ่ม (จาก AI ของเรา)
  goalDetail?: string;               // ← เพิ่ม (จาก AI ของเรา)
  qualityDetail?: string;            // ← เพิ่ม (จาก AI ของเรา)
}
```

**ตัวอย่าง real data ที่ upstream AI ส่งมา:**
```
analyzedScore: 3.50
analyzedScoreReason: "Remark is vague and task-focused (mentions missing test
  coverage and unsupported EF functions) without explaining progress toward the
  80% unit test coverage goal. CheckInPointCurrent (1.0) shows minimal movement
  from CheckInPointPrevious (0.0), and KeyPointCurrent (2.0) remains far below
  PointGoal (5.0), suggesting routine work rather than meaningful progress..."
```

→ AI ของเราต้องอ่าน `analyzedScoreReason` ทุก check-in แล้วสรุปเป็น `qualityDetail` ภาษาไทย

---

## Mock Check-in Data (ใช้จนกว่า API จะส่งมาจริง)

สร้างใน `use-participant-query.ts` — function `mockCheckInRecords()`  
Mock ต้องสมจริง เพราะ AI จะใช้ `analyzedScoreReason` เป็น evidence หลัก:

```typescript
function mockCheckInRecords(p: ParticipantDetailRaw): CheckInRecord[] {
  const rand = seeded(p.employeeId * 7);
  const count = Math.max(1, p.totalCheckIn);
  return Array.from({ length: count }, (_, i) => {
    const pointOKR = Math.max(1, Math.min(10,
      parseFloat((((p.avgPercent / 100) * 7) + rand() * 3).toFixed(2))
    ));
    const analyzedScore = Math.max(1, Math.min(10,
      parseFloat((pointOKR * 0.9 + rand() * 1 - 0.5).toFixed(2))
    ));

    // Mock remark ภาษาไทย (เหมือน user จริงๆ เขียน)
    const remark = pointOKR >= 7
      ? 'ทำการ optimize query ลด response time จาก 2s เหลือ 0.3s พร้อม deploy ไป production'
      : pointOKR >= 5
      ? 'ดำเนินการพัฒนา feature ตามแผน คืบหน้าประมาณ 60% มีปัญหาเรื่อง spec ที่ต้องขอ clarify'
      : 'เริ่มศึกษา requirement แต่ยังติดปัญหาเรื่อง environment setup ยังไม่ได้ progress จริงจัง';

    // Mock analyzedScoreReason ภาษาอังกฤษ (เหมือน upstream AI จริงๆ เขียน)
    const analyzedScoreReason = pointOKR >= 7
      ? `Strong technical progress with clear substance. CheckInPointCurrent (${pointOKR.toFixed(1)}) matches expected pace. Evidence shows concrete deliverable with measurable improvement. Remark directly aligns with the objective and includes quantified results.`
      : pointOKR >= 5
      ? `Moderate progress noted. Remark describes work in progress but lacks specific metrics or evidence of output. CheckInPointCurrent (${pointOKR.toFixed(1)}) shows partial movement. Some alignment to objective but could be more specific about completion criteria.`
      : `Remark is vague and task-focused without explaining progress toward the objective goal. CheckInPointCurrent (${pointOKR.toFixed(1)}) shows minimal movement. No quantified results or evidence attachments. Suggests routine activity rather than meaningful OKR progress.`;

    return {
      checkInId: p.employeeId * 100 + i,
      remark,
      pointOKR,
      analyzedScore,
      analyzedScoreReason,
    };
  });
}
// ใน mockPerformanceScores() → เพิ่ม: checkIns: mockCheckInRecords(p)
```

---

## AiParticipantScoreController Design

### Input (ส่งไป controller)

```typescript
POST /api/ai-participant-score
{
  assessmentSetId: number,
  participants: Array<{
    employeeId: number,
    fullName: string,
    // scores ที่มีอยู่แล้ว (AI จะใช้เป็น context อธิบาย)
    engageScore: number,
    goalScore: number,
    qualityScore: number,
    totalScore: number,
    // check-in evidence
    summary: { avgPercent, totalCheckIn, totalCheckInAll, totalMissCheckIn },
    checkIns: CheckInRecord[]   // capped 20 records, remark capped 300 chars
  }>
}
```

### AI Prompt per participant

```
You are an expert OKR performance coach writing a Thai performance summary.

The employee's scores have already been calculated. Your ONLY job is to explain
in Thai WHY each score is what it is — using the check-in evidence below.
Do NOT recalculate or modify any scores.

═══ EMPLOYEE ════════════════════════════════════════════════
Name: {fullName}
Scores: EngageScore={engageScore} | GoalScore={goalScore} | QualityScore={qualityScore} | Total={totalScore}
Check-in rate: {totalCheckIn}/{totalCheckInAll} sessions | Missed: {totalMissCheckIn}
Avg OKR progress: {avgPercent}%

═══ CHECK-IN RECORDS (1 row = 1 check-in session) ══════════
Each record has:
  - remark: what the employee wrote
  - pointOKR: points earned (0–10)
  - analyzedScore: upstream AI score for this check-in (0–10)
  - analyzedScoreReason: upstream AI explanation of why that score was given

{JSON.stringify(checkIns, null, 2)}

═══ YOUR OUTPUT ════════════════════════════════════════════
Return ONLY raw JSON (no code fences, no extra text):
{
  "engageDetail": "<1-2 Thai sentences: explain EngageScore={engageScore} — reference check-in rate and missed sessions>",
  "goalDetail": "<1-2 Thai sentences: explain GoalScore={goalScore} — reference avgPercent and pointOKR patterns>",
  "qualityDetail": "<1-2 Thai sentences: explain QualityScore={qualityScore} — MUST reference analyzedScore values and key points from analyzedScoreReason>",
  "detail": "<2-3 Thai sentences: overall performance summary — highlight strongest and weakest dimension>"
}

Rules:
- Thai language only
- Cite actual numbers (e.g., "check-in rate {totalCheckIn}/{totalCheckInAll}", "คะแนน {engageScore}")
- qualityDetail MUST reference the upstream AI analysis evidence from analyzedScoreReason
- Be concise and actionable — no generic praise
```

### Output (controller response)

```typescript
{
  results: ParticipantAiScore[],  // assembled: scores from input + details from AI
  failedIds: number[]             // employees where AI call failed
}
```

**Assembly logic ใน controller (per employee):**
```typescript
const aiDetails: ParticipantAiDetails = /* parsed from AI */;
const result: ParticipantAiScore = {
  employeeId: p.employeeId,
  setId: assessmentSetId,
  engageScore: p.engageScore,         // ← ส่งมาจาก UI
  engageDetail: aiDetails.engageDetail,
  goalScore: p.goalScore,             // ← ส่งมาจาก UI
  goalDetail: aiDetails.goalDetail,
  qualityScore: p.qualityScore,       // ← ส่งมาจาก UI
  qualityDetail: aiDetails.qualityDetail,
  totalScore: p.totalScore,           // ← ส่งมาจาก UI
  detail: aiDetails.detail,
  dateAIProcessed: new Date().toISOString(),
};
```

---

## Implementation Checklist

- [ ] **`src/Domain/Entities/Okr.ts`** — เพิ่ม `CheckInRecord`, `ParticipantAiScore`, `checkIns?` + detail fields ใน `ParticipantDetailRaw`
- [ ] **`src/Interface/Ui/Hooks/use-participant-query.ts`** — เพิ่ม `mockCheckInRecords()` + assign ใน `mockPerformanceScores()`
- [ ] **`src/Interface/Http/Controllers/AiParticipantScoreController.ts`** — สร้างใหม่ (parallel AI calls, assembly logic)
- [ ] **`app/api/ai-participant-score/route.ts`** — สร้างใหม่ (thin route, `maxDuration = 120`)
- [ ] **`src/Interface/Ui/Components/Ai/ai-score-section.tsx`** — เพิ่ม props + `Promise.allSettled` parallel trigger
- [ ] **`src/Interface/Ui/Components/Dashboard/dashboard.tsx`** — เพิ่ม state + merge detail fields เข้า participantDetails

---

## ai-score-section.tsx Changes

**New props:**
```typescript
participantDetails: ParticipantDetailRaw[];
assessmentSetId?: number;
onParticipantScoresChange: (scores: ParticipantAiScore[]) => void;
```

**Parallel call — send scores + check-ins:**
```typescript
const [scoreResult, participantResult] = await Promise.allSettled([
  fetch('/api/ai-score', { method: 'POST', body: JSON.stringify({ dashboardData }), signal }),
  fetch('/api/ai-participant-score', {
    method: 'POST',
    body: JSON.stringify({
      assessmentSetId,
      participants: participantDetails.map(p => ({
        employeeId: p.employeeId,
        fullName: p.fullName,
        engageScore: p.engagementBehaviorScore ?? 0,   // ← ส่ง scores ไปด้วย
        goalScore: p.goalAchievementScore ?? 0,
        qualityScore: p.qualityScore ?? 0,
        totalScore: p.totalScore ?? 0,
        summary: {
          avgPercent: p.avgPercent,
          totalCheckIn: p.totalCheckIn,
          totalCheckInAll: p.totalCheckInAll,
          totalMissCheckIn: p.totalMissCheckIn,
        },
        checkIns: p.checkIns ?? [],
      })),
    }),
    signal,
  }),
]);
```

---

## dashboard.tsx Merge Logic

**Scores ไม่เปลี่ยน** — เพิ่มแค่ detail fields:

```typescript
const [participantAiScores, setParticipantAiScores] = useState<ParticipantAiScore[]>([]);

const enrichedParticipants = useMemo(() => {
  if (participantAiScores.length === 0) return participantDetails;
  const scoreMap = new Map(participantAiScores.map(s => [s.employeeId, s]));
  return participantDetails.map(p => {
    const ai = scoreMap.get(p.employeeId);
    if (!ai) return p;
    return {
      ...p,
      // scores ไม่เปลี่ยน — ใช้ค่าจาก use-participant-query เดิม
      aiScoreReason: ai.detail,       // ← เติม overall detail
      engageDetail: ai.engageDetail,  // ← เติม detail แต่ละด้าน
      goalDetail: ai.goalDetail,
      qualityDetail: ai.qualityDetail,
    };
  });
}, [participantDetails, participantAiScores]);
```

`enrichedParticipants` ส่งไปแทน `participantDetails` ใน `<CheckInEngagement>` และ `<AIScoreSection>`

---

## Sequence Diagram

```
participantDetails (use-participant-query) — scores already present
        │
User clicks "Analyze Dashboard Data"
        │
        ├──► POST /api/ai-score ──────────────────► AiScoreController
        │                                                 └─ returns { score, review }
        │
        └──► POST /api/ai-participant-score ────────► AiParticipantScoreController
                  send: scores + check-ins                    │
                                                        Promise.all([
                                                          AI(emp1) → { details only }
                                                          AI(emp2) → { details only }
                                                          ...
                                                        ])
                                                              │
                                                        assemble: scores + details
                                                              │
                  ◄── { results: ParticipantAiScore[], failedIds: [] } ─────┘
        │
        ├── onAiScoreResultChange()      → team panel
        └── onParticipantScoresChange()  → merge detail fields → CheckInEngagement re-renders
```

---

## Performance Notes

| Item | Value |
|------|-------|
| Parallel calls | 1 per employee |
| Check-in records cap | 20 per employee |
| Remark char cap | 300 chars |
| AI output size | 4 short Thai sentences per employee — ขนาดเล็ก |
| Route `maxDuration` | 120s |
| Client timeout | 110s |
| Partial failure | failedIds returned, batch continues |

---

## Future TODOs

- [ ] Save `ParticipantAiScore[]` → backend cache (`POST /api/v1/.../ai-participant-scores`)
- [ ] Load from cache before calling AI (GET endpoint — skip AI if cache hit)
- [ ] Show `dateAIProcessed` in UI badge
- [ ] Replace mock `checkIns` → real API field when backend ready
