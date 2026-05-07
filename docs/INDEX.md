# AI-OKR-Summary — Docs Hub

> **สำหรับทุกคน (รวมถึง AI):** เริ่มอ่านที่นี่ก่อนเสมอ  
> อัปเดต: 2026-05-07

---

## Feature Status

| Feature | Status | Spec | Shipped |
|---------|--------|------|---------|
| 4-tier status + AI tooltip + Hall of Fame + Drawer | ✅ SHIPPED | [dashboard-enhancements](specs/dashboard-enhancements.md) | May 6, 2026 |
| Per-participant AI scoring (engagement table) | 🔄 IN PROGRESS | [ai-participant-score](specs/ai-participant-score.md) | May 7, 2026 |

---

## Quick Navigation

| ต้องการอะไร | ไปที่ |
|------------|-------|
| OKR API fields, progress formulas, data contracts | [reference/okr-api.md](reference/okr-api.md) |
| Multi-dimensional ranking concept (why 3 scores) | [architecture/engagement-ranking.md](architecture/engagement-ranking.md) |
| What was built in the last major feature drop | [specs/dashboard-enhancements.md](specs/dashboard-enhancements.md) |
| Per-person AI scoring implementation plan | [specs/ai-participant-score.md](specs/ai-participant-score.md) |

---

## Critical Invariants — DO NOT DRIFT

กฎเหล่านี้ถูก enforce ทั่วทั้ง codebase อย่าเปลี่ยนแบบ ad-hoc:

| # | Rule | ทำไม |
|---|------|-------|
| 1 | **`Math.floor()`** สำหรับ progress % ที่แสดงผล | source system truncates, not rounds |
| 2 | **`Math.round()`** สำหรับ AI score display | แก้ floating point artifacts (62.43000001) |
| 3 | Status thresholds: **Beyond ≥80 / On Track ≥60 / At Risk ≥40 / Behind <40** | ต้องใช้เดียวกันทุก component |
| 4 | Total score formula: **goal×0.5 + quality×0.3 + engage×0.2** | business decision ที่ตกลงไว้ |
| 5 | Dark theme: **`zinc` scale เท่านั้น** (ไม่ใช้ `gray`) | design consistency |
| 6 | **ห้ามใช้ colored borders** — ใช้ `bg-*/10` + shadow แทน | user rule |
| 7 | AI tooltip แสดงเฉพาะเมื่อ **ไม่มี date filter** (Overall QTR mode) | ข้อมูล AI คำนวณจาก full period |
| 8 | `OkrDetailRaw.pointOKR` = per-person % progress **ไม่ใช่** target/denominator | see reference/okr-api.md §3 |

---

## Mock Data Removal Checklist

เมื่อ API backend พร้อม ให้ลบ/แก้ไฟล์เหล่านี้:

| Field | ไฟล์ที่มี Mock | สถานะ |
|-------|---------------|--------|
| `goalAchievementScore`, `qualityScore`, `engagementBehaviorScore`, `totalScore`, `trend` | `src/Interface/Ui/Hooks/use-participant-query.ts` — `mockPerformanceScores()` | ⏳ รอ API |
| `aiScoreReason` | `src/Interface/Ui/Hooks/use-participant-query.ts` — `mockPerformanceScores()` | 🔄 จะถูกแทนด้วย AI Participant Score flow |
| `checkIns[]` per participant | `src/Interface/Ui/Hooks/use-participant-query.ts` — `mockCheckInRecords()` (planned) | ⏳ รอ API |
| AI processing time display | `src/Interface/Ui/Components/Okr/ParticipantObjectiveDrawer.tsx` | ⏳ รอ API |

---

## Folder Structure

```
docs/
├── INDEX.md                          ← อยู่นี่
├── specs/                            ← feature specs (planned / in-progress / shipped)
│   ├── dashboard-enhancements.md
│   └── ai-participant-score.md
├── reference/                        ← stable reference material (API contracts, types)
│   └── okr-api.md
└── architecture/                     ← design concepts, business logic rationale
    └── engagement-ranking.md
```
