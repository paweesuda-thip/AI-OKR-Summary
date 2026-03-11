# OKR Dashboard with AI Summary

Dashboard สำหรับ Team Lead ในการดูภาพรวม OKR ของทีม และสรุปผลด้วย Gemini AI โดยอัตโนมัติ

## Features

- **ภาพรวมทีม** - แสดง Objectives, Key Results, ความคืบหน้า, และจำนวนสมาชิก
- **รายละเอียด Objectives** - แสดงรายละเอียดแต่ละ Objective พร้อมผู้มีส่วนร่วม
- **Top Performers** - แสดงผู้ที่มีผลงานดีที่สุด พร้อมคะแนนการมีส่วนร่วม
- **Needs Attention** - แสดงสมาชิกที่ยังไม่ได้ check-in
- **Objectives ที่มีความเสี่ยง** - แสดง Objectives ที่ต้องให้ความสำคัญ
- **AI Summary** - สรุปผลด้วย Gemini AI พร้อม Q&A แบบ interactive

## การติดตั้ง

### 1. Clone โปรเจค

```bash
git clone <repo-url>
cd AI-OKR-Summary
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env`:

```env
# API Configuration
VITE_API_BASE_URL=https://api.empeo.com
VITE_API_KEY_EMPEO=your_empeo_api_key_here

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**วิธีรับ Gemini API Key (ฟรี):**
1. ไปที่ https://aistudio.google.com/app/apikey
2. Login ด้วย Google Account
3. คลิก "Create API Key"
4. Copy API Key มาใส่ในไฟล์ `.env`

### 4. รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ http://localhost:4200

## วิธีใช้งาน

### 1. กรอก Filter
- **Assessment Set ID**: ระบุ ID ของ Assessment Set
- **Organization ID**: ระบุ Organization ID

### 2. กดปุ่ม "Fetch Data"
ระบบจะดึงข้อมูลจาก Empeo API และแสดงผลใน Dashboard

### 3. ดูข้อมูลในแต่ละ Section
- **Overview Cards** - ตัวเลขสรุปภาพรวม
- **Objectives** - รายละเอียด Objectives แต่ละตัวพร้อม Key Results
- **Top Performers** - สมาชิกที่มีผลงานดีที่สุด
- **Needs Attention** - สมาชิกที่ยังไม่ได้ check-in
- **At Risk** - Objectives ที่ progress ต่ำกว่าเกณฑ์

### 4. สร้าง AI Summary
1. กดปุ่ม "Generate AI Summary" ในส่วน AI OKR Summary
2. รอสักครู่ AI จะวิเคราะห์และสรุปผลให้
3. ดูผลใน 3 tabs: Overview, Objectives, Action Plan

**ถามคำถาม follow-up:**
- พิมพ์คำถามในช่อง Q&A เช่น "Objective ไหนควรให้ความสำคัญมากที่สุด?"
- กด Enter หรือปุ่ม Send
- AI จะตอบตามข้อมูล OKR ที่โหลดมา

## Backend API

Dashboard ใช้ endpoint เดียว:

```
POST /api/v1/goal-managements/objective-summary
Body: { assessmentSetId, organizationId }
```

Authentication ผ่าน header `X-API-KEY-EMPEO`

## โครงสร้างโปรเจค

```
src/
├── components/
│   ├── Dashboard.jsx              # Main dashboard component
│   ├── FilterBar.jsx              # Filter inputs
│   ├── OverviewCards.jsx          # Summary stat cards
│   ├── ObjectivesSection.jsx      # Objectives list
│   ├── TopPerformersSection.jsx   # Top performers
│   ├── NeedsAttentionSection.jsx  # Members without check-in
│   ├── AtRiskSection.jsx          # At-risk objectives
│   ├── TeamMembersSection.jsx     # All team members
│   ├── PeriodComparisonSection.jsx
│   ├── AISummaryPanel.jsx         # Gemini AI summary & Q&A
│   └── APITestTool.jsx            # Dev tool for API testing
├── services/
│   ├── apiService.js              # Empeo API calls
│   └── geminiService.js           # Gemini AI integration
├── App.jsx
├── main.jsx
└── index.css
```

## ความปลอดภัย

- API Keys เก็บใน `.env` เท่านั้น — ไม่ถูก commit ขึ้น Git (มีใน `.gitignore`)
- ไม่มี HTML injection: AI response ถูก render เป็น React elements โดยตรง ไม่ใช้ `dangerouslySetInnerHTML`
- ใช้ HTTPS สำหรับ Production

> **หมายเหตุ:** เนื่องจากเป็น frontend app, API keys จะถูก embed ใน JavaScript bundle ที่ build ออกมา แนะนำให้ทำ backend proxy สำหรับ production เพื่อความปลอดภัยสูงสุด

