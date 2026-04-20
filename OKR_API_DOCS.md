# OKR API Response Documentation

เอกสารนี้อธิบาย field ทั้งหมดที่ได้จาก API response ของระบบ OKR, ความหมาย, ความสัมพันธ์ระหว่าง field, และวิธีการคำนวณ progress สำหรับแต่ละระดับ

## ⚡ TL;DR สำหรับคน implement

**อย่าเขียน person-specific progress logic ใหม่** — ใช้ helper ที่มีแล้ว:

```ts
import { mapObjectiveForPerson } from '@/lib/transformers/okr-transformer';
import type { PersonObjective } from '@/lib/types/okr';

const personObj: PersonObjective | null = mapObjectiveForPerson(objective, personName);
// personObj.personProgress          → main-obj % ของคนนี้
// personObj.subObjectives[].personProgress       → sub-OKR % (raw, สำหรับแสดงผล)
// personObj.subObjectives[].personProgressCapped → sub-OKR % (capped) — internal, caller ไม่ต้องใช้ปกติ
// return null → คนนี้ไม่มี KR เลยใน objective นี้ (skip ทั้ง render + การคำนวณ)
```

helper นี้คือ **single source of truth** — ใช้ทั้งใน `check-in-engagement.tsx` และ `versus-mode.tsx`

**แสดงผลตัวเลข:** ใช้ `Math.floor()` เสมอ (source system truncate, ไม่ใช่ round)

---

## 1. Data Hierarchy (โครงสร้างข้อมูล)

```
Main Objective (OkrDataRaw)
├── objectiveDetails[] (OkrObjectiveDetailRaw) — Sub-Objectives / Key Results
│   └── details[] (OkrDetailRaw) — Individual KR assignments per person
```

**ตัวอย่าง:**
- Main Objective: "Design and Maintain High-Performance, Secure, and Scalable Codebase"
  - Sub-OKR 1: "(Performance) Improve Backend Performance..."
    - KR detail: ศุภวิชญ์ — pointCurrent: 1.00, pointOKR: 50.00
  - Sub-OKR 2: "(Exceptionless) Fixed an error..."
    - (ไม่มี details สำหรับคนนี้)
  - Sub-OKR 3: "(Sentry) Improve Web Performance..."
    - (ไม่มี details สำหรับคนนี้)

---

## 2. Main Objective Fields (`OkrDataRaw`)

| Field | Type | ความหมาย |
|---|---|---|
| `objectiveId` | number | ID ของ Objective หลัก |
| `objectiveOwnerType` | number | ประเภทเจ้าของ (1 = ทีม, 2 = บุคคล) |
| `objectiveType` | number | ประเภท Objective |
| `referenceObjectiveId` | number | ID ของ Objective ต้นทางที่อ้างอิง |
| `ownerTeam` | string | ชื่อทีมเจ้าของ เช่น "Spartan" |
| `title` | string | ชื่อ Objective (ภาษาไทย) |
| `title_EN` | string | ชื่อ Objective (ภาษาอังกฤษ) |
| **`progress`** | number | **% progress รวมของทั้งทีม (ทุกคน)** — ใช้แสดงภาพรวมทีม ไม่ใช่ progress ของคนใดคนหนึ่ง |
| `objectiveDetails` | array | รายการ Sub-Objectives / Key Results |

### ⚠️ หมายเหตุสำคัญเรื่อง `progress` ระดับ Main Objective
- ค่านี้คือ **progress รวมของทั้งทีม** (aggregate ทุกคน)
- **ไม่ใช่** progress ของคนใดคนหนึ่ง
- ถ้าต้องการ progress ของคนเฉพาะคน ต้องคำนวณจาก `objectiveDetails[].details[].pointOKR` (ดูหัวข้อ 5)

---

## 3. Sub-Objective Fields (`OkrObjectiveDetailRaw`)

| Field | Type | ความหมาย |
|---|---|---|
| `objectiveId` | number | ID ของ Sub-Objective |
| `objectiveOwnerType` | number | ประเภทเจ้าของ |
| `ownerTeam` | string \| null | ชื่อทีม (อาจเป็น null ถ้าเป็น objective ส่วนบุคคล) |
| `title` | string | ชื่อ Sub-Objective (ภาษาไทย) |
| `title_EN` | string | ชื่อ Sub-Objective (ภาษาอังกฤษ) |
| **`progress`** | number | **% progress รวมของ Sub-OKR นี้ (ทุกคนรวมกัน)** — รวมทุก KR ของทุกคน รวมถึง KR ที่ 0% ที่อาจไม่ถูกส่งมาใน `details[]` |
| `progressUpdate` | number | ค่า progress ที่เปลี่ยนแปลงในช่วงเวลาที่ filter (ใช้สำหรับ trending) |
| `details` | array | รายการ KR assignments ของแต่ละคน **เฉพาะคนที่ถูก filter** |

