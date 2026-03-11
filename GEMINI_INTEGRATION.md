# 🤖 วิธีการส่งข้อมูล OKR ไปยัง Gemini AI เพื่อสรุปผล

## 📋 ภาพรวม

เอกสารนี้อธิบายขั้นตอนการส่งข้อมูล OKR จาก API ไปยัง Gemini AI เพื่อให้ AI สรุปผลเป็นภาษาไทย

## 🎯 วัตถุประสงค์

แก้ปัญหา: **Team Lead ต้องนั่ง copy-paste ข้อมูล OKR ของแต่ละคนในทีมไปโยนให้ AI สรุป ซึ่งเป็นงานที่จำเจและทำซ้ำ**

วิธีแก้: **สร้างระบบที่รวบรวมข้อมูลอัตโนมัติและส่งไปยัง Gemini AI ในคลิกเดียว**

---

## 📊 Schema และความสัมพันธ์ของข้อมูล

### Database Schema
```
AssessmentSets (แผน OKR)
├── AssessmentSetCheckIns (การ check-in ของแผน)
├── AssessmentObjectives (Objectives)
│   ├── AssessmentObjectiveCheckIns (การ check-in ของ Objective)
│   └── AssessmentKeyResults (Key Results)
│       └── AssessmentKeyResultCheckIns (การ check-in ของ KR)
└── AssessmentParticipants (ผู้เข้าร่วม)
    └── EmployeeId
```

### ข้อมูลที่ต้องการสรุป
1. **ภาพรวมทีม** - จำนวน Objectives, Key Results, Completion Rate, สมาชิก
2. **Objectives แต่ละตัว** - ความคืบหน้า, ผู้มีส่วนร่วม, สถานะ
3. **Top Contributors** - คนที่ทำงานเยอะที่สุด, มีส่วนร่วมมากที่สุด
4. **เปรียบเทียบรอบเดือน** - เทียบกับรอบก่อนหน้าว่าดีขึ้นหรือแย่ลง
5. **Objectives ที่มีความเสี่ยง** - Objectives ที่ต้องให้ความสำคัญ

---

## 🔄 ขั้นตอนการทำงาน

### Step 1: Team Lead เลือกข้อมูลที่ต้องการสรุป

Team Lead เข้ามาที่ Dashboard และเลือก:
- **รอบเดือน/สัปดาห์** ที่ต้องการสรุป (Start Date - End Date)
- **Assessment Set ID** (แผน OKR ที่ต้องการดู)
- **Employee IDs** (เลือกคนเฉพาะ หรือทั้งหมด)

```javascript
// ตัวอย่างการเลือก
const filters = {
  setId: 1,
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  employeeIds: [1, 2, 3, 4, 5] // หรือ null สำหรับทั้งหมด
};
```

---

### Step 2: ระบบดึงข้อมูลจาก Backend API

เมื่อ Team Lead กดปุ่ม "ดึงข้อมูล" ระบบจะเรียก API ทั้ง 5 endpoints พร้อมกัน:

#### 2.1 Team Summary API
```javascript
POST /api/okr/dashboard/team-summary

Request Body:
{
  "setId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "employeeIds": [1, 2, 3, 4, 5]
}

Response:
{
  "status": "200",
  "data": {
    "setId": 1,
    "totalObjectives": 15,
    "completedObjectives": 8,
    "totalKeyResults": 45,
    "completedKeyResults": 30,
    "avgObjectiveProgress": 65.5,
    "totalMembers": 5,
    "objectiveCompletionRate": 53.3,
    "keyResultCompletionRate": 66.7
  }
}
```

#### 2.2 Objective Details API
```javascript
POST /api/okr/dashboard/objective-details

Response:
{
  "data": [
    {
      "objectiveId": 101,
      "objectiveName": "เพิ่มยอดขาย 20%",
      "objectiveType": 2, // Team
      "objectiveProgress": 75.0,
      "totalKeyResults": 3,
      "completedKeyResults": 2,
      "contributorCount": 3,
      "status": "On Track"
    },
    // ... more objectives
  ]
}
```

#### 2.3 Top Contributors API
```javascript
POST /api/okr/dashboard/top-contributors

Response:
{
  "data": [
    {
      "employeeId": 123,
      "objectivesOwned": 3,
      "objectivesCompleted": 2,
      "objectiveCompletionRate": 66.7,
      "keyResultsOwned": 9,
      "keyResultsCompleted": 7,
      "keyResultCompletionRate": 77.8,
      "totalCheckIns": 25,
      "engagementScore": 85
    },
    // ... more contributors
  ]
}
```

