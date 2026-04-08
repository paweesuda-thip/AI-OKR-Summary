import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

// Allow responses up to 60 seconds
export const maxDuration = 60;

const tryParseJson = (raw: string): any | null => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const parseModelResponse = (text: string): any | null => {
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
    if (parsed && typeof parsed === 'object') return parsed;
  }

  return null;
};

export async function POST(req: Request) {
  try {
    const { playerA, playerB } = await req.json();

    if (!playerA || !playerB) {
      return NextResponse.json({ error: 'Missing player data' }, { status: 400 });
    }

    const trimPlayer = (p: any) => {
        return {
            name: p.fullName,
            checkIns: p.checkInCount,
            avgProgress: p.avgObjectiveProgress,
            topObjectives: p.topObjectives.map((obj: any) => ({
                name: obj.objectiveName,
                progress: obj.progress,
                tasks: obj.actualDetails?.map((kr: any) => kr.krTitle).join(', ') || 'No specific breakdown'
            }))
        };
    };

    const dataA = trimPlayer(playerA);
    const dataB = trimPlayer(playerB);

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    const maxRounds = Math.max(dataA.topObjectives.length, dataB.topObjectives.length);

    // Fallback Mock Response
    if (!apiKey) {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const mockRounds = Array.from({ length: maxRounds }).map((_, i) => ({
          roundNumber: i + 1,
          p1_badge: i === 0 ? "แบกจนหลังหัก! 🔥" : "งานหยาบก็ปราบได้ ⚔️",
          p2_badge: i === 0 ? "ความไวแสง! 🌪️" : "ดาเมจสุดคม! 💉",
          commentary: `ยกที่ ${i + 1}: สเต็ปงานของ ${dataA.name} แน่นหนากว่าในเชิงโครงสร้าง แต่ ${dataB.name} ปิดจ๊อบไวแบบสายฟ้าแลบ!`
      }));

      return NextResponse.json({
        winner: dataA.avgProgress > dataB.avgProgress ? dataA.name : (dataA.avgProgress < dataB.avgProgress ? dataB.name : 'Tie'),
        scoreA: Math.min(100, Math.max(0, dataA.avgProgress || 50)),
        scoreB: Math.min(100, Math.max(0, dataB.avgProgress || 50)),
        intro_hype: `ศึกบอสไฟต์สาย OKR ระหว่าง ${dataA.name} และ ${dataB.name}! คู่เดือดตัวทำดาเมจของทีม! 💥🥊`,
        rounds: mockRounds,
        playerA_strengths_weaknesses: "จุดเด่น: ความสม่ำเสมอ. จุดด้อย: บางงานอาจจะยังไม่เสร็จดี.",
        playerB_strengths_weaknesses: "จุดเด่น: โฟกัสงานหลักได้คมมาก. จุดด้อย: ควรเพิ่มยอด check-in.",
        conclusion: dataA.avgProgress > dataB.avgProgress ? `${dataA.name} ชนะใสๆ ด้วยผลงานรวมสุดโหด!` : "คะแนนสูสีหั่นเดือดสุดๆ ตัดสินยากมาก!"
      });
    }

    const anthropic = createAnthropic({
        apiKey: apiKey,
    });

    const prompt = `You are an AI e-sports commentator assessing an epic 1v1 battle based on OKR data! 
Analyze the performance stats, objectives, and specific tasks (KRs) of these two combatants.
Give them a score out of 100 based on their 'avgProgress' and 'checkIn' volume.

This is a ROUND-BY-ROUND showdown. Create up to ${maxRounds} rounds. For each round, compare Player 1's Objective at that index to Player 2's Objective at the same index.
Look specifically at their "tasks" (Key Results) to formulate your commentary. Provide a hyper-specific, fighting-game-style badge/shoutout in Thai for each player in that round based on their tasks (e.g. "เก็บ Bugs เรียบ! 🐛", "พรีเซนต์เทพ! ⚡"). If a player doesn't have an objective for a specific round, note that they left themselves open!

Player 1 Details:
${JSON.stringify(dataA, null, 2)}

Player 2 Details:
${JSON.stringify(dataB, null, 2)}

Respond with a JSON object EXACTLY in this format:
{
  "winner": "Name of the winning player, or 'Tie'",
  "scoreA": 85,
  "scoreB": 92,
  "intro_hype": "A hype e-sports intro to this matchup in Thai. Use emojis.",
  "rounds": [
    {
       "roundNumber": 1,
       "p1_badge": "Badge for P1's obj 1 in Thai",
       "p2_badge": "Badge for P2's obj 1 in Thai",
       "commentary": "Direct, exciting Thai commentary comparing how P1's specific tasks matched up against P2's specific tasks in this round."
    }
  ],
  "playerA_strengths_weaknesses": "A short Thai paragraph detailing Player A's main strengths and weaknesses.",
  "playerB_strengths_weaknesses": "A short Thai paragraph detailing Player B's main strengths and weaknesses.",
  "conclusion": "A dramatic final verdict of their strengths/weaknesses and why the winner won in Thai."
}

Return ONLY raw JSON, no code fences, no extra text.`;

    const { text } = await generateText({
        model: anthropic('claude-3-haiku-20240307'),
        prompt: prompt,
    });

    const parsed = parseModelResponse(text);
    
    if (parsed) {
        if (!Array.isArray(parsed.rounds)) parsed.rounds = [];
        
        // Safety for missing keys
        parsed.playerA_strengths_weaknesses = parsed.playerA_strengths_weaknesses || "นักสู้ผู้ไม่ยอมแพ้!";
        parsed.playerB_strengths_weaknesses = parsed.playerB_strengths_weaknesses || "ปีศาจแห่งความเร็ว!";

        return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: 'Data parsing failed at AI level' }, { status: 500 });
  } catch (error) {
    console.error('Error generating AI comparison:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI comparison' },
      { status: 500 }
    );
  }
}


