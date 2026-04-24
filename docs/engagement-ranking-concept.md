# Check-in Engagement: Multi-Dimensional Ranking Concept

## 1. Background & Pain Point (ปัญหาเดิม)
ในระบบเดิม การจัดอันดับ (Ranking) ของพนักงานในหน้า Check-in Engagement ถูกคำนวณจาก **Progress (ความคืบหน้า)** เพียงอย่างเดียว ซึ่งนำไปสู่ความไม่เป็นธรรม (Unfairness) ในการประเมินผล:
- พนักงานที่ตั้งเป้าหมาย (Objective) ท้าทายและมีความยากสูง มักจะทำ Progress ได้น้อยกว่า
- พนักงานที่ตั้งเป้าหมายง่ายเกินไป กลับได้ Progress สูงอย่างรวดเร็ว
- ส่งผลให้พนักงานที่ได้ Progress สูง (จากเป้าหมายง่ายๆ) ได้รับอันดับที่ดีกว่า ทำให้พนักงานคนอื่นหมดกำลังใจและ **"ไม่อยากตั้งเป้าหมายที่ท้าทาย"** อีกต่อไป

## 2. New Core Logic (แนวคิดการจัดอันดับรูปแบบใหม่)
เพื่อแก้ปัญหาดังกล่าว ระบบใหม่จะยกเลิกการใช้อันดับตาม Progress โดยตรง แต่จะเปลี่ยนมาใช้การประเมินแบบ **Multi-Dimensional Metrics (การวัดผลแบบ 3 มิติ)** ซึ่งประกอบไปด้วย:

1. **Goal Achievement (ผลลัพธ์ตามเป้า)**: คะแนนความก้าวหน้าของงานเทียบกับเป้าที่ตั้งไว้
2. **Quality (คุณภาพของงาน)**: คุณภาพของผลลัพธ์ที่ส่งมอบ
3. **Engagement & Behavior (พฤติกรรม & การมีส่วนร่วม)**: ความตั้งใจ, การอัปเดต Check-in สม่ำเสมอ, หรือการมีส่วนร่วมกับทีม

ระบบ API จะทำการคำนวณ Progress ของทั้ง 3 มิตินี้แยกจากกัน แล้วนำมาสรุปเป็นค่า **`totalScore` (ผลลัพธ์โดยรวม)** ซึ่งค่า Total Score นี้จะถูกนำมาใช้เป็นเกณฑ์ **"การจัดอันดับ (Ranking)"** ที่แท้จริง

## 3. UI Redesign & Features (ฟีเจอร์และการออกแบบหน้าจอ)
จากการปรับเปลี่ยนตรรกะด้านบน ได้นำมาสู่การออกแบบ UI ใหม่ในไฟล์ `@check-in-engagement.tsx`:
- **Main Table:**
  - กลับมาแสดง Column สำคัญที่เคยมี: Status, Check-ins, Missed Check-ins เพื่อให้เห็นความสม่ำเสมอ
  - แสดงค่า Total Score อย่างชัดเจน และใช้เป็นเกณฑ์หลักในการ Sort อันดับ
  - เพิ่ม **Trend Indicator (แนวโน้ม)** เพื่อแสดงผลว่าพนักงานคนนี้มีแนวโน้มผลงานดีขึ้น (Up), คงที่ (Normal), หรือแย่ลง (Down) 
- **Employee Detail Drawer (Sheet):**
  - เปลี่ยนจากการเปิด Modal เป็นหน้าต่าง **Slide-in Sheet แบบกว้างพิเศษ** (Command Center Style) เพื่อให้มีพื้นที่แสดงข้อมูลได้ครบถ้วน
  - นำ **Radar Chart (กราฟใยแมงมุม)** เข้ามาใช้แสดงผล Multi-dimensional Metrics ทั้ง 3 ข้อ เพื่อให้หัวหน้า/ผู้บริหาร สามารถเห็นจุดแข็ง-จุดอ่อน ของพนักงานแต่ละคนได้ทันทีด้วยสายตา

## 4. Current State: Mock Data Implementation (ข้อมูลการจำลองชั่วคราว)
ปัจจุบัน API (จากเส้น `@use-participant-query.ts`) อยู่ระหว่างการพัฒนา (In Development) ดังนั้นในหน้าเว็บปัจจุบัน เราจึงใช้การจำลองข้อมูล (Mock Data) แทรกไว้ใน Repository เพื่อให้สามารถทำงานกับ UI ใหม่ได้ ดังนี้:

**ไฟล์: `src/Infrastructure/Persistence/OkrHttpRepository.ts`**
ในฟังก์ชัน `fetchParticipantDetails`:
- ระบบสร้างค่าแบบ Random ให้กับตัวแปรทั้ง 3 ตัว: `goalAchievementScore`, `qualityScore`, `engagementBehaviorScore`
- คำนวณ `totalScore` โดยเฉลี่ยจาก 3 ค่าด้านบน (หรือจะอิงตาม Mock Weight อื่นๆ)
- คำนวณ `trend` โดยใช้ Random (สุ่มเป็น `'up'`, `'normal'`, `'down'`)

**ไฟล์: `src/Domain/Entities/Okr.ts`**
มีการเพิ่ม Interface เพื่อรองรับ Field ใหม่ที่จะถูกส่งมาจาก API แล้ว:
```ts
export interface ParticipantDetailRaw {
  // ... existing fields
  goalAchievementScore?: number;
  qualityScore?: number;
  engagementBehaviorScore?: number;
  totalScore?: number;
  trend?: 'up' | 'normal' | 'down';
}
```

## 5. Next Steps (สิ่งที่ต้องทำเมื่อ API พร้อม)
1. **Remove Mock Data:** นำโค้ดที่ทำ Random ใน `OkrHttpRepository.ts` ออก
2. **Bind Real API Data:** เชื่อมต่อและดึงฟิลด์ `goalAchievementScore`, `qualityScore`, `engagementBehaviorScore`, `totalScore`, และ `trend` จากข้อมูลจริงที่ตอบกลับมาจาก API
3. **Verify Sorting:** ตรวจสอบว่า `totalScore` ที่คำนวณมาจากฝั่ง Backend ได้เรียงลำดับถูกนำมาแสดงผลเป็นอันดับ 1, 2, 3... ได้อย่างถูกต้อง
4. **Tune Weights:** ฝั่ง Frontend คาดหวังให้ API ดำเนินการผูก `totalScore` มาให้สมบูรณ์แล้วเพื่อนำมาแสดงผลทันที