#### 2.4 Period Comparison API
```javascript
POST /api/okr/dashboard/period-comparison

Response:
{
  "data": {
    "current_TotalObjectives": 15,
    "current_AvgProgress": 65.5,
    "previous_TotalObjectives": 12,
    "previous_AvgProgress": 58.0,
    "delta_AvgProgress": 7.5,
    "progressTrend": "Improving",
    "progressChangePercent": 12.9
  }
}
```

#### 2.5 At Risk Objectives API
```javascript
POST /api/okr/dashboard/at-risk-objectives

Response:
{
  "data": [
    {
      "objectiveId": 105,
      "objectiveName": "ปรับปรุงระบบ Backend",
      "currentProgress": 25.0,
      "daysSinceLastCheckIn": 10,
      "riskScore": 75.0,
      "lowProgressFlag": "ความคืบหน้าต่ำกว่า 30%",
      "noCheckInFlag": "ไม่มี Check-in มากกว่า 7 วัน"
    }
  ]
}
```

---

### Step 3: Format ข้อมูลเป็น Prompt สำหรับ Gemini AI

ระบบจะรวบรวมข้อมูลทั้งหมดและ format เป็น prompt ภาษาไทย:

```javascript
// geminiService.js - formatOKRDataToPrompt()

function formatOKRDataToPrompt(dashboardData) {
  const { summary, objectives, contributors, comparison, atRisk } = dashboardData;

  let prompt = `กรุณาสรุป OKR ของทีมในรอบนี้ และให้คำแนะนำเป็นภาษาไทย:\n\n`;

  // ภาพรวมทีม
  prompt += `## ภาพรวมทีม\n`;
  prompt += `- จำนวน Objectives ทั้งหมด: ${summary.totalObjectives} (เสร็จสมบูรณ์ ${summary.completedObjectives})\n`;
  prompt += `- จำนวน Key Results ทั้งหมด: ${summary.totalKeyResults} (เสร็จสมบูรณ์ ${summary.completedKeyResults})\n`;
  prompt += `- อัตราความสำเร็จ Objectives: ${summary.objectiveCompletionRate.toFixed(1)}%\n`;
  prompt += `- ความคืบหน้าเฉลี่ย: ${summary.avgObjectiveProgress.toFixed(1)}%\n`;
  prompt += `- สมาชิกที่มีส่วนร่วม: ${summary.totalMembers} คน\n\n`;

  // Objectives แต่ละตัว (แสดง 5 อันดับแรก)
  prompt += `## Objectives แต่ละตัว\n`;
  objectives.slice(0, 5).forEach((obj, index) => {
    prompt += `${index + 1}. ${obj.objectiveName}\n`;
    prompt += `   - ความคืบหน้า: ${obj.objectiveProgress.toFixed(1)}%\n`;
    prompt += `   - Key Results: ${obj.completedKeyResults}/${obj.totalKeyResults}\n`;
    prompt += `   - ผู้มีส่วนร่วม: ${obj.contributorCount} คน\n`;
    prompt += `   - สถานะ: ${obj.status}\n\n`;
  });

  // Top Contributors
  prompt += `## ผู้มีส่วนร่วมมากที่สุด (Top 5)\n`;
  contributors.slice(0, 5).forEach((contributor, index) => {
    prompt += `${index + 1}. Employee ID: ${contributor.employeeId}\n`;
    prompt += `   - Objectives: ${contributor.objectivesCompleted}/${contributor.objectivesOwned} (${contributor.objectiveCompletionRate.toFixed(1)}%)\n`;
    prompt += `   - Check-ins: ${contributor.totalCheckIns}\n`;
    prompt += `   - คะแนนการมีส่วนร่วม: ${contributor.engagementScore}\n\n`;
  });

  // เปรียบเทียบกับรอบก่อน
  if (comparison) {
    prompt += `## เปรียบเทียบกับรอบก่อนหน้า\n`;
    prompt += `- ความคืบหน้าเฉลี่ย: ${comparison.current_AvgProgress.toFixed(1)}% → ${comparison.previous_AvgProgress.toFixed(1)}% `;
    prompt += `(${comparison.delta_AvgProgress > 0 ? '+' : ''}${comparison.delta_AvgProgress.toFixed(1)}%)\n`;
    prompt += `- แนวโน้มความคืบหน้า: ${comparison.progressTrend}\n\n`;
  }

  // Objectives ที่มีความเสี่ยง
  if (atRisk.length > 0) {
    prompt += `## Objectives ที่มีความเสี่ยง (${atRisk.length} รายการ)\n`;
    atRisk.forEach((obj, index) => {
      prompt += `${index + 1}. ${obj.objectiveName}\n`;
      prompt += `   - ความคืบหน้า: ${obj.currentProgress.toFixed(1)}%\n`;
      prompt += `   - Check-in ล่าสุด: ${obj.daysSinceLastCheckIn} วันที่แล้ว\n`;
      prompt += `   - คะแนนความเสี่ยง: ${obj.riskScore.toFixed(1)}\n\n`;
    });
  }

  prompt += `\n---\n\n`;
  prompt += `กรุณาสรุปผลการทำงานของทีม วิเคราะห์จุดแข็ง จุดอ่อน และให้คำแนะนำในการปรับปรุง OKR ในรอบถัดไป`;

  return prompt;
}
```

**ตัวอย่าง Prompt ที่ได้:**
```
กรุณาสรุป OKR ของทีมในรอบนี้ และให้คำแนะนำเป็นภาษาไทย:

