import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000;

// Initialize SDK with the new @google/genai pattern
let ai: any = null;

if (GEMINI_API_KEY) {
    ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY
    });
}

// Using the specific model version requested by the user
const CURRENT_MODEL = 'gemini-3-flash-preview';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function extractRetryTime(errorMessage: string) {
    const retryMatch = errorMessage.match(/retry in (\d+(\.\d+)?)/i);
    return retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : null;
}

/**
 * Parse and clean JSON response from AI
 */
function parseAIResponse(text: string) {
    try {
        // Remove markdown code blocks if present
        let cleaned = text.trim();
        cleaned = cleaned.replace(/^```json\s*/i, '');
        cleaned = cleaned.replace(/^```\s*/i, '');
        cleaned = cleaned.replace(/\s*```$/i, '');
        cleaned = cleaned.trim();
        
        // Parse JSON
        const parsed = JSON.parse(cleaned);
        return parsed;
    } catch (error) {
        console.error('Failed to parse AI response as JSON:', error);
        console.error('Raw response:', text);
        throw new Error('AI ส่งข้อมูลกลับมาไม่ใช่ JSON ที่ถูกต้อง');
    }
}

/**
 * Enhanced Prompt Formatter for Team Lead-level OKR Analysis - JSON Output
 */
function formatOKRDataToPrompt(dashboardData: any) {
    const { summary, objectives, contributors, atRisk } = dashboardData;

    let prompt = `คุณคือ **Strategic Business Partner & OKR Specialist** ระดับสูง
หน้าที่ของคุณคือการกลั่นกรองข้อมูล OKR ที่ซับซ้อนให้กลายเป็น **อินไซท์เชิงกลยุทธ์ (Strategic Insights)** เพื่อนำเสนอต่อ Team Lead โดยตรง

### ปรัชญาการสรุป:
1. **Team Lead First**: ไม่ต้องร่ายยาว เน้น "สิ่งที่เป็นปัญหา" และ "สิ่งที่สำเร็จจริง"
2. **Impact Driven**: เชื่อมโยงตัวเลขเข้ากับผลกระทบต่อธุรกิจ (Business Impact)
3. **Action Oriented**: ทุกประเด็นที่สรุปควรนำไปสู่การตัดสินใจหรือการตั้งคำถามต่อได้
4. **Professional Tone**: ห้ามใช้ Emoji ในการตอบ ให้ใช้ภาษาทางการและกระชับ

---

### ชุดข้อมูลดิบสำหรับวิเคราะห์ (Raw Data Context):

#### 1. ตัวชี้วัดหลักและสุขภาพขององค์กร (Key Metrics & Organizational Health)
`;

    if (summary) {
        const objCompletionRate = summary.objectiveCompletionRate?.toFixed(1) || '0.0';
        const krCompletionRate = summary.krCompletionRate?.toFixed(1) || '0.0';
        const avgProgress = summary.avgObjectiveProgress?.toFixed(1) || '0.0';

        prompt += `- อัตราความสำเร็จของ Objectives: ${objCompletionRate}% (${summary.completedObjectives}/${summary.totalObjectives})
- อัตราความสำเร็จของ Key Results: ${krCompletionRate}% (${summary.completedKRs}/${summary.totalKRs})
- ความคืบหน้าเฉลี่ยรวม: ${avgProgress}%
- จำนวนผู้มีส่วนร่วม: ${summary.totalContributors} คน\n\n`;
    }

    if (contributors && contributors.length > 0) {
        prompt += `#### 2. พลังขับเคลื่อนของบุคลากร (Human Capital Drivers)
`;
        contributors.slice(0, 5).forEach((person: any) => {
            prompt += `- ${person.fullName}: ${person.totalPointCurrent} pts จาก ${person.krCount} KRs, มีส่วนร่วมใน ${person.objectives?.length || 0} Objectives\n`;
        });
        prompt += `\n`;
    }

    if (objectives && objectives.length > 0) {
        prompt += `#### 3. สถานะความสำเร็จรายเป้าหมาย (Strategic Objectives Status)
`;
        objectives.slice(0, 8).forEach((obj: any) => {
            prompt += `- ${obj.objectiveName}: ${obj.status} (${obj.progress}%) [${obj.ownerTeam || 'N/A'}]\n`;
        });
        prompt += `\n`;
    }

    if (atRisk && atRisk.length > 0) {
        prompt += `#### 4. ประเด็นวิกฤตและความเสี่ยง (Critical Risks)
`;
        atRisk.forEach((obj: any) => {
            prompt += `- 🔴 [วิกฤต]: ${obj.objectiveName} (คืบหน้าเพียง ${obj.progress}%) [ทีม: ${obj.ownerTeam || 'N/A'}]\n`;
        });
        prompt += `\n`;
    }

    prompt += `---

### 📝 คำสั่งสำหรับการส่งข้อมูลกลับ (JSON Response Format)

**⚠️ สำคัญมาก: คุณต้องส่งข้อมูลกลับมาในรูปแบบ JSON เท่านั้น ไม่ต้องมี markdown หรือข้อความอื่นใดนอกจาก JSON object**

หลักการสำคัญ:
- โทนเชิงบวก มองไปข้างหน้า (Growth & Opportunity-driven)
- ทุกการวิเคราะห์ต้องอ้างอิงชื่อ Objective เสมอ
- ใช้ภาษาไทยเชิงผู้บริหาร สุภาพ มั่นใจ และสร้างพลัง
- เน้น "โอกาส + การเติบโต" มากกว่าการตำหนิ

กรุณาส่งข้อมูลกลับมาในรูปแบบ JSON ตาม Schema นี้เท่านั้น:

{
  "executiveSummary": {
    "healthScore": <number 1-10>,
    "healthReason": "<เหตุผลเชิงกลยุทธ์ที่ให้คะแนนนี้ 2-3 ประโยค>",
    "alignmentStatus": "on-track" หรือ "needs-focus",
    "keyAchievement": "<Achievement เชิงบวกที่สร้าง Momentum สูงสุด พร้อมอ้างอิง Objective>"
  },
  "winningObjectives": [
    {
      "objectiveName": "<ชื่อ Objective จริงจากข้อมูล>",
      "progress": <number ความคืบหน้า>,
      "contributors": ["<ชื่อผู้มีส่วนร่วมหลัก>"],
      "insight": "<ทำได้ดีเพราะอะไร จุดแข็งที่ควรต่อยอด 1-2 ประโยค>",
      "impactLevel": "high" หรือ "medium"
    }
  ],
  "growthOpportunities": [
    {
      "objectiveName": "<ชื่อ Objective จริงจากข้อมูล>",
      "currentStatus": "<On Track|At Risk|Behind>",
      "opportunity": "<โอกาสในการพัฒนา 1-2 ประโยค>",
      "unlock": "<สิ่งที่ช่วยปลดล็อก เช่น คน/เวลา/clarity>",
      "priority": "high" หรือ "medium" หรือ "low"
    }
  ],
  "actionPlan": [
    {
      "priority": <number 1-5>,
      "action": "<Action ที่แนะนำ ชัดเจนและ actionable>",
      "relatedObjective": "<ชื่อ Objective ที่เกี่ยวข้อง>",
      "expectedImpact": "<ผลกระทบที่คาดหวัง>",
      "actionType": "accelerate" หรือ "refocus" หรือ "expand"
    }
  ],
  "keyInsights": {
    "topPerformancePattern": "<pattern ของความสำเร็จที่สามารถ replicate ได้ 2-3 ประโยค>",
    "systemicOpportunity": "<โอกาสเชิงระบบที่จะช่วยหลาย Objective พร้อมกัน>",
    "teamStrength": "<จุดแข็งหลักของทีมที่ควร leverage>"
  }
}

**คำแนะนำเพิ่มเติม:**
- winningObjectives: เลือก 3-5 Objectives ที่ทำได้ดีที่สุด (progress สูง หรือ impact สูง)
- growthOpportunities: เลือก 2-4 Objectives ที่มีโอกาสพัฒนาสูง (ไม่จำเป็นต้องเป็น At Risk เท่านั้น)
- actionPlan: ให้ 3-5 actions ที่เป็นรูปธรรมและ actionable
- ทุก field ที่เป็นข้อความควรกระชับ ชัดเจน และเป็นประโยคสมบูรณ์
- ต้องใช้ข้อมูลจริงจากที่ให้ไป อย่าสร้างชื่อ Objective ขึ้นมาเอง

**ห้ามส่งข้อความอื่นใดนอกจาก JSON object ที่ valid **
ไม่ต้องมี \`\`\`json หรือ markdown wrapper ใดๆ (แต่ถ้ามีก็ไม่เป็นไร ระบบจะตัดออกให้)

`;

    return prompt;
}

const geminiService = {
    isConfigured() {
        return !!ai;
    },

    getPrompt(dashboardData: any) {
        return formatOKRDataToPrompt(dashboardData);
    },

    async generateSummary(dashboardData: any) {
        if (!this.isConfigured()) {
            throw new Error('กรุณาตั้งค่า VITE_GEMINI_API_KEY ในไฟล์ .env');
        }

        const prompt = formatOKRDataToPrompt(dashboardData);

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {

                const response = await ai.models.generateContent({
                    model: CURRENT_MODEL,
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config: {
                        temperature: 0.65, // ปรับเพื่อความแม่นยำเชิงวิเคราะห์
                        maxOutputTokens: 3000,
                    }
                });

                if (!response.text) throw new Error('AI ส่งคำตอบกลับมาเป็นค่าว่าง');
                
                // Parse JSON response
                const jsonData = parseAIResponse(response.text);
                
                return jsonData;

            } catch (error: any) {
                console.error(`Attempt ${attempt} error:`, error.message);

                const isQuotaError = error.message?.includes('429') || error.message?.toLowerCase().includes('quota');

                if (isQuotaError && attempt < MAX_RETRIES) {
                    const waitTime = extractRetryTime(error.message) || (Math.pow(2, attempt) * 1000 / 1000);
                    console.warn(`Quota limit. Waiting ${waitTime}s...`);
                    await sleep(waitTime * 1000);
                    continue;
                }

                if (error.message?.includes('404')) {
                    throw new Error(`ไม่พบ Model ${CURRENT_MODEL} หรือ Endpoint (404). กรุณาตรวจสอบการตั้งค่า Model Name`);
                }

                if (attempt === MAX_RETRIES) throw error;
                await sleep(BASE_RETRY_DELAY * attempt);
            }
        }
    },

    async generateTopPerformersSummary(top3: any[]) {
        if (!this.isConfigured()) {
            throw new Error('กรุณาตั้งค่า VITE_GEMINI_API_KEY ในไฟล์ .env');
        }

        const personData = top3.map((person: any, idx: number) => ({
            rank: idx + 1,
            name: person.fullName,
            score: person.totalPointCurrent,
            krCount: person.krCount,
            objectives: (person.objectives || []).map((o: any) => ({
                name: o.objectiveName,
                progress: o.progress,
                status: o.status,
            })),
        }));

        const prompt = `คุณคือ HR Analytics Expert ผู้เชี่ยวชาญด้านการวิเคราะห์ผลงานและ OKR

ข้อมูล Top 3 Performers ของทีม:
${JSON.stringify(personData, null, 2)}

กรุณาสรุปผลงานโดย:
- อธิบายว่าแต่ละคนโดดเด่นด้านใด และมีส่วนร่วมใน OKR อะไรบ้าง
- ใช้ภาษาไทยเชิงบวก สั้นกระชับ 1-2 ประโยคต่อคน (ห้ามเกิน 80 ตัวอักษร)
- สรุปภาพรวมทีม 1 ประโยค (ห้ามเกิน 60 ตัวอักษร)

**ข้อจำกัดสำคัญ: ห้ามเขียนยาว ให้สั้นกระชับที่สุด**

ส่ง JSON เท่านั้น ห้ามมี markdown wrapper:
{"rankings":[{"rank":1,"name":"ชื่อ","summary":"สรุปสั้นๆ"},{"rank":2,"name":"ชื่อ","summary":"สรุปสั้นๆ"},{"rank":3,"name":"ชื่อ","summary":"สรุปสั้นๆ"}],"teamSummary":"สรุปทีมสั้นๆ"}`;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model: CURRENT_MODEL,
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config: { temperature: 0.5, maxOutputTokens: 2000 },
                });
                if (!response.text) throw new Error('AI ส่งคำตอบกลับมาเป็นค่าว่าง');
                return parseAIResponse(response.text);
            } catch (error: any) {
                const isQuotaError = error.message?.includes('429') || error.message?.toLowerCase().includes('quota');
                if (isQuotaError && attempt < MAX_RETRIES) {
                    const waitTime = extractRetryTime(error.message) || Math.pow(2, attempt);
                    await sleep(waitTime * 1000);
                    continue;
                }
                if (attempt === MAX_RETRIES) throw error;
                await sleep(BASE_RETRY_DELAY * attempt);
            }
        }
    },

    async askQuestion(dashboardData: any, question: string) {
        if (!this.isConfigured()) {
            throw new Error('Gemini API key is not configured');
        }

        // For Q&A, we can keep returning text instead of JSON
        const dataContext = JSON.stringify({
            summary: dashboardData.summary,
            objectives: dashboardData.objectives?.slice(0, 10),
            contributors: dashboardData.contributors?.slice(0, 5),
            comparison: dashboardData.comparison,
            atRisk: dashboardData.atRisk
        }, null, 2);

        const fullPrompt = `คุณคือ Strategic OKR Advisor 

### ข้อมูล OKR ปัจจุบัน:
${dataContext}

### คำถามจาก Team Lead:
${question}

### คำสั่ง:
ตอบคำถามโดยรักษาภาพลักษณ์ของ Strategic Advisor 
- ให้คำตอบที่เฉียบคม อ้างอิงตัวเลขและข้อมูลจริง
- ใช้ภาษาไทยเชิงผู้บริหาร
- บสั้นและตรงประเด็น 2-4 ประโยค
- เน้นการให้ insight และ actionable recommendation
`;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model: CURRENT_MODEL,
                    contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
                    config: {
                        temperature: 0.7,
                        maxOutputTokens: 500,
                    }
                });
                return response.text;
            } catch (error: any) {
                const isQuotaError = error.message?.includes('quota') || error.message?.includes('429');

                if (isQuotaError && attempt < MAX_RETRIES) {
                    const waitTime = extractRetryTime(error.message) || (BASE_RETRY_DELAY * attempt / 1000);
                    await sleep(waitTime * 1000);
                    continue;
                }

                if (attempt === MAX_RETRIES) {
                    throw new Error(`ไม่สามารถตอบคำถามได้: ${error.message}`);
                }
            }
        }
    }
};

export default geminiService;