### ⚠️ หมายเหตุสำคัญเรื่อง `progress` ระดับ Sub-Objective
- ค่านี้คือ **progress รวมของ Sub-OKR นี้ ทุกคนรวมกัน**
- ค่านี้ **รวม KR ที่ progress เป็น 0%** ที่อาจ **ไม่ปรากฏ** ใน `details[]`
- ใช้เป็น **upper cap** ในการคำนวณ progress ระดับ Main Objective ของคนเฉพาะคน (ดูหัวข้อ 5)

### ⚠️ หมายเหตุเรื่อง `details[]`
- `details[]` อาจ **ไม่ครบทุก KR** ของ Sub-Objective นั้น
- API จะส่งมาเฉพาะ KR ที่ตรงกับ filter (เช่น คนที่เลือก)
- KR ที่ progress = 0% อาจ **ไม่ถูกส่งมา** ใน `details[]` แต่ยัง **ถูกนับรวม** ใน `progress` ของ Sub-Objective

---

## 4. KR Detail Fields (`OkrDetailRaw`)

| Field | Type | ความหมาย |
|---|---|---|
| `keyId` | number | ID ของ Key Result |
| `fullName` | string | ชื่อเต็มเจ้าของ KR (ภาษาไทย) |
| `fullName_EN` | string | ชื่อเต็มเจ้าของ KR (ภาษาอังกฤษ) |
| `pictureUrl` | string | URL รูปโปรไฟล์ |
| `title` | string | ชื่อ/คำอธิบายของ KR |
| **`pointCurrent`** | number | **คะแนนปัจจุบันที่ทำได้จริง** (หน่วยเป็น point ดิบ เช่น 1, 25, 140) |
| **`pointOKR`** | number | **% progress ของ Sub-Objective นั้นสำหรับคนนี้** — เป็น % ไม่ใช่ target/total |

### ⚠️ ความเข้าใจผิดที่พบบ่อย

#### `pointOKR` ≠ target point
- `pointOKR` **ไม่ใช่** จำนวน point เป้าหมาย
- `pointOKR` **คือ % progress** ของ Sub-Objective นั้น สำหรับคนคนนี้
- ❌ ห้ามใช้เป็นตัวหาร: `pointCurrent / pointOKR`
- ✅ ใช้แสดงเป็น `{pointOKR}%` ได้โดยตรง

#### `pointCurrent` = raw point ของ KR
- `pointCurrent` คือคะแนนดิบที่ทำได้จริงของ KR แต่ละตัว
- หน่วยเป็น point (ไม่ใช่ %)
- ใช้แสดงเป็น point ได้โดยตรง เช่น "1 pt", "25 pt"

---

## 5. วิธีคำนวณ Progress สำหรับคนเฉพาะคน (Person-Specific)

### 5.1 Sub-OKR Progress (สำหรับแสดงผล)

```
subPersonProgress = avg(details[].pointOKR)
```

- เอา `pointOKR` ของทุก KR ใน `details[]` มาเฉลี่ยกัน
- ใช้แสดงผลใน UI ของ Sub-OKR

**ตัวอย่าง:** Sub-OKR 60469 มี 2 KR → pointOKR = [50, 10]
```
subPersonProgress = (50 + 10) / 2 = 30%
```

### 5.2 Sub-OKR Progress (สำหรับคำนวณ Main Objective)

```
subPersonProgressCapped = min(avg(details[].pointOKR), sub.progress)
```

- เหมือน 5.1 แต่ **cap ด้วย `sub.progress`** (progress รวมของทีม)
- เหตุผล: `details[]` อาจไม่มี KR ที่ 0% แต่ `sub.progress` รวมไว้แล้ว
- ใช้เฉพาะตอนคำนวณ Main Objective progress เท่านั้น

**ตัวอย่าง:** Sub-OKR 60878 มี 2 KR ใน details → pointOKR = [25, 100]
แต่จริงๆมี KR อีกตัวที่ 0% ไม่ถูกส่งมาใน details
```
avg(pointOKR)  = (25 + 100) / 2 = 62.5
sub.progress   = 41   (backend รวม KR ที่ 0% ไว้แล้ว)
capped         = min(62.5, 41) = 41%
```

### 5.3 Main Objective Progress (สำหรับคนเฉพาะคน)

```
objPersonProgress = avg(subPersonProgressCapped) เฉพาะ Sub-OKR ที่มี details
```

- เอา Sub-OKR ที่คนนี้มี KR (details.length > 0) มาเฉลี่ยกัน
- ใช้ค่า **capped** (5.2) ไม่ใช่ค่า raw (5.1)
- Sub-OKR ที่ไม่มี details สำหรับคนนี้ → **ไม่แสดง** ใน UI และ **ไม่นับ** ในการคำนวณ