## ภาพรวมทีม
- จำนวน Objectives ทั้งหมด: 15 (เสร็จสมบูรณ์ 8)
- จำนวน Key Results ทั้งหมด: 45 (เสร็จสมบูรณ์ 30)
- อัตราความสำเร็จ Objectives: 53.3%
- ความคืบหน้าเฉลี่ย: 65.5%
- สมาชิกที่มีส่วนร่วม: 5 คน

## Objectives แต่ละตัว
1. เพิ่มยอดขาย 20%
   - ความคืบหน้า: 75.0%
   - Key Results: 2/3
   - ผู้มีส่วนร่วม: 3 คน
   - สถานะ: On Track

...

กรุณาสรุปผลการทำงานของทีม วิเคราะห์จุดแข็ง จุดอ่อน และให้คำแนะนำในการปรับปรุง OKR ในรอบถัดไป
```

---

### Step 4: ส่ง Prompt ไปยัง Gemini AI

ใช้ Google Generative AI SDK เรียก Gemini Pro model:

```javascript
// geminiService.js - generateSummary()

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

async function generateSummary(dashboardData) {
  try {
    // 1. Format ข้อมูลเป็น prompt
    const prompt = formatOKRDataToPrompt(dashboardData);
    
    // 2. ส่ง prompt ไปยัง Gemini AI
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // 3. รับ text กลับมา
    const summary = response.text();
    
    return summary;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    throw error;
  }
}
```

**API Call ที่เกิดขึ้นภายใน:**
```javascript
POST https://generativelanguage.googleapis.com/v1/models/gemini-3-flash-preview

Headers:
{
  "Content-Type": "application/json",
  "x-goog-api-key": "YOUR_GEMINI_API_KEY"
}

Body:
{
  "contents": [{
    "parts": [{
      "text": "กรุณาสรุป OKR ของทีมในรอบนี้...(prompt ทั้งหมด)"
    }]
  }]
}
```

---

### Step 5: แสดงผลสรุปจาก AI

Gemini AI จะส่ง response กลับมาเป็นภาษาไทย:

**ตัวอย่าง Response จาก Gemini:**
```
สรุปผลการทำงาน OKR ของทีม

## จุดแข็ง
✅ ทีมมีความคืบหน้าโดยรวมอยู่ที่ 65.5% ซึ่งถือว่าอยู่ในเกณฑ์ดี
✅ อัตราความสำเร็จของ Key Results อยู่ที่ 66.7% สูงกว่า Objectives
✅ มีสมาชิกที่มีส่วนร่วมสูง โดยเฉพาะ Employee ID 123 ที่มีคะแนนการมีส่วนร่วม 85
✅ แนวโน้มความคืบหน้าดีขึ้นจากรอบก่อนหน้า (+7.5%)

## จุดอ่อน
⚠️ มี Objective "ปรับปรุงระบบ Backend" ที่มีความเสี่ยงสูง (ความคืบหน้าเพียง 25%)
⚠️ บาง Objective ไม่มี Check-in มากกว่า 7 วัน
⚠️ อัตราความสำเร็จของ Objectives (53.3%) ยังต่ำกว่า Key Results

## คำแนะนำ
1. ให้ความสำคัญกับ Objective "ปรับปรุงระบบ Backend" โดยเร่งด่วน
2. กระตุ้นให้ทีม Check-in สม่ำเสมอ อย่างน้อยสัปดาห์ละครั้ง
3. ทบทวน Objectives ที่ยังไม่เสร็จว่ามีอุปสรรคอะไร
4. ชื่นชม Employee ID 123 ที่มีส่วนร่วมสูง เป็นแบบอย่างให้ทีม
5. รักษาแนวโน้มที่ดีขึ้นต่อไปในรอบถัดไป

