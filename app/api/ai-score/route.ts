import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { dashboardData } = await req.json();

    if (!dashboardData) {
      return NextResponse.json({ error: 'Missing dashboard data' }, { status: 400 });
    }

    // Check if API key is provided
    const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    
    // Using a mocked response if no API key is found to ensure it works for demo purposes
    if (!apiKey) {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { summary, atRisk } = dashboardData;
      
      let score = 7;
      let review = "ทีมของคุณมีความคืบหน้าในระดับปานกลาง";
      
      if (summary) {
        if (summary.avgObjectiveProgress > 70) {
          score = 9;
          review = `### 🔥 การดำเนินการยอดเยี่ยม!\n\nทีมของคุณทำผลงานได้อย่างยอดเยี่ยมด้วยความคืบหน้าเฉลี่ย **${summary.avgObjectiveProgress.toFixed(1)}%** มีเป้าหมายที่สำเร็จแล้ว ${summary.completedObjectives} จาก ${summary.totalObjectives} เป้าหมาย \n\n**คำแนะนำ:**\n- รักษาแรงักดันนี้ไว้และคอยสนับสนุนทีม\n- พิจารณาตั้งเป้าหมายที่ท้าทายมากขึ้นในรอบถัดไป`;
        } else if (summary.avgObjectiveProgress > 40) {
          score = 7;
          review = `### ⚡ ผลงานอยู่ในเกณฑ์ดี\n\nด้วยความคืบหน้าเฉลี่ย **${summary.avgObjectiveProgress.toFixed(1)}%** ทีมกำลังเดินหน้าอย่างมั่นคง มี ${summary.onTrackCount} เป้าหมายที่อยู่ในเกณฑ์ดี \n\n**คำแนะนำ:**\n- ระวังเป้าหมายที่มีความเสี่ยง (${atRisk?.length || 0} รายการ) เพื่อไม่ให้ล่าช้า\n- ควรมีการประชุมเพื่อติดตามความคืบหน้าอย่างใกล้ชิด`;
        } else {
          score = 5;
          review = `### ⚠️ ต้องได้รับการดูแลทันที\n\nความคืบหน้าเฉลี่ยตอนนี้อยู่ที่ **${summary.avgObjectiveProgress?.toFixed(1) || 0}%** \n\n**คำแนะนำ:**\n- คุณอาจต้องเข้าไปช่วยแก้ปัญหาที่ติดขัดหรือปรับเปลี่ยนลำดับความสำคัญ\n- มุ่งเน้นไปที่เป้าหมายหลักที่มีผลกระทบสูงก่อนเพื่อสร้างกำลังใจให้ทีม`;
        }
      }

      return NextResponse.json({
        score,
        review,
      });
    }

    // If API key exists, use the actual AI SDK
    const anthropic = createAnthropic({
      apiKey: apiKey,
    });

    const prompt = `
      You are an expert OKR coach and performance analyst with a bold, modern, and inspiring tone.
      Analyze the following OKR team dashboard data and provide:
      1. A score out of 10 for the team's overall performance. (Return only a number between 1-10)
      2. A concise, structured review of their performance and actionable suggestions. 
         IMPORTANT: The review MUST be in Thai language. Use Markdown formatting (headings like ###, bold text **, bullet points -) to make it easy to read. Include relevant emojis.

      Dashboard Data:
      ${JSON.stringify(dashboardData, null, 2)}
      
      Format your response exactly as a JSON object:
      {
        "score": number,
        "review": "string with markdown formatting in Thai"
      }
    `;

    const { text } = await generateText({
      model: anthropic('claude-3-haiku-20240307'),
      prompt: prompt,
    });

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    } catch (error) {
      // Fallback if parsing fails
      console.error('Failed to parse JSON, falling back', error);
      return NextResponse.json({
        score: 8,
        review: text
      });
    }
  } catch (error) {
    console.error('Error generating AI score:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI score' },
      { status: 500 }
    );
  }
}