**ตัวอย่าง:** Objective 60464 มี 6 Sub-OKRs แต่คนนี้มี KR ใน 2 ตัว:
```
Sub 60465: capped = min(50, 36) = 36
Sub 60962: capped = min(105, 41) = 41
objPersonProgress = (36 + 41) / 2 = 38.5
แสดงผล: Math.floor(38.5) = 38%
```

### 5.4 การแสดงผลตัวเลข

- ใช้ **`Math.floor()`** เสมอ (ปัดลง) — ไม่ใช้ `toFixed(0)` หรือ `Math.round()`
- เหตุผล: ระบบต้นทาง truncate ทศนิยม ไม่ได้ round
- ตัวอย่าง: 38.5 → แสดง **38** (ไม่ใช่ 39)

---

## 6. Status Thresholds (เกณฑ์สถานะ)

| Status | เงื่อนไข | สี |
|---|---|---|
| **On Track** | progress ≥ 70% | 🟢 emerald/green |
| **At Risk** | 40% ≤ progress < 70% | 🟡 amber/yellow |
| **Behind** | progress < 40% | 🔴 rose/red |

ใช้เกณฑ์เดียวกันทุกระดับ (Main Objective, Sub-OKR, Individual KR)

---

## 7. Participant Detail Fields (`ParticipantDetailRaw`)

ข้อมูลนี้มาจาก API แยก สำหรับแสดงรายชื่อพนักงานและสถิติ check-in

| Field | Type | ความหมาย |
|---|---|---|
| `seq` | number | ลำดับ |
| `employeeId` | number | ID พนักงาน |
| `fullName` | string | ชื่อเต็ม (ไทย) |
| `fullName_EN` | string | ชื่อเต็ม (อังกฤษ) |
| `pictureURL` | string | URL รูปโปรไฟล์ |
| `pictureMediumURL` | string | URL รูปขนาดกลาง |
| `pictureOriginalURL` | string | URL รูปต้นฉบับ |
| `totalCheckInAll` | number | จำนวน check-in ทั้งหมดที่ต้องทำ (ในช่วงที่เลือก) |
| `totalCheckIn` | number | จำนวน check-in ที่ทำแล้ว |
| `totalMissCheckInAll` | number | จำนวน miss check-in ทั้งหมดที่เป็นไปได้ |
| `totalMissCheckIn` | number | จำนวน miss check-in จริง |
| `avgPercent` | number | % progress เฉลี่ยของ Objective ทั้งหมดของคนนี้ |

---

## 8. Quick Reference: สรุปการใช้งาน Field

```
┌─────────────────────────────────────────────────────────────────┐
│ ใช้แสดง progress ทีมรวม    → OkrDataRaw.progress               │
│ ใช้แสดง progress Sub-OKR   → avg(details[].pointOKR)           │
│ ใช้คำนวณ Main Obj ของคน    → min(avg(pointOKR), sub.progress)  │
│ ใช้แสดง point ของ KR       → details[].pointCurrent            │
│ ใช้แสดง % ของ KR ต่อคน     → details[].pointOKR (เป็น %)       │
│ ใช้แสดงตัวเลข              → Math.floor() เสมอ                  │
│                                                                 │
│ ❌ ห้ามใช้ pointCurrent / pointOKR เป็น %                       │
│ ❌ ห้ามใช้ sub.progress แสดงเป็น progress ของคนเฉพาะคน          │
│ ❌ ห้ามใช้ toFixed(0) หรือ Math.round() แสดง %                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. ตัวอย่างการคำนวณจริง

### Objective: "Boost Productivity and Code Quality Through AI-Driven Development"

**API Response:**
```json
{
  "objectiveId": 60470,
  "progress": 23.0,          // ← progress รวมทีม (ไม่ใช้สำหรับคนเฉพาะคน)
  "objectiveDetails": [
    {
      "objectiveId": 60471,   // Sub-OKR 1: ไม่มี details สำหรับคนนี้
      "progress": 50.0,
      "details": []
    },
    {
      "objectiveId": 64084,   // Sub-OKR 2: ไม่มี details สำหรับคนนี้
      "progress": 50.0,
      "details": []
    },
    {
      "objectiveId": 60878,   // Sub-OKR 3: มี 2 KR สำหรับคนนี้
      "progress": 41.0,       // ← progress รวม (รวม KR ที่ 0% ที่ไม่อยู่ใน details)
      "details": [
        { "pointCurrent": 25.00, "pointOKR": 25.00 },
        { "pointCurrent": 140.00, "pointOKR": 100.00 }
      ]
    }
  ]
}
```

**การคำนวณ:**
```
Sub-OKR 60471: details = [] → ข้าม
Sub-OKR 64084: details = [] → ข้าม
Sub-OKR 60878:
  avg(pointOKR) = (25 + 100) / 2 = 62.5   (สำหรับแสดงผล Sub-OKR)
  capped = min(62.5, 41) = 41              (สำหรับคำนวณ Main Obj)

Main Obj Progress = avg([41]) = 41
แสดงผล: Math.floor(41) = 41%  ✅
```