โดยรวมแล้วทีมทำงานได้ดี แต่ควรให้ความสำคัญกับ Objectives ที่มีความเสี่ยง
```

---

### Step 6: Team Lead ใช้งานสรุป

Team Lead สามารถ:
1. **อ่านสรุป** - ดูสรุปที่ AI วิเคราะห์ให้
2. **คัดลอก** - กดปุ่ม "📋 คัดลอก" เพื่อ copy ข้อความ
3. **Export** - กดปุ่ม "💾 Export" เพื่อ download เป็นไฟล์ .txt
4. **ถามคำถามเพิ่ม** - พิมพ์คำถามเฉพาะ เช่น "Objective ไหนควรให้ความสำคัญมากที่สุด?"

---

## 🎯 ประโยชน์ที่ได้รับ

### ก่อนใช้ระบบ (Manual)
1. Team Lead เข้าไปดูข้อมูลแต่ละคนในทีม (5 คน)
2. Copy ข้อมูล OKR ของแต่ละคน
3. Paste ลง ChatGPT/Gemini
4. รอ AI สรุป
5. Copy สรุปมาใช้
6. **ใช้เวลา: ~30-45 นาที**

### หลังใช้ระบบ (Automated)
1. เลือกรอบเดือนและคน
2. กดปุ่ม "ดึงข้อมูล"
3. กดปุ่ม "สร้างสรุปอัตโนมัติ"
4. รอ 10-20 วินาที
5. ได้สรุปเลย
6. **ใช้เวลา: ~1-2 นาที**

### ประหยัดเวลา: **93-95%** 🚀

---

## 🔐 ความปลอดภัย

### แนวทางที่แนะนำ (Best Practice)
แทนที่จะให้ Frontend เรียก Gemini API โดยตรง ควรให้ **Backend เป็นตัวเรียก**:

```
Frontend → Backend API → Gemini AI
                ↓
         ส่งสรุปกลับมา
```

**ข้อดี:**
- API Key ไม่ถูก expose ใน Frontend
- ควบคุม Rate Limit ได้ดีกว่า
- สามารถ Cache ผลลัพธ์ได้
- Log การใช้งานได้

**วิธีทำ:**
1. สร้าง API Endpoint ใหม่ใน Backend:
```csharp
[HttpPost("/api/okr/dashboard/ai-summary")]
public async Task<ActionResult<Result<string>>> GenerateAISummaryAsync([FromBody] OKRDashboardSearchModel searchModel) {
    // 1. ดึงข้อมูลทั้งหมด
    // 2. Format เป็น prompt
    // 3. เรียก Gemini API
    // 4. ส่ง summary กลับ
}
```

2. Frontend เรียก API นี้แทน:
```javascript
const summary = await apiService.generateAISummary(params);
```

---

## 📊 ตัวอย่างการใช้งานจริง

### Use Case 1: สรุปรายเดือน
```
Team Lead ต้องการสรุป OKR ของทีมในเดือนมกราคม เพื่อนำเสนอ CEO

1. เลือก: SetId=1, StartDate=2024-01-01, EndDate=2024-01-31
2. กดดึงข้อมูล
3. ดูภาพรวมใน Tab "ภาพรวม"
4. ไป Tab "AI Summary" กดสร้างสรุป
5. Copy สรุปไปใส่ใน Slide นำเสนอ
```

### Use Case 2: เปรียบเทียบทีม
```
Team Lead ต้องการเปรียบเทียบ 2 ทีม

1. ดึงข้อมูลทีม A (EmployeeIds: 1,2,3)
2. Export AI Summary
3. ดึงข้อมูลทีม B (EmployeeIds: 4,5,6)
4. Export AI Summary
5. เปรียบเทียบสรุปของ 2 ทีม
```

### Use Case 3: ถามคำถามเฉพาะ
```
Team Lead ต้องการรู้ว่า Objective ไหนควรให้ความสำคัญ

1. ดึงข้อมูลทั้งหมด
2. ไป Tab "AI Summary"
3. พิมพ์: "Objective ไหนควรให้ความสำคัญมากที่สุด และทำไม?"
4. กดปุ่ม "ถาม"
5. AI จะวิเคราะห์และตอบ
```

---

## 🚀 สรุป

ระบบนี้ช่วยให้ Team Lead:
- ✅ ประหยัดเวลาในการสรุป OKR
- ✅ ได้ข้อมูลที่ครบถ้วนและแม่นยำ
- ✅ ได้ Insights จาก AI
- ✅ ไม่ต้องทำงานซ้ำซากจำเจ
- ✅ มีเวลาไปโฟกัสกับการแก้ปัญหาจริงๆ

**จากเดิมใช้เวลา 30-45 นาที → เหลือแค่ 1-2 นาที** 🎉
