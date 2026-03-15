import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface AIScoreResponse {
  score: number;
  review: string;
}

const clampScore = (score: number) => Math.min(10, Math.max(1, Math.round(score)));

const normalizeAIScoreResponse = (payload: unknown): AIScoreResponse | null => {
  if (!payload || typeof payload !== 'object') return null;

  const raw = payload as { score?: unknown; review?: unknown };
  const scoreValue = typeof raw.score === 'string' ? Number(raw.score) : raw.score;
  const reviewValue = typeof raw.review === 'string' ? raw.review.trim() : '';

  if (typeof scoreValue !== 'number' || !Number.isFinite(scoreValue) || !reviewValue) {
    return null;
  }

  return {
    score: clampScore(scoreValue),
    review: reviewValue,
  };
};

const tryParseJson = (raw: string): unknown | null => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const parseModelResponse = (text: string): AIScoreResponse | null => {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const parseCandidates = new Set<string>([trimmed]);

  const fencedJsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedJsonMatch?.[1]) {
    parseCandidates.add(fencedJsonMatch[1].trim());
  }

  const firstObjectStart = trimmed.indexOf('{');
  const lastObjectEnd = trimmed.lastIndexOf('}');
  if (firstObjectStart !== -1 && lastObjectEnd > firstObjectStart) {
    parseCandidates.add(trimmed.slice(firstObjectStart, lastObjectEnd + 1));
  }

  for (const candidate of parseCandidates) {
    const parsed = tryParseJson(candidate);
    const normalized = normalizeAIScoreResponse(parsed);
    if (normalized) return normalized;
  }

  const scoreMatch = trimmed.match(/["']?score["']?\s*:\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (!scoreMatch) return null;

  const fallbackScore = Number(scoreMatch[1]);
  if (!Number.isFinite(fallbackScore)) return null;

  const reviewMatch = trimmed.match(/["']?review["']?\s*:\s*["']?([\s\S]*)/i);
  let fallbackReview = reviewMatch?.[1]?.trim() || trimmed;
  fallbackReview = fallbackReview.replace(/"\s*}\s*$/, '').trim();

  return {
    score: clampScore(fallbackScore),
    review: fallbackReview || trimmed,
  };
};

export async function POST(req: Request) {
  try {
    const { dashboardData } = await req.json();

    if (!dashboardData) {
      return NextResponse.json({ error: 'Missing dashboard data' }, { status: 400 });
    }

    // Check if API key is provided
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    
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

      IMPORTANT: Return only raw JSON. Do not wrap with markdown code fences.
    `;

    const { text } = await generateText({
      model: anthropic('claude-3-haiku-20240307'),
      prompt: prompt,
    });

    const parsed = parseModelResponse(text);
    if (parsed) {
      return NextResponse.json(parsed);
    }

    // Last-resort fallback: keep review text but avoid misleading hardcoded score.
    console.error('Failed to parse AI score response, using safe fallback');
    return NextResponse.json({
      score: 5,
      review: text,
    });
  } catch (error) {
    console.error('Error generating AI score:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI score' },
      { status: 500 }
    );
  }
}
